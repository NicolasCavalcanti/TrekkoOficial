import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Mountain, Users, Shield, Heart, MapPin, Compass } from "lucide-react";

export default function About() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero */}
        <section className="bg-gradient-to-br from-forest-dark via-forest to-forest-light text-white py-20">
          <div className="container">
            <div className="max-w-3xl">
              <h1 className="font-heading text-4xl md:text-5xl font-bold mb-6">
                Sobre o Trilhas do Brasil
              </h1>
              <p className="text-lg text-white/80">
                Conectamos aventureiros às melhores trilhas do Brasil, com o suporte de guias 
                certificados CADASTUR para experiências seguras e inesquecíveis.
              </p>
            </div>
          </div>
        </section>

        {/* Mission */}
        <section className="py-16 bg-white">
          <div className="container">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="font-heading text-3xl font-bold mb-6">Nossa Missão</h2>
                <p className="text-muted-foreground mb-4">
                  O Trilhas do Brasil nasceu da paixão pela natureza e pelo ecoturismo. 
                  Nossa missão é democratizar o acesso às trilhas brasileiras, conectando 
                  pessoas que amam aventura com profissionais qualificados.
                </p>
                <p className="text-muted-foreground mb-4">
                  Acreditamos que a natureza deve ser acessível a todos, mas com segurança 
                  e respeito ao meio ambiente. Por isso, trabalhamos exclusivamente com 
                  guias certificados pelo CADASTUR, garantindo profissionalismo e qualidade.
                </p>
                <p className="text-muted-foreground">
                  Nosso objetivo é ser a principal plataforma de ecoturismo do Brasil, 
                  promovendo o turismo sustentável e valorizando os profissionais do setor.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Card className="bg-primary/5 border-primary/20">
                  <CardContent className="p-6 text-center">
                    <Mountain className="w-10 h-10 text-primary mx-auto mb-3" />
                    <h3 className="font-heading font-semibold text-2xl mb-1">500+</h3>
                    <p className="text-sm text-muted-foreground">Trilhas cadastradas</p>
                  </CardContent>
                </Card>
                <Card className="bg-primary/5 border-primary/20">
                  <CardContent className="p-6 text-center">
                    <Users className="w-10 h-10 text-primary mx-auto mb-3" />
                    <h3 className="font-heading font-semibold text-2xl mb-1">100+</h3>
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

        {/* Values */}
        <section className="py-16 bg-muted/30">
          <div className="container">
            <h2 className="font-heading text-3xl font-bold text-center mb-12">Nossos Valores</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Shield className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="font-heading text-xl font-semibold mb-3">Segurança</h3>
                  <p className="text-muted-foreground">
                    Trabalhamos apenas com guias certificados CADASTUR, garantindo 
                    profissionalismo e segurança em todas as expedições.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Compass className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="font-heading text-xl font-semibold mb-3">Sustentabilidade</h3>
                  <p className="text-muted-foreground">
                    Promovemos o turismo responsável, respeitando a natureza e 
                    as comunidades locais em todas as nossas atividades.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="font-heading text-xl font-semibold mb-3">Comunidade</h3>
                  <p className="text-muted-foreground">
                    Construímos uma comunidade de aventureiros e profissionais 
                    unidos pela paixão pelo ecoturismo brasileiro.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CADASTUR */}
        <section className="py-16 bg-white">
          <div className="container">
            <div className="max-w-3xl mx-auto text-center">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <Shield className="w-10 h-10 text-primary" />
              </div>
              <h2 className="font-heading text-3xl font-bold mb-6">O que é CADASTUR?</h2>
              <p className="text-muted-foreground mb-4">
                O CADASTUR é o Sistema de Cadastro de pessoas físicas e jurídicas que atuam 
                no setor do turismo, executado pelo Ministério do Turismo em parceria com 
                os Órgãos Oficiais de Turismo das Unidades da Federação.
              </p>
              <p className="text-muted-foreground mb-4">
                Guias de turismo cadastrados no CADASTUR passaram por formação técnica 
                específica e estão habilitados para conduzir pessoas em visitas, excursões 
                urbanas, municipais, estaduais, interestaduais, internacionais ou especializadas.
              </p>
              <p className="text-muted-foreground">
                Ao escolher um guia certificado CADASTUR, você tem a garantia de estar 
                sendo acompanhado por um profissional qualificado e regularizado.
              </p>
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
              querendo expandir seu alcance, o Trilhas do Brasil é o lugar certo para você.
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
