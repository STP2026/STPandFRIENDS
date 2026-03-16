import { ArrowRight, MapPin, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { usePublicStats } from "@/hooks/usePublicStats";
import SponsorTicker from "@/components/SponsorTicker";
import heroImage from "@/assets/hero-dog.webp";
import logoWhite from "@/assets/logo.svg";

const HeroSection = () => {
  const { t } = useTranslation();
  const { data: stats } = usePublicStats();

  const taggedDogs = stats?.taggedDogs || 30;
  const userCount = stats?.userCount || 20;

  const quickLinks = [
    { key: 'hero.quick.report', href: '/add', internal: true },
    { key: 'hero.quick.rescue', href: 'https://aid.save-the-paws.de/dog-aid', internal: false },
    { key: 'hero.quick.rabies', href: 'https://aid.save-the-paws.de/first-aid', internal: false },
    { key: 'hero.quick.pawfriends', href: '/pawfriends', internal: true },
    { key: 'hero.quick.donate', href: 'https://gofund.me/26e9f81e7', internal: false },
    { key: 'hero.quick.adopt', href: 'https://aid.save-the-paws.de/adopt', internal: false },
    { key: 'hero.quick.helper', href: '/become-helper', internal: true },
    { key: 'hero.quick.contact', href: '/contact', internal: true },
  ];

  return (
    <section className="relative min-h-[67svh] sm:min-h-[75svh] flex flex-col items-center justify-center overflow-hidden pt-14 sm:pt-16">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <img src={heroImage} alt="Hund am Strand von Taghazout" className="w-full h-full object-cover" />
        <div className="hero-overlay absolute inset-0" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 sm:py-12 text-center flex-1 flex flex-col items-center justify-center w-full">
        <div className="max-w-3xl mx-auto animate-fade-in w-full">
          <img
            src={logoWhite}
            alt="Save The Paws – Agadir"
            className="h-20 sm:h-28 md:h-36 w-auto mx-auto mb-4 drop-shadow-lg invert"
          />

          <div className="inline-flex items-center gap-2 bg-primary/20 backdrop-blur-sm text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-full mb-4 sm:mb-5 border border-white/20">
            <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="text-xs sm:text-sm font-medium">{t('hero.region')}</span>
          </div>

          {/* Main headline */}
          <h1 className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight drop-shadow-lg px-2">
            {t('hero.title')}{" "}
            <span className="text-orange-300">{t('hero.titleHighlight')}</span>
          </h1>

          {/* New subline */}
          <p className="text-sm sm:text-base md:text-lg text-white/90 mb-2 sm:mb-3 max-w-2xl mx-auto drop-shadow-md px-4 leading-relaxed">
            {t('hero.description')}
          </p>

          {/* Quick links strip — scrollable on mobile */}
          <div className="flex gap-2 overflow-x-auto pb-1 justify-start sm:justify-center px-4 mb-5 sm:mb-7 scrollbar-none">
            {quickLinks.map((link) =>
              link.internal ? (
                <Link key={link.key} to={link.href} className="shrink-0">
                  <span className="inline-block bg-white/15 hover:bg-white/25 backdrop-blur-sm text-white/90 text-xs px-3 py-1 rounded-full border border-white/20 transition-colors whitespace-nowrap">
                    {t(link.key)}
                  </span>
                </Link>
              ) : (
                <a key={link.key} href={link.href} target="_blank" rel="noopener noreferrer" className="shrink-0">
                  <span className="inline-block bg-white/15 hover:bg-white/25 backdrop-blur-sm text-white/90 text-xs px-3 py-1 rounded-full border border-white/20 transition-colors whitespace-nowrap">
                    {t(link.key)}
                  </span>
                </a>
              )
            )}
          </div>

          {/* CTA Buttons */}
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

        {/* Stats — no icons, text only, compact */}
        <div className="mt-8 sm:mt-12 flex gap-6 sm:gap-10 justify-center px-4">
          <div className="text-center">
            <p className="text-2xl sm:text-3xl font-bold text-white">{taggedDogs}+</p>
            <p className="text-xs text-white/70 mt-0.5">{t('hero.stats.tagged')}</p>
          </div>
          <div className="w-px bg-white/20" />
          <div className="text-center">
            <p className="text-2xl sm:text-3xl font-bold text-white">{userCount}+</p>
            <p className="text-xs text-white/70 mt-0.5">{t('hero.stats.users')}</p>
          </div>
        </div>

        {/* Sponsor Ticker */}
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
