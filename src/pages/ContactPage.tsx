import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Mail, Globe, ExternalLink, MessageCircle } from "lucide-react";
import { CONTACT } from "@/config";
import { useTranslation } from "react-i18next";







const WEBSITE_LINK = CONTACT.website;
const IMPRESSUM_LINK = CONTACT.website + "/impressum";
const WA_LINK = CONTACT.whatsapp;
const FB_LINK = CONTACT.facebook;
const EMAIL = CONTACT.email;

const ContactPage = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1 pt-20 pb-16">
        {/* Hero */}
        <section className="bg-gradient-to-b from-primary/10 to-background py-12 sm:py-16">
          <div className="container mx-auto px-4 max-w-3xl text-center animate-fade-in">
            <Mail className="w-12 h-12 text-primary mx-auto mb-4" />
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-3 leading-tight">
              {t('contact.title', 'Kontakt')}
            </h1>
            <p className="text-muted-foreground text-base sm:text-lg">
              {t('contact.subtitle', 'Wir freuen uns von dir zu hören.')}
            </p>
          </div>
        </section>

        <section className="py-10 sm:py-14">
          <div className="container mx-auto px-4 max-w-2xl space-y-5">

            {/* WhatsApp */}
            <div className="glass-card rounded-2xl p-6 sm:p-8 border border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-950/20 animate-fade-in">
              <div className="flex items-start gap-4">
                <div className="bg-green-600 p-3 rounded-xl shrink-0">
                  <MessageCircle className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h2 className="font-display text-lg font-bold text-foreground mb-1">
                    WhatsApp
                  </h2>
                  <p className="text-sm text-muted-foreground mb-4">
                    {t('contact.whatsapp.description', 'Schreib uns direkt — wir antworten so schnell wie möglich.')}
                  </p>
                  <Button asChild className="gap-2 bg-green-600 hover:bg-green-700 text-white">
                    <a href={WA_LINK} target="_blank" rel="noopener noreferrer">
                      <MessageCircle className="w-4 h-4" />
                      {t('contact.whatsapp.cta', 'WhatsApp öffnen')}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </Button>
                </div>
              </div>
            </div>

            {/* Email */}
            <div className="glass-card rounded-xl p-5 sm:p-6 animate-fade-in">
              <div className="flex items-start gap-4">
                <div className="bg-primary/10 p-3 rounded-xl shrink-0">
                  <Mail className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="font-display text-base font-bold text-foreground mb-1">E-Mail</h2>
                  <a
                    href={`mailto:${EMAIL}`}
                    className="text-sm text-primary hover:underline"
                  >
                    {EMAIL}
                  </a>
                </div>
              </div>
            </div>

            {/* Facebook */}
            <div className="glass-card rounded-2xl p-6 sm:p-8 border border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20 animate-fade-in">
              <div className="flex items-start gap-4">
                <div className="bg-blue-600 p-3 rounded-xl shrink-0">
                  <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </div>
                <div className="flex-1">
                  <h2 className="font-display text-lg font-bold text-foreground mb-1">
                    Facebook
                  </h2>
                  <p className="text-sm text-muted-foreground mb-4">
                    {t('contact.facebook.description', 'Folge uns und den Hunden auf Facebook — tritt mit uns in Kontakt, sieh aktuelle Updates und werde Teil der Community.')}
                  </p>
                  <Button asChild variant="outline" className="gap-2 border-blue-500 text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/30">
                    <a href={FB_LINK} target="_blank" rel="noopener noreferrer">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                      {t('contact.facebook.cta', 'Facebook-Gruppe öffnen')}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </Button>
                </div>
              </div>
            </div>

            {/* Website & Impressum */}
            <div className="glass-card rounded-xl p-5 sm:p-6 animate-fade-in">
              <h3 className="font-bold text-foreground text-sm mb-3">
                {t('contact.online.title', 'Website & Impressum')}
              </h3>
              <div className="space-y-3">
                <a
                  href={WEBSITE_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Globe className="w-4 h-4 text-primary shrink-0" />
                  save-the-paws.de
                  <ExternalLink className="w-3 h-3" />
                </a>
                <a
                  href={IMPRESSUM_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Globe className="w-4 h-4 text-primary shrink-0" />
                  {t('contact.impressum', 'Impressum')} (save-the-paws.de)
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
