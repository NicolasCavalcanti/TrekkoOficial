import { useState } from "react";
import { useLocation } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Search, Users, Shield, Loader2, ChevronLeft, ChevronRight } from "lucide-react";

const BRAZILIAN_STATES = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG",
  "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO"
];

export default function Guides() {
  const [, navigate] = useLocation();
  const [searchText, setSearchText] = useState("");
  const [selectedUF, setSelectedUF] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading } = trpc.guides.list.useQuery({
    search: searchText || undefined,
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
              Guias Certificados
            </h1>
            <p className="text-muted-foreground">
              Encontre guias com certificação CADASTUR para suas aventuras
            </p>
          </div>

          {/* Search Filters */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-foreground mb-1 block">Buscar</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Nome do guia..."
                      className="pl-10"
                      value={searchText}
                      onChange={(e) => setSearchText(e.target.value)}
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
                    className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => navigate(`/guia/${guide.id}`)}
                  >
                    <CardContent className="p-6 text-center">
                      <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                        {guide.photoUrl ? (
                          <img src={guide.photoUrl} alt="" className="w-24 h-24 rounded-full object-cover" />
                        ) : (
                          <span className="text-3xl font-semibold text-primary">
                            {guide.name?.charAt(0).toUpperCase() || "G"}
                          </span>
                        )}
                      </div>
                      <h3 className="font-heading font-semibold text-lg mb-1">{guide.name || "Guia"}</h3>
                      {guide.cadasturValidated === 1 && (
                        <div className="flex items-center justify-center gap-1 text-sm text-primary mb-2">
                          <Shield className="w-4 h-4" />
                          CADASTUR Verificado
                        </div>
                      )}
                      {guide.bio && (
                        <p className="text-sm text-muted-foreground line-clamp-2">{guide.bio}</p>
                      )}
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
