import React, { createContext, useContext, useEffect, useCallback, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useOffline, OfflineReport } from '@/hooks/useOffline';
import { Dog, DbDog, mapDbDogToDog } from '@/types/dog';
import { ensureValidSession } from '@/lib/sessionGuard';
import { uploadBase64ToStorage } from '@/lib/photoStorage';

interface OfflineContextType {
  isOnline: boolean;
  offlineQueue: OfflineReport[];
  pendingCount: number;
  lastSyncTime: number | null;
  cachedDogs: Dog[];
  addReportToQueue: (data: OfflineReport['data']) => OfflineReport;
  syncQueue: () => Promise<number>;
  verifyAndSync: () => Promise<boolean>;
  isSyncing: boolean;
  verifyConnectivity: () => Promise<boolean>;
}

const OfflineContext = createContext<OfflineContextType | null>(null);

export function OfflineProvider({ children }: { children: React.ReactNode }) {
  const {
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
  } = useOffline();

  const [cachedDogs, setCachedDogs] = useState<Dog[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    setCachedDogs(getCachedDogs());
  }, [getCachedDogs]);

  const fetchAndCacheDogs = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('dogs_public')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      const dogs = (data as DbDog[]).map(mapDbDogToDog);
      cacheDogs(dogs);
      setCachedDogs(dogs);
    } catch {
      // Silently fail — cached data is still available
    }
  }, [cacheDogs]);

  /**
   * Upload base64 photos to Storage and return public URLs.
   * Returns [url1, url2, url3] — empty string for slots without base64 data.
   */
  const uploadQueuedPhotos = async (
    base64s: [string, string, string],
    userId: string
  ): Promise<[string, string, string]> => {
    const urls: [string, string, string] = ['', '', ''];
    for (let i = 0; i < 3; i++) {
      if (base64s[i] && base64s[i].startsWith('data:')) {
        const url = await uploadBase64ToStorage(base64s[i], userId, i);
        urls[i] = url || '';
      }
    }
    return urls;
  };

  // Core sync logic — sends all pending reports to Supabase
  const syncQueue = useCallback(async (): Promise<number> => {
    const reportsToSync = offlineQueue.filter(
      r => r.status === 'pending' || r.status === 'failed' || r.status === 'syncing'
    );
    if (reportsToSync.length === 0) return 0;

    setIsSyncing(true);

    for (const report of reportsToSync) {
      if (report.retryCount >= 3) {
        removeFromQueue(report.id);
        continue;
      }

      updateQueueStatus(report.id, 'syncing');

      try {
        const formData = report.data;

        // ── GUEST PATH ──
        if (formData.reportedBy === '__guest__') {
          // Guests: base64 photos go directly into TEXT columns (no Storage)
          const photoUrl = formData.photoBase64?.[0] || formData.photo || null;
          const photoUrl2 = formData.photoBase64?.[1] || formData.photo2 || null;
          const photoUrl3 = formData.photoBase64?.[2] || formData.photo3 || null;

          const { error } = await supabase.from('guest_reports').insert({
            report_type: formData.reportType,
            latitude: formData.latitude,
            longitude: formData.longitude,
            location: formData.location,
            name: formData.name || null,
            ear_tag: formData.earTag || null,
            additional_info: formData.additionalInfo || null,
            photo_url: photoUrl,
            photo_url_2: photoUrl2,
            photo_url_3: photoUrl3,
            gender: formData.gender || null,
          });
          if (error) throw error;
          removeFromQueue(report.id);
          continue;
        }

        // ── LOGGED-IN USER PATH ──
        // Session guard: ensure JWT is valid before writing
        const sessionOk = await ensureValidSession();
        if (!sessionOk) {
          // Session invalid — keep in queue, don't count as retry
          // (will succeed on next sync when user has an active session)
          updateQueueStatus(report.id, 'pending');
          continue;
        }

        // Skip ear_tag duplicate check if null
        if (formData.earTag) {
          const { data: existing } = await supabase
            .from('dogs')
            .select('id')
            .eq('ear_tag', formData.earTag)
            .maybeSingle();
          if (existing) { removeFromQueue(report.id); continue; }
        }

        // Upload base64 photos to Storage if present
        let photoUrl = formData.photo || null;
        let photoUrl2 = formData.photo2 || null;
        let photoUrl3 = formData.photo3 || null;

        if (formData.photoBase64 && formData.photoBase64.some(b => b && b.startsWith('data:'))) {
          const uploadedUrls = await uploadQueuedPhotos(
            formData.photoBase64,
            formData.reportedBy
          );
          // Use uploaded URLs where available, keep existing URLs as fallback
          if (uploadedUrls[0]) photoUrl = uploadedUrls[0];
          if (uploadedUrls[1]) photoUrl2 = uploadedUrls[1];
          if (uploadedUrls[2]) photoUrl3 = uploadedUrls[2];
        }

        // Use pre-computed isAutoApproved from queue data (preserves role context from submit time)
        const isAutoApproved = formData.isAutoApproved ?? (formData.reportType !== 'save');

        const { error } = await supabase.from('dogs').insert({
          name: formData.name,
          ear_tag: formData.earTag || null,
          photo_url: photoUrl,
          photo_url_2: photoUrl2,
          photo_url_3: photoUrl3,
          latitude: formData.latitude,
          longitude: formData.longitude,
          location: formData.location,
          is_vaccinated: formData.isVaccinated,
          vaccination1_date: formData.vaccination1Date || null,
          vaccination2_date: formData.vaccination2Date || null,
          additional_info: formData.additionalInfo || null,
          reported_by: formData.reportedBy,
          is_approved: isAutoApproved,
          report_type: formData.reportType,
          urgency_level: null,
          gender: formData.gender || null,
        });

        if (error) {
          if (error.code === '23505') {
            removeFromQueue(report.id); // duplicate
          } else {
            throw error;
          }
        } else {
          removeFromQueue(report.id);
        }
      } catch (e: any) {
        const errMsg = e?.message || e?.code || String(e);
        // RLS / permission errors → keep in queue but don't retry endlessly
        // (unlike before: we don't drop immediately, because session might fix it)
        if (e?.code === '42501' || errMsg.includes('permission') || errMsg.includes('policy')) {
          updateQueueStatus(report.id, 'failed');
        } else {
          updateQueueStatus(report.id, 'failed');
        }
      }
    }

    setIsSyncing(false);
    fetchAndCacheDogs();

    // Return count of items that could not be synced
    const stored = localStorage.getItem('stp_offline_queue');
    const remaining: OfflineReport[] = stored ? JSON.parse(stored) : [];
    return remaining.filter(r => r.status === 'pending' || r.status === 'failed').length;
  }, [offlineQueue, updateQueueStatus, removeFromQueue, fetchAndCacheDogs]);

  // Manual sync: verify connectivity first, then sync, return success
  const verifyAndSync = useCallback(async (): Promise<boolean> => {
    const online = await verifyConnectivity();
    if (!online) return false;
    const remaining = await syncQueue();
    return remaining === 0;
  }, [verifyConnectivity, syncQueue]);

  // Auto-sync when coming back online
  useEffect(() => {
    if (isOnline && pendingCount > 0 && !isSyncing) syncQueue();
  }, [isOnline, pendingCount]); // eslint-disable-line

  // Auto-sync when app comes back to foreground
  useEffect(() => {
    const handleVisibility = async () => {
      if (document.visibilityState === 'visible' && pendingCount > 0) {
        const online = await verifyConnectivity();
        if (online) syncQueue();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [pendingCount, verifyConnectivity, syncQueue]);

  return (
    <OfflineContext.Provider value={{
      isOnline, offlineQueue, pendingCount, lastSyncTime,
      cachedDogs, addReportToQueue: addToQueue,
      syncQueue, verifyAndSync, isSyncing, verifyConnectivity,
    }}>
      {children}
    </OfflineContext.Provider>
  );
}

export function useOfflineContext() {
  const context = useContext(OfflineContext);
  if (!context) throw new Error('useOfflineContext must be used within OfflineProvider');
  return context;
}
