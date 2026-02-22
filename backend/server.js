import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;

const matches = [
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

const players = {
  1: [
    { id: 101, name: 'R Sharma', role: 'BAT', credit: 10, teamId: 0 },
    { id: 102, name: 'V Kohli', role: 'BAT', credit: 10, teamId: 0 },
    { id: 103, name: 'R Pant', role: 'WK', credit: 9, teamId: 0 },
    { id: 104, name: 'H Pandya', role: 'AR', credit: 9, teamId: 0 },
    { id: 105, name: 'J Bumrah', role: 'BOWL', credit: 9, teamId: 0 },
    { id: 106, name: 'D Warner', role: 'BAT', credit: 9, teamId: 1 },
    { id: 107, name: 'S Smith', role: 'BAT', credit: 9, teamId: 1 },
    { id: 108, name: 'A Carey', role: 'WK', credit: 8, teamId: 1 },
    { id: 109, name: 'M Marsh', role: 'AR', credit: 9, teamId: 1 },
    { id: 110, name: 'P Cummins', role: 'BOWL', credit: 9, teamId: 1 },
    { id: 111, name: 'S Yadav', role: 'BAT', credit: 8, teamId: 0 },
    { id: 112, name: 'K Yadav', role: 'BOWL', credit: 8, teamId: 0 },
    { id: 113, name: 'R Jadeja', role: 'AR', credit: 8, teamId: 0 },
    { id: 114, name: 'S Iyer', role: 'BAT', credit: 8, teamId: 0 },
    { id: 115, name: 'M Starc', role: 'BOWL', credit: 8, teamId: 1 },
    { id: 116, name: 'M Labuschagne', role: 'BAT', credit: 8, teamId: 1 },
    { id: 117, name: 'T Head', role: 'BAT', credit: 8, teamId: 1 },
    { id: 118, name: 'C Green', role: 'AR', credit: 7, teamId: 1 },
  ],
  2: [
    { id: 201, name: 'R Sharma', role: 'BAT', credit: 10, teamId: 0 },
    { id: 202, name: 'I Kishan', role: 'WK', credit: 8, teamId: 0 },
    { id: 203, name: 'S Yadav', role: 'BAT', credit: 9, teamId: 0 },
    { id: 204, name: 'H Pandya', role: 'AR', credit: 9, teamId: 0 },
    { id: 205, name: 'J Bumrah', role: 'BOWL', credit: 10, teamId: 0 },
    { id: 206, name: 'R Jadeja', role: 'AR', credit: 10, teamId: 1 },
    { id: 207, name: 'MS Dhoni', role: 'WK', credit: 9, teamId: 1 },
    { id: 208, name: 'R Gaikwad', role: 'BAT', credit: 9, teamId: 1 },
    { id: 209, name: 'D Conway', role: 'BAT', credit: 8, teamId: 1 },
    { id: 210, name: 'M Pathirana', role: 'BOWL', credit: 9, teamId: 1 },
    { id: 211, name: 'T Boult', role: 'BOWL', credit: 8, teamId: 1 },
    { id: 212, name: 'K Yadav', role: 'BOWL', credit: 8, teamId: 0 },
    { id: 213, name: 'T David', role: 'BAT', credit: 7, teamId: 0 },
    { id: 214, name: 'S Curran', role: 'AR', credit: 8, teamId: 1 },
    { id: 215, name: 'N Wadhera', role: 'BAT', credit: 7, teamId: 0 },
  ],
};

// MI vs CSK Final - fantasy scorecard (all players in selection pool)
// Points: 1 run, 25 per wicket, 8 per catch, 8 for 50, 16 for 100, 8 for 3w, 16 for 4w, 25 for 5w
const scorecardMatch2 = [
  { id: 201, name: 'R Sharma', role: 'BAT', runs: 65, wickets: 0, catches: 0, fifties: 1, fantasyPoints: 73 },
  { id: 202, name: 'I Kishan', role: 'WK', runs: 28, wickets: 0, catches: 1, fifties: 0, fantasyPoints: 36 },
  { id: 203, name: 'S Yadav', role: 'BAT', runs: 42, wickets: 0, catches: 0, fifties: 0, fantasyPoints: 42 },
  { id: 204, name: 'H Pandya', role: 'AR', runs: 22, wickets: 1, catches: 0, fifties: 0, fantasyPoints: 47 },
  { id: 205, name: 'J Bumrah', role: 'BOWL', runs: 0, wickets: 2, catches: 0, threeWickets: 0, fantasyPoints: 50 },
  { id: 206, name: 'R Jadeja', role: 'AR', runs: 35, wickets: 2, catches: 1, fifties: 0, fantasyPoints: 78 },
  { id: 207, name: 'MS Dhoni', role: 'WK', runs: 18, wickets: 0, catches: 2, fifties: 0, fantasyPoints: 34 },
  { id: 208, name: 'R Gaikwad', role: 'BAT', runs: 58, wickets: 0, catches: 0, fifties: 1, fantasyPoints: 66 },
  { id: 209, name: 'D Conway', role: 'BAT', runs: 31, wickets: 0, catches: 0, fifties: 0, fantasyPoints: 31 },
  { id: 210, name: 'M Pathirana', role: 'BOWL', runs: 0, wickets: 3, catches: 0, threeWickets: 1, fantasyPoints: 83 },
  { id: 211, name: 'T Boult', role: 'BOWL', runs: 0, wickets: 1, catches: 0, threeWickets: 0, fantasyPoints: 25 },
  { id: 212, name: 'K Yadav', role: 'BOWL', runs: 4, wickets: 2, catches: 0, threeWickets: 0, fantasyPoints: 54 },
  { id: 213, name: 'T David', role: 'BAT', runs: 12, wickets: 0, catches: 0, fifties: 0, fantasyPoints: 12 },
  { id: 214, name: 'S Curran', role: 'AR', runs: 15, wickets: 1, catches: 0, fifties: 0, fantasyPoints: 40 },
  { id: 215, name: 'N Wadhera', role: 'BAT', runs: 8, wickets: 0, catches: 0, fifties: 0, fantasyPoints: 8 },
];

const scorecards = {
  2: scorecardMatch2,
};

// IPL 2025 past performance (MI & CSK players) — runs, wickets, catches, matches, avg fantasy pts
const ipl2025PastPerformance = [
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

app.get('/api/matches/:id/player-stats', (req, res) => {
  const id = Number(req.params.id);
  if (id === 2) {
    return res.json(ipl2025PastPerformance);
  }
  res.status(404).json({ error: 'Past performance data not available for this match' });
});

app.get('/api/matches', (req, res) => {
  res.json(matches);
});

app.get('/api/matches/:id', (req, res) => {
  const match = matches.find((m) => m.id === Number(req.params.id));
  if (!match) return res.status(404).json({ error: 'Match not found' });
  res.json(match);
});

app.get('/api/matches/:id/players', (req, res) => {
  const list = players[req.params.id] ?? players[1];
  res.json(list);
});

app.get('/api/matches/:id/scorecard', (req, res) => {
  const id = Number(req.params.id);
  const scorecard = scorecards[id];
  if (!scorecard) return res.status(404).json({ error: 'Scorecard not found for this match' });
  res.json(scorecard);
});

app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

app.listen(PORT, () => {
  console.log(`Backend running at http://localhost:${PORT}`);
});
