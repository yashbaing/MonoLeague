import type { ScorecardEntry } from '@/hooks/useScorecard';

interface TeamScoreBreakdownProps {
  title: string;
  scorecard: ScorecardEntry[];
  playerIds: number[];
  captainId: number;
  viceCaptainId: number;
}

export function TeamScoreBreakdown({
  title,
  scorecard,
  playerIds,
  captainId,
  viceCaptainId,
}: TeamScoreBreakdownProps) {
  const byId = new Map(scorecard.map((p) => [p.id, p]));
  let total = 0;
  const rows: { id: number; name: string; pts: number; mult: string }[] = [];

  for (const id of playerIds) {
    const p = byId.get(id);
    if (!p) continue;
    let label = '1×';
    let mult = 1;
    if (id === captainId) {
      mult = 2;
      label = 'C 2×';
    } else if (id === viceCaptainId) {
      mult = 1.5;
      label = 'VC 1.5×';
    }
    const contrib = Math.round(p.fantasyPoints * mult);
    total += contrib;
    rows.push({ id: p.id, name: p.name, pts: contrib, mult: label });
  }

  return (
    <div className="rounded-xl border border-slate-700 bg-slate-900/50 p-6">
      <h3 className="mb-4 text-lg font-semibold text-white">{title}</h3>
      <p className="mb-4 text-sm text-slate-400">
        Based on match scorecard (Captain 2×, Vice-captain 1.5×)
      </p>
      <ul className="space-y-2">
        {rows.map((r) => (
          <li
            key={r.id}
            className="flex items-center justify-between text-sm text-slate-300"
          >
            <span>
              {r.name}
              <span className="ml-2 text-xs text-slate-500">({r.mult})</span>
            </span>
            <span className="font-medium text-emerald-400">{r.pts}</span>
          </li>
        ))}
      </ul>
      <div className="mt-4 flex items-center justify-between border-t border-slate-700 pt-4">
        <span className="font-medium text-white">Total</span>
        <span className="text-xl font-bold text-emerald-400">{total}</span>
      </div>
    </div>
  );
}
