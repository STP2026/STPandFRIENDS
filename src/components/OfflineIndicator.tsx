import { useOfflineContext } from '@/contexts/OfflineContext';
import { WifiOff, CloudOff, RefreshCw, Check, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';

const OfflineIndicator = () => {
  const { isOnline, pendingCount, isSyncing, syncQueue, lastSyncTime } = useOfflineContext();
  const { t } = useTranslation();

  // Don't show anything if online and no pending items
  if (isOnline && pendingCount === 0 && !isSyncing) return null;

  const formatLastSync = () => {
    if (!lastSyncTime) return '';
    const diff = Date.now() - lastSyncTime;
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return t('offline.justNow', 'Gerade eben');
    if (minutes < 60) return t('offline.minutesAgo', 'vor {{count}} Min.', { count: minutes });
    const hours = Math.floor(minutes / 60);
    return t('offline.hoursAgo', 'vor {{count}} Std.', { count: hours });
  };

  return (
    <div className={`fixed top-16 left-0 right-0 z-40 px-4 py-2 transition-all ${
      isOnline ? 'bg-primary/90' : 'bg-destructive/90'
    }`}>
      <div className="container mx-auto flex items-center justify-between text-sm text-white">
        <div className="flex items-center gap-2">
          {!isOnline ? (
            <>
              <WifiOff className="w-4 h-4" />
              <span>{t('offline.noConnection', 'Offline-Modus')}</span>
              {lastSyncTime && (
                <span className="opacity-75 text-xs">
                  ({t('offline.lastSync', 'Letzte Sync')}: {formatLastSync()})
                </span>
              )}
            </>
          ) : isSyncing ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>{t('offline.syncing', 'Synchronisiere...')}</span>
            </>
          ) : pendingCount > 0 ? (
            <>
              <CloudOff className="w-4 h-4" />
              <span>
                {t('offline.pendingReports', '{{count}} Meldung(en) warten', { count: pendingCount })}
              </span>
            </>
          ) : (
            <>
              <Check className="w-4 h-4" />
              <span>{t('offline.synced', 'Synchronisiert')}</span>
            </>
          )}
        </div>

        {isOnline && pendingCount > 0 && !isSyncing && (
          <Button
            size="sm"
            variant="secondary"
            onClick={() => syncQueue()}
            className="h-7 text-xs"
          >
            <RefreshCw className="w-3 h-3 mr-1" />
            {t('offline.syncNow', 'Jetzt sync')}
          </Button>
        )}
      </div>
    </div>
  );
};

export default OfflineIndicator;
