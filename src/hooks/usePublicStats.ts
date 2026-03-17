import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface PublicStats {
  taggedDogs: number;
  vaccinatedDogs: number;
  userCount: number;
  helperCount: number;
}

export function usePublicStats() {
  return useQuery({
    queryKey: ['public-stats'],
    queryFn: async (): Promise<PublicStats> => {
      // Tagged dogs (save type, vaccinated)
      const { count: taggedCount } = await supabase
        .from('dogs_public')
        .select('*', { count: 'exact', head: true })
        .eq('report_type', 'save');

      // Vaccinated dogs
      const { count: vaccinatedCount } = await supabase
        .from('dogs_public')
        .select('*', { count: 'exact', head: true })
        .eq('is_vaccinated', true);

      // Registered users (profiles table = one per user)
      const { count: userCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Approved helpers
      const { count: helperCount } = await supabase
        .from('helper_applications')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'approved');

      return {
        taggedDogs: Math.max(taggedCount || 0, 20),
        vaccinatedDogs: (vaccinatedCount || 0) + 30,
        userCount: Math.max(userCount || 0, 15),
        helperCount: helperCount || 0,
      };
    },
    staleTime: 1000 * 60 * 5,
    placeholderData: { taggedDogs: 20, vaccinatedDogs: 20, userCount: 15, helperCount: 0 },
  });
}
