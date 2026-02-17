import { Heart, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

interface DonationSectionProps {
  variant?: "full" | "compact" | "afterReport";
}

const DonationSection = ({ variant = "full" }: DonationSectionProps) => {
  const { t } = useTranslation();
  
  const GOFUNDME_LINK = "https://gofund.me/26e9f81e7";

  if (variant === "afterReport") {
    return (
      <div className="glass-card rounded-xl p-6 text-center animate-fade-in border-2 border-primary/20 bg-primary/5">
        <Heart className="w-12 h-12 text-primary mx-auto mb-3 animate-pulse" />
        <h3 className="font-display text-xl font-bold text-foreground mb-2">
          {t('donation.thankYou')}
        </h3>
        <p className="text-muted-foreground mb-4 text-sm">
          {t('donation.afterReport')}
        </p>
        <Button asChild className="gap-2">
          <a href={GOFUNDME_LINK} target="_blank" rel="noopener noreferrer">
            <Heart className="w-4 h-4" />
            {t('donation.cta')}
            <ExternalLink className="w-3 h-3" />
          </a>
        </Button>
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <div className="glass-card rounded-xl p-4 animate-fade-in">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 rounded-full bg-primary/10">
            <Heart className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h4 className="font-bold text-foreground text-sm">{t('donation.title')}</h4>
            <p className="text-xs text-muted-foreground">{t('donation.shortDescription')}</p>
          </div>
        </div>
        <Button asChild size="sm" className="w-full gap-2">
          <a href={GOFUNDME_LINK} target="_blank" rel="noopener noreferrer">
            <Heart className="w-4 h-4" />
            {t('donation.cta')}
            <ExternalLink className="w-3 h-3" />
          </a>
        </Button>
      </div>
    );
  }

  return (
    <section className="py-12 sm:py-16 bg-gradient-to-b from-primary/5 to-background">
      <div className="container mx-auto px-4">
        <div className="glass-card rounded-2xl p-6 sm:p-10 max-w-3xl mx-auto text-center animate-fade-in border border-primary/20">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
            <Heart className="w-8 h-8 text-primary" />
          </div>
          
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-4">
            {t('donation.title')}
          </h2>
          
          <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
            {t('donation.description')}
          </p>
          
          <Button asChild size="lg" className="gap-2">
            <a href={GOFUNDME_LINK} target="_blank" rel="noopener noreferrer">
              <Heart className="w-5 h-5" />
              {t('donation.cta')}
              <ExternalLink className="w-4 h-4" />
            </a>
          </Button>
          
          <p className="mt-6 text-xs text-muted-foreground">
            💚 {t('donation.together')}
          </p>
        </div>
      </div>
    </section>
  );
};

export default DonationSection;
