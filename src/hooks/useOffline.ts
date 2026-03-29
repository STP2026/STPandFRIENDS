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

// Real connectivity check against Supabase
// navigator.onLine is unreliable on mobile data
export async function checkRealConnectivity(): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
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
  const [isOnline, setIsOnline] = useState(true); // optimistic default
  const [offlineQueue, setOfflineQueue] = useState<OfflineReport[]>([]);
  const [lastSyncTime, setLastSyncTime] = useState<number | null>(null);
  const checkingRef = useRef(false);

  // Load from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(OFFLINE_QUEUE_KEY);
    if (stored) {
      try { setOfflineQueue(JSON.parse(stored)); } catch { /* ignore */ }
    }
    const lastSync = localStorage.getItem(LAST_SYNC_KEY);
    if (lastSync) setLastSyncTime(parseInt(lastSync));
  }, []);

  // Persist queue — wrapped in try/catch because base64 photos can
  // exceed the ~5MB localStorage limit on some browsers
  useEffect(() => {
    try {
      localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(offlineQueue));
    } catch {
      // Storage full — queue is still in memory and will sync when online,
      // but won't survive a page reload. This is acceptable: the user
      // will get a success screen and the sync attempt happens immediately.
    }
  }, [offlineQueue]);

  const verifyConnectivity = useCallback(async (): Promise<boolean> => {
    if (checkingRef.current) return isOnline;
    checkingRef.current = true;
    const real = await checkRealConnectivity();
    setIsOnline(real);
    checkingRef.current = false;
    return real;
  }, [isOnline]);

  // Browser online/offline events + initial check
  useEffect(() => {
    const handleOnline = () => verifyConnectivity();
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    verifyConnectivity();
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [verifyConnectivity]);

  const cacheDogs = useCallback((dogs: Dog[]) => {
    try {
      localStorage.setItem(DOGS_CACHE_KEY, JSON.stringify(dogs));
      const now = Date.now();
      localStorage.setItem(LAST_SYNC_KEY, now.toString());
      setLastSyncTime(now);
    } catch { /* ignore */ }
  }, []);

  const getCachedDogs = useCallback((): Dog[] => {
    try {
      const stored = localStorage.getItem(DOGS_CACHE_KEY);
      if (stored) return JSON.parse(stored);
    } catch { /* ignore */ }
    return [];
  }, []);

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
