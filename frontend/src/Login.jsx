import { useState } from 'react'
import { colors, radius } from './styles'

const API = import.meta.env.VITE_API_URL

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const res = await fetch(`${API}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
        credentials: 'include',
      })
      if (!res.ok) throw new Error('Invalid credentials')
      onLogin()
    } catch {
      setError('Invalid username or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: colors.background, fontFamily: "'Inter', sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ width: '100%', maxWidth: '22rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: colors.primary, margin: '0 0 0.25rem', letterSpacing: '-0.02em' }}>Agonas</h1>
          <p style={{ fontSize: '0.85rem', color: colors.onSurfaceVariant, margin: 0 }}>Management Console</p>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
            style={{ padding: '0.75rem 1rem', fontSize: '0.9rem', color: colors.onSurface, background: colors.surfaceContainerLowest, border: '1px solid rgba(114,121,115,0.3)', borderRadius: radius.xl, outline: 'none', fontFamily: 'inherit', width: '100%', boxSizing: 'border-box' }}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            style={{ padding: '0.75rem 1rem', fontSize: '0.9rem', color: colors.onSurface, background: colors.surfaceContainerLowest, border: '1px solid rgba(114,121,115,0.3)', borderRadius: radius.xl, outline: 'none', fontFamily: 'inherit', width: '100%', boxSizing: 'border-box' }}
          />
          {error && <p style={{ color: colors.error, fontSize: '0.8rem', margin: 0, textAlign: 'center' }}>{error}</p>}
          <button
            type="submit"
            disabled={loading}
            style={{ padding: '0.875rem', background: loading ? colors.surfaceContainer : colors.primary, color: '#fff', border: 'none', borderRadius: radius.xl, fontSize: '0.875rem', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', marginTop: '0.25rem' }}
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  )
}
