import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { colors, radius } from '../styles'

const GHOST = '1px solid rgba(194,200,194,0.2)'
const SHORT_MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const API = '/app/api'

function fmt(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  return `${SHORT_MONTHS[d.getMonth()]} ${d.getDate()}`
}

export default function Forms() {
  const navigate = useNavigate()
  const [openForms, setOpenForms] = useState([])
  const [submittedForms, setSubmittedForms] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch(`${API}/referee/matches/open`).then(r => r.ok ? r.json() : []),
      fetch(`${API}/referee/matches/submitted`).then(r => r.ok ? r.json() : []),
    ]).then(([open, submitted]) => {
      setOpenForms(open)
      setSubmittedForms(submitted)
    }).finally(() => setLoading(false))
  }, [])

  return (
    <div style={{ minHeight: '100dvh', background: colors.background, fontFamily: "'Inter', sans-serif", color: colors.onSurface }}>
      <header style={{ position: 'sticky', top: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 1rem', height: '3.5rem', background: `${colors.surface}e6`, backdropFilter: 'blur(12px)', borderBottom: GHOST, boxSizing: 'border-box' }}>
        <button onClick={() => navigate('/user')} style={{ color: colors.primary, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', padding: '0.25rem' }}>
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <span style={{ fontSize: '0.875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: colors.primary }}>Forms</span>
        <div style={{ width: '2rem' }} />
      </header>

      <main style={{ paddingTop: '3.5rem', paddingBottom: '5rem' }}>

        {/* Open forms */}
        <section style={{ padding: '1rem 1rem 0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '1.1rem', color: colors.tertiary, fontVariationSettings: "'FILL' 1" }}>pending_actions</span>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: colors.onSurface }}>Open</span>
            {!loading && <span style={{ fontSize: '0.65rem', fontWeight: 700, background: colors.error, color: '#fff', borderRadius: '1rem', padding: '0.1rem 0.45rem' }}>{openForms.length}</span>}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {loading ? (
              <p style={{ fontSize: '0.875rem', color: colors.onSurfaceVariant, textAlign: 'center', padding: '1rem 0', margin: 0 }}>Loading…</p>
            ) : openForms.length === 0 ? (
              <p style={{ fontSize: '0.875rem', color: colors.onSurfaceVariant, textAlign: 'center', padding: '1rem 0', margin: 0 }}>No open forms</p>
            ) : openForms.map(f => (
              <div
                key={f.id}
                onClick={() => navigate(`/referee-form/${f.id}`)}
                style={{ background: colors.surfaceContainerLowest, border: GHOST, borderLeft: `3px solid ${colors.tertiary}`, borderRadius: radius.xl, padding: '0.75rem 1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.875rem', fontWeight: 700, color: colors.onSurface, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.home_team_name} vs {f.away_team_name}</div>
                  <div style={{ fontSize: '0.65rem', color: colors.onSurfaceVariant, marginTop: '0.2rem' }}>{fmt(f.scheduled_at)}{f.stadium_name ? ` · ${f.stadium_name}` : ''}</div>
                </div>
                <span className="material-symbols-outlined" style={{ fontSize: '1rem', color: colors.onSurfaceVariant, flexShrink: 0 }}>chevron_right</span>
              </div>
            ))}
          </div>
        </section>

        <div style={{ margin: '0.5rem 1rem', borderTop: GHOST }} />

        {/* Submitted forms */}
        <section style={{ padding: '0.5rem 1rem 1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '1.1rem', color: colors.onSurfaceVariant, fontVariationSettings: "'FILL' 1" }}>task_alt</span>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: colors.onSurface }}>Submitted</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {!loading && submittedForms.length === 0 && (
              <p style={{ fontSize: '0.875rem', color: colors.onSurfaceVariant, textAlign: 'center', padding: '1rem 0', margin: 0 }}>No submitted forms</p>
            )}
            {submittedForms.map(f => (
              <div
                key={f.id}
                style={{ background: colors.surfaceContainerLowest, border: GHOST, borderLeft: `3px solid ${colors.outlineVariant}`, borderRadius: radius.xl, padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', opacity: 0.75 }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.875rem', fontWeight: 700, color: colors.onSurface, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.home_team_name} vs {f.away_team_name}</div>
                  <div style={{ fontSize: '0.65rem', color: colors.onSurfaceVariant, marginTop: '0.2rem' }}>{fmt(f.scheduled_at)}{f.stadium_name ? ` · ${f.stadium_name}` : ''}</div>
                </div>
                <span style={{ fontSize: '0.6rem', fontWeight: 700, color: colors.tertiary, textTransform: 'uppercase', letterSpacing: '0.05em', flexShrink: 0 }}>Submitted</span>
              </div>
            ))}
          </div>
        </section>

      </main>

      
    </div>
  )
}
