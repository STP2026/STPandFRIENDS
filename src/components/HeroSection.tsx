import { ArrowRight, MapPin, Heart, Shield, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { usePublicStats } from "@/hooks/usePublicStats";
import SponsorTicker from "@/components/SponsorTicker";
import heroImage from "@/assets/hero-dog.webp";
import logoWhite from "@/assets/logo-header.png";

const HeroSection = () => {
  const { t } = useTranslation();
  const { data: stats } = usePublicStats();

  const taggedDogs = stats?.taggedDogs || 30;
  const userCount = stats?.userCount || 20;
  const helperCount = stats?.helperCount || 0;

  const statItems = [
    { icon: Shield, label: t('hero.stats.tagged'), value: `${taggedDogs}+` },
    { icon: Users, label: t('hero.stats.users'), value: `${userCount}+` },
  ];

  return (
    <section className="relative min-h-[67svh] sm:min-h-[75svh] flex flex-col items-center justify-center overflow-hidden pt-14 sm:pt-16">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <img src={heroImage} alt="Hund am Strand von Taghazout" className="w-full h-full object-cover" />
        <div className="hero-overlay absolute inset-0" />
      </div>

      {/* Main content — flex-1 so it fills space above ticker */}
      <div className="relative z-10 container mx-auto px-4 py-8 sm:py-12 text-center flex-1 flex flex-col items-center justify-center w-full">
        <div className="max-w-3xl mx-auto animate-fade-in w-full">
          <img
            src={logoWhite}
            alt="Save The Paws – Agadir"
            className="h-20 sm:h-28 md:h-36 w-auto mx-auto mb-4 drop-shadow-lg invert"
          />

          <div className="inline-flex items-center gap-2 bg-primary/20 backdrop-blur-sm text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-full mb-4 sm:mb-6 border border-white/20">
            <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="text-xs sm:text-sm font-medium">{t('hero.region')}</span>
          </div>

          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 sm:mb-6 leading-tight drop-shadow-lg px-2">
            {t('hero.title')}{" "}
            <span className="text-orange-300">{t('hero.titleHighlight')}</span>
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-white/90 mb-3 sm:mb-4 max-w-2xl mx-auto drop-shadow-md px-4">
            {t('hero.description')}
          </p>

          <p className="text-sm sm:text-base text-orange-200 font-medium mb-6 sm:mb-8 drop-shadow-md px-4">
            {t('hero.touristHint')}
          </p>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
            <Link to="/map" className="w-full sm:w-auto">
              <Button variant="hero" size="lg" className="gap-2 w-full text-sm sm:text-base">
                <MapPin className="w-4 h-4 sm:w-5 sm:h-5" />
                {t('hero.exploreMap')}
                <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
              </Button>
            </Link>
            <Link to="/add" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="gap-2 w-full text-sm sm:text-base bg-white/10 border-white/30 text-white hover:bg-white/20 backdrop-blur-sm">
                <Heart className="w-4 h-4 sm:w-5 sm:h-5" />
                {t('hero.reportAnimal')}
              </Button>
            </Link>
          </div>
        </div>

        {/* 4 Stats — centered */}
        <div className="mt-10 sm:mt-16 grid grid-cols-2 gap-3 sm:gap-4 w-full max-w-sm mx-auto px-4">
          {statItems.map((stat, index) => (
            <div
              key={stat.label}
              className="glass-card rounded-xl p-3 sm:p-4 text-center backdrop-blur-md bg-white/10 border-white/20"
              style={{ animationDelay: `${0.1 * index}s` }}
            >
              <stat.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white mx-auto mb-1 sm:mb-2" />
              <p className="text-lg sm:text-2xl font-bold text-white">{stat.value}</p>
              <p className="text-xs text-white/70 leading-tight">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Sponsor Ticker — inside z-10 container, below stats */}
        <div className="w-full mt-6">
          <SponsorTicker />
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-float z-10">
        <div className="w-6 h-10 rounded-full border-2 border-white/50 flex justify-center pt-2">
          <div className="w-1.5 h-1.5 rounded-full bg-white/70 animate-bounce" />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
