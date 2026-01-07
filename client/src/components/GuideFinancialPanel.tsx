import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { Loader2, Wallet, TrendingUp, Clock, CheckCircle2, AlertCircle, Receipt, ArrowDownRight, ArrowUpRight, Calendar, DollarSign } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import GuidePixForm from "./GuidePixForm";

export default function GuideFinancialPanel() {
  const [activeTab, setActiveTab] = useState("resumo");
  
  const { data: verification, isLoading: loadingVerification } = trpc.guides.getMyVerification.useQuery();
  const { data: stats, isLoading: loadingStats } = trpc.expeditions.getGuideStats.useQuery();

  if (loadingVerification || loadingStats) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Check if PIX data is configured
  const hasPixConfigured = verification?.pixKey && verification?.pixKeyVerified;

  return (
    <div className="space-y-6">
      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Recebido</p>
                <p className="text-2xl font-bold text-green-600">
                  R$ {(stats?.completedPayouts || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pendente de Repasse</p>
                <p className="text-2xl font-bold text-amber-600">
                  R$ {(stats?.pendingPayouts || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
                <Clock className="w-6 h-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total em Vendas</p>
                <p className="text-2xl font-bold">
                  R$ {(stats?.totalEarnings || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alert if PIX not configured */}
      {!hasPixConfigured && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-amber-800">Configure seus dados PIX</h4>
                <p className="text-sm text-amber-700">
                  Para receber os repasses das suas expedições, você precisa configurar seus dados bancários e aceitar os termos de intermediação.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="resumo">
            <Receipt className="w-4 h-4 mr-2" />
            Resumo
          </TabsTrigger>
          <TabsTrigger value="repasses">
            <ArrowDownRight className="w-4 h-4 mr-2" />
            Repasses
          </TabsTrigger>
          <TabsTrigger value="dados-pix">
            <Wallet className="w-4 h-4 mr-2" />
            Dados PIX
          </TabsTrigger>
        </TabsList>

        <TabsContent value="resumo" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Reservas Recentes</CardTitle>
              <CardDescription>
                Acompanhe o status das reservas das suas expedições
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ReservationsList />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="repasses" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Repasses</CardTitle>
              <CardDescription>
                Todos os repasses realizados via PIX
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PayoutsList />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dados-pix" className="mt-6">
          <GuidePixForm />
        </TabsContent>
      </Tabs>

      {/* Payment Flow Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Como funciona o repasse
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex flex-col items-center text-center p-4 bg-muted/50 rounded-lg">
              <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold mb-2">1</div>
              <h4 className="font-medium">Reserva Paga</h4>
              <p className="text-sm text-muted-foreground">Usuário paga e valor fica retido</p>
            </div>
            <div className="flex flex-col items-center text-center p-4 bg-muted/50 rounded-lg">
              <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold mb-2">2</div>
              <h4 className="font-medium">Trilha Realizada</h4>
              <p className="text-sm text-muted-foreground">Expedição concluída com sucesso</p>
            </div>
            <div className="flex flex-col items-center text-center p-4 bg-muted/50 rounded-lg">
              <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold mb-2">3</div>
              <h4 className="font-medium">2 Dias Úteis</h4>
              <p className="text-sm text-muted-foreground">Período para contestação</p>
            </div>
            <div className="flex flex-col items-center text-center p-4 bg-muted/50 rounded-lg">
              <div className="w-10 h-10 rounded-full bg-green-600 text-white flex items-center justify-center font-bold mb-2">4</div>
              <h4 className="font-medium">Repasse PIX</h4>
              <p className="text-sm text-muted-foreground">Valor líquido creditado</p>
            </div>
          </div>
          <div className="mt-4 p-4 bg-muted/30 rounded-lg">
            <p className="text-sm text-muted-foreground">
              <strong>Taxa da plataforma:</strong> 4% sobre o valor da reserva<br />
              <strong>Taxas do gateway:</strong> Descontadas automaticamente pelo Mercado Pago<br />
              <strong>Prazo de repasse:</strong> 2 dias úteis após a conclusão da expedição (sem contestações)
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ReservationsList() {
  const { data: reservations, isLoading } = trpc.expeditions.getGuideReservations.useQuery();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!reservations || reservations.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Receipt className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>Nenhuma reserva encontrada</p>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Aguardando Pagamento</Badge>;
      case 'paid':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Pago - Aguardando Trilha</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">Concluída - Em Contestação</Badge>;
      case 'released':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Liberado para Repasse</Badge>;
      case 'paid_out':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Repassado</Badge>;
      case 'contested':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Em Contestação</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">Cancelada</Badge>;
      case 'refunded':
        return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">Reembolsada</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      {reservations.map((reservation: any) => (
        <div key={reservation.id} className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium">{reservation.expeditionTitle || 'Expedição'}</span>
              {getStatusBadge(reservation.status)}
            </div>
            <p className="text-sm text-muted-foreground">
              {reservation.userName} • {reservation.quantity} {reservation.quantity === 1 ? 'vaga' : 'vagas'}
            </p>
            <p className="text-xs text-muted-foreground">
              {reservation.createdAt && format(new Date(reservation.createdAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
            </p>
          </div>
          <div className="text-right">
            <p className="font-bold text-lg">
              R$ {Number(reservation.totalAmount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
            {reservation.status === 'paid_out' && (
              <p className="text-xs text-green-600">
                Líquido: R$ {Number(reservation.netAmount || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function PayoutsList() {
  const { data: payouts, isLoading } = trpc.expeditions.getGuidePayouts.useQuery();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!payouts || payouts.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <ArrowDownRight className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>Nenhum repasse realizado ainda</p>
        <p className="text-sm">Os repasses aparecerão aqui após a conclusão das expedições</p>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Agendado</Badge>;
      case 'processing':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Processando</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Concluído</Badge>;
      case 'failed':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Falhou</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      {payouts.map((payout: any) => (
        <div key={payout.id} className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium">Repasse #{payout.id}</span>
              {getStatusBadge(payout.status)}
            </div>
            <p className="text-sm text-muted-foreground">
              PIX: {payout.pixKeyType === 'email' ? payout.pixKey : '•••••' + payout.pixKey?.slice(-4)}
            </p>
            <p className="text-xs text-muted-foreground">
              {payout.completedAt 
                ? format(new Date(payout.completedAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
                : payout.scheduledDate 
                  ? `Agendado: ${format(new Date(payout.scheduledDate), "dd/MM/yyyy", { locale: ptBR })}`
                  : ''
              }
            </p>
          </div>
          <div className="text-right">
            <p className="font-bold text-lg text-green-600">
              + R$ {Number(payout.netAmount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-muted-foreground">
              Bruto: R$ {Number(payout.grossAmount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
