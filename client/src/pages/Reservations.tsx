import { useEffect, useState } from "react";
import { Link, useSearch } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Calendar, MapPin, Users, Clock, CheckCircle, XCircle, AlertTriangle, Loader2 } from "lucide-react";

export default function Reservations() {
  const { user, loading: authLoading } = useAuth();
  const searchString = useSearch();
  const params = new URLSearchParams(searchString);
  const success = params.get('success');
  const reservationId = params.get('reservation');

  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  useEffect(() => {
    document.title = "Minhas Reservas | Trekko";
    if (success === 'true') {
      setShowSuccessMessage(true);
      // Remove query params from URL
      window.history.replaceState({}, '', '/reservas');
    }
  }, [success]);

  const { data: reservations, isLoading, refetch } = trpc.payments.myReservations.useQuery(
    undefined,
    { enabled: !!user }
  );

  const cancelMutation = trpc.payments.cancelReservation.useMutation({
    onSuccess: (result) => {
      alert(result.message);
      refetch();
    },
    onError: (error) => {
      alert(`Erro ao cancelar: ${error.message}`);
    },
  });

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ReactNode }> = {
      created: { label: "Criada", variant: "secondary", icon: <Clock className="w-3 h-3" /> },
      pending_payment: { label: "Aguardando Pagamento", variant: "outline", icon: <AlertTriangle className="w-3 h-3" /> },
      paid: { label: "Confirmada", variant: "default", icon: <CheckCircle className="w-3 h-3" /> },
      cancelled: { label: "Cancelada", variant: "destructive", icon: <XCircle className="w-3 h-3" /> },
      refunded: { label: "Reembolsada", variant: "secondary", icon: <XCircle className="w-3 h-3" /> },
      no_show: { label: "Não Compareceu", variant: "destructive", icon: <XCircle className="w-3 h-3" /> },
    };

    const config = statusConfig[status] || { label: status, variant: "secondary", icon: null };
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        {config.icon}
        {config.label}
      </Badge>
    );
  };

  if (authLoading) {
    return (
      <div className="container py-8">
        <Skeleton className="h-8 w-48 mb-6" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Acesso Restrito</h1>
        <p className="text-muted-foreground mb-6">
          Você precisa estar logado para ver suas reservas.
        </p>
        <Button asChild>
          <a href={`${import.meta.env.VITE_OAUTH_PORTAL_URL}?app_id=${import.meta.env.VITE_APP_ID}`}>
            Fazer Login
          </a>
        </Button>
      </div>
    );
  }

  return (
    <div className="container py-8">
      {showSuccessMessage && (
        <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">Pagamento confirmado!</span>
          </div>
          <p className="text-sm text-green-600 dark:text-green-500 mt-1">
            Sua reserva foi confirmada com sucesso. Você receberá um email com os detalhes.
          </p>
        </div>
      )}

      <h1 className="text-3xl font-bold mb-6">Minhas Reservas</h1>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      ) : reservations && reservations.length > 0 ? (
        <div className="space-y-4">
          {reservations.map((reservation) => (
            <Card key={reservation.id} className="overflow-hidden">
              <div className="flex flex-col md:flex-row">
                {reservation.trail?.imageUrl && (
                  <div className="w-full md:w-48 h-32 md:h-auto">
                    <img
                      src={reservation.trail.imageUrl}
                      alt={reservation.trail.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="flex-1">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">
                          {reservation.expedition?.title || reservation.trail?.name || 'Expedição'}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-1 mt-1">
                          <MapPin className="w-3 h-3" />
                          {reservation.trail?.city}, {reservation.trail?.uf}
                        </CardDescription>
                      </div>
                      {getStatusBadge(reservation.status)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Data</span>
                        <p className="font-medium flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {reservation.expedition?.startDate 
                            ? new Date(reservation.expedition.startDate).toLocaleDateString('pt-BR')
                            : '-'}
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Vagas</span>
                        <p className="font-medium flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {reservation.quantity}
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Valor Total</span>
                        <p className="font-medium">
                          R$ {Number(reservation.totalAmount).toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Guia</span>
                        <p className="font-medium">
                          {reservation.guide?.name || '-'}
                        </p>
                      </div>
                    </div>

                    {reservation.expedition?.meetingPoint && reservation.status === 'paid' && (
                      <div className="mt-4 p-3 bg-muted rounded-lg">
                        <span className="text-sm font-medium">Ponto de Encontro:</span>
                        <p className="text-sm text-muted-foreground">{reservation.expedition.meetingPoint}</p>
                      </div>
                    )}

                    <div className="flex gap-2 mt-4">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/trilha/${reservation.trail?.id}`}>
                          Ver Trilha
                        </Link>
                      </Button>
                      
                      {['pending_payment', 'paid'].includes(reservation.status) && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm" disabled={cancelMutation.isPending}>
                              {cancelMutation.isPending ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                'Cancelar Reserva'
                              )}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Cancelar Reserva</AlertDialogTitle>
                              <AlertDialogDescription>
                                {reservation.status === 'paid' ? (
                                  <>
                                    Sua reserva será cancelada e o reembolso será processado de acordo com nossa política de cancelamento:
                                    <ul className="list-disc list-inside mt-2 space-y-1">
                                      <li>Até 7 dias antes: reembolso integral</li>
                                      <li>3-7 dias antes: reembolso de 50%</li>
                                      <li>Menos de 3 dias: sem reembolso</li>
                                    </ul>
                                  </>
                                ) : (
                                  'Tem certeza que deseja cancelar esta reserva?'
                                )}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Voltar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => cancelMutation.mutate({ id: reservation.id })}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Confirmar Cancelamento
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                  </CardContent>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-8 text-center">
          <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">Nenhuma reserva encontrada</h3>
          <p className="text-muted-foreground mb-4">
            Você ainda não fez nenhuma reserva de expedição.
          </p>
          <Button asChild>
            <Link href="/trilhas">Explorar Trilhas</Link>
          </Button>
        </Card>
      )}
    </div>
  );
}
