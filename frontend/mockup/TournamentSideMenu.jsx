import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { colors, fonts, radius } from './styles'

const MOCK_TOURNAMENTS = [
  { id: 1, name: 'Tournament 1', icon: 'trophy',         phases: ['Phase 1', 'Phase 2', 'Phase 3', 'Phase 4'] },
  { id: 2, name: 'Tournament 2', icon: 'sports_kabaddi', phases: ['Phase 1', 'Phase 2'] },
]

const PHASE_ICONS = ['looks_one', 'looks_two', 'looks_3', 'looks_4', 'looks_5', 'looks_6']

export default function TournamentSideMenu() {
  const navigate  = useNavigate()
  const location  = useLocation()

  const { activeId, activePhase } = (() => {
    const m = location.pathname.match(/\/tournaments\/(\d+)(?:\/phases\/(\d+))?/)
    return {
      activeId:    m ? parseInt(m[1]) : 1,
      activePhase: m && m[2] ? parseInt(m[2]) : null,
    }
  })()

  const [expanded, setExpanded] = useState(() => new Set([activeId]))

  function handleClick(id) {
    navigate(`/tournaments/${id}`)
    setExpanded(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <aside style={st.aside}>

      <div style={st.heading}>
        <p style={st.title}>Tournaments</p>
        <p style={st.subtitle}>League Management</p>
      </div>

      <button style={st.newBtn}>
        <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>add</span>
        New Tournament
      </button>

      <nav style={st.nav}>
        {MOCK_TOURNAMENTS.map(t => {
          const isActive   = activeId === t.id
          const isExpanded = expanded.has(t.id)
          return (
            <div key={t.id} style={{ marginBottom: isExpanded ? '0.25rem' : 0 }}>
              <button
                style={{ ...st.tournamentRow, ...(isActive ? st.tournamentRowActive : {}) }}
                onClick={() => handleClick(t.id)}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>{t.icon}</span>
                <span style={{ flex: 1, textAlign: 'left' }}>{t.name}</span>
                <span className="material-symbols-outlined" style={{ fontSize: '1rem', transition: 'transform 0.2s', transform: isExpanded ? 'rotate(0deg)' : 'rotate(-90deg)' }}>
                  expand_more
                </span>
              </button>

              {isExpanded && (
                <div style={st.phaseList}>
                  {t.phases.map((phase, i) => (
                    <button
                      key={phase}
                      style={{ ...st.phaseLink, ...(activeId === t.id && activePhase === i + 1 ? st.phaseLinkActive : {}) }}
                      onClick={() => navigate(`/tournaments/${t.id}/phases/${i + 1}`)}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '0.875rem' }}>{PHASE_ICONS[i] ?? 'circle'}</span>
                      {phase}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </nav>

    </aside>
  )
}

const st = {
  aside: {
    width: '16rem',
    paddingTop: '1.5rem',
    borderRight: `1px solid rgba(194, 200, 194, 0.3)`,
    backgroundColor: colors.surfaceContainerLow,
    position: 'fixed',
    top: '4rem',
    left: 0,
    height: 'calc(100vh - 4rem)',
    overflowY: 'auto',
    zIndex: 40,
    fontFamily: fonts.body,
    display: 'flex',
    flexDirection: 'column',
  },
  heading: {
    padding: '0 1.5rem',
    marginBottom: '1rem',
  },
  title: {
    fontSize: '1rem',
    fontWeight: 700,
    letterSpacing: '-0.02em',
    color: colors.onSurface,
    margin: 0,
    fontFamily: fonts.headline,
  },
  subtitle: {
    fontSize: '0.625rem',
    color: colors.onSurfaceVariant,
    margin: '2px 0 0',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
  },
  newBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.375rem',
    margin: '0 0.75rem 1rem',
    padding: '0.5rem 1rem',
    backgroundColor: colors.primary,
    color: colors.onPrimary,
    border: 'none',
    borderRadius: radius.DEFAULT,
    fontSize: '0.8125rem',
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: fonts.label,
  },
  nav: {
    display: 'flex',
    flexDirection: 'column',
    padding: '0 0.75rem',
    flex: 1,
  },
  tournamentRow: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: '0.625rem',
    padding: '0.625rem 0.875rem',
    borderRadius: radius.lg,
    color: colors.onSurfaceVariant,
    background: 'none',
    border: 'none',
    borderLeft: '3px solid transparent',
    fontSize: '0.875rem',
    fontWeight: 500,
    cursor: 'pointer',
    fontFamily: fonts.body,
    transition: 'background-color 0.15s ease',
    boxSizing: 'border-box',
  },
  tournamentRowActive: {
    backgroundColor: colors.surfaceContainerLowest,
    color: colors.tertiary,
    borderLeft: `3px solid ${colors.tertiary}`,
    fontWeight: 600,
  },
  phaseList: {
    display: 'flex',
    flexDirection: 'column',
    marginLeft: '1.5rem',
    borderLeft: `1px solid ${colors.outlineVariant}4d`,
    paddingLeft: '0.75rem',
    paddingTop: '0.25rem',
    paddingBottom: '0.25rem',
    marginBottom: '0.25rem',
  },
  phaseLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.375rem 0.625rem',
    borderRadius: radius.DEFAULT,
    color: colors.onSurfaceVariant,
    background: 'none',
    border: 'none',
    fontSize: '0.75rem',
    fontWeight: 500,
    cursor: 'pointer',
    fontFamily: fonts.body,
    textAlign: 'left',
  },
  phaseLinkActive: {
    color: colors.tertiary,
    fontWeight: 600,
  },
}
