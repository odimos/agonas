import { Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import RefereesPage from './pages/RefereesPage'
import StadiumsPage from './pages/StadiumsPage'
import PlayersPage from './pages/PlayersPage'
import TeamsPage from './pages/TeamsPage'
import MatchesPage from './pages/MatchesPage'

function App() {
  return (
    <Routes>
      <Route path="/home" element={<HomePage />} />
      <Route path="/referees" element={<RefereesPage />} />
      <Route path="/stadiums" element={<StadiumsPage />} />
      <Route path="/players" element={<PlayersPage />} />
      <Route path="/teams" element={<TeamsPage />} />
      <Route path="/matches" element={<MatchesPage />} />
    </Routes>
  )
}

export default App
