import Header from "@/components/Header";
import { useTranslation } from "react-i18next";
import { Landmark, Users, ScrollText, Mail, HeartHandshake } from "lucide-react";

/**
 * Impressum (legal notice) — required for the PWA as its own Telemedium (§ 5 DDG).
 * Legal entity since 08/2026: Save The Paws e.V. (Vereinsregister Stuttgart VR 727866).
 * Factual data (names, addresses, register numbers) is intentionally not translated;
 * section labels and the charitable-status text are i18n'd (DE/EN/FR/AR).
 */
const ImpressumPage = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20 pb-12">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="mb-8 animate-fade-in">
            <h1 className="font-display text-3xl font-bold text-foreground mb-2 flex items-center gap-3">
              <Landmark className="w-8 h-8 text-primary" />
              {t('imprint.pageTitle', 'Impressum')}
            </h1>
          </div>

          <div className="space-y-6 animate-fade-in">
            {/* Association */}
            <section className="glass-card rounded-xl p-6">
              <h2 className="font-display text-lg font-bold text-foreground mb-3">
                Save The Paws e.V.
              </h2>
              <p className="text-sm text-muted-foreground">
                Schillerstraße 38<br />
                72250 Freudenstadt<br />
                Deutschland
              </p>
            </section>

            {/* Board */}
            <section className="glass-card rounded-xl p-6">
              <h2 className="font-display text-lg font-bold text-foreground mb-3 flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                {t('imprint.boardTitle', 'Vertreten durch den Vorstand')}
              </h2>
              <p className="text-sm text-muted-foreground">
                Niklas Schlichting<br />
                Sina Walter<br />
                Frank Bernitz<br />
                Stina Bernitz
              </p>
            </section>

            {/* Register */}
            <section className="glass-card rounded-xl p-6">
              <h2 className="font-display text-lg font-bold text-foreground mb-3 flex items-center gap-2">
                <ScrollText className="w-5 h-5 text-primary" />
                {t('imprint.registerTitle', 'Vereinsregister')}
              </h2>
              <p className="text-sm text-muted-foreground">
                Amtsgericht Stuttgart<br />
                {t('imprint.registerNumber', 'Vereinsregister')}: VR 727866
              </p>
            </section>

            {/* Contact */}
            <section className="glass-card rounded-xl p-6">
              <h2 className="font-display text-lg font-bold text-foreground mb-3 flex items-center gap-2">
                <Mail className="w-5 h-5 text-primary" />
                {t('imprint.contactTitle', 'Kontakt')}
              </h2>
              <p className="text-sm text-muted-foreground">
                E-Mail: <a href="mailto:savethepawsagadir@gmail.com" className="underline text-primary hover:text-primary/80" dir="ltr">savethepawsagadir@gmail.com</a><br />
                Web: <a href="https://save-the-paws.de" target="_blank" rel="noopener noreferrer" className="underline text-primary hover:text-primary/80" dir="ltr">save-the-paws.de</a>
              </p>
            </section>

            {/* Charitable status */}
            <section className="glass-card rounded-xl p-6">
              <h2 className="font-display text-lg font-bold text-foreground mb-3 flex items-center gap-2">
                <HeartHandshake className="w-5 h-5 text-primary" />
                {t('imprint.charityTitle', 'Gemeinnützigkeit')}
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {t('imprint.charityText', 'Save The Paws e.V. verfolgt gemeinnützige Zwecke. Mit Bescheid des Finanzamts Freudenstadt vom 14.08.2026 wurde gemäß § 60a Abs. 1 AO festgestellt, dass die Satzung des Vereins die satzungsmäßigen Voraussetzungen nach §§ 51, 59, 60 und 61 AO erfüllt. Satzungsmäßiger gemeinnütziger Zweck ist die Förderung des Tierschutzes gemäß § 52 Abs. 2 Satz 1 Nr. 14 AO.')}
              </p>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ImpressumPage;
