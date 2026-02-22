import type { ScorecardEntry } from '@/hooks/useScorecard';

interface MatchScorecardProps {
  scorecard: ScorecardEntry[];
  matchTitle?: string;
}

export function MatchScorecard({ scorecard, matchTitle }: MatchScorecardProps) {
  if (!scorecard?.length) return null;

  return (
    <div className="rounded-xl border border-slate-700 bg-slate-900/50 overflow-hidden">
      <div className="border-b border-slate-700 px-6 py-4">
        <h3 className="text-lg font-semibold text-white">
          {matchTitle ?? 'Match scorecard'}
        </h3>
        <p className="text-sm text-slate-400">
          Runs, wickets, catches → fantasy points (all players in selection pool)
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-700 text-left text-sm text-slate-400">
              <th className="px-6 py-3 font-medium">Player</th>
              <th className="px-6 py-3 font-medium">Role</th>
              <th className="px-6 py-3 font-medium text-right">Runs</th>
              <th className="px-6 py-3 font-medium text-right">Wkts</th>
              <th className="px-6 py-3 font-medium text-right">Ct</th>
              <th className="px-6 py-3 font-medium text-right">Points</th>
            </tr>
          </thead>
          <tbody>
            {scorecard.map((row) => (
              <tr
                key={row.id}
                className="border-b border-slate-800 text-sm hover:bg-slate-800/50"
              >
                <td className="px-6 py-3 font-medium text-white">{row.name}</td>
                <td className="px-6 py-3 text-slate-400">{row.role}</td>
                <td className="px-6 py-3 text-right text-slate-300">{row.runs}</td>
                <td className="px-6 py-3 text-right text-slate-300">{row.wickets}</td>
                <td className="px-6 py-3 text-right text-slate-300">{row.catches}</td>
                <td className="px-6 py-3 text-right font-medium text-emerald-400">
                  {row.fantasyPoints}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="border-t border-slate-700 px-6 py-2 text-xs text-slate-500">
        Captain 2× · Vice-captain 1.5× on fantasy points
      </div>
    </div>
  );
}
