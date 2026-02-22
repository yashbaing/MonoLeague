import type { Player } from '@/data/mockPlayers';

interface TeamArenaProps {
  players: Player[];
  captainId?: number | null;
  viceCaptainId?: number | null;
  onRemove?: (player: Player) => void;
}

// Position slots on cricket field (top-down): WK behind stumps, BOWL at bowling end, BAT/AR in field
const POSITION_SLOTS: { role: Player['role']; x: number; y: number; label: string }[] = [
  { role: 'WK', x: 50, y: 88, label: 'WK' },
  { role: 'BOWL', x: 50, y: 12, label: 'BOWL' },
  { role: 'BOWL', x: 50, y: 30, label: 'BOWL' },
  { role: 'BAT', x: 22, y: 38, label: 'BAT' },
  { role: 'BAT', x: 78, y: 38, label: 'BAT' },
  { role: 'BAT', x: 12, y: 62, label: 'BAT' },
  { role: 'BAT', x: 88, y: 62, label: 'BAT' },
  { role: 'AR', x: 38, y: 22, label: 'AR' },
  { role: 'AR', x: 62, y: 22, label: 'AR' },
  { role: 'AR', x: 18, y: 75, label: 'AR' },
  { role: 'AR', x: 82, y: 75, label: 'AR' },
];

const ROLE_COLORS: Record<Player['role'], string> = {
  WK: 'bg-amber-500/90 border-amber-400',
  BAT: 'bg-emerald-500/90 border-emerald-400',
  AR: 'bg-blue-500/90 border-blue-400',
  BOWL: 'bg-rose-500/90 border-rose-400',
};

const ROLE_LABELS: Record<Player['role'], string> = {
  WK: 'Wicket Keeper',
  BAT: 'Batsman',
  AR: 'All-rounder',
  BOWL: 'Bowler',
};

export function TeamArena({ players, captainId, viceCaptainId, onRemove }: TeamArenaProps) {
  if (players.length === 0) return null;

  const byRole: Record<Player['role'], Player[]> = {
    WK: players.filter((p) => p.role === 'WK'),
    BAT: players.filter((p) => p.role === 'BAT'),
    AR: players.filter((p) => p.role === 'AR'),
    BOWL: players.filter((p) => p.role === 'BOWL'),
  };

  const roleIdx: Record<Player['role'], number> = { WK: 0, BAT: 0, AR: 0, BOWL: 0 };
  const assigned: { player: Player; x: number; y: number; label: string }[] = [];

  for (const slot of POSITION_SLOTS) {
    const list = byRole[slot.role];
    const idx = roleIdx[slot.role];
    if (list[idx]) {
      assigned.push({ player: list[idx], x: slot.x, y: slot.y, label: slot.label });
      roleIdx[slot.role]++;
    }
  }

  return (
    <div className="rounded-xl border border-slate-700 bg-slate-900/50 p-6">
      <h3 className="mb-4 font-semibold text-white">Team Arena</h3>
      <div className="relative aspect-[4/3] max-w-2xl overflow-hidden rounded-lg bg-emerald-900/30">
        {/* Cricket field oval */}
        <div className="absolute inset-4 rounded-[50%] border-2 border-emerald-600/50 bg-emerald-800/20" />
        {/* Pitch (center strip) */}
        <div
          className="absolute left-1/2 top-1/2 h-[55%] w-1 rounded bg-slate-600/50"
          style={{ transform: 'translate(-50%, -50%)' }}
        />

        {/* Player positions */}
        {assigned.map(({ player, x, y, label }) => {
          const isCaptain = captainId === player.id;
          const isVC = viceCaptainId === player.id;
          return (
            <div
              key={player.id}
              className={`absolute flex flex-col items-center justify-center rounded-full border-2 p-1.5 transition hover:scale-110 ${
                ROLE_COLORS[player.role]
              } ${onRemove ? 'cursor-pointer' : ''}`}
              style={{
                left: `${x}%`,
                top: `${y}%`,
                transform: 'translate(-50%, -50%)',
                minWidth: '56px',
                minHeight: '56px',
              }}
              title={`${player.name} (${ROLE_LABELS[player.role]})`}
              onClick={() => onRemove?.(player)}
            >
              <span className="truncate max-w-[52px] text-center text-xs font-bold text-white">
                {player.name.split(' ').pop()}
              </span>
              <span className="text-[10px] text-white/90">{label}</span>
              {(isCaptain || isVC) && (
                <span className="absolute -top-1 -right-1 rounded-full bg-amber-500 px-1.5 text-[10px] font-bold text-black">
                  {isCaptain ? 'C' : 'VC'}
                </span>
              )}
            </div>
          );
        })}
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {(['WK', 'BAT', 'AR', 'BOWL'] as const).map((role) => (
          <span
            key={role}
            className={`rounded px-2 py-1 text-xs font-medium ${ROLE_COLORS[role]} text-white`}
          >
            {ROLE_LABELS[role]}
          </span>
        ))}
      </div>
    </div>
  );
}
