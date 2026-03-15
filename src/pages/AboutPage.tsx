import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Heart, ExternalLink, Shield, Syringe, Users, Globe } from "lucide-react";
import { useTranslation } from "react-i18next";
import logoDark from "@/assets/logo-header.png";
import Footer from "@/components/Footer";

const GOFUNDME_LINK = "https://gofund.me/26e9f81e7";
const WEBSITE_LINK  = "https://save-the-paws.de";

const AboutPage = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-20 pb-16">

        {/* Hero */}
        <section className="bg-gradient-to-b from-primary/10 to-background py-14 sm:py-20">
          <div className="container mx-auto px-4 max-w-3xl text-center animate-fade-in">
            <img src={logoDark} alt="Save The Paws – Agadir" className="h-16 sm:h-20 w-auto mx-auto mb-6 dark:invert" />
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-4 leading-tight">
              {t('about.heroTitle')}{" "}
              <span className="text-primary">{t('about.heroHighlight')}</span>
            </h1>
            <p className="text-muted-foreground text-base sm:text-lg leading-relaxed">
              {t('about.heroDescription')}
            </p>
          </div>
        </section>

        {/* Mission */}
        <section className="py-12 sm:py-16">
          <div className="container mx-auto px-4 max-w-3xl">

            <div className="glass-card rounded-2xl p-7 sm:p-10 animate-fade-in mb-8 leading-relaxed space-y-4 text-foreground/90">
              <p>{t('about.mission1')}</p>
              <p>{t('about.mission2')}</p>
              <p className="font-display text-lg text-primary font-semibold">
                {t('about.missionBold')}
              </p>
              <p>{t('about.mission3')}</p>
              <p>{t('about.mission4')}</p>
            </div>

            {/* What we do */}
            <div className="grid sm:grid-cols-3 gap-4 mb-10 animate-fade-in">
              <div className="glass-card rounded-xl p-5 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-3">
                  <Syringe className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-bold text-foreground text-sm mb-1">{t('about.card1Title')}</h3>
                <p className="text-xs text-muted-foreground">{t('about.card1Desc')}</p>
              </div>
              <div className="glass-card rounded-xl p-5 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-safe/10 mb-3">
                  <Shield className="w-5 h-5 text-safe" />
                </div>
                <h3 className="font-bold text-foreground text-sm mb-1">{t('about.card2Title')}</h3>
                <p className="text-xs text-muted-foreground">{t('about.card2Desc')}</p>
              </div>
              <div className="glass-card rounded-xl p-5 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-500/10 mb-3">
                  <Users className="w-5 h-5 text-blue-500" />
                </div>
                <h3 className="font-bold text-foreground text-sm mb-1">{t('about.card3Title')}</h3>
                <p className="text-xs text-muted-foreground">{t('about.card3Desc')}</p>
              </div>
            </div>

            {/* TNVR Section */}
            <div className="glass-card rounded-2xl p-7 sm:p-10 animate-fade-in mb-8 border-l-4 border-emerald-500">
              <div className="flex items-start gap-4">
                <div className="bg-emerald-500/10 p-3 rounded-xl shrink-0">
                  <span className="text-2xl">✂️</span>
                </div>
                <div>
                  <h2 className="font-display text-xl font-bold text-foreground mb-3">
                    TNVR — {t('about.tnvr.subtitle', 'Trap · Neuter · Vaccinate · Return')}
                  </h2>
                  <p className="text-muted-foreground leading-relaxed mb-3">
                    {t('about.tnvr.desc1', 'TNVR ist die einzige humane und gleichzeitig einzige wirklich effektive Methode, um der Überpopulation von Straßenhunden entgegenzuwirken. Hunde werden eingefangen, kastriert, geimpft und wieder freigelassen — statt getötet.')}
                  </p>
                  <p className="text-muted-foreground leading-relaxed mb-3">
                    {t('about.tnvr.desc2', 'Ohne Kastration wächst eine Hundepopulation unkontrolliert. TNVR durchbricht diesen Kreislauf nachhaltig: Die behandelten Tiere leben weiterhin in ihrem Revier, verhindern aber das Nachrücken neuer, ungeimpfter Hunde.')}
                  </p>
                  <p className="text-sm text-emerald-700 dark:text-emerald-400 font-medium bg-emerald-50 dark:bg-emerald-950/30 px-4 py-2 rounded-lg">
                    {t('about.tnvr.goal', '🎯 TNVR ist eines der Hauptziele von Save The Paws in der Region Agadir-Taghazout.')}
                  </p>
                </div>
              </div>
            </div>

            {/* Donation CTA */}
            <div className="glass-card rounded-2xl p-7 sm:p-10 text-center border border-primary/20 bg-primary/5 animate-fade-in mb-8">
              <Heart className="w-10 h-10 text-primary mx-auto mb-4 animate-pulse" />
              <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground mb-3">
                {t('about.donateTitle')}
              </h2>
              <p className="text-muted-foreground mb-6 max-w-lg mx-auto text-sm sm:text-base">
                {t('about.donateDescription')}
              </p>
              <Button asChild size="lg" className="gap-2">
                <a href={GOFUNDME_LINK} target="_blank" rel="noopener noreferrer">
                  <Heart className="w-5 h-5" />
                  {t('donation.cta')}
                  <ExternalLink className="w-4 h-4" />
                </a>
              </Button>
              <p className="mt-4 text-xs text-muted-foreground">💚 {t('hero.slogan')}</p>
            </div>

            {/* App section */}
            <div className="glass-card rounded-2xl p-7 sm:p-10 animate-fade-in mb-8 space-y-4 text-foreground/90 leading-relaxed">
              <h2 className="font-display text-xl font-bold text-foreground">{t('about.appTitle')}</h2>
              <p>{t('about.appText1')}</p>
              <p>{t('about.appText2')}</p>
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Button asChild variant="outline" className="gap-2">
                  <a href={WEBSITE_LINK} target="_blank" rel="noopener noreferrer">
                    <Globe className="w-4 h-4" />
                    {t('about.websiteLink')}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </Button>
              </div>
            </div>

          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
};

export default AboutPage;
