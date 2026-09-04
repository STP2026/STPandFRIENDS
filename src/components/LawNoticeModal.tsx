import { useState, useEffect } from 'react';
import { Scale } from 'lucide-react';
import { Button } from '@/components/ui/button';

const LAW_NOTICE_KEY = 'stp_law_notice_seen';
const LAW_NOTICE_VERSION = '1'; // Bump to re-show after legal changes

/** Event fired when the law notice is dismissed — CookieConsent waits for this. */
export const LAW_DISMISSED_EVENT = 'stp:law-dismissed';

/** True when the current law notice version has already been acknowledged. */
export const isLawNoticeSeen = (): boolean => {
  try { return localStorage.getItem(LAW_NOTICE_KEY) === LAW_NOTICE_VERSION; } catch { return true; }
};

/**
 * One-time modal informing visitors about Moroccan law 19.25 (in force since
 * August 2026): Article 5 prohibits private individuals from feeding,
 * sheltering or treating stray animals without official authorization.
 *
 * v104: intentionally ALWAYS English (not localized) per project decision;
 * the report-page notice card (AddDogPage) stays localized.
 * Deliberately neutral wording — informs, does not advise. Each visitor
 * decides on their own responsibility. Shown once per device (localStorage),
 * plus a permanent notice card on the report page (AddDogPage).
 *
 * Prompt sequencing (v102): this modal is first; CookieConsent waits for
 * LAW_DISMISSED_EVENT; InstallPWA waits for cookie consent.
 */
const LawNoticeModal = () => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!isLawNoticeSeen()) {
      // Small delay so the page renders first
      const timer = setTimeout(() => setOpen(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  const dismiss = () => {
    try { localStorage.setItem(LAW_NOTICE_KEY, LAW_NOTICE_VERSION); } catch {}
    setOpen(false);
    window.dispatchEvent(new Event(LAW_DISMISSED_EVENT));
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="law-notice-title"
    >
      {/* Opaque panel (bg-card is solid) — v102 contrast fix: no blur, no translucency */}
      <div dir="ltr" className="bg-card text-card-foreground border border-border rounded-2xl max-w-md w-full max-h-[85vh] overflow-y-auto p-6 shadow-2xl animate-fade-in">
        <div className="flex items-center gap-3 mb-3">
          <div className="bg-amber-100 dark:bg-amber-900/60 rounded-xl p-2 shrink-0">
            <Scale className="w-6 h-6 text-amber-600 dark:text-amber-300" />
          </div>
          <h2 id="law-notice-title" className="font-display text-lg font-bold text-card-foreground">
            Important legal notice
          </h2>
        </div>
        <p className="text-sm text-card-foreground/85 leading-relaxed mb-5">
          Since August 2026, Law No. 19.25 on the handling of stray animals has been in force in Morocco. Article 5 prohibits private individuals from feeding, sheltering or treating street animals without official authorisation (fines of 1,500–3,000 MAD). Care is intended to be provided through municipal centres. Please inform yourself about the current legal situation and decide on your own responsibility how you wish to help.
        </p>
        <Button onClick={dismiss} className="w-full">
          Understood
        </Button>
      </div>
    </div>
  );
};

export default LawNoticeModal;
