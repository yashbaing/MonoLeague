import { useContestForMatch } from '@/hooks/useContestForMatch';
import { PrizesClaimSection } from '@/components/PrizesClaimSection';
import { mockMatches } from '@/data/mockMatches';

export function PrizesPage() {
  const match1 = mockMatches[0];
  const match2 = mockMatches[1];
  const { contestAddress: contest1 } = useContestForMatch(match1?.id ?? 1);
  const { contestAddress: contest2 } = useContestForMatch(match2?.id ?? 2);

  const contests = [
    { address: contest1, label: match1 ? `${match1.teamA} vs ${match1.teamB}` : 'Match 1', matchId: match1?.id },
    { address: contest2, label: match2 ? `${match2.teamA} vs ${match2.teamB}` : 'Match 2', matchId: match2?.id },
  ].filter((c) => c.address);

  return (
    <div>
      <h1 className="mb-2 text-3xl font-bold text-white">Prizes & claim</h1>
      <p className="mb-8 text-slate-400">
        View your winnings and claim prizes from contests you joined. Top 3 in each contest win.
      </p>
      {contests.length === 0 ? (
        <div className="rounded-xl border border-slate-700 bg-slate-900/50 p-6">
          <p className="text-slate-400">No contests on testnet yet.</p>
          <p className="mt-2 text-sm text-slate-500">Run deploy:seed to create contests for each match.</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2">
          {contests.map(({ address, label, matchId }) => (
            <PrizesClaimSection
              key={address}
              contestAddress={address}
              matchLabel={label}
              matchId={matchId}
              asCard
            />
          ))}
        </div>
      )}
    </div>
  );
}
