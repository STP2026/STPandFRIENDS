import { MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import logoHeader from "@/assets/logo-header.webp";

// WhatsApp click-to-chat — number is NOT displayed on the page
const WA_NUMBER = "4915756175163";
const WA_LINK = `https://wa.me/${WA_NUMBER}`;

const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="bg-card border-t border-border py-6 sm:py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-2">
            <img src={logoHeader} alt="Save The Paws – Agadir" className="h-8 sm:h-10 w-auto" />
          </div>

          {/* Nav links */}
          <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs sm:text-sm text-muted-foreground">
            <Link to="/about" className="hover:text-foreground transition-colors">
              {t('common.about')}
            </Link>
            <Link to="/contact" className="hover:text-foreground transition-colors">
              {t('contact.navLabel', 'Contact')}
            </Link>
            <a
              href={WA_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-green-600 hover:text-green-700 transition-colors"
              title="WhatsApp"
            >
              <MessageCircle className="w-4 h-4" />
              WhatsApp
            </a>
          </nav>

          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Niklas Schlichting
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
