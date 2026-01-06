import { useParams, Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  ArrowLeft, 
  Clock, 
  Calendar, 
  Share2, 
  Bookmark,
  ChevronRight,
  Mountain,
  User
} from "lucide-react";


const CATEGORY_LABELS: Record<string, string> = {
  "trilhas-destinos": "Trilhas & Destinos",
  "guias-praticos": "Guias Práticos",
  "planejamento-seguranca": "Planejamento & Segurança",
  "equipamentos": "Equipamentos",
  "conservacao-ambiental": "Conservação Ambiental",
  "historias-inspiracao": "Histórias & Inspiração",
};

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  

  const { data: post, isLoading, error } = trpc.blog.getBySlug.useQuery(
    { slug: slug || "" },
    { enabled: !!slug }
  );

  const { data: relatedPosts } = trpc.blog.getRelated.useQuery(
    { postId: post?.id || 0, category: post?.category || "" },
    { enabled: !!post?.id && !!post?.category }
  );

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: post?.title,
          text: post?.excerpt || "",
          url,
        });
      } catch {
        // User cancelled or error
      }
    } else {
      await navigator.clipboard.writeText(url);
      alert("Link copiado para a área de transferência!");
    }
  };

  const handleSave = () => {
    alert("Artigo salvo nos favoritos!");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container py-8">
          <Skeleton className="h-8 w-32 mb-8" />
          <Skeleton className="h-64 w-full rounded-xl mb-8" />
          <Skeleton className="h-12 w-3/4 mb-4" />
          <Skeleton className="h-6 w-1/2 mb-8" />
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Artigo não encontrado</h1>
          <p className="text-muted-foreground mb-6">
            O artigo que você procura não existe ou foi removido.
          </p>
          <Link href="/blog">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar ao Blog
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const publishedDate = post.publishedAt 
    ? new Date(post.publishedAt).toLocaleDateString("pt-BR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  // Parse content to render with proper formatting
  const renderContent = (content: string) => {
    // Split by double newlines to get paragraphs
    const sections = content.split(/\n\n+/);
    
    return sections.map((section, index) => {
      const trimmed = section.trim();
      
      // Check if it's a heading (starts with emoji or specific patterns)
      if (trimmed.match(/^[🎯👥🧱🧭⚠️🔎🎨🧩✅⛰️🌿]/)) {
        return (
          <h2 key={index} className="text-2xl font-bold mt-8 mb-4 text-green-800">
            {trimmed}
          </h2>
        );
      }
      
      // Check if it's a subheading
      if (trimmed.match(/^(A montanha|Onde fica|Um marco|Beleza que|A importância|Não é sobre|Por que|Serra Fina não)/)) {
        return (
          <h2 key={index} className="text-2xl font-bold mt-8 mb-4 text-green-800">
            {trimmed}
          </h2>
        );
      }
      
      // Check if it's a list
      if (trimmed.includes('\n') && trimmed.split('\n').every(line => line.trim().match(/^[-•]/))) {
        const items = trimmed.split('\n').filter(line => line.trim());
        return (
          <ul key={index} className="list-disc list-inside space-y-2 my-4 text-muted-foreground">
            {items.map((item, i) => (
              <li key={i}>{item.replace(/^[-•]\s*/, '')}</li>
            ))}
          </ul>
        );
      }
      
      // Check if it looks like a list (multiple short lines)
      if (trimmed.includes('\n')) {
        const lines = trimmed.split('\n').filter(line => line.trim());
        if (lines.length > 1 && lines.every(line => line.length < 100)) {
          return (
            <ul key={index} className="list-disc list-inside space-y-2 my-4 text-muted-foreground">
              {lines.map((line, i) => (
                <li key={i}>{line.trim()}</li>
              ))}
            </ul>
          );
        }
      }
      
      // Quote-like content (short, impactful statements)
      if (trimmed.length < 150 && !trimmed.includes('.') && trimmed.split('\n').length === 1) {
        return (
          <blockquote key={index} className="border-l-4 border-green-600 pl-4 my-6 italic text-lg text-green-800">
            {trimmed}
          </blockquote>
        );
      }
      
      // Regular paragraph
      return (
        <p key={index} className="text-muted-foreground leading-relaxed mb-4">
          {trimmed}
        </p>
      );
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Back Button */}
      <div className="container py-4">
        <Link href="/blog">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar ao Blog
          </Button>
        </Link>
      </div>

      {/* Hero Image */}
      <div className="relative h-64 md:h-96 bg-gradient-to-br from-green-800 to-green-900">
        {post.imageUrl ? (
          <img
            src={post.imageUrl}
            alt={post.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Mountain className="h-24 w-24 text-green-600/30" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        
        {/* Category Badge */}
        {post.category && (
          <span className="absolute top-4 left-4 bg-green-700 text-white text-sm px-3 py-1 rounded">
            {CATEGORY_LABELS[post.category] || post.category}
          </span>
        )}
      </div>

      {/* Article Content */}
      <article className="container py-8">
        <div className="max-w-3xl mx-auto">
          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
            {post.title}
          </h1>

          {/* Subtitle */}
          {post.subtitle && (
            <p className="text-xl text-muted-foreground mb-6">
              {post.subtitle}
            </p>
          )}

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-8 pb-8 border-b">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span>{post.authorName || "TREKKO"}</span>
            </div>
            {publishedDate && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>{publishedDate}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>{post.readingTime || 5} min de leitura</span>
            </div>
            
            {/* Actions */}
            <div className="flex gap-2 ml-auto">
              <Button variant="outline" size="sm" onClick={handleShare}>
                <Share2 className="h-4 w-4 mr-2" />
                Compartilhar
              </Button>
              <Button variant="outline" size="sm" onClick={handleSave}>
                <Bookmark className="h-4 w-4 mr-2" />
                Salvar
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="prose prose-lg max-w-none">
            {renderContent(post.content)}
          </div>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="mt-8 pt-8 border-t">
              <h3 className="text-sm font-semibold text-muted-foreground mb-3">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag, i) => (
                  <span
                    key={i}
                    className="bg-green-100 text-green-800 text-sm px-3 py-1 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* CTA Box */}
          <Card className="mt-8 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="p-6">
              <h3 className="text-xl font-bold text-green-800 mb-2">
                Explore mais trilhas no TREKKO
              </h3>
              <p className="text-green-700 mb-4">
                Descubra trilhas incríveis, conecte-se com guias certificados e planeje sua próxima aventura.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link href="/trilhas">
                  <Button className="bg-green-700 hover:bg-green-800">
                    Ver Trilhas
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
                <Link href="/guias">
                  <Button variant="outline" className="border-green-600 text-green-700 hover:bg-green-50">
                    Conhecer Guias
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </article>

      {/* Related Posts */}
      {relatedPosts && relatedPosts.length > 0 && (
        <section className="bg-muted py-12">
          <div className="container">
            <h2 className="text-2xl font-bold mb-6">Artigos Relacionados</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedPosts.map((relatedPost) => (
                <Link key={relatedPost.id} href={`/blog/${relatedPost.slug}`}>
                  <Card className="overflow-hidden h-full hover:shadow-lg transition-shadow cursor-pointer group">
                    <div className="relative h-40 bg-gradient-to-br from-green-700 to-green-900">
                      {relatedPost.imageUrl ? (
                        <img
                          src={relatedPost.imageUrl}
                          alt={relatedPost.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Mountain className="h-12 w-12 text-green-500/50" />
                        </div>
                      )}
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-bold line-clamp-2 group-hover:text-green-700 transition-colors">
                        {relatedPost.title}
                      </h3>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground mt-2">
                        <Clock className="h-4 w-4" />
                        <span>{relatedPost.readingTime || 5} min</span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
