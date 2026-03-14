import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { Home, ArrowLeft } from "lucide-react";

const NotFound = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center px-4 py-20">
        <div className="text-center max-w-md animate-fade-in">
          <div className="text-8xl mb-6">🐾</div>
          <h1 className="font-display text-5xl font-bold text-foreground mb-3">404</h1>
          <h2 className="font-display text-xl font-bold text-foreground mb-3">
            {t('notFound.title', 'Seite nicht gefunden')}
          </h2>
          <p className="text-muted-foreground mb-8 leading-relaxed">
            {t('notFound.description', 'Diese Seite existiert nicht oder wurde verschoben. Vielleicht hilft dir die Startseite weiter.')}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/">
              <Button className="gap-2 w-full sm:w-auto">
                <Home className="w-4 h-4" />
                {t('notFound.home', 'Zur Startseite')}
              </Button>
            </Link>
            <Button variant="outline" onClick={() => window.history.back()} className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              {t('notFound.back', 'Zurück')}
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default NotFound;
