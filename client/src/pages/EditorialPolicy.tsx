import { Helmet } from "react-helmet-async";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ChevronRight, Shield, BookOpen, Users, Eye, RefreshCw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function EditorialPolicy() {
  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>Política Editorial | Trekko - Trilhas, Guias e Aventuras no Brasil</title>
        <meta name="description" content="Conheça a Política Editorial da Trekko. Saiba como produzimos, verificamos e atualizamos o conteúdo sobre trilhas, segurança e ecoturismo no Brasil com rigor e responsabilidade." />
        <link rel="canonical" href="https://trekko.com.br/politica-editorial" />
        <meta name="robots" content="index, follow" />
      </Helmet>

      <Header />

      <main className="flex-1">
        {/* Breadcrumb */}
        <nav className="bg-muted/50 border-b" aria-label="Breadcrumb">
          <div className="container py-3">
            <ol className="flex items-center gap-2 text-sm">
              <li><a href="/" className="text-muted-foreground hover:text-foreground transition-colors">Início</a></li>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
              <li><span className="text-foreground font-medium">Política Editorial</span></li>
            </ol>
          </div>
        </nav>

        {/* Hero */}
        <section className="bg-gradient-to-br from-forest-dark via-forest to-forest-light text-white py-16">
          <div className="container">
            <div className="max-w-3xl">
              <h1 className="font-heading text-4xl md:text-5xl font-bold mb-4">Política Editorial</h1>
              <p className="text-lg text-white/80">
                Como produzimos, verificamos e mantemos a qualidade do conteúdo sobre trilhas, segurança e ecoturismo no Brasil.
              </p>
            </div>
          </div>
        </section>

        <div className="container py-12 max-w-4xl">
          <div className="prose prose-lg max-w-none space-y-8">
            <section>
              <h2 className="font-heading text-2xl font-semibold mb-4">Nosso Compromisso com a Qualidade</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                A Trekko é uma plataforma dedicada ao ecoturismo e trekking no Brasil, e entendemos que a qualidade e a precisão das informações que publicamos podem impactar diretamente a segurança e a experiência dos nossos usuários. Por isso, adotamos um rigoroso processo editorial que garante que todo conteúdo publicado seja original, verificado, relevante e útil para a comunidade de trilheiros e amantes da natureza.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Esta Política Editorial estabelece os princípios, processos e padrões que norteiam a produção de conteúdo na Trekko, abrangendo desde as fichas técnicas das trilhas até os artigos do blog, passando pelos perfis de guias e informações sobre expedições. Nosso objetivo é ser a fonte mais confiável e completa de informações sobre trilhas e ecoturismo no Brasil.
              </p>
            </section>

            {/* Editorial Principles */}
            <section>
              <h2 className="font-heading text-2xl font-semibold mb-6">Princípios Editoriais</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <Card>
                  <CardContent className="p-6">
                    <Shield className="w-8 h-8 text-forest mb-3" />
                    <h3 className="font-heading text-lg font-semibold mb-2">Precisão e Verificação</h3>
                    <p className="text-muted-foreground text-sm">
                      Todas as informações técnicas sobre trilhas (distância, desnível, dificuldade, pontos de apoio) são verificadas por meio de fontes oficiais, dados GPS e relatos de trilheiros experientes. Dados de parques nacionais e áreas de conservação são consultados junto aos órgãos gestores (ICMBio, IEF e similares).
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <BookOpen className="w-8 h-8 text-forest mb-3" />
                    <h3 className="font-heading text-lg font-semibold mb-2">Originalidade</h3>
                    <p className="text-muted-foreground text-sm">
                      Todo conteúdo publicado na Trekko é original, produzido por nossa equipe editorial ou por colaboradores especializados. Não publicamos conteúdo copiado de outras fontes. Quando utilizamos dados ou informações de terceiros, sempre citamos a fonte e fornecemos a devida atribuição.
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <Users className="w-8 h-8 text-forest mb-3" />
                    <h3 className="font-heading text-lg font-semibold mb-2">Especialização</h3>
                    <p className="text-muted-foreground text-sm">
                      Nosso conteúdo é produzido e revisado por profissionais com experiência em ecoturismo, trekking, montanhismo e conservação ambiental. Guias certificados CADASTUR contribuem com informações práticas e atualizadas sobre as trilhas que conhecem profundamente.
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <Eye className="w-8 h-8 text-forest mb-3" />
                    <h3 className="font-heading text-lg font-semibold mb-2">Transparência</h3>
                    <p className="text-muted-foreground text-sm">
                      Somos transparentes sobre nossas fontes de informação, metodologias e eventuais limitações. Quando uma informação não pode ser verificada, indicamos claramente. Conteúdo patrocinado ou parcerias comerciais são sempre identificados de forma explícita.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </section>

            <section>
              <h2 className="font-heading text-2xl font-semibold mb-4">Processo de Curadoria de Trilhas</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Cada trilha cadastrada na plataforma Trekko passa por um processo de curadoria que envolve múltiplas etapas de verificação. Primeiro, os dados técnicos básicos (localização, distância, desnível, coordenadas GPS) são coletados a partir de fontes confiáveis, incluindo dados oficiais de parques e unidades de conservação, traçados GPS verificados do Wikiloc e outras plataformas de mapeamento, e informações fornecidas por guias locais certificados.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Em seguida, as informações são enriquecidas com contexto editorial: descrição detalhada do percurso, pontos de interesse, dicas de segurança específicas, melhor época para visitação, infraestrutura disponível (pontos de água, áreas de camping, banheiros), exigência de guia obrigatório, taxa de entrada e informações sobre acesso. Cada ficha de trilha contém no mínimo 800 palavras de conteúdo original e informativo.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                As informações são revisadas periodicamente e atualizadas sempre que recebemos relatos de mudanças nas condições da trilha, alterações em regulamentações de parques ou atualizações de infraestrutura. Incentivamos os usuários a reportar informações desatualizadas ou incorretas através do sistema de avaliações e da nossa página de contato.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-2xl font-semibold mb-4">Validação de Guias</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                A Trekko trabalha exclusivamente com guias de turismo registrados no CADASTUR (Cadastro de Prestadores de Serviços Turísticos do Ministério do Turismo). O processo de validação inclui: verificação automática do número CADASTUR contra a base de dados oficial; confirmação da situação cadastral ativa; verificação das categorias de habilitação do guia; e monitoramento periódico da validade do registro.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Guias com registro CADASTUR vencido, suspenso ou cancelado são automaticamente desativados na plataforma. Este processo garante que todos os profissionais listados na Trekko possuem a formação técnica e a habilitação legal necessárias para conduzir atividades de turismo de aventura e ecoturismo.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-2xl font-semibold mb-4">Conteúdo do Blog</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Os artigos publicados no blog da Trekko seguem diretrizes editoriais rigorosas. Cada artigo deve ter no mínimo 1.500 palavras de conteúdo original e aprofundado. Os temas abordados incluem: guias completos de trilhas e destinos; dicas de segurança e planejamento para trekking; análises e recomendações de equipamentos; conservação ambiental e turismo sustentável; e histórias e relatos de aventuras na natureza brasileira.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Todos os artigos são assinados por seus autores, que possuem experiência comprovada nos temas abordados. Informações técnicas e de segurança são revisadas por profissionais qualificados antes da publicação. Artigos são atualizados periodicamente para refletir mudanças em regulamentações, condições de trilhas ou novas informações relevantes.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-2xl font-semibold mb-4">Segurança como Prioridade</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                A segurança dos nossos usuários é a prioridade máxima em todo o conteúdo que publicamos. Cada página de trilha inclui informações detalhadas sobre: nível de dificuldade com descrição clara do que esperar; exigência ou recomendação de guia profissional; dicas essenciais de segurança específicas para o percurso; equipamentos recomendados; condições climáticas e melhor época para visitação; e pontos de apoio (água, camping, resgate).
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Trilhas que exigem guia obrigatório são claramente sinalizadas, e incentivamos ativamente a contratação de guias certificados CADASTUR para todas as atividades, especialmente para trilheiros iniciantes ou que não conhecem a região. Nunca minimizamos os riscos associados às atividades de trekking e montanhismo.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-2xl font-semibold mb-4 flex items-center gap-2">
                <RefreshCw className="w-6 h-6 text-forest" />
                Atualização e Correção de Conteúdo
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                A Trekko mantém um compromisso contínuo com a atualização de seu conteúdo. Revisamos periodicamente as informações das trilhas cadastradas, atualizando dados técnicos, condições de acesso, taxas de entrada e regulamentações. Quando identificamos erros ou informações desatualizadas, realizamos as correções de forma transparente.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Valorizamos o feedback da comunidade e incentivamos nossos usuários a reportar informações incorretas ou desatualizadas. Sugestões e correções podem ser enviadas através do sistema de avaliações, da página de contato ou do e-mail <a href="mailto:editorial@trekko.com.br" className="text-primary hover:underline">editorial@trekko.com.br</a>. Todas as contribuições são analisadas pela equipe editorial antes de serem incorporadas ao conteúdo.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-2xl font-semibold mb-4">Independência Editorial</h2>
              <p className="text-muted-foreground leading-relaxed">
                O conteúdo editorial da Trekko é produzido de forma independente. Parcerias comerciais, patrocínios ou relações com guias e operadores de turismo não influenciam a avaliação ou classificação de trilhas e destinos. Conteúdo patrocinado é sempre claramente identificado como tal. As avaliações e recomendações de trilhas são baseadas exclusivamente em critérios técnicos e na experiência real dos trilheiros e profissionais que contribuem com a plataforma.
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
