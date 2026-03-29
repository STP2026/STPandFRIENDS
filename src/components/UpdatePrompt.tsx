import { useRegisterSW } from 'virtual:pwa-register/react';
import { useTranslation } from 'react-i18next';

/**
 * Shows a non-intrusive prompt when a new service worker is available.
 * User can tap to reload and get the latest version.
 */
const UpdatePrompt = () => {
  const { t } = useTranslation();
  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_swUrl, registration) {
      // Check for updates every 30 minutes
      if (registration) {
        setInterval(() => { registration.update(); }, 30 * 60 * 1000);
      }
    },
  });

  if (!needRefresh) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 animate-fade-in sm:left-auto sm:right-4 sm:max-w-sm">
      <div className="bg-foreground text-background rounded-xl shadow-lg p-4 flex items-center gap-3">
        <span className="text-lg shrink-0">🐾</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium">
            {t('pwa.updateAvailable', 'Neue Version verfügbar')}
          </p>
        </div>
        <button
          onClick={() => updateServiceWorker(true)}
          className="shrink-0 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          {t('pwa.updateNow', 'Laden')}
        </button>
      </div>
    </div>
  );
};

export default UpdatePrompt;
