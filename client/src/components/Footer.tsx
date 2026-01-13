import { Link } from "wouter";
import { Mountain, Mail, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-forest-dark text-white">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                <Mountain className="w-6 h-6 text-white" />
              </div>
              <span className="font-heading font-semibold text-lg">Trekko</span>
            </Link>
            <p className="text-white/70 text-sm">
              Descubra as melhores trilhas do Brasil e conecte-se com guias certificados para aventuras inesquecíveis.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-heading font-semibold mb-4">Explorar</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/trilhas" className="text-white/70 hover:text-white text-sm transition-colors">
                  Trilhas
                </Link>
              </li>
              <li>
                <Link href="/trilhas?tab=expedicoes" className="text-white/70 hover:text-white text-sm transition-colors">
                  Expedições
                </Link>
              </li>
              <li>
                <Link href="/guias" className="text-white/70 hover:text-white text-sm transition-colors">
                  Guias
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-white/70 hover:text-white text-sm transition-colors">
                  Blog
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-heading font-semibold mb-4">Suporte</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/sobre" className="text-white/70 hover:text-white text-sm transition-colors">
                  Sobre Nós
                </Link>
              </li>
              <li>
                <a href="#" className="text-white/70 hover:text-white text-sm transition-colors">
                  Central de Ajuda
                </a>
              </li>
              <li>
                <a href="#" className="text-white/70 hover:text-white text-sm transition-colors">
                  Termos de Uso
                </a>
              </li>
              <li>
                <a href="#" className="text-white/70 hover:text-white text-sm transition-colors">
                  Privacidade
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-heading font-semibold mb-4">Contato</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-white/70 text-sm">
                <Mail className="w-4 h-4" />
                <a href="mailto:contato@trekko.com" className="hover:text-white transition-colors">
                  contato@trekko.com
                </a>
              </li>
              <li className="flex items-center gap-2 text-white/70 text-sm">
                <MapPin className="w-4 h-4" />
                Brasil
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-white/50 text-sm">
            © {new Date().getFullYear()} Trekko. Todos os direitos reservados.
          </p>
          <div className="flex items-center gap-4">
            <a 
              href="https://www.instagram.com/trekko.com.br/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-white/50 hover:text-white text-sm transition-colors flex items-center gap-1.5"
              aria-label="Siga o Trekko no Instagram"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
              </svg>
              @trekko.com.br
            </a>
            <a 
              href="https://www.tiktok.com/@trekko.com.br" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-white/50 hover:text-white text-sm transition-colors flex items-center gap-1.5"
              aria-label="Siga o Trekko no TikTok"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
              </svg>
              @trekko.com.br
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
