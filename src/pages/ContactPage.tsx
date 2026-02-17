import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { MapPin, Mail, Globe, ExternalLink, MessageCircle } from "lucide-react";
import { useTranslation } from "react-i18next";

const WEBSITE_LINK = "https://save-the-paws.de";

// WhatsApp click-to-chat — number is NOT displayed on the page
const WA_NUMBER = "4915756175163";
const WA_LINK = `https://wa.me/${WA_NUMBER}`;

interface AddressCardProps {
  label: string;
  lines: string[];
  note?: string;
}

const AddressCard = ({ label, lines, note }: AddressCardProps) => (
  <div className="glass-card rounded-xl p-5 sm:p-6 animate-fade-in">
    <div className="flex items-start gap-3">
      <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 flex-shrink-0">
        <MapPin className="w-5 h-5 text-primary" />
      </div>
      <div>
        <h3 className="font-bold text-foreground text-sm mb-1">{label}</h3>
        {lines.map((line, i) => (
          <p key={i} className="text-sm text-muted-foreground">{line}</p>
        ))}
        {note && (
          <p className="text-xs text-muted-foreground/70 mt-2 italic">{note}</p>
        )}
      </div>
    </div>
  </div>
);

const ContactPage = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-20 pb-16">
        {/* Hero */}
        <section className="bg-gradient-to-b from-primary/10 to-background py-12 sm:py-16">
          <div className="container mx-auto px-4 max-w-3xl text-center animate-fade-in">
            <Mail className="w-12 h-12 text-primary mx-auto mb-4" />
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-3 leading-tight">
              {t('contact.title')}
            </h1>
            <p className="text-muted-foreground text-base sm:text-lg">
              {t('contact.subtitle')}
            </p>
          </div>
        </section>

        <section className="py-10 sm:py-14">
          <div className="container mx-auto px-4 max-w-3xl space-y-6">

            {/* WhatsApp CTA */}
            <div className="glass-card rounded-2xl p-6 sm:p-8 text-center border border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-950/20 animate-fade-in">
              <MessageCircle className="w-10 h-10 text-green-600 mx-auto mb-3" />
              <h2 className="font-display text-xl font-bold text-foreground mb-2">
                {t('contact.whatsapp.title')}
              </h2>
              <p className="text-muted-foreground text-sm mb-5 max-w-md mx-auto">
                {t('contact.whatsapp.description')}
              </p>
              <Button asChild size="lg" className="gap-2 bg-green-600 hover:bg-green-700 text-white">
                <a href={WA_LINK} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="w-5 h-5" />
                  {t('contact.whatsapp.cta')}
                  <ExternalLink className="w-4 h-4" />
                </a>
              </Button>
            </div>

            {/* Addresses */}
            <div>
              <h2 className="font-display text-xl font-bold text-foreground mb-4">
                {t('contact.addresses.title')}
              </h2>

              <div className="grid sm:grid-cols-2 gap-4">
                <AddressCard
                  label={t('contact.addresses.germany.label')}
                  lines={[
                    "Save The Paws e.V.",
                    "Musterstraße 1",
                    "12345 Musterstadt",
                    "Germany",
                  ]}
                  note={t('contact.addresses.germany.note')}
                />

                <AddressCard
                  label={t('contact.addresses.morocco.label')}
                  lines={[
                    "Save The Paws",
                    "Rue Example 10",
                    "Agadir 80000",
                    "Morocco",
                  ]}
                  note={t('contact.addresses.morocco.note')}
                />
              </div>
            </div>

            {/* Email & Website */}
            <div className="glass-card rounded-xl p-5 sm:p-6 animate-fade-in">
              <h3 className="font-bold text-foreground text-sm mb-3">
                {t('contact.online.title')}
              </h3>
              <div className="space-y-3">
                <a
                  href="mailto:info@save-the-paws.de"
                  className="flex items-center gap-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Mail className="w-4 h-4 text-primary" />
                  info@save-the-paws.de
                </a>
                <a
                  href={WEBSITE_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Globe className="w-4 h-4 text-primary" />
                  save-the-paws.de
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default ContactPage;
