import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Sponsor {
  id: string;
  name: string;
  createdAt: string;
}

export function useSponsors() {
  return useQuery({
    queryKey: ['sponsors'],
    queryFn: async (): Promise<Sponsor[]> => {
      const { data, error } = await supabase
        .from('sponsors')
        .select('*')
        .order('created_at', { ascending: true });
      // If table doesn't exist yet, return empty gracefully
      if (error) return [];
      return (data || []).map((s: any) => ({
        id: s.id,
        name: s.name,
        createdAt: s.created_at,
      }));
    },
    staleTime: 1000 * 60 * 5,
    placeholderData: [],
  });
}

export function useAddSponsor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (name: string) => {
      const { error } = await supabase
        .from('sponsors')
        .insert({ name: name.trim() });
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['sponsors'] }),
  });
}

export function useDeleteSponsor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('sponsors')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['sponsors'] }),
  });
}
