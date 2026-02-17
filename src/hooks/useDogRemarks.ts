import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface DogRemark {
  id: string;
  dogId: string;
  userId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  userName?: string;
}

interface DbDogRemark {
  id: string;
  dog_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export function useDogRemarks(dogId: string) {
  return useQuery({
    queryKey: ['dog-remarks', dogId],
    queryFn: async (): Promise<DogRemark[]> => {
      const { data, error } = await supabase
        .from('dog_remarks')
        .select('*')
        .eq('dog_id', dogId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Fetch user names for remarks
      const userIds = [...new Set((data || []).map(r => r.user_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, display_name')
        .in('user_id', userIds);
      
      const userNameMap = new Map(profiles?.map(p => [p.user_id, p.display_name]) || []);
      
      return (data || []).map((r: DbDogRemark) => ({
        id: r.id,
        dogId: r.dog_id,
        userId: r.user_id,
        content: r.content,
        createdAt: r.created_at,
        updatedAt: r.updated_at,
        userName: userNameMap.get(r.user_id) || 'Unbekannt',
      }));
    },
    enabled: !!dogId,
  });
}

export function useAddDogRemark() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ dogId, userId, content }: { dogId: string; userId: string; content: string }) => {
      const { data, error } = await supabase
        .from('dog_remarks')
        .insert({ dog_id: dogId, user_id: userId, content })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['dog-remarks', variables.dogId] });
    },
  });
}

export function useLatestRemarks() {
  return useQuery({
    queryKey: ['dog-remarks', 'latest'],
    queryFn: async (): Promise<Record<string, DogRemark>> => {
      const { data, error } = await supabase
        .from('dog_remarks')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Group by dog_id and get latest
      const latestByDog: Record<string, DbDogRemark> = {};
      for (const remark of data || []) {
        if (!latestByDog[remark.dog_id]) {
          latestByDog[remark.dog_id] = remark;
        }
      }

      // Fetch user names
      const userIds = [...new Set(Object.values(latestByDog).map(r => r.user_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, display_name')
        .in('user_id', userIds);
      
      const userNameMap = new Map(profiles?.map(p => [p.user_id, p.display_name]) || []);

      const result: Record<string, DogRemark> = {};
      for (const [dogId, r] of Object.entries(latestByDog)) {
        result[dogId] = {
          id: r.id,
          dogId: r.dog_id,
          userId: r.user_id,
          content: r.content,
          createdAt: r.created_at,
          updatedAt: r.updated_at,
          userName: userNameMap.get(r.user_id) || 'Unbekannt',
        };
      }
      
      return result;
    },
  });
}
