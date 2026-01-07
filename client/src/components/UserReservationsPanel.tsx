import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { Loader2, Calendar, MapPin, Users, AlertTriangle, CheckCircle2, Clock, XCircle, MessageSquare } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

export default function UserReservationsPanel() {
  const { data: reservations, isLoading, refetch } = trpc.payments.myReservations.useQuery();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!reservations || reservations.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="text-lg font-medium mb-2">Nenhuma reserva encontrada</h3>
          <p className="text-muted-foreground">
            Suas reservas de expedições aparecerão aqui após você fazer uma reserva.
          </p>
        </CardContent>
      </Card>
    );
  }

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ReactNode }> = {
      'created': { label: 'Criada', variant: 'outline', icon: <Clock className="w-3 h-3" /> },
      'pending_payment': { label: 'Aguardando Pagamento', variant: 'outline', icon: <Clock className="w-3 h-3" /> },
      'paid': { label: 'Pago', variant: 'default', icon: <CheckCircle2 className="w-3 h-3" /> },
      'awaiting_expedition': { label: 'Aguardando Expedição', variant: 'secondary', icon: <Calendar className="w-3 h-3" /> },
      'expedition_in_progress': { label: 'Em Andamento', variant: 'secondary', icon: <MapPin className="w-3 h-3" /> },
      'awaiting_contestation': { label: 'Período de Contestação', variant: 'outline', icon: <Clock className="w-3 h-3" /> },
      'released': { label: 'Concluída', variant: 'default', icon: <CheckCircle2 className="w-3 h-3" /> },
      'contested': { label: 'Em Análise', variant: 'destructive', icon: <AlertTriangle className="w-3 h-3" /> },
      'refunded': { label: 'Reembolsada', variant: 'secondary', icon: <XCircle className="w-3 h-3" /> },
      'cancelled': { label: 'Cancelada', variant: 'secondary', icon: <XCircle className="w-3 h-3" /> },
      'no_show': { label: 'Não Compareceu', variant: 'destructive', icon: <XCircle className="w-3 h-3" /> },
    };
    const config = statusConfig[status] || { label: status, variant: 'secondary' as const, icon: null };
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        {config.icon}
        {config.label}
      </Badge>
    );
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Minhas Reservas</CardTitle>
          <CardDescription>
            Acompanhe o status das suas reservas de expedições
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {reservations.map((reservation: any) => (
              <ReservationCard 
                key={reservation.id} 
                reservation={reservation} 
                onUpdate={refetch}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Info about contestation */}
      <Card className="bg-muted/30">
        <CardContent className="p-4">
          <h4 className="font-medium flex items-center gap-2 mb-2">
            <MessageSquare className="w-4 h-4" />
            Sobre Contestações
          </h4>
          <p className="text-sm text-muted-foreground">
            Após a conclusão da expedição, você tem <strong>2 dias úteis</strong> para abrir uma contestação 
            caso tenha ocorrido algum problema. Durante esse período, o valor fica retido e será analisado 
            pela nossa equipe. Contestações podem ser abertas por motivos como: expedição não realizada, 
            serviço diferente do anunciado, problemas de segurança, ou guia não compareceu.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function ReservationCard({ reservation, onUpdate }: { reservation: any; onUpdate: () => void }) {
  const [showContestDialog, setShowContestDialog] = useState(false);
  const [contestReason, setContestReason] = useState<'expedition_not_completed' | 'different_from_description' | 'safety_issues' | 'guide_no_show' | 'partial_service' | 'other' | ''>('');
  const [contestDescription, setContestDescription] = useState("");

  const contestMutation = trpc.payments.openContestation.useMutation({
    onSuccess: () => {
      toast.success("Contestação aberta com sucesso. Nossa equipe irá analisar.");
      setShowContestDialog(false);
      setContestReason("");
      setContestDescription("");
      onUpdate();
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao abrir contestação");
    },
  });

  const canContest = reservation.status === 'awaiting_contestation' && 
    reservation.contestationEndDate && 
    new Date(reservation.contestationEndDate) > new Date();

  const contestationEndsIn = reservation.contestationEndDate 
    ? Math.ceil((new Date(reservation.contestationEndDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : 0;

  const handleOpenContestation = () => {
    if (!contestReason || !contestDescription) {
      toast.error("Preencha todos os campos");
      return;
    }
    contestMutation.mutate({
      reservationId: reservation.id,
      reason: contestReason,
      description: contestDescription,
    });
  };

  return (
    <div className="border rounded-lg p-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h4 className="font-medium">{reservation.expeditionTitle || `Expedição #${reservation.expeditionId}`}</h4>
            {getStatusBadge(reservation.status)}
          </div>
          
          <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {reservation.expeditionDate 
                ? format(new Date(reservation.expeditionDate), "dd/MM/yyyy", { locale: ptBR })
                : 'Data não definida'
              }
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              {reservation.quantity} {reservation.quantity === 1 ? 'vaga' : 'vagas'}
            </div>
            {reservation.trailName && (
              <div className="flex items-center gap-1 col-span-2">
                <MapPin className="w-4 h-4" />
                {reservation.trailName}
              </div>
            )}
          </div>

          {canContest && contestationEndsIn > 0 && (
            <div className="mt-2 p-2 bg-yellow-50 rounded text-sm text-yellow-800">
              <AlertTriangle className="w-4 h-4 inline mr-1" />
              Período de contestação termina em {contestationEndsIn} dia(s)
            </div>
          )}
        </div>

        <div className="text-right">
          <p className="text-lg font-bold">
            R$ {Number(reservation.totalAmount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-muted-foreground">
            {reservation.createdAt && format(new Date(reservation.createdAt), "dd/MM/yyyy", { locale: ptBR })}
          </p>
          
          {canContest && (
            <Dialog open={showContestDialog} onOpenChange={setShowContestDialog}>
              <DialogTrigger asChild>
                <Button variant="destructive" size="sm" className="mt-2">
                  <AlertTriangle className="w-4 h-4 mr-1" />
                  Abrir Contestação
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Abrir Contestação</DialogTitle>
                  <DialogDescription>
                    Descreva o problema ocorrido durante a expedição. Nossa equipe irá analisar e entrar em contato.
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Motivo da contestação</Label>
                    <Select value={contestReason} onValueChange={(value) => setContestReason(value as typeof contestReason)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o motivo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="expedition_not_completed">Expedição não realizada</SelectItem>
                        <SelectItem value="different_from_description">Serviço diferente do anunciado</SelectItem>
                        <SelectItem value="safety_issues">Problemas de segurança</SelectItem>
                        <SelectItem value="guide_no_show">Guia não compareceu</SelectItem>
                        <SelectItem value="partial_service">Serviço parcialmente prestado</SelectItem>
                        <SelectItem value="other">Outro motivo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Descrição detalhada</Label>
                    <Textarea 
                      placeholder="Descreva em detalhes o que aconteceu..."
                      value={contestDescription}
                      onChange={(e) => setContestDescription(e.target.value)}
                      rows={4}
                    />
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowContestDialog(false)}>
                    Cancelar
                  </Button>
                  <Button 
                    variant="destructive" 
                    onClick={handleOpenContestation}
                    disabled={contestMutation.isPending}
                  >
                    {contestMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Enviar Contestação
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>
    </div>
  );
}

function getStatusBadge(status: string) {
  const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ReactNode }> = {
    'created': { label: 'Criada', variant: 'outline', icon: <Clock className="w-3 h-3" /> },
    'pending_payment': { label: 'Aguardando Pagamento', variant: 'outline', icon: <Clock className="w-3 h-3" /> },
    'paid': { label: 'Pago', variant: 'default', icon: <CheckCircle2 className="w-3 h-3" /> },
    'awaiting_expedition': { label: 'Aguardando Expedição', variant: 'secondary', icon: <Calendar className="w-3 h-3" /> },
    'expedition_in_progress': { label: 'Em Andamento', variant: 'secondary', icon: <MapPin className="w-3 h-3" /> },
    'awaiting_contestation': { label: 'Período de Contestação', variant: 'outline', icon: <Clock className="w-3 h-3" /> },
    'released': { label: 'Concluída', variant: 'default', icon: <CheckCircle2 className="w-3 h-3" /> },
    'contested': { label: 'Em Análise', variant: 'destructive', icon: <AlertTriangle className="w-3 h-3" /> },
    'refunded': { label: 'Reembolsada', variant: 'secondary', icon: <XCircle className="w-3 h-3" /> },
    'cancelled': { label: 'Cancelada', variant: 'secondary', icon: <XCircle className="w-3 h-3" /> },
    'no_show': { label: 'Não Compareceu', variant: 'destructive', icon: <XCircle className="w-3 h-3" /> },
  };
  const config = statusConfig[status] || { label: status, variant: 'secondary' as const, icon: null };
  return (
    <Badge variant={config.variant} className="flex items-center gap-1">
      {config.icon}
      {config.label}
    </Badge>
  );
}
