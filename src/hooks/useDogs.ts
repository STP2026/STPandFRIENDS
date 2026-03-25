import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Dog, DbDog, mapDbDogToDog } from '@/types/dog';

// Single hook — DB view enforces visibility via RLS + security_invoker.
// isElevated=true:  Helper/Admin — sees all dogs (stray/vac/sos + save + own)
// isElevated=false: Regular logged-in user — sees own dogs + approved save dogs
// isElevated=null:  Guest — no fetch (not logged in)
export function useDogs(isElevated: boolean | null = null) {
  const isLoggedIn = isElevated !== null;
  return useQuery({
    queryKey: isElevated ? ['dogs', 'elevated'] : ['dogs', 'own'],
    queryFn: async (): Promise<Dog[]> => {
      const { data, error } = await supabase
        .from('dogs_public')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data as DbDog[]).map(mapDbDogToDog);
    },
    enabled: isLoggedIn, // Fetch for any logged-in user — view handles what they see
    placeholderData: [],
    staleTime: 1000 * 60 * 2,
  });
}

// useAllDogs merged into useDogs — AdminPage uses this alias
export function useAllDogs() {
  return useDogs(true);
}

export function useApproveDog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (dogId: string) => {
      const { error } = await supabase
        .from('dogs')
        .update({ is_approved: true })
        .eq('id', dogId);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['dogs'] }),
  });
}

export function useUpdateDog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<DbDog> }) => {
      const { error } = await supabase
        .from('dogs')
        .update(updates)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['dogs'] }),
  });
}

export function useDeleteDog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (dogId: string) => {
      const { error } = await supabase
        .from('dogs')
        .delete()
        .eq('id', dogId);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['dogs'] }),
  });
}
