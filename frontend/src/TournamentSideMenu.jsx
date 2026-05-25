import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { colors, fonts, radius } from './styles'
import { useLang } from './LangContext'
import { useSidebar } from './SidebarContext'
import { fetchTournaments, createTournament } from './api/tournaments'
import { fetchPhases, createPhase } from './api/phases'
import { fetchTeams } from './api/teams'

const PHASE_ICONS = ['looks_one', 'looks_two', 'looks_3', 'looks_4', 'looks_5', 'looks_6']

const EMPTY_FORM = { name: '', started: '', type: 'knockout', visibility: 'public' }

function CreateTournamentModal({ teams, onClose, onCreated }) {
  const [form, setForm]         = useState(EMPTY_FORM)
  const [selectedTeams, setSelectedTeams] = useState(new Set())
  const [search, setSearch]     = useState('')
  const [saving, setSaving]     = useState(false)
  const [error, setError]       = useState('')

  function toggle(id) {
    setSelectedTeams(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const filtered = teams.filter(t => t.name.toLowerCase().includes(search.toLowerCase()))

  async function handleSubmit() {
    if (!form.name.trim()) { setError('Το όνομα είναι υποχρεωτικό.'); return }
    setSaving(true)
    setError('')
    try {
      const tournament = await createTournament({
        name:       form.name.trim(),
        started:    form.started || null,
        type:       form.type,
        visibility: form.visibility,
        active:     true,
      })
      // Create Phase 1 automatically, open, with selected teams
      const phase = await createPhase(tournament.id, 1)
      // If teams selected, set them via PUT
      if (selectedTeams.size > 0) {
        await fetch(`${import.meta.env.VITE_API_URL}/phases/${phase.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ order: 1, is_open: true, team_ids: [...selectedTeams] }),
        })
      } else {
        // Just open the phase
        await fetch(`${import.meta.env.VITE_API_URL}/phases/${phase.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ order: 1, is_open: true, team_ids: [] }),
        })
      }
      onCreated(tournament)
    } catch (e) {
      setError(e?.detail ?? 'Σφάλμα κατά τη δημιουργία.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={ms.overlay} onClick={onClose}>
      <div style={ms.modal} onClick={e => e.stopPropagation()}>

        <div style={ms.header}>
          <h2 style={ms.title}>Νέο Τουρνουά</h2>
          <button style={ms.closeBtn} onClick={onClose}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div style={ms.body}>
          {/* Name */}
          <div style={ms.fieldRow}>
            <label style={ms.label}>Όνομα *</label>
            <input style={ms.input} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="π.χ. Pro League 2026" />
          </div>

          {/* Started + Type */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div style={ms.fieldRow}>
              <label style={ms.label}>Έναρξη</label>
              <input style={ms.input} type="date" value={form.started} onChange={e => setForm(f => ({ ...f, started: e.target.value }))} />
            </div>
            <div style={ms.fieldRow}>
              <label style={ms.label}>Τύπος</label>
              <select style={ms.input} value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                <option value="knockout">Knockout</option>
              </select>
            </div>
          </div>

          {/* Visibility */}
          <div style={ms.fieldRow}>
            <label style={ms.label}>Ορατότητα</label>
            <select style={ms.input} value={form.visibility} onChange={e => setForm(f => ({ ...f, visibility: e.target.value }))}>
              <option value="public">Δημόσιο</option>
              <option value="private">Ιδιωτικό</option>
            </select>
          </div>

          {/* Teams for Phase 1 */}
          <div style={ms.fieldRow}>
            <label style={ms.label}>Ομάδες Φάσης 1 ({selectedTeams.size} επιλεγμένες)</label>
            <input style={{ ...ms.input, marginBottom: '0.5rem' }} placeholder="Αναζήτηση ομάδας..." value={search} onChange={e => setSearch(e.target.value)} />
            <div style={ms.teamList}>
              {filtered.map(team => {
                const selected = selectedTeams.has(team.id)
                return (
                  <div key={team.id} style={{ ...ms.teamRow, ...(selected ? ms.teamRowSelected : {}) }} onClick={() => toggle(team.id)}>
                    <span className="material-symbols-outlined" style={{ fontSize: '1rem', color: selected ? colors.tertiary : colors.outline }}>
                      {selected ? 'check_box' : 'check_box_outline_blank'}
                    </span>
                    <span style={{ fontSize: '0.875rem', color: colors.onSurface }}>{team.name}</span>
                  </div>
                )
              })}
              {filtered.length === 0 && <p style={{ fontSize: '0.8125rem', color: colors.outline, margin: 0, padding: '0.5rem' }}>Δεν βρέθηκαν ομάδες.</p>}
            </div>
          </div>

          {error && <p style={{ color: colors.error, fontSize: '0.8125rem', margin: 0 }}>{error}</p>}
        </div>

        <div style={ms.footer}>
          <button style={ms.cancelBtn} onClick={onClose}>Ακύρωση</button>
          <button style={ms.saveBtn} onClick={handleSubmit} disabled={saving}>
            {saving ? 'Αποθήκευση...' : 'Δημιουργία'}
          </button>
        </div>

      </div>
    </div>
  )
}

const W_FULL = '16rem'
const W_MINI = '4rem'

export default function TournamentSideMenu() {
  const { t } = useLang()
  const { collapsed, toggle } = useSidebar()
  const navigate = useNavigate()
  const location = useLocation()

  const [tournaments, setTournaments] = useState([])
  const [phases, setPhases]           = useState([])
  const [teams, setTeams]             = useState([])
  const [showModal, setShowModal]     = useState(false)

  useEffect(() => {
    fetchTournaments().then(setTournaments).catch(() => {})
    fetchPhases().then(setPhases).catch(() => {})
    fetchTeams().then(setTeams).catch(() => {})
  }, [location.pathname])

  const { activeId, activePhase } = (() => {
    const m = location.pathname.match(/\/tournaments\/(\d+)(?:\/phases\/(\d+))?/)
    return {
      activeId:    m ? parseInt(m[1]) : null,
      activePhase: m && m[2] ? parseInt(m[2]) : null,
    }
  })()

  const [expanded, setExpanded] = useState(() => new Set(activeId ? [activeId] : []))

  function handleClick(id) {
    navigate(`/tournaments/${id}`)
    setExpanded(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function handleCreated(tournament) {
    fetchTournaments().then(setTournaments).catch(() => {})
    fetchPhases().then(setPhases).catch(() => {})
    setShowModal(false)
    setExpanded(prev => new Set([...prev, tournament.id]))
    navigate(`/tournaments/${tournament.id}`)
  }

  return (
    <>
      <aside style={{ ...st.aside, width: collapsed ? W_MINI : W_FULL }}>

        {/* Toggle button */}
        <button style={{ ...st.toggleBtn, justifyContent: collapsed ? 'center' : 'flex-end' }} onClick={toggle} title={collapsed ? 'Expand' : 'Collapse'}>
          <span className="material-symbols-outlined" style={{ fontSize: '1.2rem', color: colors.onSurfaceVariant }}>
            {collapsed ? 'menu' : 'menu_open'}
          </span>
        </button>

        {!collapsed && (
          <>
            <div style={st.heading}>
              <p style={st.title}>{t('tm_title')}</p>
              <p style={st.subtitle}>{t('tm_subtitle')}</p>
            </div>

            <button style={st.newBtn} onClick={() => setShowModal(true)}>
              <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>add</span>
              {t('tm_new')}
            </button>
          </>
        )}

        {collapsed && (
          <button style={{ ...st.newBtn, margin: '0 0.5rem 0.75rem', padding: '0.5rem', justifyContent: 'center' }} onClick={() => setShowModal(true)} title={t('tm_new')}>
            <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>add</span>
          </button>
        )}

        <nav style={{ ...st.nav, padding: collapsed ? '0 0.5rem' : '0 0.75rem' }}>
          {tournaments.map(tour => {
            const isActive   = activeId === tour.id
            const isExpanded = expanded.has(tour.id) && !collapsed
            const tourPhases = phases.filter(p => p.tournament_id === tour.id)
            return (
              <div key={tour.id} style={{ marginBottom: isExpanded ? '0.25rem' : 0, position: 'relative' }}>
                <button
                  style={{
                    ...st.tournamentRow,
                    ...(isActive ? st.tournamentRowActive : {}),
                    justifyContent: collapsed ? 'center' : 'flex-start',
                    padding: collapsed ? '0.625rem' : '0.625rem 0.875rem',
                  }}
                  onClick={() => handleClick(tour.id)}
                  title={collapsed ? tour.name : undefined}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '1.1rem', flexShrink: 0 }}>trophy</span>
                  {!collapsed && (
                    <>
                      <span style={{ flex: 1, textAlign: 'left' }}>{tour.name}</span>
                      {tourPhases.length > 0 && (
                        <span className="material-symbols-outlined" style={{ fontSize: '1rem', transition: 'transform 0.2s', transform: isExpanded ? 'rotate(0deg)' : 'rotate(-90deg)' }}>
                          expand_more
                        </span>
                      )}
                    </>
                  )}
                </button>

                {isExpanded && tourPhases.length > 0 && (
                  <div style={st.phaseList}>
                    {tourPhases.map((phase, i) => {
                      const isFinish = phase.team_ids.length === 1
                      return (
                        <button
                          key={phase.id}
                          style={{ ...st.phaseLink, ...(activePhase === phase.id ? st.phaseLinkActive : {}) }}
                          onClick={() => navigate(`/tournaments/${tour.id}/phases/${phase.id}`)}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: '0.875rem' }}>
                            {isFinish ? 'emoji_events' : (PHASE_ICONS[i] ?? 'circle')}
                          </span>
                          {isFinish ? t('finish_label') : `${t('phase_label')} ${phase.order}`}
                        </button>
                      )
                    })}
                  </div>
                )}

                {collapsed && expanded.has(tour.id) && tourPhases.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.125rem', padding: '0 0.5rem' }}>
                    {tourPhases.map((phase, i) => {
                      const isFinish = phase.team_ids.length === 1
                      return (
                        <button
                          key={phase.id}
                          style={{ ...st.phaseLink, ...(activePhase === phase.id ? st.phaseLinkActive : {}), justifyContent: 'center', padding: '0.375rem' }}
                          title={isFinish ? t('finish_label') : `${t('phase_label')} ${phase.order}`}
                          onClick={() => navigate(`/tournaments/${tour.id}/phases/${phase.id}`)}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: '0.875rem' }}>
                            {isFinish ? 'emoji_events' : (PHASE_ICONS[i] ?? 'circle')}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </nav>

      </aside>

      {showModal && (
        <CreateTournamentModal
          teams={teams}
          onClose={() => setShowModal(false)}
          onCreated={handleCreated}
        />
      )}
    </>
  )
}

const st = {
  aside: {
    paddingTop: '0.75rem',
    borderRight: `1px solid rgba(194, 200, 194, 0.3)`,
    backgroundColor: colors.surfaceContainerLow,
    position: 'fixed',
    top: '4rem',
    left: 0,
    height: 'calc(100vh - 4rem)',
    overflowY: 'auto',
    overflowX: 'hidden',
    zIndex: 40,
    fontFamily: fonts.body,
    display: 'flex',
    flexDirection: 'column',
    transition: 'width 0.2s ease',
  },
  toggleBtn: {
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '0.375rem 0.75rem',
    marginBottom: '0.5rem',
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
  popout: {
    position: 'absolute',
    left: 'calc(100% + 0.375rem)',
    top: 0,
    backgroundColor: colors.surfaceContainerLowest,
    border: `1px solid ${colors.outlineVariant}`,
    borderRadius: radius.DEFAULT,
    boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
    zIndex: 100,
    minWidth: '10rem',
    padding: '0.375rem 0.25rem',
    display: 'flex',
    flexDirection: 'column',
  },
  popoutTitle: {
    fontSize: '0.6875rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    color: colors.onSurfaceVariant,
    margin: '0 0 0.25rem',
    padding: '0 0.625rem',
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

const ms = {
  overlay: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    zIndex: 200,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modal: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    width: '480px',
    maxHeight: '85vh',
    display: 'flex',
    flexDirection: 'column',
    fontFamily: fonts.body,
    boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1.25rem 1.5rem',
    borderBottom: `1px solid ${colors.outlineVariant}33`,
  },
  title: {
    fontSize: '1.125rem',
    fontWeight: 700,
    color: colors.onSurface,
    margin: 0,
    fontFamily: fonts.headline,
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: colors.onSurfaceVariant,
    display: 'flex',
    padding: '0.25rem',
  },
  body: {
    padding: '1.25rem 1.5rem',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  fieldRow: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
  },
  label: {
    fontSize: '0.6875rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    color: colors.onSurfaceVariant,
    fontFamily: fonts.label,
  },
  input: {
    padding: '0.5rem 0.75rem',
    border: `1px solid ${colors.outlineVariant}`,
    borderRadius: radius.DEFAULT,
    fontSize: '0.875rem',
    color: colors.onSurface,
    backgroundColor: colors.surfaceContainerLowest,
    fontFamily: fonts.body,
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
  },
  teamList: {
    border: `1px solid ${colors.outlineVariant}33`,
    borderRadius: radius.DEFAULT,
    maxHeight: '180px',
    overflowY: 'auto',
  },
  teamRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.625rem',
    padding: '0.5rem 0.75rem',
    cursor: 'pointer',
    borderBottom: `1px solid ${colors.outlineVariant}1a`,
  },
  teamRowSelected: {
    backgroundColor: `${colors.tertiary}0d`,
  },
  footer: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '0.75rem',
    padding: '1rem 1.5rem',
    borderTop: `1px solid ${colors.outlineVariant}33`,
  },
  cancelBtn: {
    padding: '0.5rem 1.25rem',
    background: 'none',
    border: `1px solid ${colors.outlineVariant}`,
    borderRadius: radius.DEFAULT,
    fontSize: '0.875rem',
    fontWeight: 500,
    color: colors.onSurface,
    cursor: 'pointer',
    fontFamily: fonts.label,
  },
  saveBtn: {
    padding: '0.5rem 1.5rem',
    backgroundColor: colors.primary,
    border: 'none',
    borderRadius: radius.DEFAULT,
    fontSize: '0.875rem',
    fontWeight: 600,
    color: colors.onPrimary,
    cursor: 'pointer',
    fontFamily: fonts.label,
  },
}
