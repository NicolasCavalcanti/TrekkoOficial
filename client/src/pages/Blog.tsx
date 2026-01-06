import { useState } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Clock, ChevronRight, BookOpen } from "lucide-react";

const CATEGORIES = [
  { value: "", label: "Todos" },
  { value: "trilhas-destinos", label: "Trilhas & Destinos" },
  { value: "guias-praticos", label: "Guias Práticos" },
  { value: "planejamento-seguranca", label: "Planejamento & Segurança" },
  { value: "equipamentos", label: "Equipamentos" },
  { value: "conservacao-ambiental", label: "Conservação Ambiental" },
  { value: "historias-inspiracao", label: "Histórias & Inspiração" },
];

const CATEGORY_LABELS: Record<string, string> = {
  "trilhas-destinos": "Trilhas & Destinos",
  "guias-praticos": "Guias Práticos",
  "planejamento-seguranca": "Planejamento & Segurança",
  "equipamentos": "Equipamentos",
  "conservacao-ambiental": "Conservação Ambiental",
  "historias-inspiracao": "Histórias & Inspiração",
};

export default function Blog() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading } = trpc.blog.list.useQuery({
    search: search || undefined,
    category: category || undefined,
    page,
    limit: 12,
  });

  const totalPages = data ? Math.ceil(data.total / 12) : 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-green-800 via-green-700 to-green-600 text-white py-16 md:py-24">
        <div className="absolute inset-0 bg-[url('/images/blog-hero.jpg')] bg-cover bg-center opacity-20" />
        <div className="container relative z-10">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Blog TREKKO
            </h1>
            <p className="text-xl md:text-2xl text-green-100 mb-2">
              Trilhas, Trekking e Aventuras no Brasil
            </p>
            <p className="text-green-200">
              Histórias reais, guias práticos e destinos incríveis para quem vive o trekking
            </p>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="py-8 border-b bg-card">
        <div className="container">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar artigos..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="pl-10"
              />
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <Button
                  key={cat.value}
                  variant={category === cat.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setCategory(cat.value);
                    setPage(1);
                  }}
                  className={category === cat.value ? "bg-green-700 hover:bg-green-800" : ""}
                >
                  {cat.label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Posts Grid */}
      <section className="py-12">
        <div className="container">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <Skeleton className="h-48 w-full" />
                  <CardContent className="p-4">
                    <Skeleton className="h-4 w-24 mb-2" />
                    <Skeleton className="h-6 w-full mb-2" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4 mt-1" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : data?.posts.length === 0 ? (
            <div className="text-center py-16">
              <BookOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">Nenhum artigo encontrado</h3>
              <p className="text-muted-foreground">
                {search || category
                  ? "Tente ajustar os filtros de busca"
                  : "Em breve teremos novos conteúdos para você!"}
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {data?.posts.map((post) => (
                  <Link key={post.id} href={`/blog/${post.slug}`}>
                    <Card className="overflow-hidden h-full hover:shadow-lg transition-shadow cursor-pointer group">
                      {/* Image */}
                      <div className="relative h-48 bg-gradient-to-br from-green-700 to-green-900 overflow-hidden">
                        {post.imageUrl ? (
                          <img
                            src={post.imageUrl}
                            alt={post.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <BookOpen className="h-16 w-16 text-green-500/50" />
                          </div>
                        )}
                        {/* Category Badge */}
                        {post.category && (
                          <span className="absolute top-3 left-3 bg-green-700 text-white text-xs px-2 py-1 rounded">
                            {CATEGORY_LABELS[post.category] || post.category}
                          </span>
                        )}
                      </div>

                      <CardContent className="p-4">
                        {/* Title */}
                        <h2 className="font-bold text-lg mb-2 line-clamp-2 group-hover:text-green-700 transition-colors">
                          {post.title}
                        </h2>

                        {/* Excerpt */}
                        {post.excerpt && (
                          <p className="text-muted-foreground text-sm line-clamp-3 mb-4">
                            {post.excerpt}
                          </p>
                        )}

                        {/* Meta */}
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>{post.readingTime || 5} min de leitura</span>
                          </div>
                          <span className="flex items-center gap-1 text-green-700 font-medium group-hover:gap-2 transition-all">
                            Ler artigo
                            <ChevronRight className="h-4 w-4" />
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-8">
                  <Button
                    variant="outline"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    Anterior
                  </Button>
                  <span className="flex items-center px-4 text-sm text-muted-foreground">
                    Página {page} de {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                  >
                    Próxima
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
}
