import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import BottomNav from '../components/BottomNav'
import { colors, radius } from '../styles'

const GHOST = '1px solid rgba(194,200,194,0.2)'
const API = '/app/api'
const SHORT_MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

function fmtDate(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  return `${SHORT_MONTHS[d.getMonth()]} ${d.getDate()}`
}

const RESULT_BORDER = { win: colors.tertiary, draw: colors.outline, loss: colors.error }
const RESULT_COLOR  = { win: colors.tertiary, draw: colors.onSurfaceVariant, loss: colors.error }
const RESULT_LABEL  = { win: 'Win', draw: 'Draw', loss: 'Loss' }

export default function TeamProfile() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [teamData, setTeamData] = useState(null)
  const [matches, setMatches] = useState([])
  const [squadOpen, setSquadOpen] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    Promise.all([
      fetch(`${API}/team/${id}/info`).then(r => r.ok ? r.json() : Promise.reject('not found')),
      fetch(`${API}/team/${id}/matches`).then(r => r.ok ? r.json() : []),
    ]).then(([info, ms]) => {
      setTeamData(info)
      setMatches(ms.filter(m => m.status === 'finished').sort((a, b) => new Date(b.scheduled_at) - new Date(a.scheduled_at)))
    }).catch(() => setError('Team not found'))
  }, [id])

  if (error) return (
    <div style={{ minHeight: '100dvh', background: colors.background, fontFamily: "'Inter', sans-serif", display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
      <p style={{ color: colors.error }}>{error}</p>
      <button onClick={() => navigate(-1)} style={{ color: colors.tertiary, background: 'none', border: `1.5px solid ${colors.tertiary}`, borderRadius: radius.full, padding: '0.5rem 1.5rem', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.8rem', fontWeight: 700 }}>Go Back</button>
    </div>
  )

  if (!teamData) return (
    <div style={{ minHeight: '100dvh', background: colors.background, fontFamily: "'Inter', sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ color: colors.onSurfaceVariant, fontSize: '0.9rem' }}>Loading…</span>
    </div>
  )

  const { name, players = [], wins, draws, losses, tournaments = [] } = teamData

  return (
    <div style={{ minHeight: '100dvh', background: colors.background, fontFamily: "'Inter', sans-serif", color: colors.onSurface }}>
      <header style={{ position: 'fixed', top: 0, left: 0, width: '100%', boxSizing: 'border-box', zIndex: 50, display: 'flex', alignItems: 'center', padding: '0 1rem', height: '3.5rem', background: `${colors.surface}cc`, backdropFilter: 'blur(12px)', borderBottom: GHOST }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: colors.primary, display: 'flex', alignItems: 'center', padding: '0.25rem', marginLeft: '-0.25rem' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '1.25rem' }}>arrow_back</span>
        </button>
        <h1 style={{ fontSize: '0.875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: colors.primary, margin: '0 auto' }}>{name}</h1>
        <div style={{ width: '1.75rem' }} />
      </header>

      <main style={{ paddingTop: '3.5rem', paddingBottom: '5rem' }}>
        {/* Hero */}
        <div style={{ height: '7rem', background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary}, ${colors.tertiary})` }} />

        <section style={{ padding: '1rem 1.5rem 0', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: colors.onSurface, margin: '0 0 1rem', letterSpacing: '-0.02em' }}>{name}</h2>
        </section>

        {/* Stats */}
        <section style={{ padding: '0 1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
            {[
              { value: wins,   label: 'Won',   color: colors.tertiary        },
              { value: draws,  label: 'Drawn', color: colors.onSurfaceVariant },
              { value: losses, label: 'Lost',  color: colors.error            },
            ].map(({ value, label, color }) => (
              <div key={label} style={{ background: colors.surfaceContainerLowest, border: GHOST, borderRadius: radius.xl, padding: '0.75rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.125rem' }}>
                <span style={{ fontSize: '1.875rem', fontWeight: 900, color }}>{value}</span>
                <span style={{ fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: colors.onSurfaceVariant }}>{label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Squad */}
        <section style={{ marginTop: '1.25rem', padding: '0 1rem' }}>
          <button
            onClick={() => setSquadOpen(o => !o)}
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: colors.surfaceContainerLowest, border: GHOST, borderRadius: squadOpen ? `${radius.xl} ${radius.xl} 0 0` : radius.xl, padding: '0.75rem 1rem', cursor: 'pointer' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '1.1rem', color: colors.tertiary, fontVariationSettings: "'FILL' 1" }}>person</span>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: colors.onSurface }}>Players ({players.length})</span>
            </div>
            <span className="material-symbols-outlined" style={{ fontSize: '1.1rem', color: colors.onSurfaceVariant, transition: 'transform 0.2s', transform: squadOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>expand_more</span>
          </button>
          {squadOpen && (
            <div style={{ background: colors.surfaceContainerLowest, border: GHOST, borderTop: 'none', borderRadius: `0 0 ${radius.xl} ${radius.xl}`, overflow: 'hidden' }}>
              {players.map((p, i) => (
                <div
                  key={p.id}
                  onClick={() => navigate(`/player/${p.id}`)}
                  style={{ padding: '0.625rem 1rem', borderTop: i === 0 ? 'none' : GHOST, fontSize: '0.875rem', fontWeight: 500, color: colors.onSurface, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                >
                  <span>{p.first_name} {p.last_name}{p.nickname ? ` · ${p.nickname}` : ''}</span>
                  <span className="material-symbols-outlined" style={{ fontSize: '1rem', color: colors.onSurfaceVariant }}>chevron_right</span>
                </div>
              ))}
              {players.length === 0 && <div style={{ padding: '0.75rem 1rem', fontSize: '0.875rem', color: colors.onSurfaceVariant }}>No players</div>}
            </div>
          )}
        </section>

        {/* Tournaments */}
        {tournaments.length > 0 && (
          <section style={{ padding: '1.25rem 1rem 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '1.1rem', color: colors.tertiary, fontVariationSettings: "'FILL' 1" }}>emoji_events</span>
              <h2 style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: colors.onSurface, margin: 0 }}>Tournaments</h2>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {tournaments.map(tour => {
                const isKnockout = tour.type === 'knockout'
                const openPhase = tour.phases.find(p => p.is_open)
                const lastPhase = tour.phases[tour.phases.length - 1]
                const displayPhase = openPhase || lastPhase
                return (
                  <div key={tour.id} style={{ background: colors.surfaceContainerLowest, border: GHOST, borderRadius: radius.xl, overflow: 'hidden', opacity: !openPhase ? 0.65 : 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', borderBottom: GHOST, background: `${colors.surfaceContainerLow}99` }}>
                      <span style={{ fontSize: '0.875rem', fontWeight: 700, color: colors.onSurface }}>{tour.name}</span>
                      <span style={{ fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', color: colors.onSurfaceVariant }}>{isKnockout ? 'Knockout' : 'League'}</span>
                    </div>
                    <div style={{ padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div>
                        <span style={{ fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', color: colors.onSurfaceVariant, display: 'block', marginBottom: '0.25rem' }}>
                          {openPhase ? 'Current Phase' : (isKnockout ? 'Eliminated at' : 'Completed')}
                        </span>
                        <span style={{ fontSize: '0.875rem', fontWeight: 700, color: colors.onSurface }}>Phase {displayPhase?.order}</span>
                      </div>
                      {!openPhase && isKnockout && (
                        <span style={{ fontSize: '0.625rem', fontWeight: 700, color: colors.error, background: `${colors.errorContainer}80`, padding: '0.25rem 0.5rem', borderRadius: radius.full, textTransform: 'uppercase' }}>Eliminated</span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* Match History */}
        {matches.length > 0 && (
          <section style={{ padding: '1.25rem 1rem 1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '1.1rem', color: colors.onSurfaceVariant, fontVariationSettings: "'FILL' 1" }}>history</span>
              <h2 style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: colors.onSurface, margin: 0 }}>Match History</h2>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {matches.map(m => (
                <div key={m.id} style={{ background: colors.surfaceContainerLowest, border: GHOST, borderRadius: radius.xl, overflow: 'hidden', display: 'flex', borderLeft: `4px solid ${RESULT_BORDER[m.result] || colors.outline}` }}>
                  <div style={{ flex: 1, padding: '0.75rem 1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                      <span
                        onClick={() => navigate(`/team/${m.home_team_id}`)}
                        style={{ fontSize: '0.875rem', fontWeight: 700, color: colors.onSurface, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', cursor: 'pointer', textDecoration: 'none' }}
                      >{m.home_team_name}</span>
                      <span style={{ fontFamily: 'monospace', fontSize: '1rem', fontWeight: 900, color: colors.onSurface, flexShrink: 0 }}>{m.team_score} – {m.opp_score}</span>
                      <span
                        onClick={() => navigate(`/team/${m.away_team_id}`)}
                        style={{ fontSize: '0.875rem', fontWeight: 700, color: colors.onSurface, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: 'right', cursor: 'pointer', textDecoration: 'none' }}
                      >{m.away_team_name}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.25rem' }}>
                      <span style={{ fontSize: '0.625rem', color: colors.onSurfaceVariant }}>{m.venue}</span>
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.625rem', color: colors.onSurfaceVariant }}>{fmtDate(m.scheduled_at)}</span>
                        <span style={{ fontSize: '0.625rem', fontWeight: 700, color: RESULT_COLOR[m.result] || colors.onSurfaceVariant, textTransform: 'uppercase' }}>{RESULT_LABEL[m.result] || ''}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      <BottomNav />
    </div>
  )
}
