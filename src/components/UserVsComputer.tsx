import type { ScorecardEntry } from '@/hooks/useScorecard';

function totalFromScorecard(
  scorecard: ScorecardEntry[],
  playerIds: number[],
  captainId: number,
  viceCaptainId: number
): number {
  const byId = new Map(scorecard.map((p) => [p.id, p]));
  let total = 0;
  for (const id of playerIds) {
    const p = byId.get(id);
    if (!p) continue;
    const mult = id === captainId ? 2 : id === viceCaptainId ? 1.5 : 1;
    total += Math.round(p.fantasyPoints * mult);
  }
  return total;
}

interface UserVsComputerProps {
  scorecard: ScorecardEntry[];
  userTeam: {
    playerIds: number[];
    captainId: number;
    viceCaptainId: number;
  };
  computerTeam: {
    playerIds: number[];
    captainId: number;
    viceCaptainId: number;
  };
}

export function UserVsComputer({
  scorecard,
  userTeam,
  computerTeam,
}: UserVsComputerProps) {
  const userTotal = totalFromScorecard(
    scorecard,
    userTeam.playerIds,
    userTeam.captainId,
    userTeam.viceCaptainId
  );
  const computerTotal = totalFromScorecard(
    scorecard,
    computerTeam.playerIds,
    computerTeam.captainId,
    computerTeam.viceCaptainId
  );

  const userWins = userTotal > computerTotal;
  const draw = userTotal === computerTotal;

  return (
    <div className="rounded-xl border border-slate-700 bg-slate-900/50 overflow-hidden">
      <div className="border-b border-slate-700 bg-slate-800/50 px-6 py-4">
        <h3 className="text-lg font-semibold text-white">You vs Computer</h3>
        <p className="text-sm text-slate-400">Based on match scorecard (Captain 2×, Vice-captain 1.5×)</p>
      </div>
      <div className="grid grid-cols-2 gap-0">
        <div className="border-r border-slate-700 p-6">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Your team</p>
          <p className="mt-2 text-3xl font-bold text-white">{userTotal}</p>
          <p className="mt-1 text-sm text-slate-400">points</p>
        </div>
        <div className="p-6">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Computer team</p>
          <p className="mt-2 text-3xl font-bold text-slate-300">{computerTotal}</p>
          <p className="mt-1 text-sm text-slate-400">points</p>
        </div>
      </div>
      <div className={`border-t border-slate-700 px-6 py-4 text-center ${
        userWins ? 'bg-emerald-500/20' : draw ? 'bg-slate-800/50' : 'bg-amber-500/10'
      }`}>
        {userWins && (
          <p className="text-lg font-bold text-emerald-400">You win!</p>
        )}
        {draw && (
          <p className="text-lg font-bold text-slate-300">It's a draw!</p>
        )}
        {!userWins && !draw && (
          <p className="text-lg font-bold text-amber-400">Computer wins!</p>
        )}
      </div>
    </div>
  );
}
