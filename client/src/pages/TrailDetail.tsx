import { useParams, useLocation } from "wouter";
import { useState } from "react";
import { Helmet } from "react-helmet-async";
import ImageLightbox from "@/components/ImageLightbox";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ReviewsList } from "@/components/ReviewsList";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { 
  Mountain, MapPin, ArrowLeft, Heart, Calendar, Users, Loader2, Shield,
  Clock, TrendingUp, Droplets, Tent, Sun, AlertTriangle, ChevronLeft, ChevronRight,
  Route, DollarSign, Compass, Expand, ChevronRight as ChevronRightIcon, HelpCircle,
  Navigation, Map, ThermometerSun, Info
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
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

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

  const getDifficultyProfile = (difficulty: string | null) => {
    switch (difficulty) {
      case 'easy': return 'iniciantes e famílias';
      case 'moderate': return 'trilheiros com alguma experiência';
      case 'hard': return 'trilheiros experientes';
      case 'expert': return 'montanhistas e atletas';
      default: return 'todos os níveis';
    }
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  // SEO Meta Data
  const metaTitle = `Trilha ${trail.name}: guia completo, mapa, nível e dicas essenciais | Trekko`;
  const metaDescription = `A Trilha ${trail.name} é uma das trilhas mais conhecidas do Brasil, localizada em ${trail.city}, ${trail.uf}. Possui ${trail.distanceKm || 'N/A'} km, nível ${getDifficultyLabel(trail.difficulty).toLowerCase()} e é indicada para ${getDifficultyProfile(trail.difficulty)}. Veja o guia completo.`;
  const canonicalUrl = `https://trekko.com.br/trilha/${trail.id}`;
  const mainImage = images[0] || trail.imageUrl || 'https://trekko.com.br/og-image.jpg';

  // Schema.org structured data
  const schemaData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "TouristAttraction",
        "@id": canonicalUrl,
        "name": `Trilha ${trail.name}`,
        "description": trail.description || metaDescription,
        "image": images.length > 0 ? images : [mainImage],
        "address": {
          "@type": "PostalAddress",
          "addressLocality": trail.city,
          "addressRegion": trail.uf,
          "addressCountry": "BR"
        },
        "geo": trail.mapCoordinates ? {
          "@type": "GeoCoordinates",
          "latitude": (trail.mapCoordinates as any)?.lat,
          "longitude": (trail.mapCoordinates as any)?.lng
        } : undefined,
        "isAccessibleForFree": !trail.entranceFee || trail.entranceFee === "Gratuito",
        "publicAccess": true,
        "touristType": getDifficultyProfile(trail.difficulty)
      },
      {
        "@type": "Place",
        "name": trail.park || `${trail.city}, ${trail.uf}`,
        "address": {
          "@type": "PostalAddress",
          "addressLocality": trail.city,
          "addressRegion": trail.uf,
          "addressCountry": "BR"
        }
      },
      {
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": `Qual a dificuldade da Trilha ${trail.name}?`,
            "acceptedAnswer": {
              "@type": "Answer",
              "text": `A Trilha ${trail.name} possui nível de dificuldade ${getDifficultyLabel(trail.difficulty).toLowerCase()}, sendo indicada para ${getDifficultyProfile(trail.difficulty)}. O percurso tem ${trail.distanceKm || 'N/A'} km de extensão e ${trail.elevationGain || 'N/A'} metros de ganho de altitude.`
            }
          },
          {
            "@type": "Question",
            "name": `Quanto tempo leva para fazer a Trilha ${trail.name}?`,
            "acceptedAnswer": {
              "@type": "Answer",
              "text": `O tempo estimado para completar a Trilha ${trail.name} é de ${trail.estimatedTime || '2-4 horas'}. Esse tempo pode variar de acordo com o preparo físico, condições climáticas e paradas para contemplação e descanso.`
            }
          },
          {
            "@type": "Question",
            "name": `É obrigatório guia na Trilha ${trail.name}?`,
            "acceptedAnswer": {
              "@type": "Answer",
              "text": trail.guideRequired === 1 
                ? `Sim, a Trilha ${trail.name} exige acompanhamento de guia credenciado. Recomendamos contratar guias certificados pelo CADASTUR para garantir segurança e uma experiência completa.`
                : `Não é obrigatório guia para a Trilha ${trail.name}, porém recomendamos para quem não conhece a região ou não tem experiência em trilhas. Guias locais podem enriquecer a experiência com informações sobre fauna, flora e história.`
            }
          },
          {
            "@type": "Question",
            "name": `Precisa pagar entrada na Trilha ${trail.name}?`,
            "acceptedAnswer": {
              "@type": "Answer",
              "text": trail.entranceFee 
                ? `${trail.entranceFee}. Verifique sempre os valores atualizados diretamente com a administração do parque ou área de conservação.`
                : `Não há informação confirmada sobre taxa de entrada. Recomendamos verificar diretamente com a administração local antes de sua visita.`
            }
          },
          {
            "@type": "Question",
            "name": `A Trilha ${trail.name} é segura?`,
            "acceptedAnswer": {
              "@type": "Answer",
              "text": `A Trilha ${trail.name} é considerada segura quando realizada com preparo adequado. Recomendamos: levar água suficiente, usar calçados apropriados, informar alguém sobre seu roteiro, verificar condições climáticas e respeitar seus limites físicos. ${trail.guideRequired === 1 ? 'Por ser uma trilha que exige guia, a segurança é reforçada com acompanhamento profissional.' : ''}`
            }
          },
          {
            "@type": "Question",
            "name": `Qual a melhor época para fazer a Trilha ${trail.name}?`,
            "acceptedAnswer": {
              "@type": "Answer",
              "text": trail.bestSeason 
                ? `A melhor época para fazer a Trilha ${trail.name} é ${trail.bestSeason}. Nesse período, as condições climáticas são mais favoráveis para a prática de trekking na região.`
                : `A Trilha ${trail.name} pode ser feita durante todo o ano, mas recomendamos evitar períodos de chuvas intensas. Consulte a previsão do tempo antes de sua visita.`
            }
          }
        ]
      },
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Início",
            "item": "https://trekko.com.br"
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "Trilhas",
            "item": "https://trekko.com.br/trilhas"
          },
          {
            "@type": "ListItem",
            "position": 3,
            "name": `Trilha ${trail.name}`,
            "item": canonicalUrl
          }
        ]
      }
    ]
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* SEO Head */}
      <Helmet>
        <title>{metaTitle}</title>
        <meta name="description" content={metaDescription} />
        <link rel="canonical" href={canonicalUrl} />
        
        {/* Open Graph */}
        <meta property="og:type" content="article" />
        <meta property="og:title" content={metaTitle} />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:image" content={mainImage} />
        <meta property="og:site_name" content="Trekko" />
        <meta property="og:locale" content="pt_BR" />
        
        {/* Twitter Cards */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={metaTitle} />
        <meta name="twitter:description" content={metaDescription} />
        <meta name="twitter:image" content={mainImage} />
        
        {/* Additional SEO */}
        <meta name="robots" content="index, follow" />
        <meta name="author" content="Trekko" />
        <meta name="keywords" content={`trilha ${trail.name}, ${trail.name} como chegar, ${trail.name} dificuldade, ${trail.name} mapa, trekking ${trail.city}, trilhas ${trail.uf}, ecoturismo Brasil`} />
        
        {/* Schema.org JSON-LD */}
        <script type="application/ld+json">
          {JSON.stringify(schemaData)}
        </script>
      </Helmet>

      <Header />

      <main className="flex-1">
        {/* Breadcrumbs */}
        <nav className="bg-muted/50 border-b" aria-label="Breadcrumb">
          <div className="container py-3">
            <ol className="flex items-center gap-2 text-sm">
              <li>
                <a href="/" className="text-muted-foreground hover:text-foreground transition-colors">
                  Início
                </a>
              </li>
              <ChevronRightIcon className="w-4 h-4 text-muted-foreground" />
              <li>
                <a href="/trilhas" className="text-muted-foreground hover:text-foreground transition-colors">
                  Trilhas
                </a>
              </li>
              <ChevronRightIcon className="w-4 h-4 text-muted-foreground" />
              <li>
                <span className="text-foreground font-medium">Trilha {trail.name}</span>
              </li>
            </ol>
          </div>
        </nav>

        {/* Hero with Image Gallery */}
        <div className="relative h-[50vh] md:h-[60vh] bg-gradient-to-br from-forest/30 to-forest-light/30">
          {images.length > 0 ? (
            <>
              <img 
                src={images[currentImageIndex]} 
                alt={`Trilha ${trail.name} - ${trail.city}, ${trail.uf}`}
                className="absolute inset-0 w-full h-full object-cover cursor-pointer"
                onClick={() => setIsLightboxOpen(true)}
              />
              {/* Expand button */}
              <button
                onClick={() => setIsLightboxOpen(true)}
                className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
                aria-label="Expandir imagem"
              >
                <Expand className="w-5 h-5" />
              </button>
              {images.length > 1 && (
                <>
                  <button 
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
                    aria-label="Imagem anterior"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button 
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
                    aria-label="Próxima imagem"
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
                        aria-label={`Ver imagem ${idx + 1}`}
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
              {/* SEO H1 - Main heading */}
              <h1 className="font-heading text-3xl md:text-5xl font-bold text-white mb-2">
                Trilha {trail.name}
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

        {/* Featured Snippet Paragraph - Critical for SEO */}
        <div className="bg-forest text-white py-8">
          <div className="container">
            <p className="text-lg md:text-xl text-center max-w-4xl mx-auto leading-relaxed">
              A Trilha {trail.name} é uma das trilhas mais conhecidas do Brasil, localizada em {trail.city}, {trail.uf}
              {trail.park && ` (${trail.park})`}. Possui cerca de {trail.distanceKm || 'N/A'} km, 
              nível {getDifficultyLabel(trail.difficulty).toLowerCase()} e é indicada para {getDifficultyProfile(trail.difficulty)}. 
              Veja abaixo o guia completo com mapa, dicas e informações atualizadas.
            </p>
          </div>
        </div>

        <div className="container py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* H2: Onde fica */}
              <Card>
                <CardContent className="p-6">
                  <h2 className="font-heading text-2xl font-semibold mb-4 flex items-center gap-2">
                    <MapPin className="w-6 h-6 text-forest" />
                    Onde fica a Trilha {trail.name}
                  </h2>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    A Trilha {trail.name} está localizada em <strong>{trail.city}</strong>, no estado de <strong>{trail.uf}</strong>
                    {trail.region && <>, na região {trail.region}</>}
                    {trail.park && <>, dentro do <strong>{trail.park}</strong></>}. 
                    É uma das trilhas mais procuradas da região, atraindo trilheiros de todo o Brasil.
                  </p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <p className="font-medium">Estado</p>
                      <p className="text-muted-foreground">{trail.uf}</p>
                    </div>
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <p className="font-medium">Cidade</p>
                      <p className="text-muted-foreground">{trail.city || "N/A"}</p>
                    </div>
                    {trail.region && (
                      <div className="p-3 bg-muted/50 rounded-lg">
                        <p className="font-medium">Região</p>
                        <p className="text-muted-foreground">{trail.region}</p>
                      </div>
                    )}
                    {trail.park && (
                      <div className="p-3 bg-muted/50 rounded-lg">
                        <p className="font-medium">Parque/Área</p>
                        <p className="text-muted-foreground">{trail.park}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* H2: Sobre a Trilha */}
              <Card>
                <CardContent className="p-6">
                  <h2 className="font-heading text-2xl font-semibold mb-4 flex items-center gap-2">
                    <Info className="w-6 h-6 text-forest" />
                    Sobre a Trilha {trail.name}
                  </h2>
                  {trail.shortDescription && (
                    <p className="text-lg text-forest font-medium mb-4">
                      {trail.shortDescription}
                    </p>
                  )}
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                    {trail.description || `A Trilha ${trail.name} é um destino imperdível para os amantes de trekking e ecoturismo. Com paisagens deslumbrantes e contato direto com a natureza, oferece uma experiência única para quem busca aventura e contemplação.`}
                  </p>
                </CardContent>
              </Card>

              {/* H2: Dados técnicos */}
              <Card className="overflow-hidden">
                <div className="bg-gradient-to-r from-forest to-forest-light p-4">
                  <h2 className="font-heading text-xl font-semibold text-white flex items-center gap-2">
                    <Compass className="w-5 h-5" />
                    Dados técnicos da trilha
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
                </CardContent>
              </Card>

              {/* H2: Nível de dificuldade */}
              <Card>
                <CardContent className="p-6">
                  <h2 className="font-heading text-2xl font-semibold mb-4 flex items-center gap-2">
                    <TrendingUp className="w-6 h-6 text-forest" />
                    Nível de dificuldade
                  </h2>
                  <div className="flex items-center gap-4 mb-4">
                    <Badge className={`${getDifficultyColor(trail.difficulty)} text-lg px-4 py-2`}>
                      {getDifficultyLabel(trail.difficulty)}
                    </Badge>
                    <Badge variant="outline" className="text-lg px-4 py-2">
                      {getTrailTypeLabel(trail.trailType)}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">
                    A Trilha {trail.name} possui nível de dificuldade <strong>{getDifficultyLabel(trail.difficulty).toLowerCase()}</strong>, 
                    sendo indicada para <strong>{getDifficultyProfile(trail.difficulty)}</strong>. 
                    {trail.difficulty === 'easy' && ' É uma ótima opção para quem está começando no mundo das trilhas ou para passeios em família.'}
                    {trail.difficulty === 'moderate' && ' Requer algum preparo físico e experiência básica em trilhas. Recomendamos calçados adequados e boa hidratação.'}
                    {trail.difficulty === 'hard' && ' Exige bom preparo físico e experiência em trilhas. Alguns trechos podem ser técnicos e demandar atenção redobrada.'}
                    {trail.difficulty === 'expert' && ' Trilha técnica que exige excelente preparo físico, experiência em montanhismo e equipamentos adequados. Não recomendada para iniciantes.'}
                  </p>
                </CardContent>
              </Card>

              {/* H2: Melhor época */}
              <Card>
                <CardContent className="p-6">
                  <h2 className="font-heading text-2xl font-semibold mb-4 flex items-center gap-2">
                    <ThermometerSun className="w-6 h-6 text-forest" />
                    Melhor época para fazer
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    {trail.bestSeason 
                      ? <>A melhor época para fazer a Trilha {trail.name} é <strong>{trail.bestSeason}</strong>. Nesse período, as condições climáticas são mais favoráveis, com menor chance de chuvas e temperaturas mais agradáveis para a prática de trekking.</>
                      : <>A Trilha {trail.name} pode ser feita durante todo o ano, mas recomendamos evitar períodos de chuvas intensas. Consulte sempre a previsão do tempo antes de sua visita e esteja preparado para mudanças climáticas.</>
                    }
                  </p>
                </CardContent>
              </Card>

              {/* H2: Precisa de guia? */}
              <Card className={trail.guideRequired === 1 ? "border-orange-200 bg-orange-50/50" : ""}>
                <CardContent className="p-6">
                  <h2 className="font-heading text-2xl font-semibold mb-4 flex items-center gap-2">
                    <Shield className={`w-6 h-6 ${trail.guideRequired === 1 ? "text-orange-500" : "text-forest"}`} />
                    Precisa de guia?
                  </h2>
                  {trail.guideRequired === 1 ? (
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Badge variant="destructive" className="bg-orange-500">
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          Guia Obrigatório
                        </Badge>
                      </div>
                      <p className="text-muted-foreground leading-relaxed mb-4">
                        <strong>Sim, a Trilha {trail.name} exige acompanhamento de guia credenciado.</strong> Esta exigência existe para garantir a segurança dos visitantes e a preservação do ambiente natural. Recomendamos contratar guias certificados pelo CADASTUR para uma experiência segura e enriquecedora.
                      </p>
                      <Button 
                        className="bg-forest hover:bg-forest-light"
                        onClick={() => navigate("/guias")}
                      >
                        <Shield className="w-4 h-4 mr-2" />
                        Ver guias disponíveis para esta trilha
                      </Button>
                    </div>
                  ) : (
                    <p className="text-muted-foreground leading-relaxed">
                      <strong>Não é obrigatório guia</strong> para a Trilha {trail.name}, porém recomendamos para quem não conhece a região ou não tem experiência em trilhas. Guias locais podem enriquecer significativamente a experiência, oferecendo informações sobre fauna, flora, história e pontos de interesse que você poderia perder sozinho.
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Water and Camping Points */}
              {(waterPoints.length > 0 || campingPoints.length > 0) && (
                <Card>
                  <CardContent className="p-6">
                    <h2 className="font-heading text-2xl font-semibold mb-4">Pontos de apoio</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  </CardContent>
                </Card>
              )}

              {/* Highlights */}
              {highlights.length > 0 && (
                <Card>
                  <CardContent className="p-6">
                    <h2 className="font-heading text-2xl font-semibold mb-4 flex items-center gap-2">
                      <Sun className="w-6 h-6 text-forest" />
                      Destaques da trilha
                    </h2>
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

              {/* H2: Dicas de segurança */}
              <Card>
                <CardContent className="p-6">
                  <h2 className="font-heading text-2xl font-semibold mb-4 flex items-center gap-2">
                    <AlertTriangle className="w-6 h-6 text-forest" />
                    Dicas essenciais de segurança
                  </h2>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                      <span className="w-6 h-6 bg-forest text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">1</span>
                      <p className="text-sm text-muted-foreground"><strong>Leve água suficiente</strong> — Hidratação é fundamental. Calcule pelo menos 500ml por hora de caminhada.</p>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                      <span className="w-6 h-6 bg-forest text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">2</span>
                      <p className="text-sm text-muted-foreground"><strong>Use calçados adequados</strong> — Botas ou tênis de trilha com boa aderência são essenciais.</p>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                      <span className="w-6 h-6 bg-forest text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">3</span>
                      <p className="text-sm text-muted-foreground"><strong>Informe seu roteiro</strong> — Sempre avise alguém sobre seu destino e horário previsto de retorno.</p>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                      <span className="w-6 h-6 bg-forest text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">4</span>
                      <p className="text-sm text-muted-foreground"><strong>Verifique o clima</strong> — Consulte a previsão do tempo e evite trilhas em condições adversas.</p>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                      <span className="w-6 h-6 bg-forest text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">5</span>
                      <p className="text-sm text-muted-foreground"><strong>Respeite seus limites</strong> — A montanha sempre estará lá. Não hesite em voltar se necessário.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* H2: FAQ Section - Critical for SGE */}
              <Card>
                <CardContent className="p-6">
                  <h2 className="font-heading text-2xl font-semibold mb-6 flex items-center gap-2">
                    <HelpCircle className="w-6 h-6 text-forest" />
                    Perguntas frequentes sobre a Trilha {trail.name}
                  </h2>
                  <div className="space-y-6">
                    <div className="border-b pb-4">
                      <h3 className="font-semibold mb-2">Qual a dificuldade da Trilha {trail.name}?</h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        A Trilha {trail.name} possui nível de dificuldade {getDifficultyLabel(trail.difficulty).toLowerCase()}, sendo indicada para {getDifficultyProfile(trail.difficulty)}. O percurso tem {trail.distanceKm || 'N/A'} km de extensão e {trail.elevationGain || 'N/A'} metros de ganho de altitude.
                      </p>
                    </div>
                    <div className="border-b pb-4">
                      <h3 className="font-semibold mb-2">Quanto tempo leva para fazer a Trilha {trail.name}?</h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        O tempo estimado para completar a Trilha {trail.name} é de {trail.estimatedTime || '2-4 horas'}. Esse tempo pode variar de acordo com o preparo físico, condições climáticas e paradas para contemplação e descanso.
                      </p>
                    </div>
                    <div className="border-b pb-4">
                      <h3 className="font-semibold mb-2">É obrigatório guia na Trilha {trail.name}?</h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        {trail.guideRequired === 1 
                          ? `Sim, a Trilha ${trail.name} exige acompanhamento de guia credenciado. Recomendamos contratar guias certificados pelo CADASTUR para garantir segurança e uma experiência completa.`
                          : `Não é obrigatório guia para a Trilha ${trail.name}, porém recomendamos para quem não conhece a região ou não tem experiência em trilhas.`
                        }
                      </p>
                    </div>
                    <div className="border-b pb-4">
                      <h3 className="font-semibold mb-2">Precisa pagar entrada na Trilha {trail.name}?</h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        {trail.entranceFee 
                          ? `${trail.entranceFee}. Verifique sempre os valores atualizados diretamente com a administração do parque ou área de conservação.`
                          : `Não há informação confirmada sobre taxa de entrada. Recomendamos verificar diretamente com a administração local antes de sua visita.`
                        }
                      </p>
                    </div>
                    <div className="border-b pb-4">
                      <h3 className="font-semibold mb-2">A Trilha {trail.name} é segura?</h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        A Trilha {trail.name} é considerada segura quando realizada com preparo adequado. Recomendamos: levar água suficiente, usar calçados apropriados, informar alguém sobre seu roteiro, verificar condições climáticas e respeitar seus limites físicos.
                      </p>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">Qual a melhor época para fazer a Trilha {trail.name}?</h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        {trail.bestSeason 
                          ? `A melhor época para fazer a Trilha ${trail.name} é ${trail.bestSeason}. Nesse período, as condições climáticas são mais favoráveis para a prática de trekking.`
                          : `A Trilha ${trail.name} pode ser feita durante todo o ano, mas recomendamos evitar períodos de chuvas intensas.`
                        }
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Image Gallery Thumbnails */}
              {images.length > 1 && (
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="font-heading text-xl font-semibold">Galeria de Fotos</h2>
                      <button
                        onClick={() => {
                          setCurrentImageIndex(0);
                          setIsLightboxOpen(true);
                        }}
                        className="text-sm text-forest hover:text-forest-light flex items-center gap-1 transition-colors"
                      >
                        <Expand className="w-4 h-4" />
                        Ver todas
                      </button>
                    </div>
                    <div className="grid grid-cols-5 sm:grid-cols-5 gap-2">
                      {images.map((img, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            setCurrentImageIndex(idx);
                            setIsLightboxOpen(true);
                          }}
                          className={`aspect-square rounded-lg overflow-hidden border-2 transition-all hover:scale-105 ${
                            idx === currentImageIndex ? 'border-forest ring-2 ring-forest/30' : 'border-transparent hover:border-forest/50'
                          }`}
                        >
                          <img src={img} alt={`Trilha ${trail.name} - foto ${idx + 1}`} className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* H2: CTA - Agende sua trilha */}
              <Card className="bg-gradient-to-br from-forest to-forest-light text-white overflow-hidden">
                <CardContent className="p-6">
                  <h2 className="font-heading text-2xl font-semibold mb-4">
                    Agende sua trilha com um guia local no Trekko
                  </h2>
                  <p className="text-white/90 leading-relaxed mb-6">
                    Este conteúdo é mantido e atualizado pela plataforma Trekko, especializada em trilhas reais no Brasil 
                    e na conexão entre trilheiros e guias locais certificados. Encontre guias experientes para a Trilha {trail.name} 
                    e viva uma experiência segura e inesquecível.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button 
                      variant="secondary" 
                      className="bg-white text-forest hover:bg-white/90"
                      onClick={() => navigate("/guias")}
                    >
                      <Shield className="w-4 h-4 mr-2" />
                      Ver guias disponíveis para esta trilha
                    </Button>
                    {relatedExpeditions.length > 0 && (
                      <Button 
                        variant="outline" 
                        className="border-white text-white hover:bg-white/20"
                        onClick={() => navigate(`/trilhas?tab=expedicoes`)}
                      >
                        <Calendar className="w-4 h-4 mr-2" />
                        Ver expedições
                      </Button>
                    )}
                  </div>
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
                                {(expedition.capacity || 10) - (expedition.enrolledCount || 0)} vagas
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            {expedition.price && (
                              <p className="font-heading font-semibold text-primary">
                                R$ {parseFloat(expedition.price).toFixed(2)}
                              </p>
                            )}
                            <Button size="sm" className="mt-2" onClick={() => navigate(`/expedicao/${expedition.id}`)}>
                              Participar
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Reviews Section */}
              <Card>
                <CardContent className="p-6">
                  <ReviewsList
                    targetType="trail"
                    targetId={trailId}
                    targetName={trail.name}
                  />
                </CardContent>
              </Card>
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

              {/* Find Guides CTA */}
              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Shield className="w-5 h-5 text-primary" />
                    <h3 className="font-heading font-semibold">Guias certificados</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Encontre guias CADASTUR para esta trilha e viva uma experiência segura
                  </p>
                  <Button variant="outline" className="w-full" onClick={() => navigate("/guias")}>
                    Ver guias disponíveis
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {/* Lightbox Modal */}
      <ImageLightbox
        images={images}
        currentIndex={currentImageIndex}
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
        onIndexChange={setCurrentImageIndex}
        altText={`Trilha ${trail.name}`}
      />
    </div>
  );
}
