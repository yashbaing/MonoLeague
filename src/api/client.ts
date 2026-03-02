const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';

export async function fetchMatches(): Promise<
  { id: number; teamA: string; teamB: string; venue: string; startTime: string; sport: 'cricket' | 'football' }[]
> {
  const res = await fetch(`${API_BASE}/api/matches`);
  if (!res.ok) throw new Error('Failed to fetch matches');
  return res.json();
}

export async function fetchMatch(id: number) {
  const res = await fetch(`${API_BASE}/api/matches/${id}`);
  if (!res.ok) return null;
  return res.json();
}

export async function fetchPlayers(matchId: number): Promise<
  { id: number; name: string; role: string; credit: number; teamId: 0 | 1 }[]
> {
  const res = await fetch(`${API_BASE}/api/matches/${matchId}/players`);
  if (!res.ok) throw new Error('Failed to fetch players');
  return res.json();
}

export interface ScorecardEntry {
  id: number;
  name: string;
  role: string;
  runs: number;
  wickets: number;
  catches: number;
  fifties?: number;
  threeWickets?: number;
  fantasyPoints: number;
}

export async function fetchScorecard(matchId: number): Promise<ScorecardEntry[]> {
  const res = await fetch(`${API_BASE}/api/matches/${matchId}/scorecard`);
  if (!res.ok) throw new Error('Scorecard not found');
  return res.json();
}

export interface PlayerPastStats {
  id: number;
  name: string;
  role: string;
  matches: number;
  runs: number;
  wickets: number;
  catches: number;
  avgFantasy: number;
  last3Avg: number;
}

function hashToUnit(str: string): number {
  let n = 0;
  for (let i = 0; i < str.length; i++) n = (n * 31 + str.charCodeAt(i)) >>> 0;
  return (n % 10_000) / 10_000;
}

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

export function synthesizePlayerStatsFromPlayers(
  players: { id: number; name: string; role: string; credit?: number }[]
): PlayerPastStats[] {
  return players.map((p) => {
    const role = p.role;
    const credit = Number(p.credit ?? 8);
    const seed = hashToUnit(`${p.id}-${p.name}-${role}-${credit}`);

    const baseByRole = role === 'WK' ? 38 : role === 'BAT' ? 42 : role === 'AR' ? 46 : 44;
    const creditBoost = (credit - 8) * 3;
    const noise = Math.round((seed * 2 - 1) * 6);

    const avgFantasy = clamp(baseByRole + creditBoost + noise, 18, 78);
    const formNoise = Math.round(((1 - seed) * 2 - 1) * 8);
    const last3Avg = clamp(avgFantasy + formNoise, 12, 90);

    const matches = clamp(9 + Math.floor(seed * 7), 6, 16);
    const runs = role === 'BOWL' ? Math.floor(seed * 30) : Math.floor(avgFantasy * (6 + seed * 4));
    const wickets = role === 'BOWL' ? Math.floor(8 + seed * 14) : role === 'AR' ? Math.floor(3 + seed * 10) : 0;
    const catches = role === 'WK' ? Math.floor(6 + seed * 10) : Math.floor(seed * 6);

    return {
      id: p.id,
      name: p.name,
      role: p.role,
      matches,
      runs,
      wickets,
      catches,
      avgFantasy,
      last3Avg,
    };
  });
}

/** Fallback for India/Australia (matches 1–8) when API is unreachable. */
export const FALLBACK_PLAYER_STATS_INDIA_AUS: PlayerPastStats[] = [
  { id: 101, name: 'R Sharma', role: 'BAT', matches: 12, runs: 380, wickets: 0, catches: 6, avgFantasy: 48, last3Avg: 52 },
  { id: 102, name: 'V Kohli', role: 'BAT', matches: 14, runs: 420, wickets: 0, catches: 4, avgFantasy: 55, last3Avg: 58 },
  { id: 103, name: 'R Pant', role: 'WK', matches: 10, runs: 220, wickets: 0, catches: 14, avgFantasy: 42, last3Avg: 46 },
  { id: 104, name: 'H Pandya', role: 'AR', matches: 11, runs: 165, wickets: 8, catches: 2, avgFantasy: 44, last3Avg: 48 },
  { id: 105, name: 'J Bumrah', role: 'BOWL', matches: 13, runs: 8, wickets: 18, catches: 1, avgFantasy: 52, last3Avg: 56 },
  { id: 106, name: 'D Warner', role: 'BAT', matches: 14, runs: 410, wickets: 0, catches: 5, avgFantasy: 54, last3Avg: 50 },
  { id: 107, name: 'S Smith', role: 'BAT', matches: 12, runs: 320, wickets: 0, catches: 6, avgFantasy: 46, last3Avg: 44 },
  { id: 108, name: 'A Carey', role: 'WK', matches: 11, runs: 180, wickets: 0, catches: 12, avgFantasy: 38, last3Avg: 36 },
  { id: 109, name: 'M Marsh', role: 'AR', matches: 10, runs: 195, wickets: 6, catches: 3, avgFantasy: 48, last3Avg: 52 },
  { id: 110, name: 'P Cummins', role: 'BOWL', matches: 12, runs: 22, wickets: 16, catches: 2, avgFantasy: 50, last3Avg: 48 },
  { id: 111, name: 'S Yadav', role: 'BAT', matches: 13, runs: 340, wickets: 0, catches: 2, avgFantasy: 42, last3Avg: 46 },
  { id: 112, name: 'K Yadav', role: 'BOWL', matches: 11, runs: 18, wickets: 14, catches: 1, avgFantasy: 46, last3Avg: 50 },
  { id: 113, name: 'R Jadeja', role: 'AR', matches: 14, runs: 240, wickets: 10, catches: 5, avgFantasy: 52, last3Avg: 56 },
  { id: 114, name: 'S Iyer', role: 'BAT', matches: 10, runs: 280, wickets: 0, catches: 3, avgFantasy: 44, last3Avg: 42 },
  { id: 115, name: 'M Starc', role: 'BOWL', matches: 12, runs: 12, wickets: 20, catches: 0, avgFantasy: 54, last3Avg: 58 },
  { id: 116, name: 'M Labuschagne', role: 'BAT', matches: 13, runs: 365, wickets: 0, catches: 4, avgFantasy: 50, last3Avg: 48 },
  { id: 117, name: 'T Head', role: 'BAT', matches: 14, runs: 390, wickets: 0, catches: 6, avgFantasy: 52, last3Avg: 56 },
  { id: 118, name: 'C Green', role: 'AR', matches: 11, runs: 155, wickets: 7, catches: 2, avgFantasy: 42, last3Avg: 40 },
];

/** Fallback for MI vs CSK (match 9) when API is unreachable. */
export const FALLBACK_PLAYER_STATS_MATCH2: PlayerPastStats[] = [
  { id: 201, name: 'R Sharma', role: 'BAT', matches: 14, runs: 412, wickets: 0, catches: 8, avgFantasy: 52, last3Avg: 58 },
  { id: 202, name: 'I Kishan', role: 'WK', matches: 13, runs: 298, wickets: 0, catches: 12, avgFantasy: 38, last3Avg: 42 },
  { id: 203, name: 'S Yadav', role: 'BAT', matches: 14, runs: 385, wickets: 0, catches: 4, avgFantasy: 45, last3Avg: 48 },
  { id: 204, name: 'H Pandya', role: 'AR', matches: 12, runs: 186, wickets: 11, catches: 3, avgFantasy: 44, last3Avg: 50 },
  { id: 205, name: 'J Bumrah', role: 'BOWL', matches: 14, runs: 12, wickets: 22, catches: 2, avgFantasy: 55, last3Avg: 58 },
  { id: 206, name: 'R Jadeja', role: 'AR', matches: 14, runs: 268, wickets: 14, catches: 6, avgFantasy: 62, last3Avg: 72 },
  { id: 207, name: 'MS Dhoni', role: 'WK', matches: 12, runs: 198, wickets: 0, catches: 14, avgFantasy: 35, last3Avg: 32 },
  { id: 208, name: 'R Gaikwad', role: 'BAT', matches: 14, runs: 445, wickets: 0, catches: 5, avgFantasy: 58, last3Avg: 64 },
  { id: 209, name: 'D Conway', role: 'BAT', matches: 11, runs: 312, wickets: 0, catches: 6, avgFantasy: 42, last3Avg: 38 },
  { id: 210, name: 'M Pathirana', role: 'BOWL', matches: 13, runs: 8, wickets: 19, catches: 1, avgFantasy: 61, last3Avg: 68 },
  { id: 211, name: 'T Boult', role: 'BOWL', matches: 14, runs: 22, wickets: 16, catches: 2, avgFantasy: 48, last3Avg: 44 },
  { id: 212, name: 'K Yadav', role: 'BOWL', matches: 12, runs: 28, wickets: 15, catches: 3, avgFantasy: 49, last3Avg: 52 },
  { id: 213, name: 'T David', role: 'BAT', matches: 13, runs: 218, wickets: 0, catches: 2, avgFantasy: 28, last3Avg: 22 },
  { id: 214, name: 'S Curran', role: 'AR', matches: 14, runs: 165, wickets: 12, catches: 4, avgFantasy: 46, last3Avg: 48 },
  { id: 215, name: 'N Wadhera', role: 'BAT', matches: 9, runs: 124, wickets: 0, catches: 1, avgFantasy: 22, last3Avg: 18 },
];

export async function fetchPlayerStats(matchId: number): Promise<PlayerPastStats[]> {
  const res = await fetch(`${API_BASE}/api/matches/${matchId}/player-stats`);
  if (!res.ok) throw new Error('Player stats not found');
  return res.json();
}

/**
 * Robust stats fetch:
 * - prefer backend stats
 * - if stats endpoint fails, synthesize stats from the match player list (if available)
 */
export async function fetchPlayerStatsRobust(matchId: number): Promise<PlayerPastStats[]> {
  try {
    return await fetchPlayerStats(matchId);
  } catch {
    const players = await fetchPlayers(matchId);
    return synthesizePlayerStatsFromPlayers(players);
  }
}
