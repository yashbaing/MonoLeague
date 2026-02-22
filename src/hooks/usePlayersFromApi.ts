import { useQuery } from '@tanstack/react-query';
import { fetchPlayers } from '@/api/client';
import { mockPlayers } from '@/data/mockPlayers';
import type { Player } from '@/data/mockPlayers';

export function usePlayersFromApi(matchId: number) {
  return useQuery({
    queryKey: ['players', matchId],
    queryFn: () => fetchPlayers(matchId),
    staleTime: 60_000,
    retry: 1,
    initialData: (mockPlayers[matchId] ?? mockPlayers[1]) as Player[],
  });
}
