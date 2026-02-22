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

export async function fetchPlayerStats(matchId: number): Promise<PlayerPastStats[]> {
  const res = await fetch(`${API_BASE}/api/matches/${matchId}/player-stats`);
  if (!res.ok) throw new Error('Player stats not found');
  return res.json();
}
