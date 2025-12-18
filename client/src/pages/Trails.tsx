import { useState, useEffect } from "react";
import { useLocation, useSearch } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Search, Mountain, MapPin, Calendar, Users, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const BRAZILIAN_STATES = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG",
  "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO"
];

const DIFFICULTIES = [
  { value: "easy", label: "Fácil" },
  { value: "moderate", label: "Moderada" },
  { value: "hard", label: "Difícil" },
  { value: "expert", label: "Especialista" },
];

export default function Trails() {
  const [, navigate] = useLocation();
  const searchParams = useSearch();
  const params = new URLSearchParams(searchParams);

  const [activeTab, setActiveTab] = useState(params.get("tab") || "trilhas");
  const [searchText, setSearchText] = useState(params.get("q") || "");
  const [selectedUF, setSelectedUF] = useState(params.get("uf") || "");
  const [selectedDifficulty, setSelectedDifficulty] = useState(params.get("difficulty") || "");
  const [maxDistance, setMaxDistance] = useState(params.get("distance") || "");
  const [page, setPage] = useState(1);

  // Expedition filters
  const [expSearchText, setExpSearchText] = useState("");
  const [expUF, setExpUF] = useState("");
  const [expStartDate, setExpStartDate] = useState("");
  const [expEndDate, setExpEndDate] = useState("");
  const [expPage, setExpPage] = useState(1);

  const { data: trailsData, isLoading: trailsLoading } = trpc.trails.list.useQuery({
    search: searchText || undefined,
    uf: selectedUF && selectedUF !== "all" ? selectedUF : undefined,
    difficulty: selectedDifficulty && selectedDifficulty !== "all" ? selectedDifficulty : undefined,
    maxDistance: maxDistance ? parseInt(maxDistance) : undefined,
    page,
    limit: 12,
  });

  const { data: expeditionsData, isLoading: expeditionsLoading } = trpc.expeditions.list.useQuery({
    search: expSearchText || undefined,
    uf: expUF && expUF !== "all" ? expUF : undefined,
    startDate: expStartDate ? new Date(expStartDate) : undefined,
    endDate: expEndDate ? new Date(expEndDate) : undefined,
    page: expPage,
    limit: 12,
  });

  const totalTrailPages = Math.ceil((trailsData?.total || 0) / 12);
  const totalExpPages = Math.ceil((expeditionsData?.total || 0) / 12);

  const handleTrailSearch = () => {
    setPage(1);
    const newParams = new URLSearchParams();
    newParams.set("tab", "trilhas");
    if (searchText) newParams.set("q", searchText);
    if (selectedUF && selectedUF !== "all") newParams.set("uf", selectedUF);
    if (selectedDifficulty && selectedDifficulty !== "all") newParams.set("difficulty", selectedDifficulty);
    if (maxDistance) newParams.set("distance", maxDistance);
    navigate(`/trilhas?${newParams.toString()}`);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 bg-muted/30">
        <div className="container py-8">
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-6">
            Explorar
          </h1>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="trilhas">Trilhas</TabsTrigger>
              <TabsTrigger value="expedicoes">Expedições</TabsTrigger>
            </TabsList>

            {/* Trails Tab */}
            <TabsContent value="trilhas">
              {/* Search Filters */}
              <Card className="mb-6">
                <CardContent className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div className="md:col-span-2">
                      <label className="text-sm font-medium text-foreground mb-1 block">Buscar</label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          placeholder="Nome ou local..."
                          className="pl-10"
                          value={searchText}
                          onChange={(e) => setSearchText(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && handleTrailSearch()}
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
                    <div>
                      <label className="text-sm font-medium text-foreground mb-1 block">Dificuldade</label>
                      <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                        <SelectTrigger>
                          <SelectValue placeholder="Todas" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todas</SelectItem>
                          {DIFFICULTIES.map((d) => (
                            <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-end">
                      <Button onClick={handleTrailSearch} className="w-full">
                        <Search className="w-4 h-4 mr-2" />
                        Buscar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Results */}
              {trailsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : trailsData?.trails.length === 0 ? (
                <div className="text-center py-12">
                  <Mountain className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-heading text-xl font-semibold mb-2">Nenhuma trilha encontrada</h3>
                  <p className="text-muted-foreground">Tente ajustar os filtros de busca</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {trailsData?.trails.map((trail) => (
                      <Card 
                        key={trail.id} 
                        className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                        onClick={() => navigate(`/trilha/${trail.id}`)}
                      >
                        <div className="h-40 bg-gradient-to-br from-forest/20 to-forest-light/20 flex items-center justify-center">
                          <Mountain className="w-12 h-12 text-forest/40" />
                        </div>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="font-heading font-semibold">{trail.name}</h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              trail.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                              trail.difficulty === 'moderate' ? 'bg-yellow-100 text-yellow-700' :
                              trail.difficulty === 'hard' ? 'bg-orange-100 text-orange-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                              {trail.difficulty === 'easy' ? 'Fácil' :
                               trail.difficulty === 'moderate' ? 'Moderada' :
                               trail.difficulty === 'hard' ? 'Difícil' : 'Especialista'}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {trail.city}, {trail.uf}
                            </span>
                            {trail.distanceKm && (
                              <span>{trail.distanceKm} km</span>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalTrailPages > 1 && (
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
                        Página {page} de {totalTrailPages}
                      </span>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setPage(p => Math.min(totalTrailPages, p + 1))}
                        disabled={page === totalTrailPages}
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </>
              )}
            </TabsContent>

            {/* Expeditions Tab */}
            <TabsContent value="expedicoes">
              {/* Search Filters */}
              <Card className="mb-6">
                <CardContent className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div className="md:col-span-2">
                      <label className="text-sm font-medium text-foreground mb-1 block">Buscar</label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          placeholder="Trilha ou guia..."
                          className="pl-10"
                          value={expSearchText}
                          onChange={(e) => setExpSearchText(e.target.value)}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-1 block">Estado</label>
                      <Select value={expUF} onValueChange={setExpUF}>
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
                    <div>
                      <label className="text-sm font-medium text-foreground mb-1 block">Data início</label>
                      <Input
                        type="date"
                        value={expStartDate}
                        onChange={(e) => setExpStartDate(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-1 block">Data fim</label>
                      <Input
                        type="date"
                        value={expEndDate}
                        onChange={(e) => setExpEndDate(e.target.value)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Results */}
              {expeditionsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : expeditionsData?.expeditions.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-heading text-xl font-semibold mb-2">Nenhuma expedição encontrada</h3>
                  <p className="text-muted-foreground">Tente ajustar os filtros ou volte mais tarde</p>
                </div>
              ) : (
                <>
                  <div className="space-y-4">
                    {expeditionsData?.expeditions.map((expedition) => (
                      <ExpeditionCard key={expedition.id} expedition={expedition} />
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalExpPages > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-8">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setExpPage(p => Math.max(1, p - 1))}
                        disabled={expPage === 1}
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <span className="text-sm text-muted-foreground px-4">
                        Página {expPage} de {totalExpPages}
                      </span>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setExpPage(p => Math.min(totalExpPages, p + 1))}
                        disabled={expPage === totalExpPages}
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
}

function ExpeditionCard({ expedition }: { expedition: any }) {
  const [, navigate] = useLocation();
  const { data: trailData } = trpc.trails.getById.useQuery({ id: expedition.trailId });
  const participateMutation = trpc.expeditions.participate.useMutation();

  const handleParticipate = (e: React.MouseEvent) => {
    e.stopPropagation();
    participateMutation.mutate({ expeditionId: expedition.id });
  };

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
                {format(new Date(expedition.startDate), "dd 'de' MMMM", { locale: ptBR })}
              </span>
              {trailData?.trail && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {trailData.trail.city}, {trailData.trail.uf}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                {expedition.availableSpots} vagas
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {expedition.price && (
              <span className="font-heading font-semibold text-lg text-primary">
                R$ {parseFloat(expedition.price).toFixed(2)}
              </span>
            )}
            <Button onClick={handleParticipate} disabled={participateMutation.isPending}>
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
