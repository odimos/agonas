import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Calendar from './pages/Calendar'
import User from './pages/User'
import Team from './pages/Team'
import Notifications from './pages/Notifications'
import RefereeForm from './pages/RefereeForm'

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
      </Routes>
    </BrowserRouter>
  )
}
