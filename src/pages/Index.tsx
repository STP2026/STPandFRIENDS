import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import DonationSection from "@/components/DonationSection";
import SponsorTicker from "@/components/SponsorTicker";
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
      <section className="py-10 sm:py-14">
        <div className="container mx-auto px-4">

          {/* Section header */}
          <div className="text-center mb-8 sm:mb-10 animate-fade-in">
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-2">
              {t('actions.title')}
            </h2>
            <p className="text-sm text-muted-foreground max-w-xl mx-auto">
              {t('actions.subtitle')}
            </p>
          </div>

          {/* 4er Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 max-w-6xl mx-auto items-stretch">

            {/* [1] Hund melden */}
            <div className="glass-card rounded-2xl overflow-hidden border border-border animate-fade-in flex flex-col h-full">
              <div className="bg-gradient-to-br from-orange-400 to-orange-600 p-4 flex items-center justify-center">
                <HandHeart className="w-10 h-10 text-white drop-shadow" />
              </div>
              <div className="p-4 sm:p-5 flex flex-col flex-1">
                <h3 className="font-display text-base font-bold text-foreground mb-1.5">
                  {t('actions.rescue.title')}
                </h3>
                <p className="text-xs text-muted-foreground mb-4 leading-relaxed flex-1">
                  {t('actions.rescue.description')}
                </p>
                <Link to="/add">
                  <Button variant="outline" className="w-full gap-1.5 text-xs sm:text-sm border-orange-500 text-orange-700 hover:bg-orange-50 dark:hover:bg-orange-950/30" size="sm">
                    <Heart className="w-3.5 h-3.5" />
                    {t('actions.rescue.cta')}
                  </Button>
                </Link>
              </div>
            </div>

            {/* [2] Supporter werden */}
            <div className="glass-card rounded-2xl overflow-hidden border border-border animate-fade-in flex flex-col h-full" style={{ animationDelay: '0.1s' }}>
              <div className="bg-gradient-to-br from-amber-400 to-amber-600 p-4 flex items-center justify-center">
                <Heart className="w-10 h-10 text-white drop-shadow" />
              </div>
              <div className="p-4 sm:p-5 flex flex-col flex-1">
                <h3 className="font-display text-base font-bold text-foreground mb-1.5">
                  {t('actions.support.title')}
                </h3>
                <p className="text-xs text-muted-foreground mb-4 leading-relaxed flex-1">
                  {t('actions.support.description')}
                </p>
                <a href="https://gofund.me/26e9f81e7" target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" className="w-full gap-1.5 text-xs sm:text-sm border-amber-500 text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-950/30" size="sm">
                    <Heart className="w-3.5 h-3.5" />
                    {t('actions.support.cta')}
                  </Button>
                </a>
              </div>
            </div>

            {/* [3] PawFriends */}
            <div className="glass-card rounded-2xl overflow-hidden border border-border animate-fade-in flex flex-col h-full" style={{ animationDelay: '0.2s' }}>
              <div className="bg-gradient-to-br from-emerald-400 to-emerald-600 p-4 flex items-center justify-center">
                <MapPin className="w-10 h-10 text-white drop-shadow" />
              </div>
              <div className="p-4 sm:p-5 flex flex-col flex-1">
                <h3 className="font-display text-base font-bold text-foreground mb-1.5">
                  {t('actions.pawfriends.title')}
                </h3>
                <p className="text-xs text-muted-foreground mb-4 leading-relaxed flex-1">
                  {t('actions.pawfriends.description')}
                </p>
                <Link to="/map">
                  <Button variant="outline" className="w-full gap-1.5 text-xs sm:text-sm border-emerald-500 text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/30" size="sm">
                    <MapPin className="w-3.5 h-3.5" />
                    {t('actions.pawfriends.cta')}
                  </Button>
                </Link>
              </div>
            </div>

            {/* [4] Adopt */}
            <div className="glass-card rounded-2xl overflow-hidden border border-border animate-fade-in flex flex-col h-full" style={{ animationDelay: '0.3s' }}>
              <div className="bg-gradient-to-br from-violet-500 to-violet-700 p-4 flex items-center justify-center">
                <span className="text-4xl">🐶</span>
              </div>
              <div className="p-4 sm:p-5 flex flex-col flex-1">
                <h3 className="font-display text-base font-bold text-foreground mb-1.5">
                  {t('actions.adopt.title')}
                </h3>
                <p className="text-xs text-muted-foreground mb-4 leading-relaxed flex-1">
                  {t('actions.adopt.description')}
                </p>
                <a href="https://aid.save-the-paws.de/adopt" target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" className="w-full gap-1.5 text-xs sm:text-sm border-violet-500 text-violet-700 hover:bg-violet-50 dark:hover:bg-violet-950/30" size="sm">
                    <Heart className="w-3.5 h-3.5" />
                    {t('actions.adopt.cta')}
                  </Button>
                </a>
              </div>
            </div>

          </div>

          {/* [5]+[6] Dog Aid + First Aid als 2-Spalten-Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mt-3 sm:mt-4 max-w-6xl mx-auto">

            {/* [5] Hund in Not */}
            <div className="glass-card rounded-2xl overflow-hidden border border-border animate-fade-in flex">
              <div className="bg-gradient-to-br from-blue-500 to-blue-700 p-4 flex items-center justify-center shrink-0 w-20">
                <svg viewBox="0 0 32 32" className="w-9 h-9 drop-shadow" aria-label="Dog Aid">
                  <ellipse cx="10.5" cy="9" rx="3" ry="3.5" fill="white" />
                  <ellipse cx="21.5" cy="9" rx="3" ry="3.5" fill="white" />
                  <ellipse cx="6.5" cy="16" rx="2.8" ry="3.2" fill="white" />
                  <ellipse cx="25.5" cy="16" rx="2.8" ry="3.2" fill="white" />
                  <ellipse cx="16" cy="22" rx="7" ry="6" fill="white" />
                  <rect x="14.8" y="18.5" width="2.4" height="7" rx="0.6" fill="#2563eb" />
                  <rect x="12.5" y="20.8" width="7" height="2.4" rx="0.6" fill="#2563eb" />
                </svg>
              </div>
              <div className="p-4 flex flex-col justify-center flex-1">
                <h3 className="font-display text-sm font-bold text-foreground mb-1">
                  {t('actions.dogaid.title')}
                </h3>
                <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
                  {t('actions.dogaid.description')}
                </p>
                <a href="https://aid.save-the-paws.de/dog-aid" target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="sm" className="gap-1.5 text-xs border-blue-500 text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/30">
                    {t('actions.dogaid.cta')}
                    <ArrowRight className="w-3 h-3" />
                  </Button>
                </a>
              </div>
            </div>

            {/* [6] Tollwut-Leitfaden */}
            <div className="glass-card rounded-2xl overflow-hidden border border-border animate-fade-in flex" style={{ animationDelay: '0.1s' }}>
              <div className="bg-gradient-to-br from-red-500 to-red-700 p-4 flex items-center justify-center shrink-0 w-20">
                <svg viewBox="0 0 32 32" className="w-9 h-9 drop-shadow" aria-label="First Aid">
                  <path d="M16 28s-11-7.2-11-14.5C5 9.4 8.4 6 12.5 6c2.2 0 3.5 1.5 3.5 1.5S17.8 6 20 6c3.6 0 6.5 3.4 6.5 7.5C26.5 20.8 16 28 16 28z" fill="white" />
                  <rect x="14" y="11" width="4" height="10" rx="0.8" fill="#dc2626" />
                  <rect x="11" y="14" width="10" height="4" rx="0.8" fill="#dc2626" />
                </svg>
              </div>
              <div className="p-4 flex flex-col justify-center flex-1">
                <h3 className="font-display text-sm font-bold text-foreground mb-1">
                  {t('actions.firstaid.title')}
                </h3>
                <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
                  {t('actions.firstaid.description')}
                </p>
                <a href="https://aid.save-the-paws.de/first-aid" target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="sm" className="gap-1.5 text-xs border-red-500 text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30">
                    {t('actions.firstaid.cta')}
                    <ArrowRight className="w-3 h-3" />
                  </Button>
                </a>
              </div>
            </div>

          </div>

        </div>
      </section>

            {/* Donation */}
      <DonationSection />

      {/* Sponsor Ticker */}
      <div className="py-2 bg-secondary/30">
        <SponsorTicker />
      </div>

      {/* Become a Helper — shown to all (guests + logged-in non-helpers) */}
      {!isHelper && (
        <section className="py-5 sm:py-7">
          <div className="container mx-auto px-4">
            <div className="glass-card rounded-2xl p-8 text-center max-w-3xl mx-auto animate-fade-in border border-primary/20">
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
