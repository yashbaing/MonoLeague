import { useQuery } from '@tanstack/react-query';
import { fetchMatches } from '@/api/client';
import { mockMatches } from '@/data/mockMatches';

export function useMatches() {
  return useQuery({
    queryKey: ['matches'],
    queryFn: fetchMatches,
    staleTime: 60_000,
    retry: 1,
    initialData: mockMatches,
  });
}
