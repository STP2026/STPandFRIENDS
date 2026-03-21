import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Dog, DogFormData } from '@/types/dog';

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

// Real connectivity check — pings Supabase health endpoint
// navigator.onLine is unreliable on mobile data (returns true even when request fails)
async function checkRealConnectivity(): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const { error } = await supabase
      .from('sponsors')
      .select('id', { head: true, count: 'exact' })
      .abortSignal(controller.signal)
      .limit(1);
    clearTimeout(timeout);
    return !error;
  } catch {
    return false;
  }
}

export function useOffline() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [offlineQueue, setOfflineQueue] = useState<OfflineReport[]>([]);
  const [lastSyncTime, setLastSyncTime] = useState<number | null>(null);
  const checkingRef = useRef(false);

  // Load offline queue from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(OFFLINE_QUEUE_KEY);
    if (stored) {
      try { setOfflineQueue(JSON.parse(stored)); } catch { /* ignore */ }
    }
    const lastSync = localStorage.getItem(LAST_SYNC_KEY);
    if (lastSync) setLastSyncTime(parseInt(lastSync));
  }, []);

  // Save offline queue to localStorage
  useEffect(() => {
    localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(offlineQueue));
  }, [offlineQueue]);

  // Real connectivity check — runs on browser online event + every 30s when queue pending
  const verifyConnectivity = useCallback(async () => {
    if (checkingRef.current) return;
    checkingRef.current = true;
    const real = await checkRealConnectivity();
    setIsOnline(real);
    checkingRef.current = false;
    return real;
  }, []);

  // Listen for online/offline events
  useEffect(() => {
    const handleOnline = () => verifyConnectivity();
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial real check
    verifyConnectivity();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [verifyConnectivity]);

  // Cache dogs data
  const cacheDogs = useCallback((dogs: Dog[]) => {
    try {
      localStorage.setItem(DOGS_CACHE_KEY, JSON.stringify(dogs));
      const now = Date.now();
      localStorage.setItem(LAST_SYNC_KEY, now.toString());
      setLastSyncTime(now);
    } catch { /* ignore */ }
  }, []);

  // Get cached dogs
  const getCachedDogs = useCallback((): Dog[] => {
    try {
      const stored = localStorage.getItem(DOGS_CACHE_KEY);
      if (stored) return JSON.parse(stored);
    } catch { /* ignore */ }
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
    return report;
  }, []);

  const removeFromQueue = useCallback((id: string) => {
    setOfflineQueue(prev => prev.filter(r => r.id !== id));
  }, []);

  const updateQueueStatus = useCallback((id: string, status: OfflineReport['status']) => {
    setOfflineQueue(prev =>
      prev.map(r => r.id === id
        ? { ...r, status, retryCount: status === 'failed' ? r.retryCount + 1 : r.retryCount }
        : r
      )
    );
  }, []);

  const pendingCount = offlineQueue.filter(
    r => r.status === 'pending' || r.status === 'failed' || r.status === 'syncing'
  ).length;

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
    verifyConnectivity,
  };
}

export function useMapTileCache() {
  const [isCached, setIsCached] = useState(false);
  useEffect(() => {
    if ('caches' in window) {
      caches.has('map-tiles-cache').then(setIsCached);
    }
  }, []);
  return { isCached };
}
