import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Dog, DbDog, DogFormData, mapDbDogToDog, ReportType } from '@/types/dog';

// onlyApproved: true = normal user (no dogs — DB view returns nothing)
//               false = helper/admin (all report types they can see)
export function useDogs(onlyApproved = true) {
  return useQuery({
    queryKey: ['dogs', onlyApproved],
    queryFn: async (): Promise<Dog[]> => {
      // The dogs_public view enforces all visibility via RLS.
      // Normal users get an empty result from the view.
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
      // Use the dogs_public view which masks reported_by UUID and shows reporter_name instead
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
      // Non-tagged reports (stray, sos, vaccination_wish) are auto-approved
      // so helpers/admins see them on the map immediately.
      // Tagged ("save") dogs require admin approval before showing to users.
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