import { Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import RefereesPage from './pages/RefereesPage'

function App() {
  return (
    <Routes>
      
      <Route path="/home" element={<HomePage />} />
      <Route path="/referees" element={<RefereesPage />} />
    </Routes>
  )
}

export default App
