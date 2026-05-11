import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Calendar from './pages/Calendar'
import User from './pages/User'
import Team from './pages/Team'
import Notifications from './pages/Notifications'
import RefereeForm from './pages/RefereeForm'
import Forms from './pages/Forms'
import Settings from './pages/Settings'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/calendar" replace />} />
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/user" element={<User />} />
        <Route path="/team" element={<Team />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/referee-form" element={<RefereeForm />} />
        <Route path="/forms" element={<Forms />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </BrowserRouter>
  )
}
