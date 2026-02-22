import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { Home } from './pages/Home';
import { CreateTeam } from './pages/CreateTeam';
import { ContestDetail } from './pages/ContestDetail';
import { LeaderboardPage } from './pages/LeaderboardPage';
import { PrizesPage } from './pages/PrizesPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="leaderboard" element={<LeaderboardPage />} />
          <Route path="prizes" element={<PrizesPage />} />
          <Route path="match/:matchId/create-team" element={<CreateTeam />} />
          <Route
            path="match/:matchId/contest/:contestId"
            element={<ContestDetail />}
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
