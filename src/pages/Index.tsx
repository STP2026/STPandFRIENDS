import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import DonationSection from "@/components/DonationSection";
import AdPopup from "@/components/AdPopup";
import { ArrowRight, Heart, MapPin, Users, Stethoscope, HandHeart } from "lucide-react";
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

      {/* Three Action Cards */}
      <section className="py-14 sm:py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10 sm:mb-14 animate-fade-in">
            <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3">
              {t('actions.title')}
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">
              {t('actions.subtitle')}
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 max-w-6xl mx-auto">

            {/* Card 1: Report */}
            <div className="glass-card rounded-2xl overflow-hidden border border-border animate-fade-in group">
              <div className="bg-gradient-to-br from-orange-400 to-orange-600 p-6 flex items-center justify-center">
                <HandHeart className="w-14 h-14 text-white drop-shadow" />
              </div>
              <div className="p-6">
                <h3 className="font-display text-xl font-bold text-foreground mb-2">
                  {t('actions.rescue.title')}
                </h3>
                <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
                  {t('actions.rescue.description')}
                </p>
                <Link to="/add">
                  <Button className="w-full gap-2">
                    <Heart className="w-4 h-4" />
                    {t('actions.rescue.cta')}
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </div>

            {/* Card 2: PawFriends */}
            <div className="glass-card rounded-2xl overflow-hidden border border-border animate-fade-in group" style={{ animationDelay: '0.1s' }}>
              <div className="bg-gradient-to-br from-emerald-400 to-emerald-600 p-6 flex items-center justify-center">
                <MapPin className="w-14 h-14 text-white drop-shadow" />
              </div>
              <div className="p-6">
                <h3 className="font-display text-xl font-bold text-foreground mb-2">
                  {t('actions.pawfriends.title')}
                </h3>
                <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
                  {t('actions.pawfriends.description')}
                </p>
                <Link to="/pawfriends">
                  <Button variant="outline" className="w-full gap-2 border-emerald-500 text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/30">
                    <MapPin className="w-4 h-4" />
                    {t('actions.pawfriends.cta')}
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </div>

            {/* Card 3: Dog Aid */}
            <div className="glass-card rounded-2xl overflow-hidden border border-border animate-fade-in group" style={{ animationDelay: '0.2s' }}>
              <div className="bg-gradient-to-br from-red-400 to-red-600 p-6 flex items-center justify-center">
                <Stethoscope className="w-14 h-14 text-white drop-shadow" />
              </div>
              <div className="p-6">
                <h3 className="font-display text-xl font-bold text-foreground mb-2">
                  {t('actions.dogaid.title')}
                </h3>
                <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
                  {t('actions.dogaid.description')}
                </p>
                <a href="https://aid.save-the-paws.de/dog-aid" target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" className="w-full gap-2 border-red-500 text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30">
                    <Stethoscope className="w-4 h-4" />
                    {t('actions.dogaid.cta')}
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </a>
              </div>
            </div>

            {/* Card 4: First Aid (human) */}
            <div className="glass-card rounded-2xl overflow-hidden border border-border animate-fade-in group" style={{ animationDelay: '0.3s' }}>
              <div className="bg-gradient-to-br from-blue-400 to-blue-600 p-6 flex items-center justify-center">
                <Heart className="w-14 h-14 text-white drop-shadow" />
              </div>
              <div className="p-6">
                <h3 className="font-display text-xl font-bold text-foreground mb-2">
                  {t('actions.firstaid.title')}
                </h3>
                <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
                  {t('actions.firstaid.description')}
                </p>
                <a href="https://aid.save-the-paws.de/first-aid" target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" className="w-full gap-2 border-blue-500 text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/30">
                    <Heart className="w-4 h-4" />
                    {t('actions.firstaid.cta')}
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </a>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Donation */}}
      <DonationSection />

      {/* Become a Helper */}
      {user && !isHelper && (
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="glass-card rounded-2xl p-8 text-center max-w-2xl mx-auto animate-fade-in border border-primary/20">
              <Users className="w-14 h-14 text-primary mx-auto mb-4" />
              <h2 className="font-display text-2xl font-bold text-foreground mb-3">
                {t('helperCta.title')}
              </h2>
              <p className="text-muted-foreground mb-6 leading-relaxed">
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
