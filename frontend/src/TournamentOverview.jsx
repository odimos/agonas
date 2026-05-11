import { useState, useRef, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { colors, fonts, radius } from './styles'
import { useLang } from './LangContext'
import { StatCard } from './Buttons'
import { fetchTournaments, createTournament } from './api/tournaments'
import { fetchPhases } from './api/phases'

const BASE = import.meta.env.VITE_API_URL

async function getTournament(id) {
  const res = await fetch(`${BASE}/tournaments/${id}`)
  if (!res.ok) throw new Error('Failed to fetch tournament')
  return res.json()
}

async function saveTournament(id, data) {
  const res = await fetch(`${BASE}/tournaments/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Failed to save tournament')
  return res.json()
}

async function deleteTournament(id) {
  const res = await fetch(`${BASE}/tournaments/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('Failed to delete tournament')
}

function DataCell({ label, last, onClick, children }) {
  return (
    <div
      style={{ ...st.dataCell, borderRight: last ? 'none' : `1px solid ${colors.outlineVariant}33`, cursor: onClick ? 'pointer' : 'default', position: 'relative' }}
      onClick={onClick}
    >
      <span style={st.dataCellLabel}>{label}</span>
      <div style={st.dataCellRow}>{children}</div>
    </div>
  )
}

export default function TournamentOverview() {
  const { id } = useParams()
  const { t } = useLang()
  const navigate = useNavigate()
  const dateInputRef = useRef(null)

  const [tour,    setTour]    = useState(null)
  const [phases,  setPhases]  = useState([])
  const [editing, setEditing] = useState(false)
  const [draft,   setDraft]   = useState(null)
  const [confirm, setConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    getTournament(id).then(data => { setTour(data); setDraft(data) }).catch(() => {})
    fetchPhases(id).then(setPhases).catch(() => {})
  }, [id])

  function handleCancel() {
    setDraft(tour)
    setEditing(false)
  }

  async function handleSave() {
    const updated = await saveTournament(id, {
      name:       draft.name,
      started:    draft.started || null,
      type:       draft.type,
      active:     draft.active,
      visibility: draft.visibility,
    })
    setTour(updated)
    setDraft(updated)
    setEditing(false)
  }

  async function handleDelete() {
    setDeleting(true)
    try {
      await deleteTournament(id)
      navigate('/tournaments')
    } catch {
      setDeleting(false)
    }
  }

  if (!tour || !draft) return null

  const sortedPhases   = [...phases].sort((a, b) => a.order - b.order)
  const phase1         = sortedPhases[0]
  const allTeams       = phase1 ? phase1.team_ids.length : 0
  const openPhases     = sortedPhases.filter(p => p.is_open)
  const lastOpenPhase  = openPhases[openPhases.length - 1]
  const remainingTeams = lastOpenPhase ? lastOpenPhase.team_ids.length : 0
  const progress       = allTeams > 0
    ? Math.round(((allTeams - remainingTeams) / allTeams) * 10) * 10
    : 0

  return (
    <div style={st.page}>

      {/* Confirm delete modal */}
      {confirm && (
        <div style={ms.overlay} onClick={() => setConfirm(false)}>
          <div style={ms.modal} onClick={e => e.stopPropagation()}>
            <div style={ms.header}>
              <span className="material-symbols-outlined" style={{ color: colors.error, fontSize: '1.5rem' }}>warning</span>
              <h3 style={ms.title}>Διαγραφή τουρνουά</h3>
            </div>
            <p style={ms.body}>Είσαι σίγουρος; Η ενέργεια είναι μη αναστρέψιμη. Θα διαγραφούν επίσης όλες οι φάσεις του τουρνουά.</p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button style={ms.cancelBtn} onClick={() => setConfirm(false)}>Ακύρωση</button>
              <button style={ms.deleteBtn} onClick={handleDelete} disabled={deleting}>
                {deleting ? '...' : 'Διαγραφή'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={st.header}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.375rem' }}>
            {editing ? (
              <input
                style={st.nameInput}
                value={draft.name}
                onChange={e => setDraft(d => ({ ...d, name: e.target.value }))}
              />
            ) : (
              <h1 style={st.title}>{tour.name.toUpperCase()}</h1>
            )}
            <div style={{ ...st.statusBadge, ...(!draft.active ? st.statusBadgeInactive : {}) }}>
              {draft.active ? 'Ενεργό' : 'Ανενεργό'}
            </div>
          </div>
          <p style={st.subtitle}>{t('to_subtitle')}</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          {editing ? (
            <>
              <button style={st.cancelBtn} onClick={handleCancel}>{t('modal_cancel')}</button>
              <button style={st.saveBtn} onClick={handleSave}>{t('modal_save')}</button>
            </>
          ) : (
            <button style={st.editBtn} onClick={() => setEditing(true)}>{t('modal_edit')}</button>
          )}
        </div>
      </div>

      {/* Bento grid */}
      <div style={st.bentoGrid}>

        {/* Progress card */}
        <div style={st.progressCard}>
          <div>
            <span style={st.cardLabel}>{t('to_progress')}</span>
            <div style={st.progressNum}>{progress}%</div>
          </div>
          <div style={st.progressBarTrack}>
            <div style={{ ...st.progressBarFill, width: `${progress}%` }} />
          </div>
        </div>

        {/* Stat cards */}
        <StatCard label={t('to_total_teams')} count={allTeams} />
        <StatCard label="Εναπομείναντες" count={remainingTeams} accentColor={colors.primary} />

        {/* Data grid */}
        <div style={st.dataGrid}>

          {/* Start Date */}
          <DataCell label={t('to_start_date')} onClick={editing ? () => dateInputRef.current?.showPicker?.() : undefined}>
            <span style={st.dataCellValue}>{draft.started ?? '—'}</span>
            {editing && (
              <>
                <span className="material-symbols-outlined" style={st.dataCellIcon}>calendar_today</span>
                <input
                  ref={dateInputRef}
                  type="date"
                  value={draft.started ?? ''}
                  onChange={e => setDraft(d => ({ ...d, started: e.target.value || null }))}
                  style={st.hiddenDateInput}
                  onClick={e => e.stopPropagation()}
                />
              </>
            )}
          </DataCell>

          {/* Type */}
          <DataCell label={t('to_type')}>
            {editing ? (
              <select style={st.fieldSelect} value={draft.type} onChange={e => setDraft(d => ({ ...d, type: e.target.value }))}>
                <option value="knockout">Knockout</option>
              </select>
            ) : (
              <>
                <span style={st.dataCellValue}>{draft.type}</span>
                <span className="material-symbols-outlined" style={st.dataCellIcon}>schema</span>
              </>
            )}
          </DataCell>

          {/* Visibility */}
          <DataCell label={t('to_visibility')} last>
            {editing ? (
              <select style={st.fieldSelect} value={draft.visibility} onChange={e => setDraft(d => ({ ...d, visibility: e.target.value }))}>
                <option value="public">Δημόσιο</option>
                <option value="private">Ιδιωτικό</option>
              </select>
            ) : (
              <>
                <span style={st.dataCellValue}>{draft.visibility}</span>
                <span className="material-symbols-outlined" style={st.dataCellIcon}>visibility</span>
              </>
            )}
          </DataCell>

        </div>

      </div>

      {/* Danger Zone */}
      <div style={st.dangerZone}>
        <div>
          <p style={st.dangerTitle}>{t('to_danger_zone')}</p>
          <p style={st.dangerText}>{t('to_danger_text')}</p>
        </div>
        <button style={st.dangerBtn} onClick={() => setConfirm(true)}>
          <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>delete_forever</span>
          {t('to_delete')}
        </button>
      </div>

    </div>
  )
}

const st = {
  page: {
    padding: '2rem 2.5rem',
    fontFamily: fonts.body,
    backgroundColor: colors.surface,
    display: 'flex',
    flexDirection: 'column',
    gap: '2rem',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingBottom: '1.5rem',
    borderBottom: `1px solid ${colors.outlineVariant}33`,
  },
  title: {
    fontSize: '2rem',
    fontWeight: 800,
    letterSpacing: '-0.04em',
    color: colors.onSurface,
    margin: 0,
    fontFamily: fonts.headline,
  },
  nameInput: {
    fontSize: '2rem',
    fontWeight: 800,
    letterSpacing: '-0.04em',
    color: colors.onSurface,
    fontFamily: fonts.headline,
    border: 'none',
    borderBottom: `2px solid ${colors.primary}`,
    background: 'none',
    outline: 'none',
    padding: '0 0 0.125rem',
  },
  subtitle: {
    fontSize: '0.875rem',
    color: colors.onSurfaceVariant,
    margin: 0,
    fontFamily: fonts.label,
  },
  statusBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    backgroundColor: colors.secondaryContainer,
    color: colors.onSecondaryContainer,
    padding: '0.1875rem 0.75rem',
    borderRadius: radius.DEFAULT,
    fontSize: '0.625rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    fontFamily: fonts.label,
  },
  statusBadgeInactive: {
    backgroundColor: colors.surfaceContainerHigh,
    color: colors.onSurfaceVariant,
  },
  editBtn: {
    padding: '0.5rem 2rem',
    backgroundColor: colors.primary,
    color: colors.onPrimary,
    border: 'none',
    borderRadius: radius.DEFAULT,
    fontSize: '0.875rem',
    fontWeight: 700,
    cursor: 'pointer',
    fontFamily: fonts.label,
  },
  cancelBtn: {
    padding: '0.5rem 1.25rem',
    backgroundColor: 'transparent',
    color: colors.onSurfaceVariant,
    border: `1px solid ${colors.outlineVariant}`,
    borderRadius: radius.DEFAULT,
    fontSize: '0.875rem',
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: fonts.label,
  },
  saveBtn: {
    padding: '0.5rem 1.5rem',
    backgroundColor: colors.primary,
    color: colors.onPrimary,
    border: 'none',
    borderRadius: radius.DEFAULT,
    fontSize: '0.875rem',
    fontWeight: 700,
    cursor: 'pointer',
    fontFamily: fonts.label,
  },
  bentoGrid: {
    display: 'grid',
    gridTemplateColumns: '3fr 1fr 1fr',
    gap: '1.5rem',
  },
  progressCard: {
    backgroundColor: colors.surfaceContainerLowest,
    borderLeft: `4px solid ${colors.tertiary}`,
    padding: '1.25rem 1.5rem',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    gap: '1rem',
  },
  cardLabel: {
    display: 'block',
    fontSize: '0.625rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.18em',
    color: colors.onSurfaceVariant,
    marginBottom: '0.375rem',
    fontFamily: fonts.label,
  },
  progressNum: {
    fontSize: '2rem',
    fontWeight: 800,
    letterSpacing: '-0.04em',
    color: colors.onSurface,
    lineHeight: 1,
    fontFamily: fonts.headline,
  },
  progressBarTrack: {
    width: '100%',
    height: '4px',
    backgroundColor: colors.surfaceContainer,
    borderRadius: radius.full,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.tertiary,
    borderRadius: radius.full,
    transition: 'width 0.8s ease',
  },
  dataGrid: {
    gridColumn: '1 / -1',
    backgroundColor: colors.surfaceContainerLowest,
    border: `1px solid ${colors.outlineVariant}33`,
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
  },
  dataCell: { padding: '1.5rem' },
  dataCellLabel: {
    display: 'block',
    fontSize: '0.625rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.18em',
    color: colors.onSurfaceVariant,
    marginBottom: '0.5rem',
    fontFamily: fonts.label,
  },
  dataCellRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dataCellValue: {
    fontSize: '1.125rem',
    fontWeight: 500,
    color: colors.onSurface,
  },
  dataCellIcon: {
    fontSize: '1.25rem',
    color: colors.onSurfaceVariant,
  },
  hiddenDateInput: {
    position: 'absolute',
    opacity: 0,
    width: 0,
    height: 0,
    pointerEvents: 'none',
  },
  fieldSelect: {
    fontSize: '1.125rem',
    fontWeight: 500,
    color: colors.onSurface,
    fontFamily: fonts.body,
    background: 'none',
    border: 'none',
    borderBottom: `1px solid ${colors.outlineVariant}`,
    outline: 'none',
    padding: '0.125rem 0',
    cursor: 'pointer',
    width: '100%',
  },
  dangerZone: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '2rem',
    borderTop: `1px solid ${colors.error}1a`,
    backgroundColor: `${colors.errorContainer}0d`,
  },
  dangerTitle: {
    fontSize: '0.875rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '-0.02em',
    color: colors.error,
    margin: '0 0 0.25rem',
    fontFamily: fonts.headline,
  },
  dangerText: {
    fontSize: '0.75rem',
    color: colors.onSurfaceVariant,
    margin: 0,
    maxWidth: '36rem',
    lineHeight: 1.5,
  },
  dangerBtn: {
    display: 'flex', alignItems: 'center', gap: '0.5rem',
    padding: '0.625rem 1.5rem',
    backgroundColor: 'transparent',
    border: `1px solid ${colors.error}`,
    borderRadius: radius.DEFAULT,
    fontSize: '0.75rem', fontWeight: 800,
    textTransform: 'uppercase', letterSpacing: '0.08em',
    color: colors.error,
    cursor: 'pointer', fontFamily: fonts.label,
    flexShrink: 0,
  },
}

const ms = {
  overlay: {
    position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)',
    zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  modal: {
    backgroundColor: colors.surface, borderRadius: radius.lg,
    width: '420px', padding: '2rem', fontFamily: fonts.body,
    boxShadow: '0 8px 32px rgba(0,0,0,0.18)', display: 'flex', flexDirection: 'column', gap: '1rem',
  },
  header: {
    display: 'flex', alignItems: 'center', gap: '0.75rem',
  },
  title: {
    fontSize: '1rem', fontWeight: 700, color: colors.onSurface, margin: 0,
    fontFamily: fonts.headline,
  },
  body: {
    fontSize: '0.875rem', color: colors.onSurfaceVariant, margin: 0, lineHeight: 1.5,
  },
  cancelBtn: {
    padding: '0.5rem 1.25rem',
    background: 'none',
    border: `1px solid ${colors.outlineVariant}`,
    borderRadius: radius.DEFAULT,
    fontSize: '0.875rem', fontWeight: 500,
    color: colors.onSurface, cursor: 'pointer', fontFamily: fonts.label,
  },
  deleteBtn: {
    padding: '0.5rem 1.5rem',
    backgroundColor: colors.error,
    border: 'none',
    borderRadius: radius.DEFAULT,
    fontSize: '0.875rem', fontWeight: 700,
    color: colors.onError, cursor: 'pointer', fontFamily: fonts.label,
  },
}
