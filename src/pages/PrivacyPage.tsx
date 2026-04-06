import Header from "@/components/Header";
import { useTranslation } from "react-i18next";
import { Shield, Database, MapPin, Lock, Trash2, Mail } from "lucide-react";
import { CONTACT } from "@/config";

const PrivacyPage = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20 pb-12">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="mb-8 animate-fade-in">
            <h1 className="font-display text-3xl font-bold text-foreground mb-2 flex items-center gap-3">
              <Shield className="w-8 h-8 text-primary" />
              {t('privacy.pageTitle', 'Datenschutzerklärung')}
            </h1>
            <p className="text-sm text-muted-foreground">
              {t('privacy.lastUpdated', 'Stand: März 2026')}
            </p>
          </div>

          <div className="space-y-6 animate-fade-in">
            {/* Responsible */}
            <section className="glass-card rounded-xl p-6">
              <h2 className="font-display text-lg font-bold text-foreground mb-3">
                {t('privacy.responsibleTitle', 'Verantwortlich')}
              </h2>
              <p className="text-sm text-muted-foreground">
                Save The Paws — Niklas Schlichting<br />
                E-Mail: {CONTACT.email}<br />
                Web: {CONTACT.website}
              </p>
            </section>

            {/* What we collect */}
            <section className="glass-card rounded-xl p-6">
              <h2 className="font-display text-lg font-bold text-foreground mb-3 flex items-center gap-2">
                <Database className="w-5 h-5 text-primary" />
                {t('privacy.dataCollectedTitle', 'Welche Daten werden verarbeitet?')}
              </h2>
              <div className="space-y-3 text-sm text-muted-foreground">
                <div>
                  <p className="font-medium text-foreground">{t('privacy.reportDataTitle', 'Hunde-Meldungen')}</p>
                  <p>{t('privacy.reportDataDesc', 'Wenn du einen Hund meldest, speichern wir: Standort (GPS-Koordinaten), Foto(s), Name/Beschreibung, Ohrmarke, Geschlecht und zusätzliche Notizen. Bei eingeloggten Nutzern wird die Meldung mit deinem Benutzerkonto verknüpft.')}</p>
                </div>
                <div>
                  <p className="font-medium text-foreground">{t('privacy.accountDataTitle', 'Benutzerkonto')}</p>
                  <p>{t('privacy.accountDataDesc', 'Bei der Registrierung speichern wir deine E-Mail-Adresse und einen selbst gewählten Anzeigenamen. Passwörter werden von Supabase Auth gehasht und sind für uns nicht einsehbar.')}</p>
                </div>
                <div>
                  <p className="font-medium text-foreground">{t('privacy.guestDataTitle', 'Gast-Meldungen')}</p>
                  <p>{t('privacy.guestDataDesc', 'Gäste können ohne Konto melden. Dabei wird keine E-Mail oder persönliche Identifikation erhoben — nur die Meldungsdaten selbst.')}</p>
                </div>
              </div>
            </section>

            {/* Local storage */}
            <section className="glass-card rounded-xl p-6">
              <h2 className="font-display text-lg font-bold text-foreground mb-3 flex items-center gap-2">
                <Lock className="w-5 h-5 text-primary" />
                {t('privacy.localStorageTitle', 'Lokale Speicherung (Cookies & localStorage)')}
              </h2>
              <div className="text-sm text-muted-foreground space-y-2">
                <p>{t('privacy.localStorageDesc', 'Diese App setzt keine Tracking- oder Werbe-Cookies. Wir nutzen ausschließlich technisch notwendige lokale Speicherung:')}</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>{t('privacy.ls1', 'Login-Session (Supabase Auth Token)')}</li>
                  <li>{t('privacy.ls2', 'Offline-Warteschlange für Meldungen bei schlechtem Netz')}</li>
                  <li>{t('privacy.ls3', 'Zwischengespeicherte Kartendaten für Offline-Nutzung')}</li>
                  <li>{t('privacy.ls4', 'PWA-Installationshinweis (ob bereits angezeigt)')}</li>
                  <li>{t('privacy.ls5', 'Datenschutz-Hinweis (ob bereits bestätigt)')}</li>
                </ul>
              </div>
            </section>

            {/* External services */}
            <section className="glass-card rounded-xl p-6">
              <h2 className="font-display text-lg font-bold text-foreground mb-3 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" />
                {t('privacy.externalTitle', 'Externe Dienste')}
              </h2>
              <div className="text-sm text-muted-foreground space-y-2">
                <div>
                  <p className="font-medium text-foreground">Supabase</p>
                  <p>{t('privacy.supabaseDesc', 'Datenbank und Authentifizierung. Server in der EU (Frankfurt). Datenschutzrichtlinie: supabase.com/privacy')}</p>
                </div>
                <div>
                  <p className="font-medium text-foreground">OpenStreetMap</p>
                  <p>{t('privacy.osmDesc', 'Kartenkacheln werden von OpenStreetMap-Servern geladen. Dabei wird deine IP-Adresse an OSM übermittelt. Datenschutzrichtlinie: wiki.osmfoundation.org/wiki/Privacy_Policy')}</p>
                </div>
                <div>
                  <p className="font-medium text-foreground">Vercel</p>
                  <p>{t('privacy.vercelDesc', 'Hosting der App. Datenschutzrichtlinie: vercel.com/legal/privacy-policy')}</p>
                </div>
              </div>
            </section>

            {/* No tracking */}
            <section className="glass-card rounded-xl p-6 border border-green-200 dark:border-green-800 bg-green-50/30 dark:bg-green-950/10">
              <h2 className="font-display text-lg font-bold text-foreground mb-3">
                {t('privacy.noTrackingTitle', 'Kein Tracking')}
              </h2>
              <p className="text-sm text-muted-foreground">
                {t('privacy.noTrackingDesc', 'Save The Paws nutzt keine Analytics-Tools (kein Google Analytics, kein Meta Pixel, kein Tracking). Wir erheben keine Nutzungsstatistiken und geben keine Daten an Werbeanbieter oder Dritte weiter.')}
              </p>
            </section>

            {/* Deletion */}
            <section className="glass-card rounded-xl p-6">
              <h2 className="font-display text-lg font-bold text-foreground mb-3 flex items-center gap-2">
                <Trash2 className="w-5 h-5 text-primary" />
                {t('privacy.deletionTitle', 'Auskunft & Löschung')}
              </h2>
              <p className="text-sm text-muted-foreground">
                {t('privacy.deletionDesc', 'Du hast das Recht auf Auskunft, Berichtigung und Löschung deiner Daten. Kontaktiere uns per E-Mail und wir kümmern uns innerhalb von 30 Tagen darum.')}
              </p>
              <a href={`mailto:${CONTACT.email}?subject=Datenschutzanfrage`}
                className="inline-flex items-center gap-2 mt-3 text-sm text-primary font-medium hover:underline">
                <Mail className="w-4 h-4" />
                {CONTACT.email}
              </a>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PrivacyPage;
