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

/** Fallback so ML predictions (Good/Average/Risky) always show for match 2 when API is unreachable (e.g. no backend, different network). */
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
