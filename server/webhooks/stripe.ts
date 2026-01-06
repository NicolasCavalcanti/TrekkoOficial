import { Request, Response } from 'express';
import Stripe from 'stripe';
import * as db from '../db';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function handleStripeWebhook(req: Request, res: Response) {
  const sig = req.headers['stripe-signature'] as string;

  let event: Stripe.Event;

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err: any) {
    console.error('[Stripe Webhook] Signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  console.log(`[Stripe Webhook] Received event: ${event.type}`);

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;
      }

      case 'checkout.session.expired': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutExpired(session);
        break;
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentSucceeded(paymentIntent);
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentFailed(paymentIntent);
        break;
      }

      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge;
        await handleChargeRefunded(charge);
        break;
      }

      default:
        console.log(`[Stripe Webhook] Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error: any) {
    console.error('[Stripe Webhook] Error processing event:', error);
    res.status(500).json({ error: 'Webhook handler failed' });
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  console.log(`[Stripe Webhook] Checkout completed: ${session.id}`);

  const reservation = await db.getReservationByCheckoutSession(session.id);
  if (!reservation) {
    console.error(`[Stripe Webhook] Reservation not found for session: ${session.id}`);
    return;
  }

  // Update reservation status
  await db.updateReservation(reservation.id, {
    status: 'paid',
    stripePaymentIntentId: session.payment_intent as string,
    paymentMethod: session.payment_method_types?.[0] === 'pix' ? 'pix' : 'card',
    paidAt: new Date(),
  });

  // Get platform fee
  const platformFeePercent = Number(await db.getPlatformSetting('platform_fee_percent') || '10');
  const grossAmount = Number(reservation.totalAmount);
  const platformFee = grossAmount * (platformFeePercent / 100);
  const netAmount = grossAmount - platformFee;

  // Create payment record
  await db.createPayment({
    reservationId: reservation.id,
    stripePaymentIntentId: session.payment_intent as string,
    status: 'succeeded',
    grossAmount: grossAmount.toString(),
    platformFee: platformFee.toString(),
    netAmount: netAmount.toString(),
    paymentMethod: session.payment_method_types?.[0] === 'pix' ? 'pix' : 'card',
    currency: 'BRL',
    metadata: {
      sessionId: session.id,
      customerEmail: session.customer_email,
    },
  });

  // Update expedition enrolled count
  const expedition = await db.getExpeditionById(reservation.expeditionId);
  if (expedition) {
    const paidReservations = await db.getPaidReservationsForExpedition(expedition.id);
    const totalEnrolled = paidReservations.reduce((sum, r) => sum + r.quantity, 0);
    
    // Update expedition status if full
    if (totalEnrolled >= (expedition.capacity || 10)) {
      await db.updateExpedition(expedition.id, { status: 'full' });
    }
  }

  // Schedule payout to guide
  const payoutDelayDays = Number(await db.getPlatformSetting('payout_delay_days') || '7');
  const scheduledDate = new Date();
  scheduledDate.setDate(scheduledDate.getDate() + payoutDelayDays);

  if (expedition) {
    await db.createPayout({
      guideId: expedition.guideId,
      status: 'scheduled',
      amount: netAmount.toString(),
      currency: 'BRL',
      scheduledDate,
      paymentIds: [reservation.id],
    });
  }

  // Create audit log
  await db.createAuditLog({
    entityType: 'reservation',
    entityId: reservation.id,
    action: 'payment_completed',
    newValue: JSON.stringify({ 
      paymentIntent: session.payment_intent,
      amount: grossAmount,
      platformFee,
      netAmount,
    }),
    actorType: 'system',
  });

  console.log(`[Stripe Webhook] Reservation ${reservation.id} marked as paid`);
}

async function handleCheckoutExpired(session: Stripe.Checkout.Session) {
  console.log(`[Stripe Webhook] Checkout expired: ${session.id}`);

  const reservation = await db.getReservationByCheckoutSession(session.id);
  if (!reservation) {
    return;
  }

  // Only update if still pending
  if (reservation.status === 'pending_payment') {
    await db.updateReservation(reservation.id, {
      status: 'cancelled',
      cancelledAt: new Date(),
      cancellationReason: 'Checkout session expired',
      cancelledBy: 'system',
    });

    await db.createAuditLog({
      entityType: 'reservation',
      entityId: reservation.id,
      action: 'checkout_expired',
      previousValue: 'pending_payment',
      newValue: 'cancelled',
      actorType: 'system',
    });
  }
}

async function handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  console.log(`[Stripe Webhook] Payment succeeded: ${paymentIntent.id}`);

  // This is a backup handler - checkout.session.completed should handle most cases
  const reservation = await db.getReservationByPaymentIntent(paymentIntent.id);
  if (reservation && reservation.status !== 'paid') {
    await db.updateReservation(reservation.id, {
      status: 'paid',
      paidAt: new Date(),
    });
  }
}

async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  console.log(`[Stripe Webhook] Payment failed: ${paymentIntent.id}`);

  const reservation = await db.getReservationByPaymentIntent(paymentIntent.id);
  if (reservation) {
    await db.createAuditLog({
      entityType: 'reservation',
      entityId: reservation.id,
      action: 'payment_failed',
      metadata: {
        paymentIntentId: paymentIntent.id,
        failureMessage: paymentIntent.last_payment_error?.message,
      },
      actorType: 'system',
    });
  }
}

async function handleChargeRefunded(charge: Stripe.Charge) {
  console.log(`[Stripe Webhook] Charge refunded: ${charge.id}`);

  const payment = await db.getPaymentByPaymentIntent(charge.payment_intent as string);
  if (payment) {
    const refundedAmount = charge.amount_refunded / 100; // Convert from cents
    const isFullRefund = charge.refunded;

    await db.updatePayment(payment.id, {
      status: isFullRefund ? 'refunded' : 'partially_refunded',
    });

    await db.createAuditLog({
      entityType: 'payment',
      entityId: payment.id,
      action: isFullRefund ? 'fully_refunded' : 'partially_refunded',
      metadata: {
        chargeId: charge.id,
        refundedAmount,
      },
      actorType: 'system',
    });
  }
}
