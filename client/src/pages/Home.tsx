import { useState } from "react";
import { useLocation } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Search, Mountain, Users, Calendar, MapPin, ArrowRight, Shield, Star, Compass, CheckCircle2 } from "lucide-react";

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

export default function Home() {
  const [, navigate] = useLocation();
  const [searchText, setSearchText] = useState("");
  const [selectedUF, setSelectedUF] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState("");

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchText) params.set("q", searchText);
    if (selectedUF) params.set("uf", selectedUF);
    if (selectedDifficulty) params.set("difficulty", selectedDifficulty);
    navigate(`/trilhas?${params.toString()}`);
  };

  const { data: trailsData } = trpc.trails.list.useQuery({ limit: 6 });
  const { data: guidesData } = trpc.guides.list.useQuery({ limit: 4 });

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-forest-dark via-forest to-forest-light text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M54.627%200l.83.828-1.415%201.415L51.8%200h2.827zM5.373%200l-.83.828L5.96%202.243%208.2%200H5.374zM48.97%200l3.657%203.657-1.414%201.414L46.143%200h2.828zM11.03%200L7.372%203.657%208.787%205.07%2013.857%200H11.03zm32.284%200L49.8%206.485%2048.384%207.9l-7.9-7.9h2.83zM16.686%200L10.2%206.485%2011.616%207.9l7.9-7.9h-2.83zM22.344%200L13.858%208.485%2015.272%209.9l9.9-9.9h-2.828zM32%200l-3.486%203.485%201.414%201.415L34.828%200H32zm5.657%200l-9.9%209.9%201.414%201.414L40.485%200h-2.828zM37.657%200L24.343%2013.314l1.414%201.414L40.485%200h-2.828zm-22.97%200l-3.658%203.657%201.414%201.414L18.515%200h-3.828z%22%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.03%22%20fill-rule%3D%22evenodd%22%2F%3E%3C%2Fsvg%3E')] opacity-50" />
        
        <div className="container relative py-20 md:py-32">
          <div className="max-w-3xl">
            <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Descubra as melhores{" "}
              <span className="text-highlight">trilhas do Brasil</span>
            </h1>
            <p className="text-lg md:text-xl text-white/80 mb-8 max-w-2xl">
              Encontre trilhas incríveis, conecte-se com guias certificados CADASTUR e viva aventuras inesquecíveis na natureza brasileira.
            </p>

            {/* Search Box */}
            <div className="bg-white rounded-xl p-4 md:p-6 shadow-xl">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Buscar trilha</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Nome ou localização..."
                      className="pl-10 text-foreground"
                      value={searchText}
                      onChange={(e) => setSearchText(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Estado</label>
                  <Select value={selectedUF} onValueChange={setSelectedUF}>
                    <SelectTrigger className="text-foreground">
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
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Dificuldade</label>
                  <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                    <SelectTrigger className="text-foreground">
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
              </div>
              <div className="mt-4 flex justify-end">
                <Button onClick={handleSearch} size="lg" className="w-full md:w-auto">
                  <Search className="w-4 h-4 mr-2" />
                  Buscar Trilhas
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-4">
              Como funciona
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Encontre sua próxima aventura em três passos simples
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Compass className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-heading text-xl font-semibold mb-2">Explore Trilhas</h3>
              <p className="text-muted-foreground">
                Descubra centenas de trilhas em todo o Brasil, com informações detalhadas sobre dificuldade, distância e muito mais.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-heading text-xl font-semibold mb-2">Encontre Guias</h3>
              <p className="text-muted-foreground">
                Conecte-se com guias certificados CADASTUR que conhecem cada detalhe das trilhas e garantem sua segurança.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-heading text-xl font-semibold mb-2">Participe de Expedições</h3>
              <p className="text-muted-foreground">
                Junte-se a expedições organizadas ou crie a sua própria aventura com o suporte de profissionais experientes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Trails */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-2">
                Trilhas em Destaque
              </h2>
              <p className="text-muted-foreground">
                As trilhas mais populares do momento
              </p>
            </div>
            <Button variant="outline" onClick={() => navigate("/trilhas")} className="hidden md:flex">
              Ver todas
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trailsData?.trails.map((trail) => (
              <Card 
                key={trail.id} 
                className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => navigate(`/trilha/${trail.id}`)}
              >
                <div className="h-48 bg-gradient-to-br from-forest/20 to-forest-light/20 flex items-center justify-center">
                  <Mountain className="w-16 h-16 text-forest/40" />
                </div>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-heading font-semibold text-lg">{trail.name}</h3>
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

          <div className="mt-8 text-center md:hidden">
            <Button variant="outline" onClick={() => navigate("/trilhas")}>
              Ver todas as trilhas
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Guides Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-2">
                Guias Certificados
              </h2>
              <p className="text-muted-foreground">
                Profissionais com certificação CADASTUR
              </p>
            </div>
            <Button variant="outline" onClick={() => navigate("/guias")} className="hidden md:flex">
              Ver todos
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {guidesData?.guides.map((guide) => (
              <Card 
                key={guide.id} 
                className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => navigate(`/guia/${guide.cadasturNumber}`)}
              >
                <CardContent className="p-6 text-center">
                  <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-semibold text-primary">
                      {guide.name?.charAt(0).toUpperCase() || "G"}
                    </span>
                  </div>
                  <h3 className="font-heading font-semibold text-lg mb-1 line-clamp-1">{guide.name || "Guia"}</h3>
                  <div className="flex items-center justify-center gap-1 text-sm text-amber-600 mb-1">
                    <Shield className="w-4 h-4" />
                    CADASTUR
                  </div>
                  {guide.isVerified && (
                    <div className="flex items-center justify-center gap-1 text-xs text-primary">
                      <CheckCircle2 className="w-3 h-3" />
                      Verificado no Trekko
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-8 text-center md:hidden">
            <Button variant="outline" onClick={() => navigate("/guias")}>
              Ver todos os guias
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-earth text-white">
        <div className="container text-center">
          <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">
            Pronto para sua próxima aventura?
          </h2>
          <p className="text-white/80 max-w-2xl mx-auto mb-8">
            Cadastre-se gratuitamente e comece a explorar as melhores trilhas do Brasil. 
            Se você é guia, valide seu CADASTUR e conecte-se com aventureiros.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" onClick={() => navigate("/trilhas")}>
              Explorar Trilhas
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
              Sou Guia
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
