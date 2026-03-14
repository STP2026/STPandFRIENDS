import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import DonationSection from "@/components/DonationSection";
import AdPopup from "@/components/AdPopup";
import { ArrowRight, Heart, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useIsHelper } from "@/hooks/useHelperApplication";
import { useTranslation } from "react-i18next";
import Footer from "@/components/Footer";

const Index = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { data: isHelper } = useIsHelper(user?.id);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <AdPopup />
      
      <HeroSection />

      {/* Mission Section */}
      <section className="py-12 sm:py-20 bg-secondary/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 sm:mb-12 animate-fade-in">
            <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3 sm:mb-4">
              {t('reportTypes.title')}
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto px-2">
              {t('reportTypes.description')}
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 max-w-5xl mx-auto">
            <div className="glass-card rounded-xl p-4 sm:p-6 text-center animate-fade-in border-l-4 border-green-500">
              <div className="text-2xl sm:text-4xl mb-2 sm:mb-3">💚</div>
              <h3 className="font-bold text-foreground mb-1 sm:mb-2 text-sm sm:text-base">{t('reportTypes.save.title')}</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {t('reportTypes.save.description')}
              </p>
            </div>
            <a href="https://aid.save-the-paws.de/dog-aid" target="_blank" rel="noopener noreferrer" className="glass-card rounded-xl p-4 sm:p-6 text-center animate-fade-in border-l-4 border-red-500 hover:border-red-600 transition-colors group">
              <div className="text-2xl sm:text-4xl mb-2 sm:mb-3">🐾</div>
              <h3 className="font-bold text-foreground mb-1 sm:mb-2 text-sm sm:text-base group-hover:text-red-600 transition-colors">{t('reportTypes.sos.title')}</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {t('reportTypes.sos.description')}
              </p>
            </a>
            <div className="glass-card rounded-xl p-4 sm:p-6 text-center animate-fade-in border-l-4 border-amber-500">
              <div className="text-2xl sm:text-4xl mb-2 sm:mb-3">🐕</div>
              <h3 className="font-bold text-foreground mb-1 sm:mb-2 text-sm sm:text-base">{t('reportTypes.stray.title')}</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {t('reportTypes.stray.description')}
              </p>
            </div>
            <div className="glass-card rounded-xl p-4 sm:p-6 text-center animate-fade-in border-l-4 border-blue-500">
              <div className="text-2xl sm:text-4xl mb-2 sm:mb-3">💉</div>
              <h3 className="font-bold text-foreground mb-1 sm:mb-2 text-sm sm:text-base">{t('reportTypes.vaccination.title')}</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {t('reportTypes.vaccination.description')}
              </p>
            </div>
          </div>

          <div className="flex justify-center mt-8">
            <Link to="/add">
              <Button variant="default" className="gap-2">
                <Heart className="w-4 h-4" />
                {t('hero.reportAnimal')}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Donation Section */}
      <DonationSection />

      {/* Become a Helper Section */}
      {user && !isHelper && (
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="glass-card rounded-xl p-8 text-center max-w-2xl mx-auto animate-fade-in">
              <Users className="w-16 h-16 text-primary mx-auto mb-4" />
              <h2 className="font-display text-2xl font-bold text-foreground mb-4">
                {t('helperCta.title')}
              </h2>
              <p className="text-muted-foreground mb-6">
                {t('helperCta.description')}
              </p>
              <Link to="/become-helper">
                <Button className="gap-2">
                  <Heart className="w-4 h-4" />
                  {t('helperCta.apply')}
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
};

export default Index;
