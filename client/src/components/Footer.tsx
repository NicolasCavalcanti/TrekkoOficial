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
              <span className="font-heading font-semibold text-lg">Trilhas do Brasil</span>
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
                contato@trilhasdobrasil.com
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
            © {new Date().getFullYear()} Trilhas do Brasil. Todos os direitos reservados.
          </p>
          <div className="flex items-center gap-4">
            <a href="#" className="text-white/50 hover:text-white text-sm transition-colors">
              Instagram
            </a>
            <a href="#" className="text-white/50 hover:text-white text-sm transition-colors">
              Facebook
            </a>
            <a href="#" className="text-white/50 hover:text-white text-sm transition-colors">
              YouTube
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
