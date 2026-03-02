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

// Past + upcoming ICC/international matches (upcoming after 27 Feb 2026)
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
    teamA: 'India',
    teamB: 'Australia',
    venue: 'Himachal Pradesh Cricket Association Stadium, Dharamsala',
    startTime: '2026-02-28T14:30:00Z',
    sport: 'cricket',
  },
  {
    id: 3,
    teamA: 'India',
    teamB: 'England',
    venue: 'Eden Gardens, Kolkata',
    startTime: '2026-03-04T14:30:00Z',
    sport: 'cricket',
  },
  {
    id: 4,
    teamA: 'Australia',
    teamB: 'South Africa',
    venue: 'Wankhede Stadium, Mumbai',
    startTime: '2026-03-05T14:30:00Z',
    sport: 'cricket',
  },
  {
    id: 5,
    teamA: 'India',
    teamB: 'Australia',
    venue: 'Narendra Modi Stadium, Ahmedabad',
    startTime: '2026-03-08T14:30:00Z',
    sport: 'cricket',
  },
  {
    id: 6,
    teamA: 'Bangladesh',
    teamB: 'New Zealand',
    venue: 'Shere Bangla National Stadium, Dhaka',
    startTime: '2026-04-17T08:00:00Z',
    sport: 'cricket',
  },
  {
    id: 7,
    teamA: 'Pakistan',
    teamB: 'Zimbabwe',
    venue: 'Gaddafi Stadium, Lahore',
    startTime: '2026-04-10T14:30:00Z',
    sport: 'cricket',
  },
  {
    id: 8,
    teamA: 'England',
    teamB: 'New Zealand',
    venue: "Lord's, London",
    startTime: '2026-06-04T11:00:00Z',
    sport: 'cricket',
  },
  {
    id: 9,
    teamA: 'Mumbai Indians',
    teamB: 'Chennai Super Kings',
    venue: 'DY Patil Stadium, Navi Mumbai',
    startTime: '2026-03-15T19:30:00Z',
    sport: 'cricket',
  },
];
