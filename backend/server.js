import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;

// --- ICC real-time matches (via ICC's Sportz Interactive schedule API) ---
const SPORTZ_BASE_URL = 'https://assets-icc.sportz.io';
const SPORTZ_SCHEDULE_PATH = '/cricket/v1/schedule?';
const ICC_CLIENT_ID_SOURCE_URL = 'https://www.icc-cricket.com/matches/men/t20i';

/** Parse Sportz date format like "3/3/2026T17:00:00+00:00" to ISO "YYYY-MM-DDTHH:mm:ssZ". */
function sportzStartDateToIsoUtc(startDate) {
  if (!startDate || typeof startDate !== 'string') return null;
  const m = startDate.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})T(\d{2}:\d{2}:\d{2})([+-]\d{2}:\d{2})$/);
  if (!m) return null;
  const [, mm, dd, yyyy, time, offset] = m;
  const iso = `${yyyy}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}T${time}${offset}`;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}

let iccClientIdCache = { fetchedAt: 0, value: null };
async function getIccSportzClientId({ forceRefresh = false } = {}) {
  const now = Date.now();
  if (!forceRefresh && iccClientIdCache.value && now - iccClientIdCache.fetchedAt < 6 * 60_000) {
    return iccClientIdCache.value;
  }
  const html = await fetch(ICC_CLIENT_ID_SOURCE_URL, { headers: { 'user-agent': 'monoleague-backend/1.0' } }).then(
    (r) => r.text(),
  );
  // ICC pages sometimes embed the config inside escaped strings like: \"clientId\":\"...\"
  // Note: the closing quote after the value is not always escaped, so we match a plain `"` there.
  const matchEscaped = html.match(/\\\"clientId\\\":\\\"([^\\\"]+?)\"/);
  const matchPlain = html.match(/\"clientId\":\"([^\"]+)\"/);
  const clientId = matchEscaped?.[1] ?? matchPlain?.[1] ?? null;
  iccClientIdCache = { fetchedAt: now, value: clientId };
  return clientId;
}

let iccMatchesCache = { fetchedAt: 0, data: [] };
async function fetchIccMatches({ forceRefresh = false } = {}) {
  const now = Date.now();
  if (!forceRefresh && now - iccMatchesCache.fetchedAt < 60_000) return iccMatchesCache.data;

  try {
    const clientId = await getIccSportzClientId({ forceRefresh });
    if (!clientId) return iccMatchesCache.data;

    const common = `client_id=${encodeURIComponent(clientId)}&feed_format=json&lang=en&is_deleted=false&page_size=50`;
    const [fixturesJson, resultsJson] = await Promise.all([
      fetch(`${SPORTZ_BASE_URL}${SPORTZ_SCHEDULE_PATH}${common}&is_upcoming=true&is_live=true`).then((r) => r.json()),
      fetch(`${SPORTZ_BASE_URL}${SPORTZ_SCHEDULE_PATH}${common}&is_recent=true`).then((r) => r.json()),
    ]);

    const merged = [...(fixturesJson?.data?.matches ?? []), ...(resultsJson?.data?.matches ?? [])];
    const byId = new Map();
    for (const m of merged) {
      const mid = String(m?.match_id ?? '');
      if (!mid) continue;
      byId.set(mid, m);
    }

    const normalized = Array.from(byId.values())
      .map((m) => {
        // Keep men's matches by default (avoid flooding UI with women's/domestic variants).
        if (typeof m.comp_type === 'string' && m.comp_type.includes('- w')) return null;
        if (typeof m.league === 'string' && m.league.toLowerCase().includes('women')) return null;

        const mid = Number(m.match_id);
        if (!Number.isFinite(mid)) return null;
        const startTime = sportzStartDateToIsoUtc(m.start_date) ?? null;
        if (!startTime) return null;
        return {
          // Avoid clashing with our app's seeded match ids (1..9)
          id: 1_000_000 + mid,
          teamA: m.teama_display_name || m.teama || 'TBD',
          teamB: m.teamb_display_name || m.teamb || 'TBD',
          venue: m.venue || 'TBD',
          startTime,
          sport: 'cricket',
        };
      })
      .filter(Boolean)
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

    iccMatchesCache = { fetchedAt: now, data: normalized };
    return normalized;
  } catch {
    // Keep last good cache on failures.
    return iccMatchesCache.data;
  }
}

// Past + upcoming ICC/international matches (upcoming after 27 Feb 2026)
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
    venue: 'Lord\'s, London',
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

// India squad (teamId 0)
const indiaSquad = [
  { id: 101, name: 'R Sharma', role: 'BAT', credit: 10, teamId: 0 },
  { id: 102, name: 'V Kohli', role: 'BAT', credit: 10, teamId: 0 },
  { id: 103, name: 'R Pant', role: 'WK', credit: 9, teamId: 0 },
  { id: 104, name: 'H Pandya', role: 'AR', credit: 9, teamId: 0 },
  { id: 105, name: 'J Bumrah', role: 'BOWL', credit: 9, teamId: 0 },
  { id: 111, name: 'S Yadav', role: 'BAT', credit: 8, teamId: 0 },
  { id: 112, name: 'K Yadav', role: 'BOWL', credit: 8, teamId: 0 },
  { id: 113, name: 'R Jadeja', role: 'AR', credit: 8, teamId: 0 },
  { id: 114, name: 'S Iyer', role: 'BAT', credit: 8, teamId: 0 },
];
// Australia squad (teamId 1)
const australiaSquad = [
  { id: 106, name: 'D Warner', role: 'BAT', credit: 9, teamId: 1 },
  { id: 107, name: 'S Smith', role: 'BAT', credit: 9, teamId: 1 },
  { id: 108, name: 'A Carey', role: 'WK', credit: 8, teamId: 1 },
  { id: 109, name: 'M Marsh', role: 'AR', credit: 9, teamId: 1 },
  { id: 110, name: 'P Cummins', role: 'BOWL', credit: 9, teamId: 1 },
  { id: 115, name: 'M Starc', role: 'BOWL', credit: 8, teamId: 1 },
  { id: 116, name: 'M Labuschagne', role: 'BAT', credit: 8, teamId: 1 },
  { id: 117, name: 'T Head', role: 'BAT', credit: 8, teamId: 1 },
  { id: 118, name: 'C Green', role: 'AR', credit: 7, teamId: 1 },
];

const players = {
  1: [...indiaSquad, ...australiaSquad],
  2: [...indiaSquad, ...australiaSquad],
  3: [
    { id: 301, name: 'R Sharma', role: 'BAT', credit: 10, teamId: 0 },
    { id: 302, name: 'V Kohli', role: 'BAT', credit: 10, teamId: 0 },
    { id: 303, name: 'R Pant', role: 'WK', credit: 9, teamId: 0 },
    { id: 304, name: 'H Pandya', role: 'AR', credit: 9, teamId: 0 },
    { id: 305, name: 'J Bumrah', role: 'BOWL', credit: 9, teamId: 0 },
    { id: 306, name: 'S Yadav', role: 'BAT', credit: 8, teamId: 0 },
    { id: 307, name: 'K Yadav', role: 'BOWL', credit: 8, teamId: 0 },
    { id: 308, name: 'R Jadeja', role: 'AR', credit: 8, teamId: 0 },
    { id: 309, name: 'S Iyer', role: 'BAT', credit: 8, teamId: 0 },
    { id: 310, name: 'J Root', role: 'BAT', credit: 10, teamId: 1 },
    { id: 311, name: 'J Bairstow', role: 'WK', credit: 9, teamId: 1 },
    { id: 312, name: 'B Stokes', role: 'AR', credit: 10, teamId: 1 },
    { id: 313, name: 'J Buttler', role: 'BAT', credit: 9, teamId: 1 },
    { id: 314, name: 'M Wood', role: 'BOWL', credit: 8, teamId: 1 },
    { id: 315, name: 'A Rashid', role: 'BOWL', credit: 9, teamId: 1 },
    { id: 316, name: 'J Archer', role: 'BOWL', credit: 9, teamId: 1 },
    { id: 317, name: 'L Livingstone', role: 'AR', credit: 8, teamId: 1 },
    { id: 318, name: 'P Salt', role: 'BAT', credit: 7, teamId: 1 },
  ],
  4: [
    { id: 401, name: 'D Warner', role: 'BAT', credit: 10, teamId: 0 },
    { id: 402, name: 'T Head', role: 'BAT', credit: 9, teamId: 0 },
    { id: 403, name: 'M Marsh', role: 'AR', credit: 9, teamId: 0 },
    { id: 404, name: 'P Cummins', role: 'BOWL', credit: 9, teamId: 0 },
    { id: 405, name: 'A Carey', role: 'WK', credit: 8, teamId: 0 },
    { id: 406, name: 'M Starc', role: 'BOWL', credit: 8, teamId: 0 },
    { id: 407, name: 'S Smith', role: 'BAT', credit: 8, teamId: 0 },
    { id: 408, name: 'C Green', role: 'AR', credit: 7, teamId: 0 },
    { id: 409, name: 'J Hazlewood', role: 'BOWL', credit: 8, teamId: 0 },
    { id: 410, name: 'Q de Kock', role: 'WK', credit: 9, teamId: 1 },
    { id: 411, name: 'H Klaasen', role: 'BAT', credit: 9, teamId: 1 },
    { id: 412, name: 'A Markram', role: 'AR', credit: 9, teamId: 1 },
    { id: 413, name: 'K Rabada', role: 'BOWL', credit: 9, teamId: 1 },
    { id: 414, name: 'K Maharaj', role: 'BOWL', credit: 8, teamId: 1 },
    { id: 415, name: 'D Miller', role: 'BAT', credit: 8, teamId: 1 },
    { id: 416, name: 'M Jansen', role: 'AR', credit: 8, teamId: 1 },
    { id: 417, name: 'T Bavuma', role: 'BAT', credit: 7, teamId: 1 },
    { id: 418, name: 'A Nortje', role: 'BOWL', credit: 8, teamId: 1 },
  ],
  5: [...indiaSquad, ...australiaSquad],
  6: [
    { id: 601, name: 'L Das', role: 'BAT', credit: 9, teamId: 0 },
    { id: 602, name: 'S Hasan', role: 'AR', credit: 9, teamId: 0 },
    { id: 603, name: 'M Rahim', role: 'WK', credit: 8, teamId: 0 },
    { id: 604, name: 'T Ahmed', role: 'BOWL', credit: 9, teamId: 0 },
    { id: 605, name: 'N Hossain', role: 'BAT', credit: 8, teamId: 0 },
    { id: 606, name: 'M Rahman', role: 'BOWL', credit: 8, teamId: 0 },
    { id: 607, name: 'M Haque', role: 'BAT', credit: 7, teamId: 0 },
    { id: 608, name: 'T Islam', role: 'BOWL', credit: 8, teamId: 0 },
    { id: 609, name: 'S Sarkar', role: 'BAT', credit: 7, teamId: 0 },
    { id: 610, name: 'K Williamson', role: 'BAT', credit: 10, teamId: 1 },
    { id: 611, name: 'T Boult', role: 'BOWL', credit: 9, teamId: 1 },
    { id: 612, name: 'D Conway', role: 'BAT', credit: 9, teamId: 1 },
    { id: 613, name: 'M Santner', role: 'AR', credit: 8, teamId: 1 },
    { id: 614, name: 'L Ferguson', role: 'BOWL', credit: 8, teamId: 1 },
    { id: 615, name: 'G Phillips', role: 'BAT', credit: 8, teamId: 1 },
    { id: 616, name: 'T Latham', role: 'WK', credit: 8, teamId: 1 },
    { id: 617, name: 'J Neesham', role: 'AR', credit: 7, teamId: 1 },
    { id: 618, name: 'M Henry', role: 'BOWL', credit: 7, teamId: 1 },
  ],
  7: [
    { id: 701, name: 'B Azam', role: 'BAT', credit: 10, teamId: 0 },
    { id: 702, name: 'M Rizwan', role: 'WK', credit: 9, teamId: 0 },
    { id: 703, name: 'S Khan', role: 'AR', credit: 9, teamId: 0 },
    { id: 704, name: 'S Afridi', role: 'BOWL', credit: 9, teamId: 0 },
    { id: 705, name: 'H Ali', role: 'BOWL', credit: 8, teamId: 0 },
    { id: 706, name: 'I Ahmed', role: 'BAT', credit: 8, teamId: 0 },
    { id: 707, name: 'F Ashraf', role: 'AR', credit: 7, teamId: 0 },
    { id: 708, name: 'N Shah', role: 'BOWL', credit: 8, teamId: 0 },
    { id: 709, name: 'I Wasim', role: 'AR', credit: 7, teamId: 0 },
    { id: 710, name: 'S Raza', role: 'AR', credit: 9, teamId: 1 },
    { id: 711, name: 'C Ervine', role: 'BAT', credit: 8, teamId: 1 },
    { id: 712, name: 'S Williams', role: 'BAT', credit: 8, teamId: 1 },
    { id: 713, name: 'B Muzarabani', role: 'BOWL', credit: 8, teamId: 1 },
    { id: 714, name: 'R Burl', role: 'BAT', credit: 7, teamId: 1 },
    { id: 715, name: 'W Madhevere', role: 'AR', credit: 7, teamId: 1 },
    { id: 716, name: 'J Ball', role: 'BOWL', credit: 7, teamId: 1 },
    { id: 717, name: 'M Shumba', role: 'BAT', credit: 6, teamId: 1 },
    { id: 718, name: 'T Kamunhukamwe', role: 'BAT', credit: 6, teamId: 1 },
  ],
  8: [
    { id: 801, name: 'J Root', role: 'BAT', credit: 10, teamId: 0 },
    { id: 802, name: 'J Bairstow', role: 'WK', credit: 9, teamId: 0 },
    { id: 803, name: 'B Stokes', role: 'AR', credit: 10, teamId: 0 },
    { id: 804, name: 'J Archer', role: 'BOWL', credit: 9, teamId: 0 },
    { id: 805, name: 'A Rashid', role: 'BOWL', credit: 8, teamId: 0 },
    { id: 806, name: 'J Buttler', role: 'BAT', credit: 9, teamId: 0 },
    { id: 807, name: 'M Wood', role: 'BOWL', credit: 8, teamId: 0 },
    { id: 808, name: 'L Livingstone', role: 'AR', credit: 8, teamId: 0 },
    { id: 809, name: 'P Salt', role: 'BAT', credit: 7, teamId: 0 },
    { id: 810, name: 'K Williamson', role: 'BAT', credit: 10, teamId: 1 },
    { id: 811, name: 'T Boult', role: 'BOWL', credit: 9, teamId: 1 },
    { id: 812, name: 'D Conway', role: 'BAT', credit: 9, teamId: 1 },
    { id: 813, name: 'M Santner', role: 'AR', credit: 8, teamId: 1 },
    { id: 814, name: 'L Ferguson', role: 'BOWL', credit: 8, teamId: 1 },
    { id: 815, name: 'G Phillips', role: 'BAT', credit: 8, teamId: 1 },
    { id: 816, name: 'T Latham', role: 'WK', credit: 8, teamId: 1 },
    { id: 817, name: 'J Neesham', role: 'AR', credit: 7, teamId: 1 },
    { id: 818, name: 'M Henry', role: 'BOWL', credit: 7, teamId: 1 },
  ],
  9: [
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
  9: scorecardMatch2,
};

// India vs Australia past performance (ids 101–118) — matches 1, 2, 5
const indiaAustraliaPastPerformance = [
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

// India vs England (match 3) — ids 301–318
const indiaEnglandPastPerformance = [
  { id: 301, name: 'R Sharma', role: 'BAT', matches: 12, runs: 380, wickets: 0, catches: 6, avgFantasy: 48, last3Avg: 52 },
  { id: 302, name: 'V Kohli', role: 'BAT', matches: 14, runs: 420, wickets: 0, catches: 4, avgFantasy: 55, last3Avg: 58 },
  { id: 303, name: 'R Pant', role: 'WK', matches: 10, runs: 220, wickets: 0, catches: 14, avgFantasy: 42, last3Avg: 46 },
  { id: 304, name: 'H Pandya', role: 'AR', matches: 11, runs: 165, wickets: 8, catches: 2, avgFantasy: 44, last3Avg: 48 },
  { id: 305, name: 'J Bumrah', role: 'BOWL', matches: 13, runs: 8, wickets: 18, catches: 1, avgFantasy: 52, last3Avg: 56 },
  { id: 306, name: 'S Yadav', role: 'BAT', matches: 13, runs: 340, wickets: 0, catches: 2, avgFantasy: 42, last3Avg: 46 },
  { id: 307, name: 'K Yadav', role: 'BOWL', matches: 11, runs: 18, wickets: 14, catches: 1, avgFantasy: 46, last3Avg: 50 },
  { id: 308, name: 'R Jadeja', role: 'AR', matches: 14, runs: 240, wickets: 10, catches: 5, avgFantasy: 52, last3Avg: 56 },
  { id: 309, name: 'S Iyer', role: 'BAT', matches: 10, runs: 280, wickets: 0, catches: 3, avgFantasy: 44, last3Avg: 42 },
  { id: 310, name: 'J Root', role: 'BAT', matches: 14, runs: 400, wickets: 0, catches: 5, avgFantasy: 52, last3Avg: 56 },
  { id: 311, name: 'J Bairstow', role: 'WK', matches: 12, runs: 320, wickets: 0, catches: 10, avgFantasy: 48, last3Avg: 50 },
  { id: 312, name: 'B Stokes', role: 'AR', matches: 11, runs: 180, wickets: 6, catches: 3, avgFantasy: 50, last3Avg: 54 },
  { id: 313, name: 'J Buttler', role: 'BAT', matches: 13, runs: 380, wickets: 0, catches: 6, avgFantasy: 54, last3Avg: 58 },
  { id: 314, name: 'M Wood', role: 'BOWL', matches: 10, runs: 12, wickets: 14, catches: 1, avgFantasy: 46, last3Avg: 48 },
  { id: 315, name: 'A Rashid', role: 'BOWL', matches: 12, runs: 20, wickets: 16, catches: 2, avgFantasy: 50, last3Avg: 52 },
  { id: 316, name: 'J Archer', role: 'BOWL', matches: 9, runs: 8, wickets: 12, catches: 0, avgFantasy: 44, last3Avg: 46 },
  { id: 317, name: 'L Livingstone', role: 'AR', matches: 11, runs: 220, wickets: 4, catches: 2, avgFantasy: 46, last3Avg: 48 },
  { id: 318, name: 'P Salt', role: 'BAT', matches: 10, runs: 280, wickets: 0, catches: 4, avgFantasy: 42, last3Avg: 44 },
];

// Australia vs South Africa (match 4) — ids 401–418
const australiaSouthAfricaPastPerformance = [
  { id: 401, name: 'D Warner', role: 'BAT', matches: 14, runs: 410, wickets: 0, catches: 5, avgFantasy: 54, last3Avg: 50 },
  { id: 402, name: 'T Head', role: 'BAT', matches: 14, runs: 390, wickets: 0, catches: 6, avgFantasy: 52, last3Avg: 56 },
  { id: 403, name: 'M Marsh', role: 'AR', matches: 10, runs: 195, wickets: 6, catches: 3, avgFantasy: 48, last3Avg: 52 },
  { id: 404, name: 'P Cummins', role: 'BOWL', matches: 12, runs: 22, wickets: 16, catches: 2, avgFantasy: 50, last3Avg: 48 },
  { id: 405, name: 'A Carey', role: 'WK', matches: 11, runs: 180, wickets: 0, catches: 12, avgFantasy: 38, last3Avg: 36 },
  { id: 406, name: 'M Starc', role: 'BOWL', matches: 12, runs: 12, wickets: 20, catches: 0, avgFantasy: 54, last3Avg: 58 },
  { id: 407, name: 'S Smith', role: 'BAT', matches: 12, runs: 320, wickets: 0, catches: 6, avgFantasy: 46, last3Avg: 44 },
  { id: 408, name: 'C Green', role: 'AR', matches: 11, runs: 155, wickets: 7, catches: 2, avgFantasy: 42, last3Avg: 40 },
  { id: 409, name: 'J Hazlewood', role: 'BOWL', matches: 11, runs: 10, wickets: 15, catches: 1, avgFantasy: 48, last3Avg: 50 },
  { id: 410, name: 'Q de Kock', role: 'WK', matches: 13, runs: 380, wickets: 0, catches: 8, avgFantasy: 52, last3Avg: 56 },
  { id: 411, name: 'H Klaasen', role: 'BAT', matches: 12, runs: 340, wickets: 0, catches: 4, avgFantasy: 50, last3Avg: 54 },
  { id: 412, name: 'A Markram', role: 'AR', matches: 11, runs: 260, wickets: 5, catches: 3, avgFantasy: 48, last3Avg: 50 },
  { id: 413, name: 'K Rabada', role: 'BOWL', matches: 12, runs: 18, wickets: 18, catches: 1, avgFantasy: 52, last3Avg: 54 },
  { id: 414, name: 'K Maharaj', role: 'BOWL', matches: 11, runs: 22, wickets: 12, catches: 2, avgFantasy: 44, last3Avg: 46 },
  { id: 415, name: 'D Miller', role: 'BAT', matches: 12, runs: 290, wickets: 0, catches: 5, avgFantasy: 46, last3Avg: 48 },
  { id: 416, name: 'M Jansen', role: 'AR', matches: 10, runs: 120, wickets: 10, catches: 2, avgFantasy: 44, last3Avg: 46 },
  { id: 417, name: 'T Bavuma', role: 'BAT', matches: 10, runs: 240, wickets: 0, catches: 4, avgFantasy: 40, last3Avg: 38 },
  { id: 418, name: 'A Nortje', role: 'BOWL', matches: 9, runs: 6, wickets: 14, catches: 0, avgFantasy: 48, last3Avg: 50 },
];

// Bangladesh vs New Zealand (match 6) — ids 601–618
const bangladeshNewZealandPastPerformance = [
  { id: 601, name: 'L Das', role: 'BAT', matches: 12, runs: 320, wickets: 0, catches: 4, avgFantasy: 44, last3Avg: 48 },
  { id: 602, name: 'S Hasan', role: 'AR', matches: 11, runs: 180, wickets: 8, catches: 2, avgFantasy: 46, last3Avg: 50 },
  { id: 603, name: 'M Rahim', role: 'WK', matches: 13, runs: 280, wickets: 0, catches: 12, avgFantasy: 42, last3Avg: 44 },
  { id: 604, name: 'T Ahmed', role: 'BOWL', matches: 10, runs: 8, wickets: 16, catches: 0, avgFantasy: 48, last3Avg: 52 },
  { id: 605, name: 'N Hossain', role: 'BAT', matches: 11, runs: 260, wickets: 0, catches: 3, avgFantasy: 40, last3Avg: 42 },
  { id: 606, name: 'M Rahman', role: 'BOWL', matches: 12, runs: 12, wickets: 14, catches: 1, avgFantasy: 44, last3Avg: 46 },
  { id: 607, name: 'M Haque', role: 'BAT', matches: 10, runs: 220, wickets: 0, catches: 2, avgFantasy: 38, last3Avg: 40 },
  { id: 608, name: 'T Islam', role: 'BOWL', matches: 11, runs: 15, wickets: 12, catches: 1, avgFantasy: 42, last3Avg: 44 },
  { id: 609, name: 'S Sarkar', role: 'BAT', matches: 9, runs: 180, wickets: 0, catches: 4, avgFantasy: 36, last3Avg: 34 },
  { id: 610, name: 'K Williamson', role: 'BAT', matches: 14, runs: 420, wickets: 0, catches: 6, avgFantasy: 56, last3Avg: 60 },
  { id: 611, name: 'T Boult', role: 'BOWL', matches: 12, runs: 10, wickets: 18, catches: 0, avgFantasy: 52, last3Avg: 54 },
  { id: 612, name: 'D Conway', role: 'BAT', matches: 11, runs: 312, wickets: 0, catches: 6, avgFantasy: 42, last3Avg: 38 },
  { id: 613, name: 'M Santner', role: 'AR', matches: 11, runs: 140, wickets: 10, catches: 3, avgFantasy: 46, last3Avg: 48 },
  { id: 614, name: 'L Ferguson', role: 'BOWL', matches: 10, runs: 6, wickets: 14, catches: 0, avgFantasy: 48, last3Avg: 50 },
  { id: 615, name: 'G Phillips', role: 'BAT', matches: 12, runs: 300, wickets: 0, catches: 5, avgFantasy: 46, last3Avg: 48 },
  { id: 616, name: 'T Latham', role: 'WK', matches: 11, runs: 240, wickets: 0, catches: 10, avgFantasy: 40, last3Avg: 42 },
  { id: 617, name: 'J Neesham', role: 'AR', matches: 10, runs: 160, wickets: 5, catches: 2, avgFantasy: 42, last3Avg: 44 },
  { id: 618, name: 'M Henry', role: 'BOWL', matches: 9, runs: 8, wickets: 12, catches: 0, avgFantasy: 44, last3Avg: 46 },
];

// Pakistan vs Zimbabwe (match 7) — ids 701–718
const pakistanZimbabwePastPerformance = [
  { id: 701, name: 'B Azam', role: 'BAT', matches: 14, runs: 450, wickets: 0, catches: 5, avgFantasy: 58, last3Avg: 62 },
  { id: 702, name: 'M Rizwan', role: 'WK', matches: 13, runs: 380, wickets: 0, catches: 12, avgFantasy: 52, last3Avg: 54 },
  { id: 703, name: 'S Khan', role: 'AR', matches: 11, runs: 180, wickets: 10, catches: 2, avgFantasy: 50, last3Avg: 52 },
  { id: 704, name: 'S Afridi', role: 'BOWL', matches: 12, runs: 15, wickets: 20, catches: 0, avgFantasy: 54, last3Avg: 58 },
  { id: 705, name: 'H Ali', role: 'BOWL', matches: 10, runs: 10, wickets: 14, catches: 1, avgFantasy: 46, last3Avg: 48 },
  { id: 706, name: 'I Ahmed', role: 'BAT', matches: 11, runs: 280, wickets: 0, catches: 4, avgFantasy: 44, last3Avg: 46 },
  { id: 707, name: 'F Ashraf', role: 'AR', matches: 10, runs: 120, wickets: 6, catches: 2, avgFantasy: 40, last3Avg: 42 },
  { id: 708, name: 'N Shah', role: 'BOWL', matches: 9, runs: 8, wickets: 12, catches: 0, avgFantasy: 44, last3Avg: 46 },
  { id: 709, name: 'I Wasim', role: 'AR', matches: 10, runs: 100, wickets: 8, catches: 1, avgFantasy: 42, last3Avg: 40 },
  { id: 710, name: 'S Raza', role: 'AR', matches: 12, runs: 260, wickets: 6, catches: 3, avgFantasy: 48, last3Avg: 50 },
  { id: 711, name: 'C Ervine', role: 'BAT', matches: 11, runs: 280, wickets: 0, catches: 4, avgFantasy: 42, last3Avg: 44 },
  { id: 712, name: 'S Williams', role: 'BAT', matches: 10, runs: 240, wickets: 0, catches: 3, avgFantasy: 40, last3Avg: 38 },
  { id: 713, name: 'B Muzarabani', role: 'BOWL', matches: 11, runs: 12, wickets: 14, catches: 0, avgFantasy: 46, last3Avg: 48 },
  { id: 714, name: 'R Burl', role: 'BAT', matches: 10, runs: 200, wickets: 0, catches: 2, avgFantasy: 36, last3Avg: 34 },
  { id: 715, name: 'W Madhevere', role: 'AR', matches: 9, runs: 150, wickets: 4, catches: 2, avgFantasy: 38, last3Avg: 40 },
  { id: 716, name: 'J Ball', role: 'BOWL', matches: 8, runs: 6, wickets: 10, catches: 0, avgFantasy: 40, last3Avg: 42 },
  { id: 717, name: 'M Shumba', role: 'BAT', matches: 8, runs: 160, wickets: 0, catches: 3, avgFantasy: 34, last3Avg: 32 },
  { id: 718, name: 'T Kamunhukamwe', role: 'BAT', matches: 9, runs: 180, wickets: 0, catches: 2, avgFantasy: 36, last3Avg: 34 },
];

// England vs New Zealand (match 8) — ids 801–818
const englandNewZealandPastPerformance = [
  { id: 801, name: 'J Root', role: 'BAT', matches: 14, runs: 400, wickets: 0, catches: 5, avgFantasy: 52, last3Avg: 56 },
  { id: 802, name: 'J Bairstow', role: 'WK', matches: 12, runs: 320, wickets: 0, catches: 10, avgFantasy: 48, last3Avg: 50 },
  { id: 803, name: 'B Stokes', role: 'AR', matches: 11, runs: 180, wickets: 6, catches: 3, avgFantasy: 50, last3Avg: 54 },
  { id: 804, name: 'J Archer', role: 'BOWL', matches: 9, runs: 8, wickets: 12, catches: 0, avgFantasy: 44, last3Avg: 46 },
  { id: 805, name: 'A Rashid', role: 'BOWL', matches: 12, runs: 20, wickets: 16, catches: 2, avgFantasy: 50, last3Avg: 52 },
  { id: 806, name: 'J Buttler', role: 'BAT', matches: 13, runs: 380, wickets: 0, catches: 6, avgFantasy: 54, last3Avg: 58 },
  { id: 807, name: 'M Wood', role: 'BOWL', matches: 10, runs: 12, wickets: 14, catches: 1, avgFantasy: 46, last3Avg: 48 },
  { id: 808, name: 'L Livingstone', role: 'AR', matches: 11, runs: 220, wickets: 4, catches: 2, avgFantasy: 46, last3Avg: 48 },
  { id: 809, name: 'P Salt', role: 'BAT', matches: 10, runs: 280, wickets: 0, catches: 4, avgFantasy: 42, last3Avg: 44 },
  { id: 810, name: 'K Williamson', role: 'BAT', matches: 14, runs: 420, wickets: 0, catches: 6, avgFantasy: 56, last3Avg: 60 },
  { id: 811, name: 'T Boult', role: 'BOWL', matches: 12, runs: 10, wickets: 18, catches: 0, avgFantasy: 52, last3Avg: 54 },
  { id: 812, name: 'D Conway', role: 'BAT', matches: 11, runs: 312, wickets: 0, catches: 6, avgFantasy: 42, last3Avg: 38 },
  { id: 813, name: 'M Santner', role: 'AR', matches: 11, runs: 140, wickets: 10, catches: 3, avgFantasy: 46, last3Avg: 48 },
  { id: 814, name: 'L Ferguson', role: 'BOWL', matches: 10, runs: 6, wickets: 14, catches: 0, avgFantasy: 48, last3Avg: 50 },
  { id: 815, name: 'G Phillips', role: 'BAT', matches: 12, runs: 300, wickets: 0, catches: 5, avgFantasy: 46, last3Avg: 48 },
  { id: 816, name: 'T Latham', role: 'WK', matches: 11, runs: 240, wickets: 0, catches: 10, avgFantasy: 40, last3Avg: 42 },
  { id: 817, name: 'J Neesham', role: 'AR', matches: 10, runs: 160, wickets: 5, catches: 2, avgFantasy: 42, last3Avg: 44 },
  { id: 818, name: 'M Henry', role: 'BOWL', matches: 9, runs: 8, wickets: 12, catches: 0, avgFantasy: 44, last3Avg: 46 },
];

// IPL 2025 past performance (MI & CSK players) — for match 9
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

const playerStatsByMatch = {
  1: indiaAustraliaPastPerformance,
  2: indiaAustraliaPastPerformance,
  3: indiaEnglandPastPerformance,
  4: australiaSouthAfricaPastPerformance,
  5: indiaAustraliaPastPerformance,
  6: bangladeshNewZealandPastPerformance,
  7: pakistanZimbabwePastPerformance,
  8: englandNewZealandPastPerformance,
  9: ipl2025PastPerformance,
};

function hashToUnit(str) {
  let n = 0;
  for (let i = 0; i < str.length; i++) n = (n * 31 + str.charCodeAt(i)) >>> 0;
  return (n % 10_000) / 10_000; // 0..0.9999
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function synthesizePastStatsFromPlayer(p) {
  const role = p.role;
  const credit = Number(p.credit ?? 8);
  const seed = hashToUnit(`${p.id}-${p.name}-${role}-${credit}`);

  const baseByRole = role === 'WK' ? 38 : role === 'BAT' ? 42 : role === 'AR' ? 46 : 44; // BOWL default
  const creditBoost = (credit - 8) * 3;
  const noise = Math.round((seed * 2 - 1) * 6); // -6..+6

  const avgFantasy = clamp(baseByRole + creditBoost + noise, 18, 78);
  const formNoise = Math.round(((1 - seed) * 2 - 1) * 8); // -8..+8
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
}

function fillPastStatsForMatch(matchId, stats, matchPlayers) {
  if (!Array.isArray(matchPlayers) || matchPlayers.length === 0) return stats ?? [];
  const byId = new Map((stats ?? []).map((s) => [Number(s.id), s]));
  return matchPlayers.map((p) => {
    const existing = byId.get(Number(p.id));
    return existing ?? synthesizePastStatsFromPlayer(p);
  });
}

app.get('/api/matches/:id/player-stats', (req, res) => {
  const id = Number(req.params.id);
  const stats = playerStatsByMatch[id];
  const matchPlayers = players[id];
  if (stats) return res.json(fillPastStatsForMatch(id, stats, matchPlayers));
  res.status(404).json({ error: 'Past performance data not available for this match' });
});

app.get('/api/matches', async (req, res) => {
  const forceRefresh = req.query.refresh === '1';
  const iccMatches = await fetchIccMatches({ forceRefresh });
  // Our seeded matches first, then live ICC matches.
  res.json([...matches, ...iccMatches]);
});

app.get('/api/matches/:id', (req, res) => {
  const match = matches.find((m) => m.id === Number(req.params.id));
  if (!match) return res.status(404).json({ error: 'Match not found' });
  res.json(match);
});

app.get('/api/matches/:id/players', (req, res) => {
  const id = Number(req.params.id);
  const list = players[id];
  if (!list) return res.status(404).json({ error: 'Players not available for this match' });
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
