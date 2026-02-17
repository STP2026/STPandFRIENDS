import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import DogCard from "@/components/DogCard";
import DonationSection from "@/components/DonationSection";
import AdPopup from "@/components/AdPopup";
import { ArrowRight, Heart, MapPin, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useDogs } from "@/hooks/useDogs";
import { useAuth } from "@/contexts/AuthContext";
import { useIsHelper } from "@/hooks/useHelperApplication";
import { useTranslation } from "react-i18next";
import Footer from "@/components/Footer";

const Index = () => {
  const { t } = useTranslation();
  const { data: dogs, isLoading } = useDogs(true);
  const { user } = useAuth();
  const { data: isHelper } = useIsHelper(user?.id);
  
  const recentDogs = dogs?.slice(0, 3) || [];
  const totalDogs = dogs?.length || 0;
  const vaccinatedDogs = dogs?.filter(d => d.isVaccinated).length || 0;
  const saveDogs = dogs?.filter(d => d.reportType === 'save').length || 0;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <AdPopup />
      
      <HeroSection />

      {/* Report Types Section */}
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
            <div className="glass-card rounded-xl p-4 sm:p-6 text-center animate-fade-in border-l-4 border-red-500">
              <div className="text-2xl sm:text-4xl mb-2 sm:mb-3">🚨</div>
              <h3 className="font-bold text-foreground mb-1 sm:mb-2 text-sm sm:text-base">{t('reportTypes.sos.title')}</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {t('reportTypes.sos.description')}
              </p>
            </div>
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

      {/* Stats Section */}
      <section className="py-12 sm:py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 sm:mb-12 animate-fade-in">
            <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3 sm:mb-4">
              {t('community.title')}
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto px-2">
              {t('community.description')}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 sm:gap-6 max-w-3xl mx-auto">
            <div className="glass-card rounded-xl p-4 sm:p-6 text-center animate-fade-in">
              <div className="text-2xl sm:text-4xl font-bold text-foreground mb-1 sm:mb-2">{totalDogs}</div>
              <p className="text-xs sm:text-sm text-muted-foreground">{t('community.reportedDogs')}</p>
            </div>
            <div className="glass-card rounded-xl p-4 sm:p-6 text-center animate-fade-in">
              <div className="text-2xl sm:text-4xl font-bold text-safe mb-1 sm:mb-2">{vaccinatedDogs}</div>
              <p className="text-xs sm:text-sm text-muted-foreground">{t('community.vaccinated')}</p>
            </div>
            <div className="glass-card rounded-xl p-4 sm:p-6 text-center animate-fade-in">
              <div className="text-2xl sm:text-4xl font-bold text-green-600 mb-1 sm:mb-2">{saveDogs}</div>
              <p className="text-xs sm:text-sm text-muted-foreground">{t('community.rescued')}</p>
            </div>
          </div>

          <div className="flex justify-center mt-6 sm:mt-8">
            <Link to="/map">
              <Button variant="default" className="gap-2 text-sm sm:text-base">
                <MapPin className="w-4 h-4" />
                {t('community.viewMap')}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Recent Dogs Section */}
      {recentDogs.length > 0 && (
        <section className="py-20 bg-secondary/50">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-12 animate-fade-in">
              <div>
                <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-2">
                  {t('recent.title')}
                </h2>
                <p className="text-muted-foreground">
                  {t('recent.description')}
                </p>
              </div>
              <Link to="/dogs" className="hidden sm:block">
                <Button variant="outline" className="gap-2">
                  {t('recent.viewAll')}
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>

            {isLoading ? (
              <div className="text-center py-12 text-muted-foreground">{t('common.loading')}</div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {recentDogs.map((dog, index) => (
                  <DogCard key={dog.id} dog={dog} index={index} />
                ))}
              </div>
            )}

            <Link to="/dogs" className="block sm:hidden mt-6">
              <Button variant="outline" className="w-full gap-2">
                {t('recent.viewAllDogs')}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </section>
      )}

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
