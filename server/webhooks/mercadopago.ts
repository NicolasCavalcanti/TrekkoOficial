import { Router, Request, Response } from "express";
import { MercadoPagoConfig, Payment } from "mercadopago";
import { getDb } from "../db";
import { reservations, payments } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { notifyOwner } from "../_core/notification";

const router = Router();

// Mercado Pago webhook handler
router.post("/", async (req: Request, res: Response) => {
  try {
    const { type, data } = req.body;
    
    console.log("[MercadoPago Webhook] Received:", type, data);

    // Only process payment notifications
    if (type !== "payment") {
      return res.status(200).send("OK");
    }

    const paymentId = data?.id;
    if (!paymentId) {
      console.error("[MercadoPago Webhook] No payment ID in notification");
      return res.status(400).send("Missing payment ID");
    }

    // Initialize Mercado Pago client
    const mpClient = new MercadoPagoConfig({
      accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
    });
    const paymentApi = new Payment(mpClient);

    // Get payment details from Mercado Pago
    const paymentInfo = await paymentApi.get({ id: paymentId });
    
    if (!paymentInfo) {
      console.error("[MercadoPago Webhook] Payment not found:", paymentId);
      return res.status(404).send("Payment not found");
    }

    console.log("[MercadoPago Webhook] Payment info:", {
      id: paymentInfo.id,
      status: paymentInfo.status,
      external_reference: paymentInfo.external_reference,
      transaction_amount: paymentInfo.transaction_amount,
    });

    const externalReference = paymentInfo.external_reference;
    if (!externalReference) {
      console.error("[MercadoPago Webhook] No external reference in payment");
      return res.status(400).send("Missing external reference");
    }

    // Extract reservation ID from external reference (format: reservation_{id}_{timestamp})
    const match = externalReference.match(/reservation_(\d+)_/);
    if (!match) {
      console.error("[MercadoPago Webhook] Invalid external reference format:", externalReference);
      return res.status(400).send("Invalid external reference");
    }

    const reservationId = parseInt(match[1], 10);
    const db = await getDb();
    if (!db) {
      console.error("[MercadoPago Webhook] Database not available");
      return res.status(500).send("Database not available");
    }

    // Get the reservation
    const [reservation] = await db
      .select()
      .from(reservations)
      .where(eq(reservations.id, reservationId))
      .limit(1);

    if (!reservation) {
      console.error("[MercadoPago Webhook] Reservation not found:", reservationId);
      return res.status(404).send("Reservation not found");
    }

    // Handle different payment statuses
    const status = paymentInfo.status;
    
    if (status === "approved") {
      // Payment approved - update reservation to paid
      await db
        .update(reservations)
        .set({
          status: "paid",
          mpPaymentId: paymentId.toString(),
          paymentMethod: mapPaymentMethod(paymentInfo.payment_type_id),
          paidAt: new Date(),
        })
        .where(eq(reservations.id, reservationId));

      // Create payment record
      const platformFeePercent = 10; // Default 10%
      const grossAmount = paymentInfo.transaction_amount || 0;
      const platformFee = grossAmount * (platformFeePercent / 100);
      const mpFee = paymentInfo.fee_details?.reduce((sum: number, fee: any) => sum + (fee.amount || 0), 0) || 0;
      const netAmount = grossAmount - platformFee - mpFee;

      await db.insert(payments).values({
        reservationId,
        mpPaymentId: paymentId.toString(),
        status: "approved",
        grossAmount: grossAmount.toString(),
        platformFee: platformFee.toString(),
        mpFee: mpFee.toString(),
        netAmount: netAmount.toString(),
        paymentMethod: mapPaymentMethod(paymentInfo.payment_type_id),
        paymentTypeId: paymentInfo.payment_type_id,
        currency: paymentInfo.currency_id || "BRL",
        metadata: {
          payer_email: paymentInfo.payer?.email,
          payer_id: paymentInfo.payer?.id,
        },
      });

      // Notify owner
      await notifyOwner({
        title: "💰 Novo Pagamento Recebido",
        content: `Reserva #${reservationId} paga via ${paymentInfo.payment_type_id}. Valor: R$ ${grossAmount.toFixed(2)}`,
      });

      console.log("[MercadoPago Webhook] Payment approved for reservation:", reservationId);
    } else if (status === "rejected" || status === "cancelled") {
      // Payment failed - update reservation status
      await db
        .update(reservations)
        .set({
          status: "cancelled",
          cancelledAt: new Date(),
          cancellationReason: `Pagamento ${status}: ${paymentInfo.status_detail || "sem detalhes"}`,
          cancelledBy: "system",
        })
        .where(eq(reservations.id, reservationId));

      console.log("[MercadoPago Webhook] Payment rejected/cancelled for reservation:", reservationId);
    } else if (status === "refunded") {
      // Payment refunded
      await db
        .update(reservations)
        .set({
          status: "refunded",
          refundedAt: new Date(),
          refundAmount: (paymentInfo.transaction_amount_refunded || paymentInfo.transaction_amount || 0).toString(),
        })
        .where(eq(reservations.id, reservationId));

      // Update payment record
      await db
        .update(payments)
        .set({ status: "refunded" })
        .where(eq(payments.mpPaymentId, paymentId.toString()));

      console.log("[MercadoPago Webhook] Payment refunded for reservation:", reservationId);
    }

    return res.status(200).send("OK");
  } catch (error) {
    console.error("[MercadoPago Webhook] Error:", error);
    return res.status(500).send("Internal server error");
  }
});

// Map Mercado Pago payment type to our enum
function mapPaymentMethod(paymentTypeId: string | undefined): "card" | "pix" | "boleto" | "account_money" | undefined {
  if (!paymentTypeId) return undefined;
  
  switch (paymentTypeId) {
    case "credit_card":
    case "debit_card":
      return "card";
    case "pix":
      return "pix";
    case "ticket":
    case "bolbradesco":
      return "boleto";
    case "account_money":
      return "account_money";
    default:
      return undefined;
  }
}

export default router;
