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
    // Live ICC matches (id > 1,000,000) don't have seeded squads in our app.
    initialData: (matchId > 1_000_000 ? [] : (mockPlayers[matchId] ?? mockPlayers[1])) as Player[],
  });
}
