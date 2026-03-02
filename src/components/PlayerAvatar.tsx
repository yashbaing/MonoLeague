import { useState } from 'react';

/** Avatar for a player: image if url/seed provided, otherwise initials in a colored circle. */
interface PlayerAvatarProps {
  name: string;
  size?: 'sm' | 'md' | 'lg';
  /** Optional: URL to player photo. */
  imageUrl?: string | null;
  /** Optional: player id used to generate a consistent avatar image (DiceBear). */
  playerId?: number;
  className?: string;
}

const SIZE_MAP = { sm: 32, md: 40, lg: 56 } as const;

function hashToIndex(str: string): number {
  let n = 0;
  for (let i = 0; i < str.length; i++) n = (n * 31 + str.charCodeAt(i)) >>> 0;
  return n % 8;
}

const AVATAR_BG = [
  'bg-emerald-600',
  'bg-blue-600',
  'bg-violet-600',
  'bg-amber-600',
  'bg-rose-600',
  'bg-cyan-600',
  'bg-indigo-600',
  'bg-teal-600',
];

/** Consistent avatar image URL from DiceBear (person-style) when no real photo. */
export function getPlayerImageUrl(playerId: number, size = 128): string {
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${playerId}&size=${size}`;
}

export function PlayerAvatar({ name, size = 'md', imageUrl, playerId, className = '' }: PlayerAvatarProps) {
  const [imgFailed, setImgFailed] = useState(false);
  const px = SIZE_MAP[size];
  const initials = name
    .trim()
    .split(/\s+/)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || '?';
  const bgClass = AVATAR_BG[hashToIndex(name)];

  const effectiveImageUrl = imageUrl || (playerId != null && !imgFailed ? getPlayerImageUrl(playerId, px * 2) : null);

  if (effectiveImageUrl) {
    return (
      <img
        src={effectiveImageUrl}
        alt={name}
        className={`rounded-full object-cover bg-slate-700 flex-shrink-0 ${className}`}
        width={px}
        height={px}
        onError={() => setImgFailed(true)}
      />
    );
  }

  return (
    <div
      className={`flex-shrink-0 rounded-full flex items-center justify-center text-white font-bold ${bgClass} ${className}`}
      style={{ width: px, height: px, fontSize: size === 'sm' ? 12 : size === 'md' ? 14 : 18 }}
      title={name}
    >
      {initials}
    </div>
  );
}
