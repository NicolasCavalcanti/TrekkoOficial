import { Helmet } from "react-helmet-async";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ChevronRight } from "lucide-react";

export default function Privacy() {
  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>Política de Privacidade | Trekko - Trilhas, Guias e Aventuras no Brasil</title>
        <meta name="description" content="Conheça a Política de Privacidade da Trekko. Saiba como coletamos, utilizamos, armazenamos e protegemos seus dados pessoais em conformidade com a LGPD." />
        <link rel="canonical" href="https://trekko.com.br/privacidade" />
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
              <li><span className="text-foreground font-medium">Política de Privacidade</span></li>
            </ol>
          </div>
        </nav>

        <div className="container py-12 max-w-4xl">
          <h1 className="font-heading text-4xl font-bold mb-2">Política de Privacidade</h1>
          <p className="text-muted-foreground mb-8">Última atualização: 11 de fevereiro de 2026</p>

          <div className="prose prose-lg max-w-none space-y-8">
            <section>
              <h2 className="font-heading text-2xl font-semibold mb-4">1. Introdução</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                A Trekko (acessível pelo domínio trekko.com.br) tem o compromisso de proteger a privacidade e os dados pessoais de seus usuários. Esta Política de Privacidade descreve como coletamos, utilizamos, armazenamos, compartilhamos e protegemos suas informações pessoais quando você utiliza nossa plataforma de ecoturismo e trilhas. Esta política foi elaborada em conformidade com a Lei Geral de Proteção de Dados Pessoais (LGPD - Lei nº 13.709/2018) e demais legislações aplicáveis.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Ao utilizar a Plataforma Trekko, você declara ter lido, compreendido e concordado com os termos desta Política de Privacidade. Caso não concorde com qualquer disposição aqui descrita, solicitamos que não utilize nossos serviços. Recomendamos a leitura atenta e periódica deste documento, que pode ser atualizado para refletir mudanças em nossas práticas ou na legislação vigente.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-2xl font-semibold mb-4">2. Dados Pessoais Coletados</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                A Trekko coleta diferentes categorias de dados pessoais, dependendo da forma como você interage com a Plataforma. Os dados coletados durante o cadastro incluem: nome completo, endereço de e-mail, e senha (armazenada de forma criptografada). Para guias de turismo, coletamos adicionalmente o número CADASTUR, dados de contato profissional (telefone e e-mail), localização de atuação (estado e cidade), categorias de especialização, idiomas falados e dados bancários para recebimento de pagamentos (chave PIX).
              </p>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Durante a navegação na Plataforma, podemos coletar automaticamente: endereço IP, tipo de navegador e sistema operacional, páginas visitadas e tempo de permanência, dados de geolocalização aproximada (quando autorizado), e informações sobre o dispositivo utilizado. Esses dados são coletados por meio de cookies e tecnologias similares, conforme detalhado na seção específica desta política.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Ao realizar transações financeiras na Plataforma (reservas de expedições), os dados de pagamento são processados diretamente por nossos provedores de pagamento (Stripe e/ou Mercado Pago). A Trekko não armazena números completos de cartão de crédito, CVV ou dados sensíveis de pagamento. Armazenamos apenas identificadores de transação necessários para o acompanhamento de pedidos e reembolsos.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-2xl font-semibold mb-4">3. Finalidade do Tratamento de Dados</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Os dados pessoais coletados são utilizados para as seguintes finalidades: criação e gerenciamento de contas de usuário; validação de credenciais CADASTUR de guias de turismo; processamento de reservas e pagamentos de expedições; comunicação sobre serviços, atualizações e novidades da Plataforma; personalização da experiência do usuário; melhoria contínua dos serviços oferecidos; cumprimento de obrigações legais e regulatórias; e prevenção de fraudes e atividades ilícitas.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                A Trekko utiliza ferramentas de análise para compreender como os usuários interagem com a Plataforma, permitindo melhorias na experiência de navegação e no conteúdo oferecido. Esses dados são tratados de forma agregada e anonimizada sempre que possível, não permitindo a identificação individual dos usuários.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-2xl font-semibold mb-4">4. Base Legal para o Tratamento</h2>
              <p className="text-muted-foreground leading-relaxed">
                O tratamento de dados pessoais pela Trekko fundamenta-se nas seguintes bases legais previstas na LGPD: consentimento do titular (Art. 7º, I) para o cadastro e utilização dos serviços; execução de contrato (Art. 7º, V) para o processamento de reservas e pagamentos; cumprimento de obrigação legal (Art. 7º, II) para o armazenamento de dados fiscais e tributários; legítimo interesse do controlador (Art. 7º, IX) para melhorias na Plataforma e comunicações relevantes; e proteção do crédito (Art. 7º, X) para a prevenção de fraudes em transações financeiras.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-2xl font-semibold mb-4">5. Compartilhamento de Dados</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                A Trekko pode compartilhar dados pessoais com terceiros nas seguintes situações: com guias de turismo, quando o usuário realiza uma reserva de expedição (nome e dados de contato necessários para a prestação do serviço); com provedores de pagamento (Stripe e Mercado Pago) para o processamento de transações financeiras; com autoridades governamentais, quando exigido por lei, ordem judicial ou regulamentação aplicável; e com prestadores de serviços técnicos que auxiliam na operação da Plataforma (hospedagem, análise de dados, suporte técnico), sempre mediante contratos que garantam a proteção dos dados.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                A Trekko não vende, aluga ou comercializa dados pessoais de seus usuários para terceiros com finalidade de marketing direto. Eventuais transferências internacionais de dados são realizadas em conformidade com a LGPD, garantindo nível adequado de proteção.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-2xl font-semibold mb-4">6. Cookies e Tecnologias de Rastreamento</h2>
              <p className="text-muted-foreground leading-relaxed">
                A Plataforma utiliza cookies e tecnologias similares para melhorar a experiência de navegação. Cookies essenciais são necessários para o funcionamento básico da Plataforma (autenticação, preferências de sessão). Cookies de análise nos ajudam a entender como os usuários interagem com a Plataforma, permitindo melhorias contínuas. Cookies de publicidade podem ser utilizados para exibir anúncios relevantes, incluindo anúncios do Google AdSense. O usuário pode gerenciar suas preferências de cookies através das configurações do navegador, porém a desativação de cookies essenciais pode afetar o funcionamento da Plataforma.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-2xl font-semibold mb-4">7. Segurança dos Dados</h2>
              <p className="text-muted-foreground leading-relaxed">
                A Trekko implementa medidas técnicas e organizacionais adequadas para proteger os dados pessoais contra acesso não autorizado, alteração, divulgação ou destruição. Essas medidas incluem: criptografia de dados em trânsito (HTTPS/TLS) e em repouso; armazenamento seguro de senhas utilizando algoritmos de hash robustos; controle de acesso baseado em funções (RBAC); monitoramento contínuo de segurança; backups regulares; e revisão periódica das práticas de segurança. Apesar de nossos esforços, nenhum sistema é completamente imune a riscos de segurança, e não podemos garantir proteção absoluta contra todas as ameaças.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-2xl font-semibold mb-4">8. Direitos do Titular dos Dados</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Em conformidade com a LGPD, você possui os seguintes direitos em relação aos seus dados pessoais: confirmação da existência de tratamento; acesso aos dados pessoais; correção de dados incompletos, inexatos ou desatualizados; anonimização, bloqueio ou eliminação de dados desnecessários ou tratados em desconformidade; portabilidade dos dados; eliminação dos dados tratados com base no consentimento; informação sobre compartilhamento de dados; informação sobre a possibilidade de não fornecer consentimento e suas consequências; e revogação do consentimento.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Para exercer qualquer desses direitos, entre em contato conosco através do e-mail <a href="mailto:privacidade@trekko.com.br" className="text-primary hover:underline">privacidade@trekko.com.br</a> ou através da nossa <a href="/contato" className="text-primary hover:underline">página de contato</a>. Responderemos às solicitações no prazo de 15 (quinze) dias úteis, conforme previsto na legislação.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-2xl font-semibold mb-4">9. Retenção de Dados</h2>
              <p className="text-muted-foreground leading-relaxed">
                Os dados pessoais são retidos pelo período necessário para cumprir as finalidades para as quais foram coletados, incluindo obrigações legais, contratuais e regulatórias. Dados de conta são mantidos enquanto a conta estiver ativa. Dados de transações financeiras são retidos pelo prazo legal exigido pela legislação fiscal e tributária brasileira. Após o término do período de retenção, os dados são eliminados ou anonimizados de forma segura. O usuário pode solicitar a exclusão de sua conta e dados pessoais a qualquer momento, respeitados os prazos legais de retenção obrigatória.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-2xl font-semibold mb-4">10. Alterações nesta Política</h2>
              <p className="text-muted-foreground leading-relaxed">
                A Trekko reserva-se o direito de atualizar esta Política de Privacidade periodicamente para refletir mudanças em nossas práticas, tecnologias ou na legislação aplicável. Alterações significativas serão comunicadas aos usuários registrados por e-mail ou notificação na Plataforma. A data da última atualização será sempre indicada no topo deste documento. Recomendamos a revisão periódica desta política.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-2xl font-semibold mb-4">11. Contato e Encarregado de Dados (DPO)</h2>
              <p className="text-muted-foreground leading-relaxed">
                Para questões relacionadas à privacidade e proteção de dados pessoais, entre em contato com nosso Encarregado de Proteção de Dados (DPO) através do e-mail <a href="mailto:privacidade@trekko.com.br" className="text-primary hover:underline">privacidade@trekko.com.br</a>. Para questões gerais, utilize o e-mail <a href="mailto:contato@trekko.com.br" className="text-primary hover:underline">contato@trekko.com.br</a> ou acesse nossa <a href="/contato" className="text-primary hover:underline">página de contato</a>.
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
