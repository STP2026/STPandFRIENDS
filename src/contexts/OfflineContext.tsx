import React, { createContext, useContext, useEffect, useCallback, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useOffline, OfflineReport } from '@/hooks/useOffline';
import { Dog, DbDog, mapDbDogToDog } from '@/types/dog';

interface OfflineContextType {
  isOnline: boolean;
  offlineQueue: OfflineReport[];
  pendingCount: number;
  lastSyncTime: number | null;
  cachedDogs: Dog[];
  addReportToQueue: (data: OfflineReport['data']) => OfflineReport;
  syncQueue: () => Promise<void>;
  // verifyAndSync: checks real connectivity then syncs — used by manual sync button
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
    } catch (e) {
      console.error('[Offline] Failed to fetch dogs:', e);
    }
  }, [cacheDogs]);

  // Core sync logic — sends all pending reports to Supabase
  const syncQueue = useCallback(async () => {
    const reportsToSync = offlineQueue.filter(
      r => r.status === 'pending' || r.status === 'failed' || r.status === 'syncing'
    );
    if (reportsToSync.length === 0) return;

    setIsSyncing(true);

    for (const report of reportsToSync) {
      if (report.retryCount >= 3) {
        console.error('[Offline] Max retries reached, dropping report:', report.id);
        removeFromQueue(report.id);
        continue;
      }

      updateQueueStatus(report.id, 'syncing');

      try {
        const formData = report.data;

        // Skip ear_tag duplicate check if null
        if (formData.earTag) {
          const { data: existing } = await supabase
            .from('dogs')
            .select('id')
            .eq('ear_tag', formData.earTag)
            .maybeSingle();
          if (existing) { removeFromQueue(report.id); continue; }
        }

        // Guest entries (reportedBy='__guest__') → guest_reports table
        if (formData.reportedBy === '__guest__') {
          const { error } = await supabase.from('guest_reports').insert({
            report_type: formData.reportType,
            latitude: formData.latitude,
            longitude: formData.longitude,
            location: formData.location,
            name: formData.name || null,
            additional_info: formData.additionalInfo || null,
            photo_url: formData.photo || null,
            photo_url_2: formData.photo2 || null,
            photo_url_3: formData.photo3 || null,
          });
          if (error) throw error;
          removeFromQueue(report.id);
          continue;
        }

        const isAutoApproved = formData.reportType !== 'save';
        const { error } = await supabase.from('dogs').insert({
          name: formData.name,
          ear_tag: formData.earTag || null,
          photo_url: formData.photo || null,
          photo_url_2: formData.photo2 || null,
          photo_url_3: formData.photo3 || null,
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
        console.error('[Offline] Sync failed:', report.id, errMsg);
        // RLS / permission errors → drop immediately (won't fix by retrying)
        if (e?.code === '42501' || errMsg.includes('permission') || errMsg.includes('policy')) {
          console.error('[Offline] RLS/permission error — dropping report');
          removeFromQueue(report.id);
        } else {
          updateQueueStatus(report.id, 'failed');
        }
      }
    }

    setIsSyncing(false);
    fetchAndCacheDogs();
  }, [offlineQueue, updateQueueStatus, removeFromQueue, fetchAndCacheDogs]);

  // Manual sync: verify connectivity first, then sync, return success
  const verifyAndSync = useCallback(async (): Promise<boolean> => {
    const online = await verifyConnectivity();
    if (!online) return false;
    await syncQueue();
    // Wait briefly for React state to update after async queue operations
    await new Promise(r => setTimeout(r, 300));
    // Success = no reports remain in failed/pending state
    const remaining = offlineQueue.filter(
      r => r.status === 'pending' || r.status === 'failed' || r.status === 'syncing'
    ).length;
    return remaining === 0;
  }, [verifyConnectivity, syncQueue, offlineQueue]);

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
