import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { HelperApplication, DbHelperApplication, mapDbHelperApplication } from '@/types/dog';

export function useMyHelperApplication(userId: string | undefined) {
  return useQuery({
    queryKey: ['helper-application', userId],
    queryFn: async (): Promise<HelperApplication | null> => {
      if (!userId) return null;
      
      const { data, error } = await supabase
        .from('helper_applications')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();
      
      if (error) throw error;
      return data ? mapDbHelperApplication(data as DbHelperApplication) : null;
    },
    enabled: !!userId,
  });
}

export function useAllHelperApplications() {
  return useQuery({
    queryKey: ['helper-applications', 'all'],
    queryFn: async (): Promise<HelperApplication[]> => {
      const { data, error } = await supabase
        .from('helper_applications')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return (data as DbHelperApplication[]).map(mapDbHelperApplication);
    },
  });
}

export function useApplyAsHelper() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ userId, message }: { userId: string; message: string }) => {
      const { data, error } = await supabase
        .from('helper_applications')
        .insert({
          user_id: userId,
          message,
          status: 'pending',
        })
        .select()
        .single();
      
      if (error) throw error;
      return mapDbHelperApplication(data as DbHelperApplication);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['helper-application'] });
    },
  });
}

export function useUpdateHelperApplication() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      id, 
      status, 
      reviewedBy 
    }: { 
      id: string; 
      status: 'approved' | 'rejected'; 
      reviewedBy: string;
    }) => {
      const { error } = await supabase
        .from('helper_applications')
        .update({
          status,
          reviewed_by: reviewedBy,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['helper-applications'] });
      queryClient.invalidateQueries({ queryKey: ['helper-application'] });
    },
  });
}

export function useIsHelper(userId: string | undefined) {
  return useQuery({
    queryKey: ['is-helper', userId],
    queryFn: async (): Promise<boolean> => {
      if (!userId) return false;
      
      // Check if user has admin/moderator role
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .maybeSingle();
      
      if (roleData?.role === 'admin' || roleData?.role === 'moderator') {
        return true;
      }
      
      // Check if user has approved helper application
      const { data: appData } = await supabase
        .from('helper_applications')
        .select('status')
        .eq('user_id', userId)
        .eq('status', 'approved')
        .maybeSingle();
      
      return !!appData;
    },
    enabled: !!userId,
    // Role rarely changes — cache for 10 min to prevent re-fetching on every Header render
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 15,
  });
}
