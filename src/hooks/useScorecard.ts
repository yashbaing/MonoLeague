import { useQuery } from '@tanstack/react-query';
import { fetchScorecard, type ScorecardEntry } from '@/api/client';

export type { ScorecardEntry };

export function useScorecard(matchId: number) {
  const query = useQuery({
    queryKey: ['scorecard', matchId],
    queryFn: () => fetchScorecard(matchId),
    staleTime: 5 * 60 * 1000,
    retry: 1,
    enabled: matchId > 0,
  });
  return {
    data: query.data ?? null,
    isLoading: query.isLoading,
    error: query.error,
  };
}
