import { useEffect, useState } from 'react';
import type { Player } from '@/data/mockPlayers';
import { PlayerAvatar } from '@/components/PlayerAvatar';
import { getPlayerImageUrl } from '@/data/playerImages';

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

  const [slotAssignments, setSlotAssignments] = useState<(number | null)[]>(() =>
    POSITION_SLOTS.map(() => null)
  );

  // Reset assignments whenever players change
  useEffect(() => {
    const byRole: Record<Player['role'], Player[]> = {
      WK: players.filter((p) => p.role === 'WK'),
      BAT: players.filter((p) => p.role === 'BAT'),
      AR: players.filter((p) => p.role === 'AR'),
      BOWL: players.filter((p) => p.role === 'BOWL'),
    };
    const roleIdx: Record<Player['role'], number> = { WK: 0, BAT: 0, AR: 0, BOWL: 0 };
    const next: (number | null)[] = POSITION_SLOTS.map(() => null);
    POSITION_SLOTS.forEach((slot, idx) => {
      const list = byRole[slot.role];
      const i = roleIdx[slot.role];
      if (list[i]) {
        next[idx] = list[i].id;
        roleIdx[slot.role]++;
      }
    });
    setSlotAssignments(next);
  }, [players]);

  const playersById = new Map(players.map((p) => [p.id, p]));

  const handleSwapSlots = (fromIdx: number, toIdx: number) => {
    if (
      fromIdx === toIdx ||
      fromIdx < 0 ||
      toIdx < 0 ||
      fromIdx >= POSITION_SLOTS.length ||
      toIdx >= POSITION_SLOTS.length
    ) {
      return;
    }
    // Only allow swapping within same role so the field layout stays sensible
    if (POSITION_SLOTS[fromIdx].role !== POSITION_SLOTS[toIdx].role) return;
    setSlotAssignments((prev) => {
      const copy = [...prev];
      const tmp = copy[fromIdx];
      copy[fromIdx] = copy[toIdx];
      copy[toIdx] = tmp;
      return copy;
    });
  };

  const handleDragStart = (slotIndex: number, ev: React.DragEvent<HTMLDivElement>) => {
    ev.dataTransfer.setData('text/plain', String(slotIndex));
    ev.dataTransfer.effectAllowed = 'move';
  };

  const handleDrop = (slotIndex: number, ev: React.DragEvent<HTMLDivElement>) => {
    ev.preventDefault();
    const from = Number(ev.dataTransfer.getData('text/plain'));
    if (Number.isNaN(from)) return;
    handleSwapSlots(from, slotIndex);
  };

  const handleDragOver = (ev: React.DragEvent<HTMLDivElement>) => {
    ev.preventDefault();
    ev.dataTransfer.dropEffect = 'move';
  };

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

        {/* Player positions (draggable between same-role slots) */}
        {POSITION_SLOTS.map((slot, idx) => {
          const playerId = slotAssignments[idx];
          const player = playerId != null ? playersById.get(playerId) ?? null : null;
          const isCaptain = player && captainId === player.id;
          const isVC = player && viceCaptainId === player.id;
          const isInteractive = !!player && !!playersById.size;
          return (
            <div
              key={idx}
              className="absolute flex -translate-x-1/2 -translate-y-1/2 transform items-center justify-center"
              style={{
                left: `${slot.x}%`,
                top: `${slot.y}%`,
                width: '56px',
                height: '56px',
              }}
              onDragOver={handleDragOver}
              onDrop={(ev) => handleDrop(idx, ev)}
            >
              {player ? (
                <div
                  draggable={isInteractive}
                  onDragStart={(ev) => handleDragStart(idx, ev)}
                  title={`${player.name} (${ROLE_LABELS[player.role]}) — drag to swap position`}
                  onClick={() => onRemove?.(player)}
                  className={`relative flex h-full w-full flex-col items-center justify-center rounded-full border-2 p-1 transition hover:scale-110 overflow-hidden ${
                    ROLE_COLORS[player.role]
                  } ${onRemove ? 'cursor-pointer' : ''}`}
                >
                  <PlayerAvatar
                    name={player.name}
                    size="sm"
                    imageUrl={getPlayerImageUrl(player.name)}
                    playerId={player.id}
                    className="mb-0.5"
                  />
                  <span className="text-[10px] text-white/90 font-medium">{slot.label}</span>
                  {(isCaptain || isVC) && (
                    <span className="absolute -top-1 -right-1 rounded-full bg-amber-500 px-1.5 text-[10px] font-bold text-black">
                      {isCaptain ? 'C' : 'VC'}
                    </span>
                  )}
                </div>
              ) : (
                <div className="flex h-full w-full items-center justify-center rounded-full border-2 border-dashed border-slate-600/60 bg-slate-900/40 text-[10px] font-medium text-slate-500">
                  {slot.label}
                </div>
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
