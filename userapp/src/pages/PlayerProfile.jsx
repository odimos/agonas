import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { colors, radius } from '../styles'

const GHOST = '1px solid rgba(194,200,194,0.2)'
const API = '/app/api'

const PHOTO_URL = 'https://lh3.googleusercontent.com/aida-public/AB6AXuCBkCHnAwmADB4NVNQl029WFv6xEjDW2ujhKW1D5szW1EdUo9ag9ORUcUCLaUe9DMvbJiY8BPok1c2xCeHmNuaV5_wjrimUUTomUrObt4xbRwxFj2DFuw1lSNEZt0_G-70h4qXyNPS2zW_PnJEuAtK7mcSeHqltTrFcmOBbajPqTHtgMb5243h_kGpJAkBl_F5A7vyL2RhSR7HN4UcOQwwVi44NnCMAdi_qEEvwuYu2_sxcXoxptbfBmZPuC-HxYcsMX2BCqiHLVKw'

const SHORT_MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

function fmtDate(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  return `${d.getDate()} ${SHORT_MONTHS[d.getMonth()].toUpperCase()} ${d.getFullYear()}`
}

export default function PlayerProfile() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [player, setPlayer] = useState(null)
  const [recentMatches, setRecentMatches] = useState([])
  const [error, setError] = useState(null)

  useEffect(() => {
    fetch(`${API}/players/${id}/profile`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(p => {
        setPlayer(p)
        if (p.team_id) {
          fetch(`${API}/team/${p.team_id}/matches`)
            .then(r => r.ok ? r.json() : [])
            .then(matches => {
              const finished = matches
                .filter(m => m.status === 'finished')
                .sort((a, b) => new Date(b.scheduled_at) - new Date(a.scheduled_at))
                .slice(0, 3)
              setRecentMatches(finished)
            })
        }
      })
      .catch(() => setError('Player not found'))
  }, [id])

  const RESULT_CFG = {
    win:  { border: colors.tertiary,        color: colors.tertiary,        label: 'Win'  },
    draw: { border: colors.outline,         color: colors.onSurfaceVariant, label: 'Draw' },
    loss: { border: colors.error,           color: colors.error,           label: 'Loss' },
  }

  if (error) return (
    <div style={{ minHeight: '100dvh', background: colors.background, fontFamily: "'Inter', sans-serif", display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
      <p style={{ color: colors.error }}>{error}</p>
      <button onClick={() => navigate(-1)} style={{ color: colors.tertiary, background: 'none', border: `1.5px solid ${colors.tertiary}`, borderRadius: radius.full, padding: '0.5rem 1.5rem', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.8rem', fontWeight: 700 }}>Go Back</button>
    </div>
  )

  if (!player) return (
    <div style={{ minHeight: '100dvh', background: colors.background, fontFamily: "'Inter', sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ color: colors.onSurfaceVariant, fontSize: '0.9rem' }}>Loading…</span>
    </div>
  )

  const fullName = `${player.first_name} ${player.last_name}`

  return (
    <div style={{ minHeight: '100dvh', background: colors.background, fontFamily: "'Inter', sans-serif", color: colors.onSurface }}>
      {/* TopAppBar — same as /user but with back arrow */}
      <header style={{ position: 'sticky', top: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 1rem', height: '3.5rem', background: `${colors.surface}cc`, backdropFilter: 'blur(12px)', borderBottom: GHOST, boxSizing: 'border-box' }}>
        <button onClick={() => navigate(-1)} style={{ fontSize: '0.8rem', fontWeight: 600, color: colors.primary, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>arrow_back</span>
        </button>
        <div style={{ width: '2rem' }} />
      </header>

      <main style={{ paddingTop: '3.5rem', paddingBottom: '5rem' }}>
        {/* Hero — identical to /user */}
        <div style={{ position: 'relative' }}>
          <div style={{ height: '8rem', background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary}, ${colors.tertiary})` }} />
          <div style={{ position: 'absolute', left: '50%', transform: 'translate(-50%, 50%)', bottom: 0 }}>
            <div style={{ width: '6rem', height: '6rem', borderRadius: '50%', overflow: 'hidden', border: `4px solid ${colors.surface}`, boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
              <img src={PHOTO_URL} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          </div>
        </div>

        {/* Identity — identical structure to /user */}
        <section style={{ marginTop: '4rem', padding: '0 1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '0.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.025em', color: colors.onSurface, margin: 0, textTransform: 'uppercase' }}>{fullName}</h2>
          {player.nickname && <p style={{ fontSize: '0.875rem', color: colors.onSurfaceVariant, lineHeight: 1.5, maxWidth: '20rem', margin: 0 }}>"{player.nickname}"</p>}
          {player.team_name && (
            <div
              onClick={() => navigate(`/team/${player.team_id}`)}
              style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.25rem 0.75rem', background: colors.secondaryContainer, borderRadius: radius.full, marginTop: '0.25rem', cursor: 'pointer' }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '1rem', color: colors.onSecondaryContainer, fontVariationSettings: "'FILL' 1" }}>shield</span>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: colors.onSecondaryContainer, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{player.team_name}</span>
            </div>
          )}
        </section>

        {/* Stats — same 2-column grid as /user */}
        <section style={{ padding: '1.5rem 1rem 0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          {/* Goals — same as /user */}
          <div style={{ background: colors.surfaceContainerLowest, border: GHOST, borderRadius: radius.xl, padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginBottom: '0.25rem' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '1.1rem', color: colors.tertiary, fontVariationSettings: "'FILL' 1" }}>sports_soccer</span>
              <span style={{ fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: colors.onSurfaceVariant }}>Goals</span>
            </div>
            <span style={{ fontSize: '3rem', fontWeight: 900, color: colors.onSurface, lineHeight: 1 }}>{player.goals}</span>
          </div>

          {/* Cards — same style as awards box in /user */}
          <div style={{ background: colors.surfaceContainerLowest, border: GHOST, borderRadius: radius.xl, padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginBottom: '0.25rem' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '1.1rem', color: colors.tertiary, fontVariationSettings: "'FILL' 1" }}>style</span>
              <span style={{ fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: colors.onSurfaceVariant }}>Cards</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                <div style={{ width: '0.6rem', height: '0.85rem', borderRadius: '0.1rem', background: '#f59e0b' }} />
                <span style={{ fontSize: '0.75rem', color: colors.onSurfaceVariant }}>Yellow</span>
              </div>
              <span style={{ fontSize: '0.875rem', fontWeight: 700, color: colors.onSurface }}>{player.yellow_cards}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                <div style={{ width: '0.6rem', height: '0.85rem', borderRadius: '0.1rem', background: colors.error }} />
                <span style={{ fontSize: '0.75rem', color: colors.onSurfaceVariant }}>Red</span>
              </div>
              <span style={{ fontSize: '0.875rem', fontWeight: 700, color: colors.onSurface }}>{player.red_cards}</span>
            </div>
          </div>
        </section>

        {/* Recent matches — same as /user */}
        {recentMatches.length > 0 && (
          <section style={{ padding: '1rem 1rem 0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: colors.onSurface }}>Recent Matches</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {recentMatches.map(m => {
                const { border, color, label } = RESULT_CFG[m.result] || {}
                return (
                  <div key={m.id} style={{ background: colors.surfaceContainerLowest, borderRadius: radius.xl, overflow: 'hidden', display: 'flex', border: GHOST, borderLeft: `4px solid ${border}` }}>
                    <div style={{ flex: 1, padding: '0.75rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.125rem' }}>
                      <span style={{ fontSize: '0.875rem', fontWeight: 700, color: colors.onSurface }}>{m.opponent}</span>
                      <span style={{ fontSize: '0.625rem', color: colors.onSurfaceVariant }}>{fmtDate(m.scheduled_at)}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0 1rem' }}>
                      <span style={{ fontFamily: 'monospace', fontSize: '0.875rem', fontWeight: 700, color: colors.onSurface }}>{m.team_score} – {m.opp_score}</span>
                      <span style={{ fontSize: '0.625rem', fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        )}
      </main>

      
    </div>
  )
}
