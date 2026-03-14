import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface PublicStats {
  totalDogs: number;
  vaccinatedDogs: number;
  helperCount: number;
}

export function usePublicStats() {
  return useQuery({
    queryKey: ['public-stats'],
    queryFn: async (): Promise<PublicStats> => {
      // Dogs total
      const { count: totalCount } = await supabase
        .from('dogs_public')
        .select('*', { count: 'exact', head: true });

      // Vaccinated dogs
      const { count: vaccinatedCount } = await supabase
        .from('dogs_public')
        .select('*', { count: 'exact', head: true })
        .eq('is_vaccinated', true);

      // Approved helpers
      const { count: helperCount } = await supabase
        .from('helper_applications')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'approved');

      return {
        totalDogs: (totalCount || 0) + 30,
        vaccinatedDogs: (vaccinatedCount || 0) + 30,
        helperCount: (helperCount || 0),
      };
    },
    staleTime: 1000 * 60 * 5,
    placeholderData: { totalDogs: 30, vaccinatedDogs: 30, helperCount: 0 },
  });
}
