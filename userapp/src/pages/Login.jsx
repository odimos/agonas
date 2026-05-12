import { useState } from 'react'
import { useUser } from '../UserContext'
import { colors, radius } from '../styles'

const GHOST = '1px solid rgba(194,200,194,0.2)'

export default function Login() {
  const { login } = useUser()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await login(username, password)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100dvh', background: colors.background, fontFamily: "'Inter', sans-serif", color: colors.onSurface, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ width: '100%', maxWidth: '22rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ textAlign: 'center' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '3rem', color: colors.tertiary, fontVariationSettings: "'FILL' 1" }}>sports_soccer</span>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: colors.onSurface, margin: '0.5rem 0 0.25rem', textTransform: 'uppercase', letterSpacing: '-0.02em' }}>Agonas</h1>
          <p style={{ fontSize: '0.8rem', color: colors.onSurfaceVariant, margin: 0 }}>Sign in to continue</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
            style={{ padding: '0.75rem 1rem', fontSize: '0.9rem', color: colors.onSurface, background: colors.surfaceContainerLowest, border: GHOST, borderRadius: radius.xl, outline: 'none', fontFamily: 'inherit', width: '100%', boxSizing: 'border-box' }}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            style={{ padding: '0.75rem 1rem', fontSize: '0.9rem', color: colors.onSurface, background: colors.surfaceContainerLowest, border: GHOST, borderRadius: radius.xl, outline: 'none', fontFamily: 'inherit', width: '100%', boxSizing: 'border-box' }}
          />
          {error && <p style={{ color: colors.error, fontSize: '0.8rem', margin: 0, textAlign: 'center' }}>{error}</p>}
          <button
            type="submit"
            disabled={loading}
            style={{ padding: '0.875rem', background: loading ? colors.surfaceContainer : colors.tertiary, color: loading ? colors.onSurfaceVariant : '#fff', border: 'none', borderRadius: radius.xl, fontSize: '0.875rem', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', letterSpacing: '0.04em', marginTop: '0.25rem' }}
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  )
}
