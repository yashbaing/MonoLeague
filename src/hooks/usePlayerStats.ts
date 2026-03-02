import { useQuery } from '@tanstack/react-query';
import {
  fetchPlayerStatsRobust,
  FALLBACK_PLAYER_STATS_MATCH2,
  FALLBACK_PLAYER_STATS_INDIA_AUS,
  type PlayerPastStats,
} from '@/api/client';

export type { PlayerPastStats };

function getFallbackForMatch(matchId: number): PlayerPastStats[] | undefined {
  if (matchId === 9) return FALLBACK_PLAYER_STATS_MATCH2;
  if (matchId >= 1 && matchId <= 8) return FALLBACK_PLAYER_STATS_INDIA_AUS;
  return undefined;
}

export function usePlayerStats(matchId: number) {
  const fallback = getFallbackForMatch(matchId);
  const query = useQuery({
    queryKey: ['playerStats', matchId],
    queryFn: () => fetchPlayerStatsRobust(matchId),
    staleTime: 5 * 60 * 1000,
    retry: 1,
    enabled: true,
    placeholderData: fallback,
  });
  const data = query.data ?? fallback ?? null;
  return {
    data,
    isLoading: query.isLoading,
    isError: query.isError,
  };
}
