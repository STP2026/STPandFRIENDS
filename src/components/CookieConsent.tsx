import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { isLawNoticeSeen, LAW_DISMISSED_EVENT } from '@/components/LawNoticeModal';

const CONSENT_KEY = 'stp_privacy_consent';
const CONSENT_VERSION = '2'; // v2: report sender data (name, email, timestamp) — bump when privacy policy changes

/** Event fired when consent is accepted — InstallPWA waits for this. */
export const CONSENT_ACCEPTED_EVENT = 'stp:consent-accepted';

/** True when the current consent version has been accepted. */
export const isConsentCurrent = (): boolean => {
  try { return localStorage.getItem(CONSENT_KEY) === CONSENT_VERSION; } catch { return true; }
};

/**
 * DSGVO-compliant privacy consent banner.
 * 
 * Save The Paws uses:
 * - localStorage for session, offline queue, and PWA state (essential, no consent needed)
 * - Supabase Auth (essential for login functionality)
 * - OpenStreetMap tiles (external, loads map tiles from OSM servers)
 * - Google Maps links (only on user click, no tracking)
 * - Report sender data: name, email and report timestamp, stored with each
 *   report for follow-up questions (v100). Explicit consent is additionally
 *   collected via checkbox on the report form itself.
 * 
 * No analytics, no tracking cookies, no third-party advertising.
 * The banner informs about essential data processing and links to the privacy page.
 */
const CookieConsent = () => {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const consent = localStorage.getItem(CONSENT_KEY);
      if (consent === CONSENT_VERSION) return;

      // v102 sequencing: wait until the law notice modal was dismissed,
      // so only one prompt is on screen at a time.
      let timer: ReturnType<typeof setTimeout> | undefined;
      const show = () => { timer = setTimeout(() => setVisible(true), 1200); };

      if (isLawNoticeSeen()) {
        show();
      } else {
        window.addEventListener(LAW_DISMISSED_EVENT, show, { once: true });
      }
      return () => {
        if (timer) clearTimeout(timer);
        window.removeEventListener(LAW_DISMISSED_EVENT, show);
      };
    } catch {
      // localStorage not available — banner won't show, but app still works
    }
  }, []);

  const handleAccept = () => {
    try { localStorage.setItem(CONSENT_KEY, CONSENT_VERSION); } catch {}
    setVisible(false);
    window.dispatchEvent(new Event(CONSENT_ACCEPTED_EVENT));
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 animate-fade-in">
      <div className="bg-background/95 backdrop-blur-md border-t border-border shadow-lg">
        <div className="container mx-auto px-4 py-4 max-w-3xl">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-foreground font-medium mb-1">
                {t('privacy.bannerTitle', 'Datenschutz & Cookies')}
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {t('privacy.bannerText', 'Diese App nutzt ausschließlich technisch notwendige Daten (Login-Session, Offline-Warteschlange) und lädt Kartendaten von OpenStreetMap. Bei Hunde-Meldungen speichern wir Name, E-Mail-Adresse und Meldezeitpunkt für Rückfragen. Es werden keine Tracking-Cookies gesetzt und keine Daten an Werbeanbieter weitergegeben.')}
                {' '}
                <Link to="/privacy" className="underline text-primary hover:text-primary/80">
                  {t('privacy.learnMore', 'Mehr erfahren')}
                </Link>
              </p>
            </div>
            <Button
              size="sm"
              onClick={handleAccept}
              className="shrink-0"
            >
              {t('privacy.accept', 'Verstanden')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;
