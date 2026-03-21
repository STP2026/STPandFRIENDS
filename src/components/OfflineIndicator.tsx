import { useState, useEffect } from 'react';
import { useOfflineContext } from '@/contexts/OfflineContext';
import { WifiOff, RefreshCw, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';

const OfflineIndicator = () => {
  const { pendingCount, isSyncing, syncQueue, verifyAndSync } = useOfflineContext();
  const { t } = useTranslation();
  const [syncSuccess, setSyncSuccess] = useState(false);
  const [visible, setVisible] = useState(false);

  // Show when there are pending reports
  useEffect(() => {
    if (pendingCount > 0 || isSyncing) {
      setVisible(true);
      setSyncSuccess(false);
    }
  }, [pendingCount, isSyncing]);

  // Hide success message after 4s
  useEffect(() => {
    if (syncSuccess) {
      const t = setTimeout(() => {
        setSyncSuccess(false);
        setVisible(false);
      }, 4000);
      return () => clearTimeout(t);
    }
  }, [syncSuccess]);

  if (!visible) return null;

  const handleSync = async () => {
    const ok = await verifyAndSync();
    if (ok) setSyncSuccess(true);
  };

  if (syncSuccess) {
    return (
      <div className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-sm">
        <div className="flex items-center gap-3 bg-green-600 text-white px-4 py-3 rounded-xl shadow-lg">
          <CheckCircle className="w-5 h-5 shrink-0" />
          <span className="text-sm font-medium">
            {t('offline.syncSuccess', 'Meldungen erfolgreich übertragen!')}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-sm">
      <div className="flex items-center gap-3 bg-amber-600 text-white px-4 py-3 rounded-xl shadow-lg">
        <WifiOff className="w-5 h-5 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium leading-tight">
            {isSyncing
              ? t('offline.syncing', 'Synchronisiere...')
              : t('offline.pendingBanner', 'Schlechte Verbindung — {{count}} Meldung(en) ausstehend', { count: pendingCount })
            }
          </p>
        </div>
        {!isSyncing && (
          <Button
            size="sm"
            onClick={handleSync}
            className="shrink-0 h-8 bg-white text-amber-700 hover:bg-amber-50 text-xs font-medium"
          >
            <RefreshCw className="w-3 h-3 mr-1" />
            {t('offline.syncNow', 'Synchronisieren')}
          </Button>
        )}
        {isSyncing && (
          <RefreshCw className="w-4 h-4 animate-spin shrink-0 opacity-75" />
        )}
      </div>
    </div>
  );
};

export default OfflineIndicator;
