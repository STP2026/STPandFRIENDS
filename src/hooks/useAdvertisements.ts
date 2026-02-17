import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Advertisement {
  id: string;
  title: string;
  image_url: string;
  target_url: string;
  is_active: boolean;
  display_delay_seconds: number;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

export const useActiveAdvertisement = () => {
  return useQuery({
    queryKey: ['active-advertisement'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('advertisements')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data as Advertisement | null;
    },
  });
};

export const useAllAdvertisements = () => {
  return useQuery({
    queryKey: ['all-advertisements'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('advertisements')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Advertisement[];
    },
  });
};

export const useCreateAdvertisement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ad: {
      title: string;
      image_url: string;
      target_url: string;
      is_active?: boolean;
      display_delay_seconds?: number;
      created_by?: string;
    }) => {
      const { data, error } = await supabase
        .from('advertisements')
        .insert(ad)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-advertisements'] });
      queryClient.invalidateQueries({ queryKey: ['active-advertisement'] });
    },
  });
};

export const useUpdateAdvertisement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<Omit<Advertisement, 'id' | 'created_at' | 'updated_at'>>;
    }) => {
      const { data, error } = await supabase
        .from('advertisements')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-advertisements'] });
      queryClient.invalidateQueries({ queryKey: ['active-advertisement'] });
    },
  });
};

export const useDeleteAdvertisement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('advertisements')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-advertisements'] });
      queryClient.invalidateQueries({ queryKey: ['active-advertisement'] });
    },
  });
};
