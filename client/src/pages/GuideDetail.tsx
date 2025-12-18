import { useParams, useLocation } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Shield, Mail, Phone, Globe, Calendar, Users, MapPin, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function GuideDetail() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const guideId = parseInt(id || "0");

  const { data, isLoading, error } = trpc.guides.getById.useQuery({ id: guideId });

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

  const { guide, profile, expeditions } = data;

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
                  
                  {guide.cadasturValidated === 1 && (
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                      <Shield className="w-4 h-4" />
                      CADASTUR Verificado
                    </div>
                  )}

                  {guide.bio && (
                    <p className="text-muted-foreground text-sm mb-4">{guide.bio}</p>
                  )}

                  {/* Contact Info */}
                  <div className="space-y-3 text-left border-t pt-4 mt-4">
                    {profile?.contactEmail && (
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        <a href={`mailto:${profile.contactEmail}`} className="text-primary hover:underline">
                          {profile.contactEmail}
                        </a>
                      </div>
                    )}
                    {profile?.contactPhone && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        <a href={`tel:${profile.contactPhone}`} className="text-primary hover:underline">
                          {profile.contactPhone}
                        </a>
                      </div>
                    )}
                    {profile?.website && (
                      <div className="flex items-center gap-2 text-sm">
                        <Globe className="w-4 h-4 text-muted-foreground" />
                        <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                          Website
                        </a>
                      </div>
                    )}
                  </div>

                  <Button className="w-full mt-6">
                    <Mail className="w-4 h-4 mr-2" />
                    Entrar em contato
                  </Button>
                </CardContent>
              </Card>

              {/* CADASTUR Info */}
              {profile && (
                <Card className="mt-6">
                  <CardContent className="p-6">
                    <h3 className="font-heading font-semibold mb-4 flex items-center gap-2">
                      <Shield className="w-5 h-5 text-primary" />
                      Certificação CADASTUR
                    </h3>
                    <div className="space-y-2 text-sm">
                      <p><strong>Número:</strong> {profile.cadasturNumber}</p>
                      {profile.uf && <p><strong>Estado:</strong> {profile.uf}</p>}
                      {profile.city && <p><strong>Cidade:</strong> {profile.city}</p>}
                      {profile.cadasturValidatedAt && (
                        <p><strong>Validado em:</strong> {format(new Date(profile.cadasturValidatedAt), "dd/MM/yyyy")}</p>
                      )}
                      {profile.categories && profile.categories.length > 0 && (
                        <div>
                          <strong>Categorias:</strong>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {profile.categories.map((cat, i) => (
                              <span key={i} className="px-2 py-1 bg-muted rounded text-xs">{cat}</span>
                            ))}
                          </div>
                        </div>
                      )}
                      {profile.languages && profile.languages.length > 0 && (
                        <div>
                          <strong>Idiomas:</strong>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {profile.languages.map((lang, i) => (
                              <span key={i} className="px-2 py-1 bg-muted rounded text-xs">{lang}</span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Expeditions */}
            <div className="lg:col-span-2">
              <h2 className="font-heading text-2xl font-bold mb-6">Expedições</h2>
              
              {expeditions.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-heading text-lg font-semibold mb-2">Nenhuma expedição disponível</h3>
                    <p className="text-muted-foreground">Este guia ainda não possui expedições agendadas</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {expeditions.map((expedition) => (
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
