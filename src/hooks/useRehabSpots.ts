import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface RehabSpot {
  id: string;
  createdBy: string;
  placesTotal: number;
  availableUntil: string;
  contactInfo: string;
  notes: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface RehabSpotInsert {
  places_total: number;
  available_until: string;
  contact_info: string;
  notes?: string | null;
  created_by: string;
}

interface RehabSpotUpdate {
  places_total?: number;
  available_until?: string;
  contact_info?: string;
  notes?: string | null;
  is_active?: boolean;
}

const mapRehabSpot = (row: any): RehabSpot => ({
  id: row.id,
  createdBy: row.created_by,
  placesTotal: row.places_total,
  availableUntil: row.available_until,
  contactInfo: row.contact_info,
  notes: row.notes,
  isActive: row.is_active,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export function useRehabSpots() {
  return useQuery({
    queryKey: ['rehab-spots'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rehab_spots')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []).map(mapRehabSpot);
    },
  });
}

export function useAllRehabSpots() {
  return useQuery({
    queryKey: ['all-rehab-spots'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rehab_spots')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []).map(mapRehabSpot);
    },
  });
}

export function useAddRehabSpot() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (spot: RehabSpotInsert) => {
      const { data, error } = await supabase
        .from('rehab_spots')
        .insert(spot)
        .select()
        .single();

      if (error) throw error;
      return mapRehabSpot(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rehab-spots'] });
      queryClient.invalidateQueries({ queryKey: ['all-rehab-spots'] });
    },
  });
}

export function useUpdateRehabSpot() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: RehabSpotUpdate }) => {
      const { data, error } = await supabase
        .from('rehab_spots')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return mapRehabSpot(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rehab-spots'] });
      queryClient.invalidateQueries({ queryKey: ['all-rehab-spots'] });
    },
  });
}

export function useDeleteRehabSpot() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('rehab_spots')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rehab-spots'] });
      queryClient.invalidateQueries({ queryKey: ['all-rehab-spots'] });
    },
  });
}
