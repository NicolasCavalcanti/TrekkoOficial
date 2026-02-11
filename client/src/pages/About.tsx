import { Helmet } from "react-helmet-async";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Mountain, Users, Shield, Heart, MapPin, Compass, BookOpen, Award, Leaf, Target, Eye, Sparkles, ChevronRight } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";

export default function About() {
  const { data: stats } = trpc.stats.public.useQuery();

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(num >= 10000 ? 0 : 1).replace('.', ',') + 'k+';
    }
    return num.toString() + '+';
  };

  const aboutSchema = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    "name": "Sobre o Trekko",
    "url": "https://trekko.com.br/sobre",
    "description": "Conheça a Trekko, plataforma brasileira de ecoturismo que conecta trilheiros a guias certificados CADASTUR para aventuras seguras em trilhas de todo o Brasil.",
    "mainEntity": {
      "@type": "Organization",
      "name": "Trekko",
      "url": "https://trekko.com.br",
      "logo": "https://trekko.com.br/favicon-512x512.png",
      "description": "Plataforma brasileira de ecoturismo e trekking",
      "foundingDate": "2025",
      "areaServed": "Brazil",
      "sameAs": [
        "https://www.instagram.com/trekko.com.br/",
        "https://www.tiktok.com/@trekko.com.br"
      ]
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>Sobre o Trekko | Plataforma de Ecoturismo e Trilhas do Brasil</title>
        <meta name="description" content="Conheça a Trekko, plataforma brasileira de ecoturismo que conecta trilheiros a guias certificados CADASTUR. Saiba nossa missão, valores e como promovemos o turismo sustentável." />
        <link rel="canonical" href="https://trekko.com.br/sobre" />
        <meta property="og:title" content="Sobre o Trekko | Plataforma de Ecoturismo e Trilhas do Brasil" />
        <meta property="og:description" content="Conheça a Trekko, plataforma brasileira de ecoturismo que conecta trilheiros a guias certificados CADASTUR." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://trekko.com.br/sobre" />
        <script type="application/ld+json">{JSON.stringify(aboutSchema)}</script>
      </Helmet>

      <Header />

      <main className="flex-1">
        {/* Breadcrumb */}
        <nav className="bg-muted/50 border-b" aria-label="Breadcrumb">
          <div className="container py-3">
            <ol className="flex items-center gap-2 text-sm">
              <li><a href="/" className="text-muted-foreground hover:text-foreground transition-colors">Início</a></li>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
              <li><span className="text-foreground font-medium">Sobre</span></li>
            </ol>
          </div>
        </nav>

        {/* Hero */}
        <section className="bg-gradient-to-br from-forest-dark via-forest to-forest-light text-white py-20">
          <div className="container">
            <div className="max-w-3xl">
              <h1 className="font-heading text-4xl md:text-5xl font-bold mb-6">
                Sobre o Trekko
              </h1>
              <p className="text-lg text-white/80 mb-4">
                Somos a plataforma brasileira de ecoturismo que conecta aventureiros às melhores trilhas do Brasil, 
                com o suporte de guias de turismo certificados pelo CADASTUR (Ministério do Turismo).
              </p>
              <p className="text-lg text-white/80">
                Nascemos da convicção de que a natureza brasileira — com seus mais de 70 parques nacionais, 
                centenas de unidades de conservação e milhares de trilhas — merece ser explorada com segurança, 
                responsabilidade e respeito ao meio ambiente.
              </p>
            </div>
          </div>
        </section>

        {/* Our Story */}
        <section className="py-16 bg-white">
          <div className="container">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
              <div>
                <h2 className="font-heading text-3xl font-bold mb-6">Nossa História</h2>
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  O Trekko nasceu da paixão pela natureza e pela percepção de uma lacuna no ecoturismo brasileiro: 
                  a dificuldade de encontrar informações confiáveis sobre trilhas e de conectar-se com guias 
                  profissionais certificados. Enquanto o Brasil possui uma das maiores biodiversidades do planeta 
                  e paisagens naturais de tirar o fôlego, muitos trilheiros enfrentavam desafios para planejar 
                  suas aventuras com segurança.
                </p>
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  Fundada em 2025, a Trekko surgiu com a missão de democratizar o acesso ao ecoturismo no Brasil. 
                  Começamos catalogando trilhas icônicas como a Travessia Petrópolis-Teresópolis, o Pico da 
                  Bandeira e a Trilha do Ouro, e rapidamente expandimos para cobrir destinos em todos os 
                  biomas brasileiros — da Mata Atlântica à Amazônia, do Cerrado à Caatinga, dos Pampas ao Pantanal.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Desde o início, adotamos o CADASTUR como critério fundamental para a certificação de guias 
                  na plataforma. Essa decisão reflete nosso compromisso com a segurança dos trilheiros e com 
                  a valorização dos profissionais de turismo que dedicam suas carreiras a compartilhar as 
                  belezas naturais do Brasil.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Card className="bg-primary/5 border-primary/20">
                  <CardContent className="p-6 text-center">
                    <Mountain className="w-10 h-10 text-primary mx-auto mb-3" />
                    <h3 className="font-heading font-semibold text-2xl mb-1">
                      {stats?.trailsCount ? formatNumber(stats.trailsCount) : '...'}
                    </h3>
                    <p className="text-sm text-muted-foreground">Trilhas cadastradas</p>
                  </CardContent>
                </Card>
                <Card className="bg-primary/5 border-primary/20">
                  <CardContent className="p-6 text-center">
                    <Users className="w-10 h-10 text-primary mx-auto mb-3" />
                    <h3 className="font-heading font-semibold text-2xl mb-1">
                      {stats?.guidesCount ? formatNumber(stats.guidesCount) : '...'}
                    </h3>
                    <p className="text-sm text-muted-foreground">Guias certificados</p>
                  </CardContent>
                </Card>
                <Card className="bg-primary/5 border-primary/20">
                  <CardContent className="p-6 text-center">
                    <MapPin className="w-10 h-10 text-primary mx-auto mb-3" />
                    <h3 className="font-heading font-semibold text-2xl mb-1">27</h3>
                    <p className="text-sm text-muted-foreground">Estados atendidos</p>
                  </CardContent>
                </Card>
                <Card className="bg-primary/5 border-primary/20">
                  <CardContent className="p-6 text-center">
                    <Heart className="w-10 h-10 text-primary mx-auto mb-3" />
                    <h3 className="font-heading font-semibold text-2xl mb-1">10k+</h3>
                    <p className="text-sm text-muted-foreground">Aventureiros</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Mission, Vision, Purpose */}
        <section className="py-16 bg-muted/30">
          <div className="container">
            <h2 className="font-heading text-3xl font-bold text-center mb-12">Missão, Visão e Propósito</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card>
                <CardContent className="p-8">
                  <Target className="w-10 h-10 text-forest mb-4" />
                  <h3 className="font-heading text-xl font-semibold mb-4">Missão</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Democratizar o acesso ao ecoturismo no Brasil, conectando trilheiros e aventureiros 
                    a guias de turismo certificados pelo CADASTUR, fornecendo informações detalhadas e 
                    confiáveis sobre trilhas e promovendo experiências seguras e memoráveis na natureza brasileira.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-8">
                  <Eye className="w-10 h-10 text-forest mb-4" />
                  <h3 className="font-heading text-xl font-semibold mb-4">Visão</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Ser a principal plataforma de ecoturismo do Brasil, reconhecida pela qualidade e 
                    confiabilidade das informações sobre trilhas, pela excelência na conexão entre 
                    trilheiros e guias profissionais, e pela contribuição ativa para a conservação 
                    ambiental e o desenvolvimento do turismo sustentável no país.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-8">
                  <Sparkles className="w-10 h-10 text-forest mb-4" />
                  <h3 className="font-heading text-xl font-semibold mb-4">Propósito</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Inspirar pessoas a explorar a natureza brasileira de forma responsável, 
                    valorizando os profissionais de turismo, promovendo a conservação ambiental 
                    e fortalecendo as comunidades locais que dependem do ecoturismo como fonte 
                    de renda e desenvolvimento sustentável.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="py-16 bg-white">
          <div className="container">
            <h2 className="font-heading text-3xl font-bold text-center mb-4">Nossos Valores</h2>
            <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-12">
              Os valores que orientam cada decisão da Trekko e definem como nos relacionamos 
              com trilheiros, guias, comunidades e o meio ambiente.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Shield className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="font-heading text-xl font-semibold mb-3">Segurança em Primeiro Lugar</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Trabalhamos exclusivamente com guias certificados pelo CADASTUR, garantindo que todos os 
                    profissionais na plataforma possuem formação técnica e habilitação legal. Cada trilha 
                    inclui informações detalhadas de segurança, dificuldade e equipamentos recomendados.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Leaf className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="font-heading text-xl font-semibold mb-3">Sustentabilidade Ambiental</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Promovemos o turismo responsável e a prática do "Leave No Trace" (Não Deixe Rastro). 
                    Incentivamos trilheiros a respeitar a fauna e flora, seguir as regulamentações dos 
                    parques e contribuir para a preservação dos ecossistemas brasileiros.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <BookOpen className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="font-heading text-xl font-semibold mb-3">Informação de Qualidade</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Cada trilha na plataforma é curada com informações técnicas verificadas, descrições 
                    detalhadas e dicas práticas. Seguimos uma rigorosa <Link href="/politica-editorial" className="text-primary hover:underline">política editorial</Link> para 
                    garantir a precisão e a utilidade de todo o conteúdo publicado.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="font-heading text-xl font-semibold mb-3">Comunidade e Inclusão</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Construímos uma comunidade diversa de aventureiros e profissionais unidos pela paixão 
                    pelo ecoturismo. Acreditamos que a natureza é para todos e trabalhamos para tornar 
                    as trilhas brasileiras acessíveis a pessoas de diferentes níveis de experiência.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Award className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="font-heading text-xl font-semibold mb-3">Valorização Profissional</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Valorizamos e apoiamos os guias de turismo certificados, oferecendo uma plataforma 
                    para expandir seu alcance, organizar expedições e conectar-se com trilheiros de 
                    todo o Brasil. Acreditamos que profissionais bem remunerados prestam melhores serviços.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Compass className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="font-heading text-xl font-semibold mb-3">Transparência</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Somos transparentes em todas as nossas práticas: desde a classificação de dificuldade 
                    das trilhas até as taxas cobradas por intermediação. Nossas <Link href="/termos" className="text-primary hover:underline">políticas</Link> são 
                    claras e acessíveis, e incentivamos o feedback da comunidade.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* How it Works - For Trekkers */}
        <section className="py-16 bg-muted/30">
          <div className="container">
            <h2 className="font-heading text-3xl font-bold text-center mb-4">Como Funciona</h2>
            <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-12">
              A Trekko conecta trilheiros a guias certificados de forma simples, segura e transparente.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {/* For Trekkers */}
              <div>
                <h3 className="font-heading text-2xl font-semibold mb-6 flex items-center gap-2">
                  <Mountain className="w-6 h-6 text-forest" />
                  Para Trilheiros
                </h3>
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-forest text-white flex items-center justify-center flex-shrink-0 font-bold">1</div>
                    <div>
                      <h4 className="font-semibold mb-1">Explore o catálogo de trilhas</h4>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        Navegue por mais de 30 trilhas catalogadas em todo o Brasil, com informações técnicas 
                        detalhadas como distância, desnível, dificuldade, pontos de água e áreas de camping. 
                        Use filtros por estado, dificuldade e tipo de trilha para encontrar a aventura ideal.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-forest text-white flex items-center justify-center flex-shrink-0 font-bold">2</div>
                    <div>
                      <h4 className="font-semibold mb-1">Encontre guias certificados</h4>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        Conecte-se com guias de turismo certificados pelo CADASTUR que conhecem profundamente 
                        as trilhas da região. Veja perfis completos, avaliações de outros trilheiros e 
                        expedições disponíveis.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-forest text-white flex items-center justify-center flex-shrink-0 font-bold">3</div>
                    <div>
                      <h4 className="font-semibold mb-1">Reserve sua expedição</h4>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        Escolha uma expedição com data, roteiro e preço definidos. Faça sua reserva de forma 
                        segura com pagamento via cartão de crédito ou Pix. Receba todas as informações 
                        necessárias para se preparar para a aventura.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-forest text-white flex items-center justify-center flex-shrink-0 font-bold">4</div>
                    <div>
                      <h4 className="font-semibold mb-1">Viva a experiência</h4>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        Aproveite sua trilha com a segurança de um guia profissional. Após a expedição, 
                        compartilhe sua experiência avaliando o guia e a trilha, ajudando outros trilheiros 
                        a planejar suas aventuras.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* For Guides */}
              <div>
                <h3 className="font-heading text-2xl font-semibold mb-6 flex items-center gap-2">
                  <Shield className="w-6 h-6 text-forest" />
                  Para Guias
                </h3>
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-earth text-white flex items-center justify-center flex-shrink-0 font-bold">1</div>
                    <div>
                      <h4 className="font-semibold mb-1">Cadastre-se com seu CADASTUR</h4>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        Crie sua conta na Trekko e valide seu número CADASTUR. O sistema verifica 
                        automaticamente sua certificação junto à base oficial do Ministério do Turismo, 
                        garantindo credibilidade e confiança para os trilheiros.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-earth text-white flex items-center justify-center flex-shrink-0 font-bold">2</div>
                    <div>
                      <h4 className="font-semibold mb-1">Monte seu perfil profissional</h4>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        Complete seu perfil com foto, biografia, especialidades, idiomas e região de atuação. 
                        Um perfil completo aumenta sua visibilidade e a confiança dos trilheiros na hora 
                        de escolher um guia.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-earth text-white flex items-center justify-center flex-shrink-0 font-bold">3</div>
                    <div>
                      <h4 className="font-semibold mb-1">Crie expedições</h4>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        Publique expedições com datas, roteiros, preços e número de vagas. A Trekko cuida 
                        do processamento de pagamentos e da comunicação com os participantes, permitindo 
                        que você foque no que faz de melhor: guiar aventuras.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-earth text-white flex items-center justify-center flex-shrink-0 font-bold">4</div>
                    <div>
                      <h4 className="font-semibold mb-1">Receba pagamentos</h4>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        Receba os pagamentos das reservas diretamente via Pix, com uma taxa de intermediação 
                        de apenas 4%. Acompanhe suas finanças pelo painel do guia, com relatórios detalhados 
                        de reservas, pagamentos e avaliações.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CADASTUR Explanation */}
        <section className="py-16 bg-white">
          <div className="container">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-10">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                  <Shield className="w-10 h-10 text-primary" />
                </div>
                <h2 className="font-heading text-3xl font-bold mb-4">O que é CADASTUR?</h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Entenda por que a certificação CADASTUR é fundamental para a segurança 
                  e a qualidade do ecoturismo no Brasil.
                </p>
              </div>

              <div className="space-y-6">
                <p className="text-muted-foreground leading-relaxed">
                  O <strong>CADASTUR</strong> (Cadastro de Prestadores de Serviços Turísticos) é o sistema 
                  oficial do Ministério do Turismo do Brasil para o registro de pessoas físicas e jurídicas 
                  que atuam no setor de turismo. Criado pela Lei nº 11.771/2008 (Lei Geral do Turismo), 
                  o CADASTUR é executado pelo Ministério do Turismo em parceria com os Órgãos Oficiais de 
                  Turismo das Unidades da Federação.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Para guias de turismo, o cadastro no CADASTUR é <strong>obrigatório por lei</strong>. 
                  Apenas profissionais com formação técnica específica em Guia de Turismo (curso reconhecido 
                  pelo MEC) podem obter o registro. Os guias cadastrados são habilitados para conduzir pessoas 
                  em visitas, excursões urbanas, municipais, estaduais, interestaduais, internacionais ou 
                  especializadas, dependendo de sua categoria de habilitação.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  A Trekko exige o CADASTUR de todos os guias cadastrados na plataforma porque acreditamos 
                  que a <strong>segurança dos trilheiros não é negociável</strong>. Guias certificados possuem 
                  conhecimento técnico em primeiros socorros, orientação em ambientes naturais, legislação 
                  ambiental e turística, e técnicas de condução de grupos em áreas de risco. Ao escolher 
                  um guia certificado CADASTUR na Trekko, você tem a garantia de estar sendo acompanhado 
                  por um profissional qualificado, regularizado e comprometido com sua segurança.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 bg-earth text-white">
          <div className="container text-center">
            <h2 className="font-heading text-3xl font-bold mb-4">
              Faça parte dessa comunidade
            </h2>
            <p className="text-white/80 max-w-2xl mx-auto mb-8">
              Seja você um aventureiro em busca de novas trilhas ou um guia certificado 
              querendo expandir seu alcance, o Trekko é o lugar certo para você. Junte-se 
              a milhares de trilheiros e profissionais que já fazem parte da maior comunidade 
              de ecoturismo do Brasil.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/trilhas">
                <a className="inline-flex items-center justify-center rounded-md bg-white text-earth font-semibold px-8 py-3 hover:bg-white/90 transition-colors">
                  <Mountain className="w-5 h-5 mr-2" />
                  Explorar Trilhas
                </a>
              </Link>
              <Link href="/guias">
                <a className="inline-flex items-center justify-center rounded-md border-2 border-white text-white font-semibold px-8 py-3 hover:bg-white/10 transition-colors">
                  <Users className="w-5 h-5 mr-2" />
                  Conhecer Guias
                </a>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
