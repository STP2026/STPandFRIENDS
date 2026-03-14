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
  isSyncing: boolean;
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
  } = useOffline();

  const [cachedDogs, setCachedDogs] = useState<Dog[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    setCachedDogs(getCachedDogs());
  }, [getCachedDogs]);

  const fetchAndCacheDogs = useCallback(async () => {
    if (!isOnline) return;
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
  }, [isOnline, cacheDogs]);

  useEffect(() => {
    if (isOnline) fetchAndCacheDogs();
  }, [isOnline, fetchAndCacheDogs]);

  const syncQueue = useCallback(async () => {
    if (!isOnline) return;

    // Include 'syncing' — handles reports stuck from previous failed runs
    const reportsToSync = offlineQueue.filter(
      r => r.status === 'pending' || r.status === 'failed' || r.status === 'syncing'
    );
    if (reportsToSync.length === 0) return;

    setIsSyncing(true);

    for (const report of reportsToSync) {
      if (report.retryCount >= 3) {
        // Max retries — check if already in DB by ear_tag, remove if so
        try {
          const { data } = await supabase
            .from('dogs')
            .select('id')
            .eq('ear_tag', report.data.earTag)
            .maybeSingle();
          if (data) removeFromQueue(report.id);
        } catch { /* ignore */ }
        continue;
      }

      updateQueueStatus(report.id, 'syncing');

      try {
        const formData = report.data;
        const isAutoApproved = formData.reportType !== 'save';

        // Check if ear_tag already exists (duplicate from previous sync attempt)
        const { data: existing } = await supabase
          .from('dogs')
          .select('id')
          .eq('ear_tag', formData.earTag)
          .maybeSingle();

        if (existing) {
          removeFromQueue(report.id);
          continue;
        }

        const { error } = await supabase
          .from('dogs')
          .insert({
            name: formData.name,
            ear_tag: formData.earTag,
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
            urgency_level: formData.urgencyLevel || null,
          });

        if (error) {
          // Unique constraint on ear_tag → already exists → remove
          if (error.code === '23505') {
            removeFromQueue(report.id);
          } else {
            throw error;
          }
        } else {
          removeFromQueue(report.id);
        }
      } catch (e) {
        console.error('[Offline] Failed to sync report:', report.id, e);
        updateQueueStatus(report.id, 'failed');
      }
    }

    setIsSyncing(false);
    await fetchAndCacheDogs();
  }, [isOnline, offlineQueue, updateQueueStatus, removeFromQueue, fetchAndCacheDogs]);

  useEffect(() => {
    if (isOnline && pendingCount > 0) syncQueue();
  }, [isOnline, pendingCount, syncQueue]);

  return (
    <OfflineContext.Provider value={{
      isOnline, offlineQueue, pendingCount, lastSyncTime,
      cachedDogs, addReportToQueue: addToQueue, syncQueue, isSyncing,
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
