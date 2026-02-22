export interface Match {
  id: number;
  teamA: string;
  teamB: string;
  venue: string;
  startTime: string;
  sport: 'cricket' | 'football';
}

// Placeholder contest address - replace after deploy
export const MOCK_CONTEST_ADDRESS =
  '0x0000000000000000000000000000000000000001' as `0x${string}`;

export const mockMatches: Match[] = [
  {
    id: 1,
    teamA: 'India',
    teamB: 'Australia',
    venue: 'Wankhede Stadium, Mumbai',
    startTime: '2025-03-20T14:30:00Z',
    sport: 'cricket',
  },
  {
    id: 2,
    teamA: 'Mumbai Indians',
    teamB: 'Chennai Super Kings',
    venue: 'DY Patil Stadium, Navi Mumbai',
    startTime: '2025-03-22T19:30:00Z',
    sport: 'cricket',
  },
];
