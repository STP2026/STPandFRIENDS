import { useState, useEffect, useCallback } from 'react';
import { Dog, DogFormData, ReportType } from '@/types/dog';

const DOGS_CACHE_KEY = 'stp_cached_dogs';
const OFFLINE_QUEUE_KEY = 'stp_offline_queue';
const LAST_SYNC_KEY = 'stp_last_sync';

export interface OfflineReport {
  id: string;
  data: DogFormData & { reportedBy: string };
  timestamp: number;
  status: 'pending' | 'syncing' | 'failed';
  retryCount: number;
}

export function useOffline() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [offlineQueue, setOfflineQueue] = useState<OfflineReport[]>([]);
  const [lastSyncTime, setLastSyncTime] = useState<number | null>(null);

  // Load offline queue from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(OFFLINE_QUEUE_KEY);
    if (stored) {
      try {
        setOfflineQueue(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse offline queue:', e);
      }
    }

    const lastSync = localStorage.getItem(LAST_SYNC_KEY);
    if (lastSync) {
      setLastSyncTime(parseInt(lastSync));
    }
  }, []);

  // Save offline queue to localStorage
  useEffect(() => {
    localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(offlineQueue));
  }, [offlineQueue]);

  // Listen for online/offline events
  useEffect(() => {
    const handleOnline = () => {
      console.log('[Offline] Back online');
      setIsOnline(true);
    };

    const handleOffline = () => {
      console.log('[Offline] Gone offline');
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Cache dogs data
  const cacheDogs = useCallback((dogs: Dog[]) => {
    try {
      localStorage.setItem(DOGS_CACHE_KEY, JSON.stringify(dogs));
      const now = Date.now();
      localStorage.setItem(LAST_SYNC_KEY, now.toString());
      setLastSyncTime(now);
      console.log('[Offline] Cached', dogs.length, 'dogs');
    } catch (e) {
      console.error('Failed to cache dogs:', e);
    }
  }, []);

  // Get cached dogs
  const getCachedDogs = useCallback((): Dog[] => {
    try {
      const stored = localStorage.getItem(DOGS_CACHE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed to get cached dogs:', e);
    }
    return [];
  }, []);

  // Add report to offline queue
  const addToQueue = useCallback((data: DogFormData & { reportedBy: string }): OfflineReport => {
    const report: OfflineReport = {
      id: `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      data,
      timestamp: Date.now(),
      status: 'pending',
      retryCount: 0,
    };

    setOfflineQueue(prev => [...prev, report]);
    console.log('[Offline] Added report to queue:', report.id);
    return report;
  }, []);

  // Remove report from queue (after successful sync)
  const removeFromQueue = useCallback((id: string) => {
    setOfflineQueue(prev => prev.filter(r => r.id !== id));
    console.log('[Offline] Removed report from queue:', id);
  }, []);

  // Update report status in queue
  const updateQueueStatus = useCallback((id: string, status: OfflineReport['status']) => {
    setOfflineQueue(prev => 
      prev.map(r => r.id === id ? { ...r, status, retryCount: status === 'failed' ? r.retryCount + 1 : r.retryCount } : r)
    );
  }, []);

  // Get pending count
  const pendingCount = offlineQueue.filter(r => r.status === 'pending' || r.status === 'failed').length;

  return {
    isOnline,
    offlineQueue,
    pendingCount,
    lastSyncTime,
    cacheDogs,
    getCachedDogs,
    addToQueue,
    removeFromQueue,
    updateQueueStatus,
  };
}

// Separate hook for map tile caching status
export function useMapTileCache() {
  const [isCached, setIsCached] = useState(false);

  useEffect(() => {
    // Check if map tiles are cached via service worker
    if ('caches' in window) {
      caches.has('map-tiles-cache').then(setIsCached);
    }
  }, []);

  return { isCached };
}
