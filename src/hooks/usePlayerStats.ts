import { useQuery } from '@tanstack/react-query';
import { fetchPlayerStats, type PlayerPastStats } from '@/api/client';

export type { PlayerPastStats };

export function usePlayerStats(matchId: number) {
  const query = useQuery({
    queryKey: ['playerStats', matchId],
    queryFn: () => fetchPlayerStats(matchId),
    staleTime: 5 * 60 * 1000,
    retry: 1,
    enabled: matchId === 2,
  });
  return {
    data: query.data ?? null,
    isLoading: query.isLoading,
  };
}
