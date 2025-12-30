import { useState } from "react";
import { useLocation } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { Search, Users, Shield, Loader2, ChevronLeft, ChevronRight, MapPin, Phone, Mail, Globe, CheckCircle2 } from "lucide-react";

const BRAZILIAN_STATES = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG",
  "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO"
];

export default function Guides() {
  const [, navigate] = useLocation();
  const [searchText, setSearchText] = useState("");
  const [cadasturCode, setCadasturCode] = useState("");
  const [selectedUF, setSelectedUF] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading } = trpc.guides.list.useQuery({
    search: searchText || undefined,
    cadasturCode: cadasturCode || undefined,
    uf: selectedUF && selectedUF !== "all" ? selectedUF : undefined,
    page,
    limit: 12,
  });

  const totalPages = Math.ceil((data?.total || 0) / 12);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 bg-muted/30">
        <div className="container py-8">
          <div className="mb-8">
            <h1 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-2">
              Guias Certificados CADASTUR
            </h1>
            <p className="text-muted-foreground">
              {data?.total ? `${data.total.toLocaleString()} guias` : "Carregando..."} com certificação do Ministério do Turismo
            </p>
          </div>

          {/* Search Filters */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-foreground mb-1 block">Nome do guia</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar por nome..."
                      className="pl-10"
                      value={searchText}
                      onChange={(e) => setSearchText(e.target.value)}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Ignora maiúsculas e acentos</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">Código CADASTUR</label>
                  <div className="relative">
                    <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Ex: 12345678"
                      className="pl-10"
                      value={cadasturCode}
                      onChange={(e) => setCadasturCode(e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">Estado</label>
                  <Select value={selectedUF} onValueChange={setSelectedUF}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      {BRAZILIAN_STATES.map((uf) => (
                        <SelectItem key={uf} value={uf}>{uf}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button className="w-full" onClick={() => setPage(1)}>
                    <Search className="w-4 h-4 mr-2" />
                    Buscar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Legend */}
          <div className="flex flex-wrap items-center gap-4 mb-6 text-sm">
            <div className="flex items-center gap-2">
              <Badge variant="default" className="bg-primary">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                Verificado
              </Badge>
              <span className="text-muted-foreground">Cadastrado no Trekko</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="border-amber-500 text-amber-600">
                <Shield className="w-3 h-3 mr-1" />
                CADASTUR
              </Badge>
              <span className="text-muted-foreground">Certificação oficial</span>
            </div>
          </div>

          {/* Results */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : data?.guides.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-heading text-xl font-semibold mb-2">Nenhum guia encontrado</h3>
              <p className="text-muted-foreground">Tente ajustar os filtros de busca</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {data?.guides.map((guide) => (
                  <Card 
                    key={guide.id} 
                    className={`overflow-hidden cursor-pointer hover:shadow-lg transition-shadow ${guide.isVerified ? 'ring-2 ring-primary/20' : ''}`}
                    onClick={() => navigate(`/guia/${guide.cadasturNumber}`)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <span className="text-xl font-semibold text-primary">
                            {guide.name?.charAt(0).toUpperCase() || "G"}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-heading font-semibold text-base mb-1 truncate" title={guide.name}>
                            {guide.name || "Guia"}
                          </h3>
                          
                          {/* Badges */}
                          <div className="flex flex-wrap gap-1 mb-2">
                            {guide.isVerified && (
                              <Badge variant="default" className="bg-primary text-xs">
                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                Verificado
                              </Badge>
                            )}
                            <Badge variant="outline" className="border-amber-500 text-amber-600 text-xs">
                              <Shield className="w-3 h-3 mr-1" />
                              CADASTUR
                            </Badge>
                          </div>
                          
                          {/* Location */}
                          <div className="flex items-center gap-1 text-sm text-muted-foreground mb-1">
                            <MapPin className="w-3 h-3" />
                            <span className="truncate">{guide.city ? `${guide.city}, ${guide.uf}` : guide.uf}</span>
                          </div>
                          
                          {/* Categories */}
                          {guide.categories && guide.categories.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {guide.categories.slice(0, 2).map((cat, i) => (
                                <Badge key={i} variant="secondary" className="text-xs">
                                  {cat}
                                </Badge>
                              ))}
                              {guide.categories.length > 2 && (
                                <Badge variant="secondary" className="text-xs">
                                  +{guide.categories.length - 2}
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Contact info */}
                      <div className="mt-4 pt-4 border-t border-border space-y-1">
                        {guide.phone && (
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Phone className="w-3 h-3" />
                            <span className="truncate">{guide.phone}</span>
                          </div>
                        )}
                        {guide.email && (
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Mail className="w-3 h-3" />
                            <span className="truncate">{guide.email}</span>
                          </div>
                        )}
                        {guide.website && (
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Globe className="w-3 h-3" />
                            <span className="truncate">{guide.website}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <span className="text-sm text-muted-foreground px-4">
                    Página {page} de {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
