import { useParams, useLocation } from "wouter";
import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { 
  Mountain, MapPin, ArrowLeft, Heart, Calendar, Users, Loader2, Shield,
  Clock, TrendingUp, Droplets, Tent, Sun, AlertTriangle, ChevronLeft, ChevronRight,
  Route, DollarSign, Compass
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

export default function TrailDetail() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { isAuthenticated } = useAuth();
  const trailId = parseInt(id || "0");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

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
  const images = (trail.images as string[]) || [];
  const waterPoints = (trail.waterPoints as string[]) || [];
  const campingPoints = (trail.campingPoints as string[]) || [];
  const highlights = (trail.highlights as string[]) || [];

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

  const getTrailTypeLabel = (type: string | null) => {
    switch (type) {
      case 'linear': return 'Linear';
      case 'circular': return 'Circular';
      case 'traverse': return 'Travessia';
      default: return 'Linear';
    }
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero with Image Gallery */}
        <div className="relative h-[50vh] md:h-[60vh] bg-gradient-to-br from-forest/30 to-forest-light/30">
          {images.length > 0 ? (
            <>
              <img 
                src={images[currentImageIndex]} 
                alt={trail.name}
                className="absolute inset-0 w-full h-full object-cover"
              />
              {images.length > 1 && (
                <>
                  <button 
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button 
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                  <div className="absolute bottom-24 left-1/2 -translate-x-1/2 flex gap-2">
                    {images.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentImageIndex(idx)}
                        className={`w-2 h-2 rounded-full transition-colors ${
                          idx === currentImageIndex ? 'bg-white' : 'bg-white/50'
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <Mountain className="w-24 h-24 text-forest/30" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
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
              <div className="flex flex-wrap gap-2 mb-3">
                <Badge className={getDifficultyColor(trail.difficulty)}>
                  {getDifficultyLabel(trail.difficulty)}
                </Badge>
                {trail.guideRequired === 1 && (
                  <Badge variant="destructive" className="bg-orange-500">
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    Guia Obrigatório
                  </Badge>
                )}
                <Badge variant="secondary" className="bg-white/20 text-white">
                  {getTrailTypeLabel(trail.trailType)}
                </Badge>
              </div>
              <h1 className="font-heading text-3xl md:text-5xl font-bold text-white mb-2">
                {trail.name}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-white/90">
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {trail.city}, {trail.uf}
                </span>
                {trail.park && <span className="text-white/70">• {trail.park}</span>}
              </div>
            </div>
          </div>
        </div>

        {/* Hook Text */}
        {trail.hookText && (
          <div className="bg-forest text-white py-8">
            <div className="container">
              <p className="text-lg md:text-xl italic text-center max-w-4xl mx-auto leading-relaxed">
                "{trail.hookText}"
              </p>
            </div>
          </div>
        )}

        <div className="container py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Infographic Stats */}
              <Card className="overflow-hidden">
                <div className="bg-gradient-to-r from-forest to-forest-light p-4">
                  <h2 className="font-heading text-xl font-semibold text-white flex items-center gap-2">
                    <Compass className="w-5 h-5" />
                    Dados da Trilha
                  </h2>
                </div>
                <CardContent className="p-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="text-center">
                      <div className="w-12 h-12 bg-forest/10 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Route className="w-6 h-6 text-forest" />
                      </div>
                      <p className="text-2xl font-heading font-bold text-forest">
                        {trail.distanceKm ? `${trail.distanceKm}` : "N/A"}
                      </p>
                      <p className="text-sm text-muted-foreground">km de extensão</p>
                    </div>
                    <div className="text-center">
                      <div className="w-12 h-12 bg-forest/10 rounded-full flex items-center justify-center mx-auto mb-2">
                        <TrendingUp className="w-6 h-6 text-forest" />
                      </div>
                      <p className="text-2xl font-heading font-bold text-forest">
                        {trail.elevationGain ? `${trail.elevationGain}` : "N/A"}
                      </p>
                      <p className="text-sm text-muted-foreground">m de ganho de altitude</p>
                    </div>
                    <div className="text-center">
                      <div className="w-12 h-12 bg-forest/10 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Mountain className="w-6 h-6 text-forest" />
                      </div>
                      <p className="text-2xl font-heading font-bold text-forest">
                        {trail.maxAltitude ? `${trail.maxAltitude}` : "N/A"}
                      </p>
                      <p className="text-sm text-muted-foreground">m altitude máxima</p>
                    </div>
                    <div className="text-center">
                      <div className="w-12 h-12 bg-forest/10 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Clock className="w-6 h-6 text-forest" />
                      </div>
                      <p className="text-2xl font-heading font-bold text-forest">
                        {trail.estimatedTime || "N/A"}
                      </p>
                      <p className="text-sm text-muted-foreground">tempo estimado</p>
                    </div>
                  </div>

                  {/* Water and Camping Points */}
                  {(waterPoints.length > 0 || campingPoints.length > 0) && (
                    <div className="mt-6 pt-6 border-t grid grid-cols-1 md:grid-cols-2 gap-6">
                      {waterPoints.length > 0 && (
                        <div>
                          <h3 className="font-semibold flex items-center gap-2 mb-3">
                            <Droplets className="w-5 h-5 text-blue-500" />
                            Pontos de Água
                          </h3>
                          <ul className="space-y-1">
                            {waterPoints.map((point, idx) => (
                              <li key={idx} className="text-sm text-muted-foreground flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                                {point}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {campingPoints.length > 0 && (
                        <div>
                          <h3 className="font-semibold flex items-center gap-2 mb-3">
                            <Tent className="w-5 h-5 text-earth" />
                            Pontos de Camping
                          </h3>
                          <ul className="space-y-1">
                            {campingPoints.map((point, idx) => (
                              <li key={idx} className="text-sm text-muted-foreground flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-earth rounded-full" />
                                {point}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Description */}
              <Card>
                <CardContent className="p-6">
                  <h2 className="font-heading text-xl font-semibold mb-4">Sobre a trilha</h2>
                  {trail.shortDescription && (
                    <p className="text-lg text-forest font-medium mb-4">
                      {trail.shortDescription}
                    </p>
                  )}
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                    {trail.description || "Descrição não disponível para esta trilha."}
                  </p>
                </CardContent>
              </Card>

              {/* Highlights */}
              {highlights.length > 0 && (
                <Card>
                  <CardContent className="p-6">
                    <h2 className="font-heading text-xl font-semibold mb-4">Destaques</h2>
                    <div className="grid grid-cols-2 gap-3">
                      {highlights.map((highlight, idx) => (
                        <div key={idx} className="flex items-center gap-2 p-3 bg-forest/5 rounded-lg">
                          <Sun className="w-5 h-5 text-forest flex-shrink-0" />
                          <span className="text-sm">{highlight}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Image Gallery Thumbnails */}
              {images.length > 1 && (
                <Card>
                  <CardContent className="p-6">
                    <h2 className="font-heading text-xl font-semibold mb-4">Galeria de Fotos</h2>
                    <div className="grid grid-cols-4 gap-2">
                      {images.map((img, idx) => (
                        <button
                          key={idx}
                          onClick={() => setCurrentImageIndex(idx)}
                          className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                            idx === currentImageIndex ? 'border-forest ring-2 ring-forest/30' : 'border-transparent hover:border-forest/50'
                          }`}
                        >
                          <img src={img} alt={`${trail.name} ${idx + 1}`} className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

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
              {/* CTA Card */}
              {trail.ctaText && (
                <Card className="bg-gradient-to-br from-forest to-forest-light text-white overflow-hidden">
                  <CardContent className="p-6">
                    <p className="text-lg leading-relaxed mb-4">
                      {trail.ctaText}
                    </p>
                    <Button 
                      variant="secondary" 
                      className="w-full bg-white text-forest hover:bg-white/90"
                      onClick={() => navigate(`/trilhas?tab=expedicoes`)}
                    >
                      <Calendar className="w-4 h-4 mr-2" />
                      Ver expedições
                    </Button>
                  </CardContent>
                </Card>
              )}

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
                </CardContent>
              </Card>

              {/* Practical Info */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-heading font-semibold mb-4">Informações Práticas</h3>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <DollarSign className="w-5 h-5 text-forest flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium">Entrada</p>
                        <p className="text-sm text-muted-foreground">
                          {trail.entranceFee || "Não informado"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Sun className="w-5 h-5 text-forest flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium">Melhor Época</p>
                        <p className="text-sm text-muted-foreground">
                          {trail.bestSeason || "Ano todo"}
                        </p>
                      </div>
                    </div>
                    {trail.guideRequired === 1 && (
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium text-orange-600">Guia Obrigatório</p>
                          <p className="text-sm text-muted-foreground">
                            Esta trilha exige acompanhamento de guia credenciado
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
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
