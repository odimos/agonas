import { Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import RefereesPage from './pages/RefereesPage'
import StadiumsPage from './pages/StadiumsPage'
import PlayersPage from './pages/PlayersPage'

function App() {
  return (
    <Routes>
      <Route path="/home" element={<HomePage />} />
      <Route path="/referees" element={<RefereesPage />} />
      <Route path="/stadiums" element={<StadiumsPage />} />
      <Route path="/players" element={<PlayersPage />} />
    </Routes>
  )
}

export default App
