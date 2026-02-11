import { useState } from "react";
import { Helmet } from "react-helmet-async";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronRight, Mail, MapPin, Clock, Send, MessageSquare, Shield, HelpCircle, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

export default function Contact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !subject || !message) {
      toast.error("Por favor, preencha todos os campos.");
      return;
    }
    setIsSubmitting(true);
    // Simulate form submission
    setTimeout(() => {
      toast.success("Mensagem enviada com sucesso! Responderemos em até 48 horas.");
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>Contato | Trekko - Trilhas, Guias e Aventuras no Brasil</title>
        <meta name="description" content="Entre em contato com a equipe Trekko. Tire dúvidas sobre trilhas, guias CADASTUR, expedições, parcerias ou sugestões. Estamos aqui para ajudar sua próxima aventura." />
        <link rel="canonical" href="https://trekko.com.br/contato" />
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
              <li><span className="text-foreground font-medium">Contato</span></li>
            </ol>
          </div>
        </nav>

        {/* Hero */}
        <section className="bg-gradient-to-br from-forest-dark via-forest to-forest-light text-white py-16">
          <div className="container">
            <div className="max-w-3xl">
              <h1 className="font-heading text-4xl md:text-5xl font-bold mb-4">Entre em Contato</h1>
              <p className="text-lg text-white/80">
                Tem dúvidas sobre trilhas, guias ou expedições? Quer sugerir uma trilha ou reportar um problema? 
                Nossa equipe está pronta para ajudar. Responderemos sua mensagem em até 48 horas úteis.
              </p>
            </div>
          </div>
        </section>

        <div className="container py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Contact Form */}
            <div className="lg:col-span-2">
              <Card>
                <CardContent className="p-6 md:p-8">
                  <h2 className="font-heading text-2xl font-semibold mb-6">Envie sua mensagem</h2>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium mb-1 block">Nome completo</label>
                        <Input 
                          placeholder="Seu nome" 
                          value={name} 
                          onChange={(e) => setName(e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-1 block">E-mail</label>
                        <Input 
                          type="email" 
                          placeholder="seu@email.com" 
                          value={email} 
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Assunto</label>
                      <select 
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        required
                      >
                        <option value="">Selecione um assunto</option>
                        <option value="duvida-trilha">Dúvida sobre uma trilha</option>
                        <option value="sugestao-trilha">Sugerir uma trilha</option>
                        <option value="problema-tecnico">Problema técnico</option>
                        <option value="cadastro-guia">Cadastro de guia</option>
                        <option value="expedicao">Dúvida sobre expedição</option>
                        <option value="parceria">Parceria comercial</option>
                        <option value="imprensa">Imprensa e mídia</option>
                        <option value="correcao">Correção de informação</option>
                        <option value="outro">Outro assunto</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Mensagem</label>
                      <textarea 
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[150px] resize-y"
                        placeholder="Descreva sua dúvida, sugestão ou problema em detalhes..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        required
                      />
                    </div>
                    <Button type="submit" size="lg" className="w-full md:w-auto" disabled={isSubmitting}>
                      <Send className="w-4 h-4 mr-2" />
                      {isSubmitting ? "Enviando..." : "Enviar Mensagem"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Contact Info */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-heading text-lg font-semibold mb-4">Informações de Contato</h3>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <Mail className="w-5 h-5 text-forest mt-0.5" />
                      <div>
                        <p className="font-medium text-sm">E-mail geral</p>
                        <a href="mailto:contato@trekko.com.br" className="text-sm text-primary hover:underline">contato@trekko.com.br</a>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Shield className="w-5 h-5 text-forest mt-0.5" />
                      <div>
                        <p className="font-medium text-sm">Privacidade e dados</p>
                        <a href="mailto:privacidade@trekko.com.br" className="text-sm text-primary hover:underline">privacidade@trekko.com.br</a>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-forest mt-0.5" />
                      <div>
                        <p className="font-medium text-sm">Localização</p>
                        <p className="text-sm text-muted-foreground">Brasil</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Clock className="w-5 h-5 text-forest mt-0.5" />
                      <div>
                        <p className="font-medium text-sm">Horário de atendimento</p>
                        <p className="text-sm text-muted-foreground">Segunda a sexta, 9h às 18h (Brasília)</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* FAQ Quick Links */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-heading text-lg font-semibold mb-4">Perguntas Frequentes</h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <HelpCircle className="w-5 h-5 text-forest mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-sm">Como me cadastrar como guia?</p>
                        <p className="text-xs text-muted-foreground">Clique em "Cadastrar" e selecione "Sou Guia (CADASTUR)". Você precisará do seu número CADASTUR válido.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <HelpCircle className="w-5 h-5 text-forest mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-sm">Como sugerir uma trilha?</p>
                        <p className="text-xs text-muted-foreground">Use o formulário ao lado selecionando "Sugerir uma trilha" e inclua o máximo de informações possível.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <HelpCircle className="w-5 h-5 text-forest mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-sm">Como reportar informação incorreta?</p>
                        <p className="text-xs text-muted-foreground">Selecione "Correção de informação" no formulário e indique qual trilha e qual dado precisa ser corrigido.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-forest mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-sm">Emergência em trilha?</p>
                        <p className="text-xs text-muted-foreground">Em caso de emergência, ligue para o SAMU (192), Bombeiros (193) ou Polícia Militar (190). A Trekko não é um serviço de resgate.</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Social */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-heading text-lg font-semibold mb-4">Redes Sociais</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Siga a Trekko nas redes sociais para novidades, dicas de trilhas e conteúdo exclusivo sobre ecoturismo no Brasil.
                  </p>
                  <div className="space-y-2">
                    <a 
                      href="https://www.instagram.com/trekko.com.br/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-primary hover:underline"
                    >
                      <MessageSquare className="w-4 h-4" />
                      @trekko.com.br no Instagram
                    </a>
                    <a 
                      href="https://www.tiktok.com/@trekko.com.br" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-primary hover:underline"
                    >
                      <MessageSquare className="w-4 h-4" />
                      @trekko.com.br no TikTok
                    </a>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
