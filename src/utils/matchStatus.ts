/** Match duration window for "live" (e.g. T20 ~3–4h, allow 8h for display). */
const LIVE_WINDOW_MS = 8 * 60 * 60 * 1000;

export type MatchStatus = 'live' | 'upcoming' | 'past';

export interface MatchWithStartTime {
  startTime: string;
}

export function getMatchStatus(match: MatchWithStartTime): MatchStatus {
  const now = Date.now();
  const start = new Date(match.startTime).getTime();
  if (start > now) return 'upcoming';
  if (now <= start + LIVE_WINDOW_MS) return 'live';
  return 'past';
}

export function hasMlPredictions(_matchId: number): boolean {
  return true; // ML predictions enabled for all matches
}
