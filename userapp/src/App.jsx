import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { UserProvider, useUser } from './UserContext'
import { LangProvider } from './LangContext'
import Login from './pages/Login'
import Calendar from './pages/Calendar'
import User from './pages/User'
import Team from './pages/Team'
import Notifications from './pages/Notifications'
import RefereeForm from './pages/RefereeForm'
import Forms from './pages/Forms'
import Settings from './pages/Settings'
import TeamProfile from './pages/TeamProfile'
import PlayerProfile from './pages/PlayerProfile'
import Home from './pages/Home'
import { colors } from './styles'

function AppRoutes() {
  const { user } = useUser()

  if (user === undefined) {
    return (
      <div style={{ minHeight: '100dvh', background: colors.background, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ color: colors.onSurfaceVariant, fontFamily: "'Inter', sans-serif", fontSize: '0.9rem' }}>Loading…</span>
      </div>
    )
  }

  if (!user) {
    return <Login />
  }

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/calendar" element={<Calendar />} />
      <Route path="/user" element={<User />} />
      {user.is_player && <Route path="/team" element={<Team />} />}
      <Route path="/notifications" element={<Notifications />} />
      <Route path="/referee-form/:id" element={<RefereeForm />} />
      <Route path="/forms" element={<Forms />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/team/:id" element={<TeamProfile />} />
      <Route path="/player/:id" element={<PlayerProfile />} />
      <Route path="*" element={<Navigate to="/calendar" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <LangProvider>
        <UserProvider>
          <AppRoutes />
        </UserProvider>
      </LangProvider>
    </BrowserRouter>
  )
}
