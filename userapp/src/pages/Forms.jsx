import { useNavigate } from 'react-router-dom'
import BottomNav from '../components/BottomNav'
import { colors, radius } from '../styles'

const GHOST = '1px solid rgba(194,200,194,0.2)'
const SHORT_MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

function fmt(date) {
  return `${SHORT_MONTHS[date.getMonth()]} ${date.getDate()}`
}

const OPEN_FORMS = [
  {
    id: 1,
    match: 'Team North vs FC Riviera',
    date: new Date(2026, 3, 22),
    venue: 'Stadium Nord',
    deadline: new Date(2026, 3, 25),
  },
  {
    id: 2,
    match: 'Southern Stars vs Team North',
    date: new Date(2026, 3, 19),
    venue: 'Stars Ground',
    deadline: new Date(2026, 3, 22),
  },
]

const CLOSED_FORMS = [
  {
    id: 3,
    match: 'Team North vs Northern Hawks',
    date: new Date(2026, 3, 12),
    venue: 'Stadium Nord',
    submitted: new Date(2026, 3, 13),
  },
  {
    id: 4,
    match: 'Coastal Elite vs Team North',
    date: new Date(2026, 3, 8),
    venue: 'Coast Arena',
    submitted: new Date(2026, 3, 9),
  },
  {
    id: 5,
    match: 'Team North vs Metro United',
    date: new Date(2026, 3, 5),
    venue: 'Stadium Nord',
    submitted: new Date(2026, 3, 6),
  },
]

export default function Forms() {
  const navigate = useNavigate()

  return (
    <div style={{ minHeight: '100dvh', background: colors.background, fontFamily: "'Inter', sans-serif", color: colors.onSurface }}>
      <header style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 1rem', height: '3.5rem', background: `${colors.surface}e6`, backdropFilter: 'blur(12px)', borderBottom: GHOST, boxSizing: 'border-box' }}>
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
            <span style={{ fontSize: '0.65rem', fontWeight: 700, background: colors.error, color: '#fff', borderRadius: '1rem', padding: '0.1rem 0.45rem' }}>{OPEN_FORMS.length}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {OPEN_FORMS.map(f => (
              <div
                key={f.id}
                onClick={() => navigate('/referee-form')}
                style={{ background: colors.surfaceContainerLowest, border: GHOST, borderLeft: `3px solid ${colors.tertiary}`, borderRadius: radius.xl, padding: '0.75rem 1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.875rem', fontWeight: 700, color: colors.onSurface, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.match}</div>
                  <div style={{ fontSize: '0.65rem', color: colors.onSurfaceVariant, marginTop: '0.2rem' }}>{fmt(f.date)} · {f.venue}</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.25rem', flexShrink: 0 }}>
                  <span style={{ fontSize: '0.6rem', fontWeight: 700, color: colors.error, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Due {fmt(f.deadline)}</span>
                  <span className="material-symbols-outlined" style={{ fontSize: '1rem', color: colors.onSurfaceVariant }}>chevron_right</span>
                </div>
              </div>
            ))}
            {OPEN_FORMS.length === 0 && (
              <p style={{ fontSize: '0.875rem', color: colors.onSurfaceVariant, textAlign: 'center', padding: '1rem 0', margin: 0 }}>No open forms</p>
            )}
          </div>
        </section>

        <div style={{ margin: '0.5rem 1rem', borderTop: GHOST }} />

        {/* Closed forms */}
        <section style={{ padding: '0.5rem 1rem 1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '1.1rem', color: colors.onSurfaceVariant, fontVariationSettings: "'FILL' 1" }}>task_alt</span>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: colors.onSurface }}>Submitted</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {CLOSED_FORMS.map(f => (
              <div
                key={f.id}
                style={{ background: colors.surfaceContainerLowest, border: GHOST, borderLeft: `3px solid ${colors.outlineVariant}`, borderRadius: radius.xl, padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', opacity: 0.75 }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.875rem', fontWeight: 700, color: colors.onSurface, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.match}</div>
                  <div style={{ fontSize: '0.65rem', color: colors.onSurfaceVariant, marginTop: '0.2rem' }}>{fmt(f.date)} · {f.venue}</div>
                </div>
                <span style={{ fontSize: '0.6rem', fontWeight: 700, color: colors.tertiary, textTransform: 'uppercase', letterSpacing: '0.05em', flexShrink: 0 }}>Submitted {fmt(f.submitted)}</span>
              </div>
            ))}
          </div>
        </section>

      </main>

      <BottomNav />
    </div>
  )
}
