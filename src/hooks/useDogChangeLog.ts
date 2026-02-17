import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';

export interface DogChangeLogEntry {
  id: string;
  dogId: string;
  userId: string;
  action: string;
  changes: Json | null;
  createdAt: string;
  userName?: string;
}

export function useDogChangeLog(dogId: string) {
  return useQuery({
    queryKey: ['dog-change-log', dogId],
    queryFn: async (): Promise<DogChangeLogEntry[]> => {
      const { data, error } = await supabase
        .from('dog_change_log')
        .select('*')
        .eq('dog_id', dogId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Fetch user names
      const userIds = [...new Set((data || []).map(r => r.user_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, display_name')
        .in('user_id', userIds);
      
      const userNameMap = new Map(profiles?.map(p => [p.user_id, p.display_name]) || []);
      
      return (data || []).map((r) => ({
        id: r.id,
        dogId: r.dog_id,
        userId: r.user_id,
        action: r.action,
        changes: r.changes,
        createdAt: r.created_at,
        userName: userNameMap.get(r.user_id) || 'Unbekannt',
      }));
    },
    enabled: !!dogId,
  });
}

export function useAddDogChangeLog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      dogId, 
      userId, 
      action, 
      changes 
    }: { 
      dogId: string; 
      userId: string; 
      action: string; 
      changes?: Json;
    }) => {
      const { data, error } = await supabase
        .from('dog_change_log')
        .insert([{ 
          dog_id: dogId, 
          user_id: userId, 
          action,
          changes: changes || null 
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['dog-change-log', variables.dogId] });
    },
  });
}
