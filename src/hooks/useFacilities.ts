import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Facility, FacilityType } from '@/types/facility';

interface FacilityInsert {
  name: string;
  type: FacilityType;
  latitude: number;
  longitude: number;
  description?: string | null;
  photo_url?: string | null;
  address?: string | null;
  phone?: string | null;
  website?: string | null;
  created_by?: string;
}

interface FacilityUpdate {
  name?: string;
  type?: FacilityType;
  latitude?: number;
  longitude?: number;
  description?: string | null;
  photo_url?: string | null;
  address?: string | null;
  phone?: string | null;
  website?: string | null;
}

const mapFacility = (row: any): Facility => ({
  id: row.id,
  name: row.name,
  type: row.type,
  latitude: row.latitude,
  longitude: row.longitude,
  description: row.description,
  photoUrl: row.photo_url,
  address: row.address,
  phone: row.phone,
  website: row.website,
  createdBy: row.created_by,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export function useFacilities() {
  return useQuery({
    queryKey: ['facilities'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('facilities')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []).map(mapFacility);
    },
    // Facilities rarely change — cache for 5 minutes
    staleTime: 1000 * 60 * 5,
    placeholderData: [],
  });
}

export function useAddFacility() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (facility: FacilityInsert) => {
      const { data, error } = await supabase
        .from('facilities')
        .insert(facility)
        .select()
        .single();

      if (error) throw error;
      return mapFacility(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['facilities'] });
    },
  });
}

export function useUpdateFacility() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: FacilityUpdate }) => {
      const { data, error } = await supabase
        .from('facilities')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return mapFacility(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['facilities'] });
    },
  });
}

export function useDeleteFacility() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('facilities')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['facilities'] });
    },
  });
}
