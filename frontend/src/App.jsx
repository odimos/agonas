import { useState, useEffect } from 'react'
import Theme from './Theme'
import Login from './Login'

const API = import.meta.env.VITE_API_URL

function App() {
  const [authed, setAuthed] = useState(null) // null = loading

  useEffect(() => {
    fetch(`${API}/auth/me`, { credentials: 'include' })
      .then(r => setAuthed(r.ok))
      .catch(() => setAuthed(false))
  }, [])

  if (authed === null) return null // brief loading flash

  if (!authed) return <Login onLogin={() => setAuthed(true)} />

  return <Theme />
}

export default App
