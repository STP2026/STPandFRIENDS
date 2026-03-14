import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface PublicStats {
  totalDogs: number;
  vaccinatedDogs: number;
}

/**
 * Fetches stats visible to helpers/admins via dogs_public view.
 * Normal users get 0 from the view (RLS) — placeholderData shows fixed values.
 * +30 offset represents dogs tracked before this app launched.
 */
export function usePublicStats() {
  return useQuery({
    queryKey: ['public-stats'],
    queryFn: async (): Promise<PublicStats> => {
      const { count: totalCount, error: totalError } = await supabase
        .from('dogs_public')
        .select('*', { count: 'exact', head: true });

      if (totalError) throw totalError;

      const { count: vaccinatedCount, error: vacError } = await supabase
        .from('dogs_public')
        .select('*', { count: 'exact', head: true })
        .eq('is_vaccinated', true);

      if (vacError) throw vacError;

      return {
        totalDogs: (totalCount || 0) + 30,
        vaccinatedDogs: (vaccinatedCount || 0) + 30,
      };
    },
    staleTime: 1000 * 60 * 5,
    placeholderData: { totalDogs: 30, vaccinatedDogs: 30 },
  });
}
