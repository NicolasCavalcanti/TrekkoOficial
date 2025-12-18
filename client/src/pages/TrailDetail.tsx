import { useParams, useLocation } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Mountain, MapPin, ArrowLeft, Heart, Calendar, Users, Loader2, Shield } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

export default function TrailDetail() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { isAuthenticated } = useAuth();
  const trailId = parseInt(id || "0");

  const { data, isLoading, error } = trpc.trails.getById.useQuery({ id: trailId });
  const { data: isFavorite, refetch: refetchFavorite } = trpc.favorites.check.useQuery(
    { trailId },
    { enabled: isAuthenticated }
  );
  
  const addFavoriteMutation = trpc.favorites.add.useMutation({
    onSuccess: () => {
      refetchFavorite();
      toast.success("Trilha adicionada aos favoritos!");
    },
  });
  
  const removeFavoriteMutation = trpc.favorites.remove.useMutation({
    onSuccess: () => {
      refetchFavorite();
      toast.success("Trilha removida dos favoritos");
    },
  });

  const handleFavorite = () => {
    if (!isAuthenticated) {
      toast.error("Faça login para favoritar trilhas");
      return;
    }
    if (isFavorite) {
      removeFavoriteMutation.mutate({ trailId });
    } else {
      addFavoriteMutation.mutate({ trailId });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
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
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Mountain className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="font-heading text-xl font-semibold mb-2">Trilha não encontrada</h2>
            <Button onClick={() => navigate("/trilhas")}>Voltar para trilhas</Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const { trail, relatedExpeditions } = data;

  const getDifficultyLabel = (difficulty: string | null) => {
    switch (difficulty) {
      case 'easy': return 'Fácil';
      case 'moderate': return 'Moderada';
      case 'hard': return 'Difícil';
      case 'expert': return 'Especialista';
      default: return 'Não informada';
    }
  };

  const getDifficultyColor = (difficulty: string | null) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-700';
      case 'moderate': return 'bg-yellow-100 text-yellow-700';
      case 'hard': return 'bg-orange-100 text-orange-700';
      case 'expert': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero */}
        <div className="relative h-64 md:h-96 bg-gradient-to-br from-forest/30 to-forest-light/30">
          <div className="absolute inset-0 flex items-center justify-center">
            <Mountain className="w-24 h-24 text-forest/30" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
            <div className="container">
              <Button
                variant="ghost"
                size="sm"
                className="text-white mb-4 hover:bg-white/20"
                onClick={() => navigate("/trilhas")}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
              <h1 className="font-heading text-3xl md:text-4xl font-bold text-white mb-2">
                {trail.name}
              </h1>
              <div className="flex items-center gap-4 text-white/80">
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {trail.city}, {trail.uf}
                </span>
                {trail.region && <span>{trail.region}</span>}
              </div>
            </div>
          </div>
        </div>

        <div className="container py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Info Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-sm text-muted-foreground mb-1">Dificuldade</p>
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(trail.difficulty)}`}>
                      {getDifficultyLabel(trail.difficulty)}
                    </span>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-sm text-muted-foreground mb-1">Distância</p>
                    <p className="font-heading font-semibold text-lg">
                      {trail.distanceKm ? `${trail.distanceKm} km` : "N/A"}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-sm text-muted-foreground mb-1">Elevação</p>
                    <p className="font-heading font-semibold text-lg">
                      {trail.elevationGain ? `${trail.elevationGain}m` : "N/A"}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-sm text-muted-foreground mb-1">Estado</p>
                    <p className="font-heading font-semibold text-lg">{trail.uf}</p>
                  </CardContent>
                </Card>
              </div>

              {/* Description */}
              <Card>
                <CardContent className="p-6">
                  <h2 className="font-heading text-xl font-semibold mb-4">Sobre a trilha</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    {trail.description || "Descrição não disponível para esta trilha."}
                  </p>
                </CardContent>
              </Card>

              {/* Related Expeditions */}
              {relatedExpeditions.length > 0 && (
                <Card>
                  <CardContent className="p-6">
                    <h2 className="font-heading text-xl font-semibold mb-4">Expedições disponíveis</h2>
                    <div className="space-y-4">
                      {relatedExpeditions.map((expedition) => (
                        <div key={expedition.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                          <div>
                            <h3 className="font-medium">{expedition.title || "Expedição"}</h3>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                {format(new Date(expedition.startDate), "dd/MM/yyyy")}
                              </span>
                              <span className="flex items-center gap-1">
                                <Users className="w-4 h-4" />
                                {expedition.availableSpots} vagas
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            {expedition.price && (
                              <p className="font-heading font-semibold text-primary">
                                R$ {parseFloat(expedition.price).toFixed(2)}
                              </p>
                            )}
                            <Button size="sm" className="mt-2">Participar</Button>
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
              {/* Actions */}
              <Card>
                <CardContent className="p-6">
                  <Button
                    variant={isFavorite ? "default" : "outline"}
                    className="w-full mb-3"
                    onClick={handleFavorite}
                    disabled={addFavoriteMutation.isPending || removeFavoriteMutation.isPending}
                  >
                    <Heart className={`w-4 h-4 mr-2 ${isFavorite ? "fill-current" : ""}`} />
                    {isFavorite ? "Favoritada" : "Favoritar"}
                  </Button>
                  <Button variant="outline" className="w-full" onClick={() => navigate(`/trilhas?tab=expedicoes`)}>
                    <Calendar className="w-4 h-4 mr-2" />
                    Ver expedições
                  </Button>
                </CardContent>
              </Card>

              {/* Location */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-heading font-semibold mb-4">Localização</h3>
                  <div className="space-y-2 text-sm">
                    <p><strong>Estado:</strong> {trail.uf}</p>
                    <p><strong>Cidade:</strong> {trail.city || "N/A"}</p>
                    {trail.region && <p><strong>Região:</strong> {trail.region}</p>}
                    {trail.park && <p><strong>Parque:</strong> {trail.park}</p>}
                  </div>
                </CardContent>
              </Card>

              {/* Find Guides */}
              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Shield className="w-5 h-5 text-primary" />
                    <h3 className="font-heading font-semibold">Guias certificados</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Encontre guias CADASTUR para esta trilha
                  </p>
                  <Button variant="outline" className="w-full" onClick={() => navigate("/guias")}>
                    Ver guias
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
