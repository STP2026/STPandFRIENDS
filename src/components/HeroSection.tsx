import { ArrowRight, MapPin, Heart, Shield, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthContext";
import heroImage from "@/assets/hero-dog.webp";
import logoWhite from "@/assets/logo-white.webp";

const HeroSection = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleExploreMap = (e: React.MouseEvent) => {
    if (!user) {
      e.preventDefault();
      navigate("/auth", { state: { from: "/map", message: "map" } });
    }
  };
  return (
    <section className="relative min-h-[100svh] flex items-center justify-center overflow-hidden pt-14 sm:pt-16">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroImage}
          alt="Hund am Strand von Taghazout"
          className="w-full h-full object-cover"
        />
        <div className="hero-overlay absolute inset-0" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-12 sm:py-20 text-center">
        <div className="max-w-3xl mx-auto animate-fade-in">
          <img
            src={logoWhite}
            alt="Save The Paws – Agadir"
            className="h-28 sm:h-36 md:h-44 w-auto mx-auto mb-6 drop-shadow-lg"
          />

          <div className="inline-flex items-center gap-2 bg-primary/20 backdrop-blur-sm text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-full mb-4 sm:mb-6 border border-white/20">
            <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="text-xs sm:text-sm font-medium">{t('hero.region')}</span>
          </div>

          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 sm:mb-6 leading-tight drop-shadow-lg px-2">
            {t('hero.title')}{" "}
            <span className="text-orange-300">{t('hero.titleHighlight')}</span>
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-white/90 mb-6 sm:mb-8 max-w-2xl mx-auto drop-shadow-md px-4">
            {t('hero.description')}
          </p>

          <p className="text-lg sm:text-xl md:text-2xl font-display font-bold text-orange-300 mb-6 sm:mb-8 drop-shadow-md">
            {t('hero.slogan')}
          </p>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
            <Link to="/map" className="w-full sm:w-auto" onClick={handleExploreMap}>
              <Button variant="hero" size="lg" className="gap-2 w-full text-sm sm:text-base">
                <MapPin className="w-4 h-4 sm:w-5 sm:h-5" />
                {t('hero.exploreMap')}
                <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
              </Button>
            </Link>
            <Link to="/add" className="w-full sm:w-auto">
              <Button 
                variant="outline" 
                size="lg" 
                className="gap-2 w-full text-sm sm:text-base bg-white/10 border-white/30 text-white hover:bg-white/20 backdrop-blur-sm"
              >
                <Heart className="w-4 h-4 sm:w-5 sm:h-5" />
                {t('hero.reportAnimal')}
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-10 sm:mt-16 grid grid-cols-2 gap-3 sm:gap-6 max-w-md sm:max-w-xl mx-auto px-4">
          {[
            { icon: Shield, label: t('hero.stats.vaccinated'), value: "150+" },
            { icon: Users, label: t('hero.stats.users'), value: "300+" },
          ].map((stat, index) => (
            <div
              key={stat.label}
              className="glass-card rounded-xl p-3 sm:p-4 text-center backdrop-blur-md bg-white/10 border-white/20"
              style={{ animationDelay: `${0.1 * index}s` }}
            >
              <stat.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white mx-auto mb-1 sm:mb-2" />
              <p className="text-xl sm:text-2xl font-bold text-white">{stat.value}</p>
              <p className="text-xs sm:text-sm text-white/70">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-float">
        <div className="w-6 h-10 rounded-full border-2 border-white/50 flex justify-center pt-2">
          <div className="w-1.5 h-1.5 rounded-full bg-white/70 animate-bounce" />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
