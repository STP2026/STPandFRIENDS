import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface PublicStats {
  totalDogs: number;
  vaccinatedDogs: number;
}

/**
 * Fetches public stats (dog count + vaccinated count) without requiring auth.
 * Uses count queries which are lightweight and work with RLS public views.
 * Adds +30 offset as requested.
 */
export function usePublicStats() {
  return useQuery({
    queryKey: ['public-stats'],
    queryFn: async (): Promise<PublicStats> => {
      // Count all approved dogs
      const { count: totalCount, error: totalError } = await supabase
        .from('dogs_public')
        .select('*', { count: 'exact', head: true })
        .eq('is_approved', true);

      if (totalError) throw totalError;

      // Count vaccinated dogs
      const { count: vaccinatedCount, error: vacError } = await supabase
        .from('dogs_public')
        .select('*', { count: 'exact', head: true })
        .eq('is_approved', true)
        .eq('is_vaccinated', true);

      if (vacError) throw vacError;

      // +30 offset: represents dogs tracked before this app was launched
      return {
        totalDogs: (totalCount || 0) + 30,
        vaccinatedDogs: (vaccinatedCount || 0) + 30,
      };
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    placeholderData: { totalDogs: 30, vaccinatedDogs: 30 },
  });
}
