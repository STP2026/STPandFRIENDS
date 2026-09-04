import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Scale } from 'lucide-react';
import { Button } from '@/components/ui/button';

const LAW_NOTICE_KEY = 'stp_law_notice_seen';
const LAW_NOTICE_VERSION = '1'; // Bump to re-show after legal changes

/**
 * One-time modal informing visitors about Moroccan law 19.25 (in force since
 * August 2026): Article 5 prohibits private individuals from feeding,
 * sheltering or treating stray animals without official authorization.
 *
 * Deliberately neutral wording — informs, does not advise. Each visitor
 * decides on their own responsibility. Shown once per device (localStorage),
 * plus a permanent notice card on the report page (AddDogPage).
 */
const LawNoticeModal = () => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem(LAW_NOTICE_KEY) !== LAW_NOTICE_VERSION) {
        // Small delay so the page renders first
        const timer = setTimeout(() => setOpen(true), 800);
        return () => clearTimeout(timer);
      }
    } catch {
      // localStorage unavailable — skip modal, report page card still informs
    }
  }, []);

  const dismiss = () => {
    try { localStorage.setItem(LAW_NOTICE_KEY, LAW_NOTICE_VERSION); } catch {}
    setOpen(false);
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="law-notice-title"
    >
      <div className="bg-background border border-border rounded-2xl max-w-md w-full p-6 shadow-xl animate-fade-in">
        <div className="flex items-center gap-3 mb-3">
          <div className="bg-amber-100 dark:bg-amber-900/40 rounded-xl p-2 shrink-0">
            <Scale className="w-6 h-6 text-amber-600 dark:text-amber-400" />
          </div>
          <h2 id="law-notice-title" className="font-display text-lg font-bold text-foreground">
            {t('lawNotice.title', 'Wichtiger rechtlicher Hinweis')}
          </h2>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed mb-5">
          {t('lawNotice.body', 'Seit August 2026 gilt in Marokko das Gesetz Nr. 19.25 zum Umgang mit streunenden Tieren. Artikel 5 untersagt Privatpersonen das Füttern, Unterbringen und Behandeln von Straßentieren ohne behördliche Genehmigung (Geldbußen 1.500–3.000 MAD). Die Versorgung soll über kommunale Zentren erfolgen. Bitte informiere dich über die aktuelle Rechtslage und entscheide eigenverantwortlich, wie du helfen möchtest.')}
        </p>
        <Button onClick={dismiss} className="w-full">
          {t('lawNotice.accept', 'Verstanden')}
        </Button>
      </div>
    </div>
  );
};

export default LawNoticeModal;
