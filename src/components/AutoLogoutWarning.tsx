import { useAutoLogout } from '@/hooks/useAutoLogout';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Clock } from 'lucide-react';

/**
 * Renders a sticky banner at the bottom of the screen when the
 * inactivity timer is about to expire. The user can dismiss it to
 * reset the timer and stay logged in.
 */
const AutoLogoutWarning = () => {
  const { t } = useTranslation();
  const { showWarning, secondsLeft, dismissWarning } = useAutoLogout();

  if (!showWarning) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-fade-in">
      <div className="max-w-md mx-auto bg-amber-500 text-white rounded-xl shadow-lg p-4 flex items-center gap-3">
        <Clock className="w-5 h-5 shrink-0" />
        <p className="text-sm flex-1">
          {t('autoLogout.warning', 'Du wirst in {{seconds}} Sekunden automatisch abgemeldet.', { seconds: secondsLeft })}
        </p>
        <Button
          size="sm"
          variant="secondary"
          className="shrink-0 bg-white text-amber-600 hover:bg-amber-50"
          onClick={dismissWarning}
        >
          {t('autoLogout.stayLoggedIn', 'Eingeloggt bleiben')}
        </Button>
      </div>
    </div>
  );
};

export default AutoLogoutWarning;
