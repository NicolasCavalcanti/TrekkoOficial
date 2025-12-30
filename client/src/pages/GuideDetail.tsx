import { useParams, useLocation } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Shield, Mail, Phone, Globe, Calendar, Users, MapPin, Loader2, CheckCircle2, Car } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function GuideDetail() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const cadasturNumber = id || "";

  const { data, isLoading, error } = trpc.guides.getById.useQuery({ cadasturNumber });

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
            <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="font-heading text-xl font-semibold mb-2">Guia não encontrado</h2>
            <Button onClick={() => navigate("/guias")}>Voltar para guias</Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const { guide, expeditions } = data;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 bg-muted/30">
        <div className="container py-8">
          <Button
            variant="ghost"
            size="sm"
            className="mb-6"
            onClick={() => navigate("/guias")}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para guias
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Card */}
            <div className="lg:col-span-1">
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="w-32 h-32 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    {guide.photoUrl ? (
                      <img src={guide.photoUrl} alt="" className="w-32 h-32 rounded-full object-cover" />
                    ) : (
                      <span className="text-4xl font-semibold text-primary">
                        {guide.name?.charAt(0).toUpperCase() || "G"}
                      </span>
                    )}
                  </div>
                  <h1 className="font-heading text-2xl font-bold mb-2">{guide.name || "Guia"}</h1>
                  
                  {/* Badges */}
                  <div className="flex flex-wrap justify-center gap-2 mb-4">
                    {guide.isVerified && (
                      <Badge variant="default" className="bg-primary">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Verificado no Trekko
                      </Badge>
                    )}
                    <Badge variant="outline" className="border-amber-500 text-amber-600">
                      <Shield className="w-3 h-3 mr-1" />
                      CADASTUR
                    </Badge>
                    {guide.isDriverGuide && (
                      <Badge variant="secondary">
                        <Car className="w-3 h-3 mr-1" />
                        Guia Motorista
                      </Badge>
                    )}
                  </div>

                  {guide.bio && (
                    <p className="text-muted-foreground text-sm mb-4">{guide.bio}</p>
                  )}

                  {/* Contact Info */}
                  <div className="space-y-3 text-left border-t pt-4 mt-4">
                    {guide.email && (
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        <a href={`mailto:${guide.email}`} className="text-primary hover:underline truncate">
                          {guide.email}
                        </a>
                      </div>
                    )}
                    {guide.phone && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        <a href={`tel:${guide.phone}`} className="text-primary hover:underline">
                          {guide.phone}
                        </a>
                      </div>
                    )}
                    {guide.website && (
                      <div className="flex items-center gap-2 text-sm">
                        <Globe className="w-4 h-4 text-muted-foreground" />
                        <a href={guide.website.startsWith('http') ? guide.website : `https://${guide.website}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline truncate">
                          Website
                        </a>
                      </div>
                    )}
                  </div>

                  {guide.email && (
                    <Button className="w-full mt-6" asChild>
                      <a href={`mailto:${guide.email}`}>
                        <Mail className="w-4 h-4 mr-2" />
                        Entrar em contato
                      </a>
                    </Button>
                  )}
                </CardContent>
              </Card>

              {/* CADASTUR Info */}
              <Card className="mt-6">
                <CardContent className="p-6">
                  <h3 className="font-heading font-semibold mb-4 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-amber-600" />
                    Certificação CADASTUR
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="text-muted-foreground">Número:</span>
                      <span className="ml-2 font-medium">{guide.cadasturNumber}</span>
                    </div>
                    {guide.uf && (
                      <div>
                        <span className="text-muted-foreground">Estado:</span>
                        <span className="ml-2 font-medium">{guide.uf}</span>
                      </div>
                    )}
                    {guide.city && (
                      <div>
                        <span className="text-muted-foreground">Cidade:</span>
                        <span className="ml-2 font-medium">{guide.city}</span>
                      </div>
                    )}
                    {guide.validUntil && (
                      <div>
                        <span className="text-muted-foreground">Válido até:</span>
                        <span className="ml-2 font-medium">{format(new Date(guide.validUntil), "dd/MM/yyyy")}</span>
                      </div>
                    )}
                    {guide.categories && guide.categories.length > 0 && (
                      <div>
                        <span className="text-muted-foreground block mb-1">Categorias:</span>
                        <div className="flex flex-wrap gap-1">
                          {guide.categories.map((cat: string, i: number) => (
                            <Badge key={i} variant="secondary" className="text-xs">{cat}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {guide.languages && guide.languages.length > 0 && (
                      <div>
                        <span className="text-muted-foreground block mb-1">Idiomas:</span>
                        <div className="flex flex-wrap gap-1">
                          {guide.languages.map((lang: string, i: number) => (
                            <Badge key={i} variant="outline" className="text-xs">{lang}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {guide.segments && guide.segments.length > 0 && (
                      <div>
                        <span className="text-muted-foreground block mb-1">Segmentos:</span>
                        <div className="flex flex-wrap gap-1">
                          {guide.segments.map((seg: string, i: number) => (
                            <Badge key={i} variant="outline" className="text-xs">{seg}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Expeditions */}
            <div className="lg:col-span-2">
              <h2 className="font-heading text-2xl font-bold mb-6">Expedições</h2>
              
              {!guide.isVerified ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Shield className="w-12 h-12 text-amber-500 mx-auto mb-4" />
                    <h3 className="font-heading text-lg font-semibold mb-2">Guia não cadastrado no Trekko</h3>
                    <p className="text-muted-foreground mb-4">
                      Este guia possui certificação CADASTUR válida, mas ainda não se cadastrou na plataforma Trekko.
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Entre em contato diretamente com o guia usando as informações ao lado.
                    </p>
                  </CardContent>
                </Card>
              ) : expeditions.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-heading text-lg font-semibold mb-2">Nenhuma expedição disponível</h3>
                    <p className="text-muted-foreground">Este guia ainda não possui expedições agendadas</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {expeditions.map((expedition: any) => (
                    <ExpeditionCard key={expedition.id} expedition={expedition} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

function ExpeditionCard({ expedition }: { expedition: any }) {
  const { data: trailData } = trpc.trails.getById.useQuery({ id: expedition.trailId });
  const participateMutation = trpc.expeditions.participate.useMutation();

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-1">
            <h3 className="font-heading font-semibold text-lg mb-2">
              {expedition.title || trailData?.trail.name || "Expedição"}
            </h3>
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {format(new Date(expedition.startDate), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </span>
              {trailData?.trail && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {trailData.trail.city}, {trailData.trail.uf}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                {expedition.availableSpots} vagas disponíveis
              </span>
            </div>
            {expedition.notes && (
              <p className="text-sm text-muted-foreground mt-2">{expedition.notes}</p>
            )}
          </div>
          <div className="flex items-center gap-4">
            {expedition.price && (
              <span className="font-heading font-semibold text-xl text-primary">
                R$ {parseFloat(expedition.price).toFixed(2)}
              </span>
            )}
            <Button 
              onClick={() => participateMutation.mutate({ expeditionId: expedition.id })}
              disabled={participateMutation.isPending}
            >
              {participateMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Participar"
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
