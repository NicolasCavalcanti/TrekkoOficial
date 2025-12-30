import { useState } from "react";
import { useParams, useLocation } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { 
  ArrowLeft, Calendar, MapPin, Users, User, DollarSign, Clock, 
  Mountain, CheckCircle2, XCircle, AlertCircle, Loader2, 
  Phone, Mail, Award, Info, ImageIcon, ChevronLeft, ChevronRight
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

const STATUS_LABELS: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  active: { label: "Ativa", color: "bg-green-100 text-green-700 border-green-200", icon: <CheckCircle2 className="w-4 h-4" /> },
  full: { label: "Lotada", color: "bg-blue-100 text-blue-700 border-blue-200", icon: <Users className="w-4 h-4" /> },
  closed: { label: "Encerrada", color: "bg-gray-100 text-gray-700 border-gray-200", icon: <XCircle className="w-4 h-4" /> },
  cancelled: { label: "Cancelada", color: "bg-red-100 text-red-700 border-red-200", icon: <AlertCircle className="w-4 h-4" /> },
  draft: { label: "Rascunho", color: "bg-yellow-100 text-yellow-700 border-yellow-200", icon: <Clock className="w-4 h-4" /> },
};

export default function ExpeditionDetail() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const [showEnrollDialog, setShowEnrollDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const expeditionId = parseInt(id || "0");

  const { data, isLoading, error, refetch } = trpc.expeditions.getDetails.useQuery(
    { id: expeditionId },
    { enabled: expeditionId > 0 }
  );

  const { data: isEnrolled, refetch: refetchEnrollment } = trpc.expeditions.isEnrolled.useQuery(
    { expeditionId },
    { enabled: expeditionId > 0 && isAuthenticated }
  );

  const { data: participants } = trpc.expeditions.getParticipants.useQuery(
    { expeditionId },
    { 
      enabled: expeditionId > 0 && isAuthenticated && 
        (data?.guide.id === user?.id || user?.role === 'admin')
    }
  );

  const enrollMutation = trpc.expeditions.enroll.useMutation({
    onSuccess: (result) => {
      if (result.success) {
        toast.success("Inscrição realizada com sucesso!");
        refetch();
        refetchEnrollment();
        setShowEnrollDialog(false);
      } else {
        toast.error(result.error || "Erro ao realizar inscrição");
      }
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao realizar inscrição");
    }
  });

  const cancelMutation = trpc.expeditions.cancelEnrollment.useMutation({
    onSuccess: (result) => {
      if (result.success) {
        toast.success("Inscrição cancelada com sucesso");
        refetch();
        refetchEnrollment();
        setShowCancelDialog(false);
      } else {
        toast.error(result.error || "Erro ao cancelar inscrição");
      }
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao cancelar inscrição");
    }
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="font-heading text-2xl font-bold mb-2">Expedição não encontrada</h2>
            <p className="text-muted-foreground mb-4">A expedição que você está procurando não existe ou foi removida.</p>
            <Button onClick={() => navigate("/trilhas?tab=expedicoes")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar para expedições
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const { expedition, trail, guide } = data;
  const status = expedition.status || 'active';
  const statusInfo = STATUS_LABELS[status] || STATUS_LABELS.active;
  const capacity = expedition.capacity || 10;
  const enrolledCount = expedition.enrolledCount || 0;
  const availableSpots = capacity - enrolledCount;
  const canEnroll = status === 'active' && availableSpots > 0 && !isEnrolled;
  const isGuideOrAdmin = user?.id === guide.id || user?.role === 'admin';

  // Get images (already typed as string[] in schema)
  const images: string[] = expedition.images || [];
  
  // Get trail images
  const trailImages: string[] = trail.images || [];
  
  // Combine all images, prioritizing expedition images
  let allImages = [...images];
  
  // Add trail image as fallback if no expedition images
  if (allImages.length === 0 && trail.imageUrl) {
    allImages = [trail.imageUrl];
  }
  
  // Add trail gallery images that aren't already included
  trailImages.forEach(img => {
    if (!allImages.includes(img)) {
      allImages.push(img);
    }
  });

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 py-8">
        <div className="container">
          {/* Back Button */}
          <Button 
            variant="ghost" 
            className="mb-6"
            onClick={() => navigate("/trilhas?tab=expedicoes")}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para expedições
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Header Card */}
              <Card>
                <CardContent className="p-6">
                  {/* Status Badge */}
                  <div className="flex items-center justify-between mb-4">
                    <Badge className={`${statusInfo.color} border flex items-center gap-1 text-sm px-3 py-1`}>
                      {statusInfo.icon}
                      {statusInfo.label}
                    </Badge>
                    {isEnrolled && (
                      <Badge className="bg-primary text-primary-foreground">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Você está inscrito
                      </Badge>
                    )}
                  </div>

                  {/* Title */}
                  <h1 className="font-heading text-3xl font-bold mb-4">
                    {expedition.title || trail.name}
                  </h1>

                  {/* Trail Info */}
                  <div className="flex flex-wrap items-center gap-4 text-muted-foreground mb-6">
                    <span className="flex items-center gap-2">
                      <Mountain className="w-5 h-5 text-primary" />
                      <span className="font-medium">{trail.name}</span>
                    </span>
                    <span className="flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-primary" />
                      {trail.city}, {trail.uf}
                    </span>
                  </div>

                  {/* Dates */}
                  <div className="flex flex-wrap gap-6 p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-6 h-6 text-primary" />
                      <div>
                        <p className="text-sm text-muted-foreground">Data</p>
                        <p className="font-medium">
                          {format(new Date(expedition.startDate), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                          {expedition.endDate && new Date(expedition.endDate).getTime() !== new Date(expedition.startDate).getTime() && (
                            <> até {format(new Date(expedition.endDate), "dd/MM/yyyy")}</>
                          )}
                        </p>
                      </div>
                    </div>
                    {(expedition.startTime || expedition.endTime) && (
                      <div className="flex items-center gap-3">
                        <Clock className="w-6 h-6 text-primary" />
                        <div>
                          <p className="text-sm text-muted-foreground">Horário</p>
                          <p className="font-medium">
                            {expedition.startTime && `Início: ${expedition.startTime}`}
                            {expedition.startTime && expedition.endTime && ' • '}
                            {expedition.endTime && `Término: ${expedition.endTime}`}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Description */}
              {expedition.description && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Info className="w-5 h-5" />
                      Descrição da Expedição
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground whitespace-pre-wrap">{expedition.description}</p>
                  </CardContent>
                </Card>
              )}

              {/* Guide Notes */}
              {expedition.guideNotes && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-orange-500" />
                      Observações do Guia
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                      <p className="text-muted-foreground whitespace-pre-wrap">{expedition.guideNotes}</p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Meeting Point */}
              {expedition.meetingPoint && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="w-5 h-5" />
                      Ponto de Encontro
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{expedition.meetingPoint}</p>
                  </CardContent>
                </Card>
              )}

              {/* What's Included */}
              {expedition.includedItems && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                      O que está incluso
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground whitespace-pre-wrap">{expedition.includedItems}</p>
                  </CardContent>
                </Card>
              )}

              {/* Image Gallery */}
              {allImages.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ImageIcon className="w-5 h-5" />
                      Fotos
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="relative">
                      <div className="aspect-video rounded-lg overflow-hidden bg-muted">
                        <img 
                          src={allImages[currentImageIndex]} 
                          alt={`Foto ${currentImageIndex + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      {allImages.length > 1 && (
                        <>
                          <Button
                            variant="outline"
                            size="icon"
                            className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/80"
                            onClick={() => setCurrentImageIndex(i => i === 0 ? allImages.length - 1 : i - 1)}
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/80"
                            onClick={() => setCurrentImageIndex(i => i === allImages.length - 1 ? 0 : i + 1)}
                          >
                            <ChevronRight className="w-4 h-4" />
                          </Button>
                          <div className="flex justify-center gap-2 mt-4">
                            {allImages.map((_, index) => (
                              <button
                                key={index}
                                className={`w-2 h-2 rounded-full transition-colors ${
                                  index === currentImageIndex ? 'bg-primary' : 'bg-muted-foreground/30'
                                }`}
                                onClick={() => setCurrentImageIndex(index)}
                              />
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                    {allImages.length > 1 && (
                      <div className="grid grid-cols-6 gap-2 mt-4">
                        {allImages.slice(0, 6).map((img, index) => (
                          <button
                            key={index}
                            className={`aspect-square rounded overflow-hidden border-2 transition-colors ${
                              index === currentImageIndex ? 'border-primary' : 'border-transparent'
                            }`}
                            onClick={() => setCurrentImageIndex(index)}
                          >
                            <img src={img} alt={`Thumbnail ${index + 1}`} className="w-full h-full object-cover" />
                          </button>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Participants List (Only for guide/admin) */}
              {isGuideOrAdmin && participants && participants.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      Lista de Participantes ({participants.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {participants.map(({ participant, user: participantUser }) => (
                        <div key={participant.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                              {participantUser.photoUrl ? (
                                <img src={participantUser.photoUrl} alt={participantUser.name || ''} className="w-full h-full object-cover" />
                              ) : (
                                <User className="w-5 h-5 text-primary" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium">{participantUser.name}</p>
                              <p className="text-sm text-muted-foreground">{participantUser.email}</p>
                            </div>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {format(new Date(participant.createdAt), "dd/MM/yyyy HH:mm")}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Booking Card */}
              <Card className="sticky top-24">
                <CardContent className="p-6">
                  {/* Price */}
                  {expedition.price && (
                    <div className="text-center mb-6">
                      <p className="text-sm text-muted-foreground">Valor por pessoa</p>
                      <p className="font-heading text-4xl font-bold text-primary">
                        R$ {parseFloat(expedition.price).toFixed(2)}
                      </p>
                    </div>
                  )}

                  <Separator className="my-4" />

                  {/* Capacity Info */}
                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Vagas totais</span>
                      <span className="font-medium">{capacity}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Inscritos</span>
                      <span className="font-medium">{enrolledCount}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Vagas disponíveis</span>
                      <span className={`font-bold ${availableSpots > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {availableSpots}
                      </span>
                    </div>
                    {/* Progress bar */}
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${Math.min(100, (enrolledCount / capacity) * 100)}%` }}
                      />
                    </div>
                    <p className="text-xs text-center text-muted-foreground">
                      {Math.round((enrolledCount / capacity) * 100)}% das vagas preenchidas
                    </p>
                  </div>

                  {/* CTA Button */}
                  {!isAuthenticated ? (
                    <Button 
                      className="w-full" 
                      size="lg"
                      onClick={() => window.location.href = getLoginUrl()}
                    >
                      Faça login para participar
                    </Button>
                  ) : isEnrolled ? (
                    <div className="space-y-3">
                      <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-center">
                        <CheckCircle2 className="w-6 h-6 text-green-600 mx-auto mb-2" />
                        <p className="font-medium text-green-700">Você está inscrito!</p>
                      </div>
                      <Button 
                        variant="outline" 
                        className="w-full text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
                        onClick={() => setShowCancelDialog(true)}
                      >
                        Cancelar inscrição
                      </Button>
                    </div>
                  ) : canEnroll ? (
                    <Button 
                      className="w-full" 
                      size="lg"
                      onClick={() => setShowEnrollDialog(true)}
                    >
                      Participar desta expedição
                    </Button>
                  ) : (
                    <Button className="w-full" size="lg" disabled>
                      {status === 'full' || availableSpots <= 0 ? 'Expedição Lotada' :
                       status === 'closed' ? 'Expedição Encerrada' :
                       status === 'cancelled' ? 'Expedição Cancelada' : 'Indisponível'}
                    </Button>
                  )}
                </CardContent>
              </Card>

              {/* Guide Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Guia Responsável</CardTitle>
                </CardHeader>
                <CardContent>
                  <div 
                    className="flex items-center gap-4 cursor-pointer hover:bg-muted/50 p-2 rounded-lg -m-2 transition-colors"
                    onClick={() => navigate(`/guia/${guide.cadasturNumber}`)}
                  >
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                      {guide.photoUrl ? (
                        <img src={guide.photoUrl} alt={guide.name || ''} className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-8 h-8 text-primary" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-heading font-semibold text-lg">{guide.name}</p>
                      {guide.cadasturNumber && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Award className="w-4 h-4 text-primary" />
                          CADASTUR: {guide.cadasturNumber}
                        </div>
                      )}
                    </div>
                  </div>

                  <Separator className="my-4" />

                  <div className="space-y-3">
                    {guide.email && (
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        <a href={`mailto:${guide.email}`} className="text-primary hover:underline">
                          {guide.email}
                        </a>
                      </div>
                    )}
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => navigate(`/guia/${guide.cadasturNumber}`)}
                    >
                      Ver perfil completo
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Trail Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Sobre a Trilha</CardTitle>
                </CardHeader>
                <CardContent>
                  <div 
                    className="cursor-pointer hover:bg-muted/50 p-2 rounded-lg -m-2 transition-colors"
                    onClick={() => navigate(`/trilha/${trail.id}`)}
                  >
                    {trail.imageUrl && (
                      <div className="aspect-video rounded-lg overflow-hidden mb-4">
                        <img src={trail.imageUrl} alt={trail.name} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <h3 className="font-heading font-semibold mb-2">{trail.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                      <MapPin className="w-4 h-4" />
                      {trail.city}, {trail.uf}
                    </div>
                    {trail.distanceKm && (
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{trail.distanceKm} km</span>
                        {trail.elevationGain && <span>↑ {trail.elevationGain}m</span>}
                      </div>
                    )}
                  </div>
                  <Button 
                    variant="outline" 
                    className="w-full mt-4"
                    onClick={() => navigate(`/trilha/${trail.id}`)}
                  >
                    Ver detalhes da trilha
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {/* Enrollment Dialog */}
      <Dialog open={showEnrollDialog} onOpenChange={setShowEnrollDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Inscrição</DialogTitle>
            <DialogDescription>
              Você está prestes a se inscrever na expedição "{expedition.title || trail.name}".
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Data:</span>
                <span>{format(new Date(expedition.startDate), "dd/MM/yyyy")}</span>
              </div>
              {expedition.price && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Valor:</span>
                  <span className="font-bold text-primary">R$ {parseFloat(expedition.price).toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Guia:</span>
                <span>{guide.name}</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEnrollDialog(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={() => enrollMutation.mutate({ expeditionId })}
              disabled={enrollMutation.isPending}
            >
              {enrollMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              Confirmar Inscrição
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancelar Inscrição</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja cancelar sua inscrição nesta expedição?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCancelDialog(false)}>
              Voltar
            </Button>
            <Button 
              variant="destructive"
              onClick={() => cancelMutation.mutate({ expeditionId })}
              disabled={cancelMutation.isPending}
            >
              {cancelMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              Confirmar Cancelamento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
