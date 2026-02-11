import { Helmet } from "react-helmet-async";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ChevronRight } from "lucide-react";

export default function Terms() {
  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>Termos de Uso | Trekko - Trilhas, Guias e Aventuras no Brasil</title>
        <meta name="description" content="Leia os Termos de Uso da plataforma Trekko. Conheça as regras, direitos e responsabilidades ao utilizar nossos serviços de trilhas e conexão com guias certificados CADASTUR." />
        <link rel="canonical" href="https://trekko.com.br/termos" />
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
              <li><span className="text-foreground font-medium">Termos de Uso</span></li>
            </ol>
          </div>
        </nav>

        <div className="container py-12 max-w-4xl">
          <h1 className="font-heading text-4xl font-bold mb-2">Termos de Uso</h1>
          <p className="text-muted-foreground mb-8">Última atualização: 11 de fevereiro de 2026</p>

          <div className="prose prose-lg max-w-none space-y-8">
            <section>
              <h2 className="font-heading text-2xl font-semibold mb-4">1. Aceitação dos Termos</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Ao acessar e utilizar a plataforma Trekko (acessível pelo domínio trekko.com.br), você concorda integralmente com os presentes Termos de Uso. A Trekko é uma plataforma digital de ecoturismo que conecta trilheiros e aventureiros a guias de turismo certificados pelo CADASTUR (Cadastro de Prestadores de Serviços Turísticos do Ministério do Turismo), oferecendo informações detalhadas sobre trilhas em todo o território brasileiro. Caso não concorde com qualquer disposição destes termos, solicitamos que não utilize nossos serviços.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Estes Termos de Uso constituem um acordo legal entre você (doravante "Usuário") e a Trekko (doravante "Plataforma"), regulando o acesso e a utilização de todos os serviços, funcionalidades e conteúdos disponibilizados. A Plataforma reserva-se o direito de atualizar estes termos periodicamente, sendo responsabilidade do Usuário verificar eventuais alterações.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-2xl font-semibold mb-4">2. Descrição dos Serviços</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                A Trekko oferece uma plataforma digital que reúne informações sobre trilhas ecológicas, montanhas, parques nacionais e destinos de ecoturismo em todo o Brasil. Nossos serviços incluem, mas não se limitam a: catálogo de trilhas com informações técnicas detalhadas (distância, desnível, dificuldade, pontos de água, áreas de camping); conexão entre trilheiros e guias de turismo certificados pelo CADASTUR; organização e divulgação de expedições guiadas; sistema de avaliações e recomendações; blog com conteúdo editorial sobre trekking, segurança e conservação ambiental; e mapas interativos com dados de percurso.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                A Plataforma atua como intermediária na conexão entre trilheiros e guias, não sendo responsável direta pela prestação dos serviços de guiamento turístico. Os guias cadastrados são profissionais independentes, devidamente registrados no CADASTUR, e respondem individualmente pela qualidade e segurança dos serviços prestados durante as expedições.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-2xl font-semibold mb-4">3. Cadastro e Conta do Usuário</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Para acessar determinadas funcionalidades da Plataforma, como favoritar trilhas, participar de expedições ou cadastrar-se como guia, é necessário criar uma conta de usuário. O Usuário compromete-se a fornecer informações verdadeiras, completas e atualizadas durante o processo de cadastro. A Trekko oferece duas modalidades de cadastro: Trilheiro (trekker), para quem deseja explorar trilhas e participar de expedições; e Guia, para profissionais de turismo certificados pelo CADASTUR que desejam oferecer seus serviços na plataforma.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                O Usuário é responsável pela segurança de suas credenciais de acesso e por todas as atividades realizadas em sua conta. Em caso de uso não autorizado ou suspeita de violação de segurança, o Usuário deve notificar imediatamente a Trekko. A Plataforma não se responsabiliza por perdas ou danos decorrentes do uso não autorizado da conta do Usuário.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-2xl font-semibold mb-4">4. Cadastro de Guias e Validação CADASTUR</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Guias de turismo que desejam se cadastrar na Plataforma devem possuir registro ativo no CADASTUR. Durante o processo de cadastro, o número CADASTUR informado será validado automaticamente contra a base de dados oficial. A Trekko aceita o número CADASTUR com ou sem formatação (pontos, traços ou espaços), realizando a normalização automática antes da validação.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Os guias cadastrados concordam em manter seu registro CADASTUR atualizado e válido durante todo o período de utilização da Plataforma. A Trekko reserva-se o direito de suspender ou cancelar o cadastro de guias cujo registro CADASTUR esteja vencido, suspenso ou cancelado. Sobre as expedições intermediadas pela Plataforma, incide uma taxa de serviço de 4% sobre o valor das reservas efetivadas, conforme detalhado nos termos de intermediação aceitos pelo guia durante o cadastro.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-2xl font-semibold mb-4">5. Responsabilidades do Usuário</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                O Usuário compromete-se a utilizar a Plataforma de forma responsável e em conformidade com a legislação vigente. É expressamente proibido: utilizar a Plataforma para fins ilegais ou não autorizados; publicar conteúdo falso, difamatório, ofensivo ou que viole direitos de terceiros; tentar acessar áreas restritas da Plataforma sem autorização; utilizar mecanismos automatizados para coletar dados da Plataforma; e interferir no funcionamento normal dos serviços.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Em relação às atividades de trekking e ecoturismo, o Usuário reconhece que trilhas e atividades ao ar livre envolvem riscos inerentes, incluindo, mas não se limitando a: condições climáticas adversas, terrenos irregulares, fauna silvestre e esforço físico intenso. O Usuário assume total responsabilidade por avaliar suas condições físicas e de saúde antes de participar de qualquer atividade, devendo seguir as recomendações de segurança disponibilizadas na Plataforma e as orientações dos guias durante as expedições.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-2xl font-semibold mb-4">6. Propriedade Intelectual</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Todo o conteúdo disponibilizado na Plataforma, incluindo textos, imagens, fotografias, mapas, logotipos, design, código-fonte e demais elementos, é protegido por direitos autorais e propriedade intelectual. A marca Trekko, seu logotipo e identidade visual são de propriedade exclusiva da Plataforma. É proibida a reprodução, distribuição, modificação ou uso comercial de qualquer conteúdo da Plataforma sem autorização prévia e expressa.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Os dados de trilhas, incluindo coordenadas GPS, traçados e mapas, são compilados a partir de fontes públicas e contribuições da comunidade, sendo disponibilizados para uso pessoal e não comercial. Mapas e traçados baseados no Wikiloc são utilizados em conformidade com os termos de uso daquela plataforma, com a devida atribuição de créditos.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-2xl font-semibold mb-4">7. Pagamentos e Reembolsos</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Os pagamentos por expedições e serviços de guiamento são processados de forma segura através de provedores de pagamento terceirizados (Stripe e/ou Mercado Pago). A Trekko não armazena dados completos de cartão de crédito ou débito. Todas as transações financeiras são protegidas por criptografia e seguem os padrões de segurança PCI-DSS.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                A política de reembolso segue as disposições do Código de Defesa do Consumidor brasileiro. Reembolsos podem ser solicitados em casos de cancelamento de expedição pelo guia, condições que impossibilitem a realização da atividade, ou outras situações previstas em lei. Os prazos e condições específicas de reembolso são detalhados na página de cada expedição e no momento da reserva.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-2xl font-semibold mb-4">8. Limitação de Responsabilidade</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                A Trekko empenha-se em fornecer informações precisas e atualizadas sobre trilhas e serviços, porém não garante a exatidão, completude ou atualidade de todas as informações disponibilizadas. As condições das trilhas podem variar devido a fatores naturais, climáticos ou de manutenção. Recomendamos sempre verificar as condições atuais antes de realizar qualquer atividade.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                A Plataforma não se responsabiliza por: acidentes, lesões ou danos ocorridos durante a realização de trilhas ou expedições; atos, omissões ou negligência de guias cadastrados; interrupções temporárias dos serviços por motivos técnicos ou de manutenção; perdas ou danos decorrentes do uso de informações disponibilizadas na Plataforma; e ações de terceiros que possam afetar a experiência do Usuário.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-2xl font-semibold mb-4">9. Modificações nos Termos</h2>
              <p className="text-muted-foreground leading-relaxed">
                A Trekko reserva-se o direito de modificar estes Termos de Uso a qualquer momento, mediante publicação da versão atualizada na Plataforma. Alterações significativas serão comunicadas aos Usuários registrados por e-mail ou notificação na Plataforma. O uso continuado dos serviços após a publicação de alterações constitui aceitação dos novos termos. Recomendamos a leitura periódica deste documento.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-2xl font-semibold mb-4">10. Legislação Aplicável e Foro</h2>
              <p className="text-muted-foreground leading-relaxed">
                Estes Termos de Uso são regidos pela legislação da República Federativa do Brasil. Quaisquer disputas ou controvérsias decorrentes da utilização da Plataforma serão submetidas ao foro da comarca do domicílio do Usuário, conforme previsto no Código de Defesa do Consumidor, ou ao foro da sede da Trekko, quando aplicável. As partes comprometem-se a buscar a resolução amigável de eventuais conflitos antes de recorrer ao Poder Judiciário.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-2xl font-semibold mb-4">11. Contato</h2>
              <p className="text-muted-foreground leading-relaxed">
                Para dúvidas, sugestões ou reclamações relacionadas a estes Termos de Uso, entre em contato conosco através do e-mail <a href="mailto:contato@trekko.com.br" className="text-primary hover:underline">contato@trekko.com.br</a> ou através da nossa <a href="/contato" className="text-primary hover:underline">página de contato</a>. Nossa equipe está disponível para atendê-lo de segunda a sexta-feira, das 9h às 18h (horário de Brasília).
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
