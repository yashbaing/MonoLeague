import { Leaderboard } from '@/components/Leaderboard';
import { useContestForMatch } from '@/hooks/useContestForMatch';
import { mockMatches } from '@/data/mockMatches';

export function LeaderboardPage() {
  const firstMatchId = mockMatches[0]?.id ?? 1;
  const { contestAddress } = useContestForMatch(firstMatchId);

  return (
    <div>
      <h1 className="mb-8 text-3xl font-bold text-white">Leaderboard</h1>
      <Leaderboard matchId={firstMatchId} contestAddress={contestAddress} />
    </div>
  );
}
