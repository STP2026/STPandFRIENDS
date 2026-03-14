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
        taggedDogs: (taggedCount || 0) + 30,
        vaccinatedDogs: (vaccinatedCount || 0) + 30,
        userCount: (userCount || 0) + 20,  // +20 psychologischer Offset
        helperCount: helperCount || 0,
      };
    },
    staleTime: 1000 * 60 * 5,
    placeholderData: { taggedDogs: 30, vaccinatedDogs: 30, userCount: 20, helperCount: 0 },
  });
}
