import { useQuery } from '@tanstack/react-query';
import { fetchPlayerStats, FALLBACK_PLAYER_STATS_MATCH2, type PlayerPastStats } from '@/api/client';

export type { PlayerPastStats };

export function usePlayerStats(matchId: number) {
  const query = useQuery({
    queryKey: ['playerStats', matchId],
    queryFn: () => fetchPlayerStats(matchId),
    staleTime: 5 * 60 * 1000,
    retry: 1,
    enabled: matchId === 2,
    placeholderData: matchId === 2 ? FALLBACK_PLAYER_STATS_MATCH2 : undefined,
  });
  const data = query.data ?? (matchId === 2 ? FALLBACK_PLAYER_STATS_MATCH2 : null);
  return {
    data,
    isLoading: query.isLoading,
    isError: query.isError,
  };
}
