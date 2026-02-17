import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';

export interface TeamMessage {
  id: string;
  userId: string;
  content: string;
  parentId: string | null;
  createdAt: string;
  updatedAt: string;
  userName?: string;
  replies?: TeamMessage[];
}

interface DbTeamMessage {
  id: string;
  user_id: string;
  content: string;
  parent_id: string | null;
  created_at: string;
  updated_at: string;
}

export function useTeamMessages() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['team-messages'],
    queryFn: async (): Promise<TeamMessage[]> => {
      const { data, error } = await supabase
        .from('team_messages')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Fetch user names
      const userIds = [...new Set((data || []).map(r => r.user_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, display_name')
        .in('user_id', userIds);
      
      const userNameMap = new Map(profiles?.map(p => [p.user_id, p.display_name]) || []);
      
      const messages = (data || []).map((r: DbTeamMessage) => ({
        id: r.id,
        userId: r.user_id,
        content: r.content,
        parentId: r.parent_id,
        createdAt: r.created_at,
        updatedAt: r.updated_at,
        userName: userNameMap.get(r.user_id) || 'Unbekannt',
      }));

      // Build thread structure: parent messages with replies
      const parentMessages = messages.filter(m => !m.parentId);
      const replies = messages.filter(m => m.parentId);

      return parentMessages.map(parent => ({
        ...parent,
        replies: replies
          .filter(r => r.parentId === parent.id)
          .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()),
      }));
    },
  });

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel('team-messages-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'team_messages',
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['team-messages'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return query;
}

export function useAddTeamMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      userId, 
      content, 
      parentId 
    }: { 
      userId: string; 
      content: string; 
      parentId?: string | null;
    }) => {
      const { data, error } = await supabase
        .from('team_messages')
        .insert({ 
          user_id: userId, 
          content,
          parent_id: parentId || null,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-messages'] });
    },
  });
}

export function useDeleteTeamMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (messageId: string) => {
      const { error } = await supabase
        .from('team_messages')
        .delete()
        .eq('id', messageId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-messages'] });
    },
  });
}
