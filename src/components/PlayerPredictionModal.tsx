import type { PlayerPastStats } from '@/api/client';

/** Selection score 0–100 from past performance (avg + recent form). */
function selectionScore(stats: PlayerPastStats, poolAvg: number): number {
  const formWeight = 0.6;
  const avgWeight = 0.4;
  const combined = stats.last3Avg * formWeight + stats.avgFantasy * avgWeight;
  if (poolAvg <= 0) return 50;
  const ratio = combined / poolAvg;
  return Math.min(100, Math.round(50 + (ratio - 1) * 50));
}

function predictedPoints(stats: PlayerPastStats): number {
  return Math.round(stats.last3Avg * 0.6 + stats.avgFantasy * 0.4);
}

interface PlayerPredictionModalProps {
  player: { id: number; name: string; role: string; credit: number };
  stats: PlayerPastStats | null;
  allStats: PlayerPastStats[];
  onClose: () => void;
}

export function PlayerPredictionModal({
  player,
  stats,
  allStats,
  onClose,
}: PlayerPredictionModalProps) {
  const poolAvg =
    allStats.length > 0
      ? allStats.reduce((s, p) => s + p.avgFantasy, 0) / allStats.length
      : 0;
  const score = stats ? selectionScore(stats, poolAvg) : 50;
  const predicted = stats ? predictedPoints(stats) : 0;
  const label =
    score >= 70 ? 'Good for team' : score >= 50 ? 'Average pick' : 'Risky pick';

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-xl border border-slate-700 bg-slate-900 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-slate-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Player prediction</h3>
            <button
              type="button"
              onClick={onClose}
              className="rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
              aria-label="Close"
            >
              ×
            </button>
          </div>
          <p className="mt-1 text-sm text-slate-400">
            Based on IPL 2025 past performance
          </p>
        </div>
        <div className="p-6">
          <div className="mb-4">
            <p className="text-xl font-medium text-white">{player.name}</p>
            <p className="text-sm text-slate-500">
              {player.role} · {player.credit} cr
            </p>
          </div>
          {stats ? (
            <>
              <div className="mb-4 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-lg bg-slate-800/80 px-3 py-2">
                  <p className="text-slate-500">Matches (IPL 2025)</p>
                  <p className="font-medium text-white">{stats.matches}</p>
                </div>
                <div className="rounded-lg bg-slate-800/80 px-3 py-2">
                  <p className="text-slate-500">Runs</p>
                  <p className="font-medium text-white">{stats.runs}</p>
                </div>
                <div className="rounded-lg bg-slate-800/80 px-3 py-2">
                  <p className="text-slate-500">Wickets</p>
                  <p className="font-medium text-white">{stats.wickets}</p>
                </div>
                <div className="rounded-lg bg-slate-800/80 px-3 py-2">
                  <p className="text-slate-500">Catches</p>
                  <p className="font-medium text-white">{stats.catches}</p>
                </div>
                <div className="rounded-lg bg-slate-800/80 px-3 py-2">
                  <p className="text-slate-500">Avg fantasy pts</p>
                  <p className="font-medium text-emerald-400">{stats.avgFantasy}</p>
                </div>
                <div className="rounded-lg bg-slate-800/80 px-3 py-2">
                  <p className="text-slate-500">Last 3 avg</p>
                  <p className="font-medium text-emerald-400">{stats.last3Avg}</p>
                </div>
              </div>
              <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-4">
                <p className="text-sm text-slate-400">Predicted points (this match)</p>
                <p className="text-2xl font-bold text-emerald-400">{predicted} pts</p>
              </div>
              <div className="mt-4 flex items-center justify-between rounded-lg border border-slate-700 px-4 py-3">
                <span className="text-sm text-slate-400">Selection score</span>
                <div className="flex items-center gap-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      score >= 70
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : score >= 50
                          ? 'bg-amber-500/20 text-amber-400'
                          : 'bg-red-500/20 text-red-400'
                    }`}
                  >
                    {label}
                  </span>
                  <span className="font-bold text-white">{score}/100</span>
                </div>
              </div>
            </>
          ) : (
            <p className="text-slate-500">No past performance data for this player.</p>
          )}
        </div>
      </div>
    </div>
  );
}
