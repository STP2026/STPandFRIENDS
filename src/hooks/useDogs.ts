import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Dog, DbDog, DogFormData, mapDbDogToDog } from '@/types/dog';

// Dogs are only visible to helpers/admins — the DB view enforces this via RLS.
// The parameter is kept for query-key differentiation but has no effect on the query.
export function useDogs(isElevated = false) {
  return useQuery({
    queryKey: ['dogs', isElevated],
    queryFn: async (): Promise<Dog[]> => {
      const { data, error } = await supabase
        .from('dogs_public')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data as DbDog[]).map(mapDbDogToDog);
    },
    placeholderData: [],
    staleTime: 1000 * 60 * 2,
  });
}

export function useAllDogs() {
  return useQuery({
    queryKey: ['dogs', 'all'],
    queryFn: async (): Promise<Dog[]> => {
      const { data, error } = await supabase
        .from('dogs_public')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data as DbDog[]).map(mapDbDogToDog);
    },
  });
}

export function useAddDog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (formData: DogFormData & { reportedBy: string }) => {
      const isAutoApproved = formData.reportType !== 'save';
      const { data, error } = await supabase
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
        })
        .select()
        .single();
      if (error) throw error;
      return mapDbDogToDog(data as DbDog);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dogs'] });
    },
  });
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dogs'] });
    },
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dogs'] });
    },
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dogs'] });
    },
  });
}
