import { useState, useMemo, useEffect, useRef, useCallback } from 'react'
import { colors, fonts, radius } from './styles'
import { StatCard, AddButton, ExportCSVButton } from './Buttons'
import { useLang } from './LangContext'
import ItemModal from './ItemModal'
import MatchModalContent, { initMatchForm } from './MatchModalContent'
import { fetchMatches, createMatch, updateMatch, deleteMatch } from './api/matches'
import { fetchTeams }       from './api/teams'
import { fetchReferees }    from './api/referees'
import { fetchStadiums }    from './api/stadiums'
import { fetchTournaments } from './api/tournaments'
import { fetchPhases }     from './api/phases'
import { fetchPlayers }    from './api/players'
import { fetchMatchGoals, deleteMatchGoal } from './api/match_player_goals'
import { fetchMatchCards, deleteMatchCard } from './api/match_player_cards'
import { fetchAllAvailabilities } from './api/stadium_availabilities'

// ─── FilterDropdown ───────────────────────────────────────────────────────────

function FilterDropdown({ label, icon, options, value, onChange, mode = 'multi' }) {
  // mode='multi'  → value is a Set, onChange(Set)
  // mode='single' → value is string|null, onChange(string|null)
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    function close(e) { if (!ref.current?.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [open])

  const isActive = mode === 'multi' ? value.size > 0 : value !== null && value !== ''
  const activeCount = mode === 'multi' ? value.size : (isActive ? 1 : 0)

  function toggle(opt) {
    if (mode === 'single') {
      onChange(value === opt ? null : opt)
      setOpen(false)
    } else {
      const next = new Set(value)
      next.has(opt) ? next.delete(opt) : next.add(opt)
      onChange(next)
    }
  }

  return (
    <div style={{ position: 'relative' }} ref={ref}>
      <button
        onClick={() => setOpen(v => !v)}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
          padding: '0.375rem 0.625rem',
          backgroundColor: isActive ? `${colors.primary}14` : 'transparent',
          border: `1px solid ${isActive ? colors.primary : `${colors.outlineVariant}55`}`,
          borderRadius: radius.DEFAULT,
          fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase',
          letterSpacing: '0.06em', color: isActive ? colors.primary : colors.onSurfaceVariant,
          cursor: 'pointer', fontFamily: fonts.label, whiteSpace: 'nowrap',
        }}
      >
        {icon && <span className="material-symbols-outlined" style={{ fontSize: '0.9rem' }}>{icon}</span>}
        {label}
        {activeCount > 0 && (
          <span style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: '1rem', height: '1rem', borderRadius: '50%',
            backgroundColor: colors.primary, color: colors.onPrimary,
            fontSize: '0.5625rem', fontWeight: 800, lineHeight: 1,
          }}>{activeCount}</span>
        )}
        <span className="material-symbols-outlined" style={{ fontSize: '0.9rem', transition: 'transform 0.15s', transform: open ? 'rotate(180deg)' : 'none' }}>expand_more</span>
      </button>

      {open && options.length > 0 && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 0.375rem)', left: 0,
          backgroundColor: colors.surfaceContainerLowest,
          border: `1px solid ${colors.outlineVariant}`,
          borderRadius: radius.DEFAULT,
          boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
          zIndex: 60, minWidth: '12rem', maxHeight: '16rem', overflowY: 'auto',
        }}>
          {options.map(opt => {
            const checked = mode === 'multi' ? value.has(opt.value) : value === opt.value
            return (
              <button
                key={opt.value}
                onClick={() => toggle(opt.value)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.625rem',
                  width: '100%', padding: '0.5rem 0.875rem',
                  background: checked ? `${colors.primary}0e` : 'none',
                  border: 'none', cursor: 'pointer', textAlign: 'left',
                  fontSize: '0.8125rem', fontWeight: checked ? 600 : 400,
                  color: checked ? colors.primary : colors.onSurface,
                  fontFamily: fonts.body,
                }}
              >
                {mode === 'multi' ? (
                  <span style={{
                    width: '1rem', height: '1rem', borderRadius: '0.2rem', flexShrink: 0,
                    border: `2px solid ${checked ? colors.primary : colors.outlineVariant}`,
                    backgroundColor: checked ? colors.primary : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {checked && <span className="material-symbols-outlined" style={{ fontSize: '0.75rem', color: colors.onPrimary, fontVariationSettings: "'FILL' 1" }}>check</span>}
                  </span>
                ) : (
                  <span style={{
                    width: '1rem', height: '1rem', borderRadius: '50%', flexShrink: 0,
                    border: `2px solid ${checked ? colors.primary : colors.outlineVariant}`,
                    backgroundColor: 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {checked && <span style={{ width: '0.5rem', height: '0.5rem', borderRadius: '50%', backgroundColor: colors.primary }} />}
                  </span>
                )}
                {opt.label}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const DAYS_GR = ['Κυριακή', 'Δευτέρα', 'Τρίτη', 'Τετάρτη', 'Πέμπτη', 'Παρασκευή', 'Σάββατο']
const DAYS_EN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

// Returns Monday of the week that contains `date`
function weekStart(date) {
  const d = new Date(date)
  const day = d.getDay() || 7
  d.setDate(d.getDate() - day + 1)
  d.setHours(0, 0, 0, 0)
  return d
}

function addDays(date, n) {
  const d = new Date(date)
  d.setDate(d.getDate() + n)
  return d
}

function isoDate(d) {
  return d.toISOString().slice(0, 10)
}

function formatMatchDate(isoStr, lang = 'gr') {
  if (!isoStr) return '—'
  // Treat stored date as wall-clock (no timezone shift)
  const datePart = isoStr.slice(0, 10) // YYYY-MM-DD
  const [y, m, d] = datePart.split('-').map(Number)
  const dt = new Date(y, m - 1, d) // local midnight on that date — safe for getDay()
  const days = lang === 'en' ? DAYS_EN : DAYS_GR
  return `${days[dt.getDay()]}, ${String(d).padStart(2, '0')}/${String(m).padStart(2, '0')}`
}

function formatMatchTime(isoStr) {
  if (!isoStr) return '—'
  return isoStr.slice(11, 16)
}

// Build a new scheduled_at ISO string by replacing the date portion
function patchDate(scheduledAt, newDateStr) {
  const time = scheduledAt ? scheduledAt.slice(11, 16) : '00:00'
  return `${newDateStr}T${time}:00`
}

function patchTime(scheduledAt, newTime) {
  const date = scheduledAt ? scheduledAt.slice(0, 10) : new Date().toISOString().slice(0, 10)
  return `${date}T${newTime}:00`
}

// ─── Conflict Detection ───────────────────────────────────────────────────────

function detectConflicts(matches, availabilities = []) {
  const conflictIndices = new Set()
  const conflicts = []

  // Group matches by stadium+date+time to check quantity
  const stadiumSlotCount = {} // key: `${stadiumId}|${date}|${time}` → [indices]
  for (let i = 0; i < matches.length; i++) {
    const m = matches[i]
    if (!m.stadium_id || !m.scheduled_at) continue
    const key = `${m.stadium_id}|${m.scheduled_at.slice(0,10)}|${m.scheduled_at.slice(11,16)}`
    if (!stadiumSlotCount[key]) stadiumSlotCount[key] = []
    stadiumSlotCount[key].push(i)
  }

  // Flag stadium conflicts where match count exceeds slot quantity
  for (const [key, indices] of Object.entries(stadiumSlotCount)) {
    if (indices.length < 2) continue
    const [stadiumId, date, time] = key.split('|')
    const jsDay = new Date(`${date}T00:00:00`).getDay()
    const dayOfWeek = (jsDay + 6) % 7
    const slot = availabilities.find(a =>
      a.stadium_id === Number(stadiumId) &&
      a.day === dayOfWeek &&
      a.start_time.slice(0,5) === time
    )
    const quantity = slot ? slot.quantity : 1
    if (indices.length > quantity) {
      for (const idx of indices) conflictIndices.add(idx)
      conflicts.push({ indices, reason: 'Γήπεδο υπερκρατημένο' })
    }
  }

  // Referee conflicts: same referee with less than 60 minutes between kick-offs
  for (let i = 0; i < matches.length; i++) {
    for (let j = i + 1; j < matches.length; j++) {
      const a = matches[i], b = matches[j]
      if (!a.scheduled_at || !b.scheduled_at) continue
      if (!a.referee_id || a.referee_id !== b.referee_id) continue
      const diffMs = Math.abs(new Date(a.scheduled_at) - new Date(b.scheduled_at))
      if (diffMs < 60 * 60 * 1000) {
        conflictIndices.add(i)
        conflictIndices.add(j)
        conflicts.push({ indices: [i, j], reason: 'Διαιτητής υπερκρατημένος' })
      }
    }
  }

  // Same pair of teams playing more than once in the same tournament+phase
  for (let i = 0; i < matches.length; i++) {
    for (let j = i + 1; j < matches.length; j++) {
      const a = matches[i], b = matches[j]
      if (!a.tournament_id || !b.tournament_id) continue
      if (a.tournament_id !== b.tournament_id || a.phase_id !== b.phase_id) continue
      if (!a.home_team_id || !a.away_team_id || !b.home_team_id || !b.away_team_id) continue
      const pairA = new Set([a.home_team_id, a.away_team_id])
      const pairB = new Set([b.home_team_id, b.away_team_id])
      if (pairA.size === 2 && [...pairA].every(id => pairB.has(id))) {
        conflictIndices.add(i)
        conflictIndices.add(j)
        conflicts.push({ indices: [i, j], reason: 'Διπλός αγώνας στην ίδια φάση' })
      }
    }
  }

  return { conflictIndices, conflicts }
}

// ─── Status config ────────────────────────────────────────────────────────────

const ALL_STATUSES = ['draft', 'expected', 'finished', 'canceled']

const STATUS_STYLES = {
  finished: { backgroundColor: colors.tertiaryContainer,  color: colors.onTertiary           },
  expected: { backgroundColor: colors.secondaryContainer, color: colors.onSecondaryContainer },
  canceled: { backgroundColor: colors.errorContainer,     color: colors.onErrorContainer     },
  draft:    { backgroundColor: colors.surfaceContainer,   color: colors.onSurfaceVariant     },
}

// ─── Small Components ─────────────────────────────────────────────────────────

function MatchStatusBadge({ status }) {
  const { t } = useLang()
  return (
    <span style={{ ...st.badge, ...(STATUS_STYLES[status] ?? STATUS_STYLES.draft) }}>
      {t('ms_' + status)}
    </span>
  )
}

function InlineDatePicker({ value, onChange, disabled }) {
  const ref = useRef(null)
  const { lang } = useLang()
  const dateStr = value ? value.slice(0, 10) : ''
  return (
    <span style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
      <span onClick={() => !disabled && ref.current?.showPicker?.()} style={{ ...st.inlineValue, cursor: disabled ? 'default' : 'pointer' }}>
        {value ? formatMatchDate(value, lang) : '—'}
      </span>
      <input
        ref={ref}
        type="date"
        value={dateStr}
        onChange={e => { if (e.target.value) onChange(e.target.value) }}
        style={{ position: 'absolute', opacity: 0, pointerEvents: 'none', width: 0, height: 0 }}
      />
    </span>
  )
}

// Generate all quarter-hour HH:MM options
const QUARTER_TIMES = []
for (let h = 0; h < 24; h++)
  for (let m = 0; m < 60; m += 15)
    QUARTER_TIMES.push(`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`)

function InlineTimePicker({ value, dateStr: dateProp, onChange, disabled, stadiumId, availabilities }) {
  const [open, setOpen] = useState(false)
  const timeStr = value ? value.slice(11, 16) : ''

  // Extract day-of-week from value, or from dateProp when scheduled_at was cleared
  const dayOfWeek = (() => {
    const datePart = value ? value.slice(0, 10) : dateProp
    if (!datePart) return null
    const jsDay = new Date(`${datePart}T00:00:00`).getDay()
    return (jsDay + 6) % 7
  })()

  const timeOpts = useMemo(() => {
    if (stadiumId) {
      const stadiumSlots = availabilities.filter(a => a.stadium_id === stadiumId)
      if (stadiumSlots.length > 0) {
        // stadium has availability defined — only show slots for that day (may be empty)
        return dayOfWeek !== null
          ? stadiumSlots.filter(a => a.day === dayOfWeek).map(s => s.start_time.slice(0, 5))
          : []
      }
      // stadium has no availability defined at all — no options
      return []
    }
    // no stadium — show all quarters
    return QUARTER_TIMES
  }, [stadiumId, dayOfWeek, availabilities])

  if (disabled) return <span style={{ ...st.inlineValue, cursor: 'default' }}>{timeStr || '—'}</span>

  return (
    <span style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
      <span style={{ ...st.inlineValue, cursor: 'pointer' }}>{timeStr || '—'}</span>
      <select
        value={timeStr}
        onChange={e => onChange(e.target.value)}
        style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', width: '100%', height: '100%' }}
      >
        <option value="">—</option>
        {timeOpts.map(t => <option key={t} value={t}>{t}</option>)}
      </select>
    </span>
  )
}

function InlineSelect({ value, options, onChange, style, getLabel, testId, disabled, required }) {
  const label = getLabel ? getLabel(value) : value
  return (
    <span style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
      <span style={{ ...st.inlineValue, ...style, ...(disabled ? { opacity: 0.35 } : {}) }}>{label || '—'}</span>
      <select
        value={value ?? ''}
        onChange={e => onChange(e.target.value || null)}
        disabled={disabled}
        style={{ position: 'absolute', inset: 0, opacity: 0, cursor: disabled ? 'default' : 'pointer', width: '100%', height: '100%' }}
        data-testid={testId}
      >
        {!required && <option value="">—</option>}
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </span>
  )
}

function ActionBtn({ icon, title, color, onClick }) {
  const [hovered, setHovered] = useState(false)
  return (
    <button
      title={title}
      onClick={onClick}
      style={{ ...st.actionBtn, color: hovered ? color : colors.onSurfaceVariant, backgroundColor: hovered ? `${color}15` : 'transparent' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>{icon}</span>
    </button>
  )
}

// ─── Match Row ────────────────────────────────────────────────────────────────

function MatchRow({ match, isFirst, isConflict, teams, referees, stadiums, tournaments, phases, availabilities, onSave, onDelete, onView }) {
  const [hovered, setHovered] = useState(false)
  const [pendingDate, setPendingDate] = useState(null)
  const { t } = useLang()

  const baseBg = isConflict ? `${colors.errorContainer}55` : 'transparent'
  const locked = match.status === 'finished'

  const selectedPhase  = phases.find(p => p.id === match.phase_id)
  const eligibleTeams  = match.phase_id && selectedPhase
    ? teams.filter(t => selectedPhase.team_ids.includes(t.id))
    : teams
  const teamOpts       = [
    ...(match.tournament_id ? [{ value: 'bye', label: 'BYE' }] : []),
    ...eligibleTeams.map(t => ({ value: String(t.id), label: t.name })),
  ]
  const refereeOpts    = referees.map(r => ({ value: String(r.id), label: `${r.first_name} ${r.last_name}` }))
  const stadiumOpts    = stadiums.map(s => ({ value: String(s.id), label: s.name }))
  const tournamentOpts = tournaments.map(tn => ({ value: String(tn.id), label: tn.name }))
  const phaseOpts      = phases.filter(p => p.is_open && (!match.tournament_id || p.tournament_id === match.tournament_id))
                               .map(p => ({ value: String(p.id), label: String(p.order) }))
  const statusOpts     = ALL_STATUSES.map(s => ({ value: s, label: t('ms_' + s) }))

  function patch(field, val) {
    const updated = { ...match, [field]: val }
    // Build the full payload for the API
    onSave(updated)
  }

  const homeTeam   = teams.find(t => t.id === match.home_team_id)
  const awayTeam   = teams.find(t => t.id === match.away_team_id)
  const referee    = referees.find(r => r.id === match.referee_id)
  const stadium    = stadiums.find(s => s.id === match.stadium_id)
  const tournament = tournaments.find(tn => tn.id === match.tournament_id)
  const phase      = phases.find(p => p.id === match.phase_id)

  return (
    <tr
      data-testid="match-row"
      data-match-id={match.id}
      style={{ borderTop: isFirst ? 'none' : `1px solid ${colors.outlineVariant}1a`, backgroundColor: hovered ? colors.surfaceContainerLow : baseBg, transition: 'background-color 0.15s', opacity: locked ? 0.75 : 1 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Tournament — empty = Friendly */}
      <td style={st.td}>
        <InlineSelect
          value={match.tournament_id ? String(match.tournament_id) : ''}
          options={tournamentOpts}
          onChange={v => {
            const tournamentId = v ? Number(v) : null
            let phaseId = null
            if (tournamentId) {
              const tournamentPhases = phases.filter(p => p.tournament_id === tournamentId && p.is_open)
              const lastOpen = tournamentPhases[tournamentPhases.length - 1]
              phaseId = lastOpen?.id ?? null
            }
            onSave({ ...match, tournament_id: tournamentId, phase_id: phaseId })
          }}
          style={{ color: colors.primary, fontWeight: 600 }}
          getLabel={() => tournament?.name || '(Φιλικό)'}
          disabled={locked}
        />
      </td>
      {/* Phase */}
      <td style={{ ...st.td, padding: '0.75rem 0.375rem', textAlign: 'center' }}>
        <InlineSelect
          value={match.phase_id ? String(match.phase_id) : ''}
          options={phaseOpts}
          onChange={v => patch('phase_id', v ? Number(v) : null)}
          style={{ color: colors.onSurfaceVariant, fontSize: '0.8125rem', fontWeight: 700 }}
          getLabel={() => phase ? String(phase.order) : '—'}
          disabled={!match.tournament_id || locked}
          required={!!match.tournament_id}
        />
      </td>
      <td style={st.td}>
        <InlineSelect
          value={match.status}
          options={statusOpts}
          onChange={v => patch('status', v ?? 'draft')}
          style={{ ...STATUS_STYLES[match.status], ...st.badge }}
          getLabel={v => t('ms_' + (v || 'draft'))}
          testId="inline-status-select"
        />
      </td>
      <td style={st.td}>
        <InlineDatePicker value={match.scheduled_at || (pendingDate ? `${pendingDate}T00:00:00` : null)} onChange={v => {
          const currentTime = match.scheduled_at ? match.scheduled_at.slice(11, 19) || '00:00:00' : null
          if (currentTime && currentTime !== '00:00:00') {
            // Keep the existing time; let validation catch incompatible date+stadium combos
            patch('scheduled_at', `${v}T${currentTime}`)
          } else {
            // No time yet — stash the date locally and wait for a time pick
            setPendingDate(v)
          }
        }} disabled={locked} />
      </td>
      <td style={st.td}>
        <InlineTimePicker value={pendingDate ? null : match.scheduled_at} dateStr={pendingDate} onChange={v => {
          if (!v) { setPendingDate(null); patch('scheduled_at', null); return }
          const d = pendingDate || (match.scheduled_at ? match.scheduled_at.slice(0, 10) : new Date().toISOString().slice(0, 10))
          setPendingDate(null)
          patch('scheduled_at', `${d}T${v}:00`)
        }} disabled={locked} stadiumId={match.stadium_id} availabilities={availabilities} />
      </td>
      <td style={st.td}>
        <InlineSelect value={match.stadium_id ? String(match.stadium_id) : ''} options={stadiumOpts} onChange={v => patch('stadium_id', v ? Number(v) : null)} style={{ color: colors.onSurfaceVariant }} getLabel={() => stadium?.name || '—'} disabled={locked} />
      </td>
      <td style={{ ...st.td, textAlign: 'right', fontWeight: 700 }}>
        <InlineSelect value={match.home_team_id ? String(match.home_team_id) : (match.tournament_id && !match.home_team_id ? 'bye' : '')} options={teamOpts} onChange={v => patch('home_team_id', v && v !== 'bye' ? Number(v) : null)} style={{ fontWeight: 700 }} getLabel={() => homeTeam?.name || (match.tournament_id && !match.home_team_id ? 'BYE' : '—')} disabled={locked} />
      </td>
      <td style={st.tdVs}>vs</td>
      <td style={{ ...st.td, fontWeight: 700 }}>
        <InlineSelect value={match.away_team_id ? String(match.away_team_id) : (match.tournament_id && !match.away_team_id ? 'bye' : '')} options={teamOpts} onChange={v => patch('away_team_id', v && v !== 'bye' ? Number(v) : null)} style={{ fontWeight: 700 }} getLabel={() => awayTeam?.name || (match.tournament_id && !match.away_team_id ? 'BYE' : '—')} disabled={locked} />
      </td>
      <td style={{ ...st.td, textAlign: 'center', backgroundColor: colors.surfaceContainerLow, fontWeight: 700 }}>
        {match.home_score ?? '—'}
        {match.penalty_winner_id === match.home_team_id && (
          <sup title={`Νικητής στα πέναλτι: ${homeTeam?.name ?? ''}`} style={{ marginLeft: '0.125rem', color: colors.tertiary, fontSize: '0.625rem', fontWeight: 700 }}>π</sup>
        )}
      </td>
      <td style={{ ...st.td, textAlign: 'center', backgroundColor: colors.surfaceContainerLow, fontWeight: 700 }}>
        {match.away_score ?? '—'}
        {match.penalty_winner_id === match.away_team_id && (
          <sup title={`Νικητής στα πέναλτι: ${awayTeam?.name ?? ''}`} style={{ marginLeft: '0.125rem', color: colors.tertiary, fontSize: '0.625rem', fontWeight: 700 }}>π</sup>
        )}
      </td>
      <td style={st.td}>
        <InlineSelect value={match.referee_id ? String(match.referee_id) : ''} options={refereeOpts} onChange={v => patch('referee_id', v ? Number(v) : null)} style={{ color: colors.onSurfaceVariant }} getLabel={() => referee ? `${referee.first_name[0]}. ${referee.last_name}` : '—'} disabled={locked} />
      </td>
      <td style={{ ...st.td, padding: '0.5rem 0.75rem' }}>
        <div style={{ display: 'flex', gap: '0.25rem' }}>
          <ActionBtn icon="visibility" title="View" color={colors.primary} onClick={onView} />
          <ActionBtn icon="delete" title="Delete" color={colors.error} onClick={onDelete} />
        </div>
      </td>
    </tr>
  )
}

// ─── Create Match Modal ───────────────────────────────────────────────────────

function CreateMatchModal({ teams, referees, stadiums, tournaments, phases, availabilities = [], onClose, onCreated }) {
  const { t } = useLang()
  const [form, setForm] = useState({ status: 'draft', tournament_id: '', phase_id: '', home_team_id: '', away_team_id: '', referee_id: '', stadium_id: '', date: '', time: '', comments: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const set = f => v => setForm(prev => ({ ...prev, [f]: v }))

  // Derive available times from chosen stadium + date
  const stadiumId = form.stadium_id ? Number(form.stadium_id) : null
  const dayOfWeek = form.date ? (new Date(form.date + 'T00:00').getDay() + 6) % 7 : null // Mon=0..Sun=6
  const timeOpts = (() => {
    if (!stadiumId) return [] // require stadium first
    const stadiumSlots = availabilities.filter(a => a.stadium_id === stadiumId)
    if (stadiumSlots.length === 0) return []
    if (dayOfWeek === null) return []
    return stadiumSlots.filter(a => a.day === dayOfWeek).map(s => s.start_time.slice(0, 5))
  })()

  async function handleSubmit() {
    setSaving(true)
    setError(null)
    try {
      const scheduled_at = form.date && form.time ? `${form.date}T${form.time}:00` : null
      await createMatch({
        status:        form.status,
        tournament_id: form.tournament_id ? Number(form.tournament_id) : null,
        home_team_id:  form.home_team_id ? Number(form.home_team_id) : null,
        away_team_id: form.away_team_id ? Number(form.away_team_id) : null,
        referee_id:   form.referee_id   ? Number(form.referee_id)   : null,
        stadium_id:   form.stadium_id   ? Number(form.stadium_id)   : null,
        phase_id:     form.phase_id     ? Number(form.phase_id) : null,
        scheduled_at,
        comments:     form.comments     || null,
      })
      onCreated()
    } catch (err) {
      const msg = err?.detail?.[0]?.msg ?? err?.detail ?? 'Failed to create match'
      setError(typeof msg === 'string' ? msg : JSON.stringify(msg))
    } finally {
      setSaving(false)
    }
  }

  const needsFields = form.status === 'expected' || form.status === 'finished'

  return (
    <div style={st.overlay} onClick={onClose}>
      <div style={st.modal} onClick={e => e.stopPropagation()}>
        <div style={st.modalHeader}>
          <h2 style={st.modalTitle}>{t('db_add_match')}</h2>
          <button style={st.closeBtn} onClick={onClose} data-testid="modal-close">
            <span className="material-symbols-outlined" style={{ fontSize: '1.25rem', color: colors.onSurfaceVariant }}>close</span>
          </button>
        </div>
        <div style={st.modalBody}>
          {/* Tournament */}
          <div style={st.fieldRow}>
            <label style={st.fieldLabel}>{t('db_col_tournament')}</label>
            <select style={st.fieldSelect} value={form.tournament_id} onChange={e => { set('tournament_id')(e.target.value); set('phase_id')('') }} data-testid="input-tournament">
              <option value="">(Φιλικό)</option>
              {tournaments.map(tn => <option key={tn.id} value={tn.id}>{tn.name}</option>)}
            </select>
          </div>

          {/* Phase */}
          {form.tournament_id && (
            <div style={st.fieldRow}>
              <label style={st.fieldLabel}>Φάση</label>
              <select style={st.fieldSelect} value={form.phase_id} onChange={e => set('phase_id')(e.target.value)} data-testid="input-phase">
                <option value="">—</option>
                {phases.filter(p => String(p.tournament_id) === String(form.tournament_id))
                       .map(p => <option key={p.id} value={p.id}>{p.order}</option>)}
              </select>
            </div>
          )}

          {/* Status */}
          <div style={st.fieldRow}>
            <label style={st.fieldLabel}>Κατάσταση</label>
            <select style={st.fieldSelect} value={form.status} onChange={e => set('status')(e.target.value)} data-testid="input-status">
              {ALL_STATUSES.map(s => <option key={s} value={s}>{t('ms_' + s)}</option>)}
            </select>
          </div>

          {/* Stadium */}
          <div style={st.fieldRow}>
            <label style={st.fieldLabel}>Γήπεδο</label>
            <select style={st.fieldSelect} value={form.stadium_id} onChange={e => { set('stadium_id')(e.target.value); set('time')('') }} data-testid="input-stadium">
              <option value="">—</option>
              {stadiums.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>

          {/* Date */}
          <div style={st.fieldRow}>
            <label style={st.fieldLabel}>Ημερομηνία</label>
            <input
              style={st.fieldInput}
              type="date"
              value={form.date}
              onChange={e => { set('date')(e.target.value); set('time')('') }}
              data-testid="input-date"
            />
          </div>

          {/* Time (from stadium availability) */}
          <div style={st.fieldRow}>
            <label style={st.fieldLabel}>Ώρα</label>
            <select
              style={st.fieldSelect}
              value={form.time}
              onChange={e => set('time')(e.target.value)}
              disabled={!form.stadium_id || !form.date}
              data-testid="input-time"
            >
              <option value="">—</option>
              {timeOpts.map(tt => <option key={tt} value={tt}>{tt}</option>)}
            </select>
            {form.stadium_id && form.date && timeOpts.length === 0 && (
              <p style={{ fontSize: '0.7rem', color: colors.outline, margin: '0.25rem 0 0', fontStyle: 'italic' }}>
                Καμία διαθεσιμότητα για αυτό το γήπεδο σε αυτήν την ημέρα.
              </p>
            )}
          </div>

          {/* Teams */}
          <div style={{ ...st.fieldRow, gap: '0.5rem' }}>
            <label style={st.fieldLabel}>Ομάδα Γηπεδούχου</label>
            <select style={st.fieldSelect} value={form.home_team_id} onChange={e => set('home_team_id')(e.target.value)} data-testid="input-home-team">
              <option value="">—</option>
              {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
          <div style={st.fieldRow}>
            <label style={st.fieldLabel}>Ομάδα Φιλοξενούμενου</label>
            <select style={st.fieldSelect} value={form.away_team_id} onChange={e => set('away_team_id')(e.target.value)} data-testid="input-away-team">
              <option value="">—</option>
              {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>

          {/* Referee */}
          <div style={st.fieldRow}>
            <label style={st.fieldLabel}>Διαιτητής</label>
            <select style={st.fieldSelect} value={form.referee_id} onChange={e => set('referee_id')(e.target.value)} data-testid="input-referee">
              <option value="">—</option>
              {referees.map(r => <option key={r.id} value={r.id}>{r.first_name} {r.last_name}</option>)}
            </select>
          </div>

          {needsFields && (
            <p style={{ fontSize: '0.75rem', color: colors.onSurfaceVariant, margin: '0.25rem 0 0' }}>
              Για κατάσταση "{t('ms_' + form.status)}" απαιτούνται: ομάδες, διαιτητής, γήπεδο και ημερομηνία.
            </p>
          )}

          {error && <p style={{ color: colors.error, fontSize: '0.875rem', margin: '0.5rem 0 0' }}>{error}</p>}
        </div>
        <div style={st.modalFooter}>
          <button style={st.cancelBtn} onClick={onClose} disabled={saving}>{t('create_cancel')}</button>
          <button style={st.createBtn} onClick={handleSubmit} disabled={saving} data-testid="btn-save">
            <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>add</span>
            {saving ? '…' : t('create_submit')}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export default function Dashboard() {
  const { t, lang } = useLang()

  // current week's Monday
  const [weekOf, setWeekOf] = useState(() => weekStart(new Date()))
  const weekEnd = addDays(weekOf, 6)

  const [matches,     setMatches]     = useState([])
  const [teams,       setTeams]       = useState([])
  const [referees,    setReferees]    = useState([])
  const [stadiums,    setStadiums]    = useState([])
  const [tournaments, setTournaments] = useState([])
  const [phases,      setPhases]      = useState([])
  const [loading,      setLoading]      = useState(true)
  const [creating,     setCreating]     = useState(false)
  const [selected,     setSelected]     = useState(null)
  const [selectedForm, setSelectedForm] = useState(null)
  const [allPlayers,   setAllPlayers]   = useState([])
  const [matchGoals,       setMatchGoals]       = useState([])
  const [matchCards,       setMatchCards]       = useState([])
  const [toast,            setToast]            = useState(null)
  const [allAvailabilities, setAllAvailabilities] = useState([])

  function showToast(msg) {
    setToast(msg)
    setTimeout(() => setToast(null), 4000)
  }

  function validateStadiumTime(p) {
    if (!p.stadium_id || !p.scheduled_at) return null
    // Extract date/time directly from the ISO string to avoid timezone shifts
    const iso = p.scheduled_at // e.g. "2026-05-14T09:00" or "2026-05-14T09:00:00Z"
    const datePart = iso.slice(0, 10) // "2026-05-14"
    const timePart = iso.slice(11, 16) // "09:00"
    if (!/^\d{2}:\d{2}$/.test(timePart) || timePart === '00:00')
      return 'Πρέπει να επιλέξετε ώρα από τις διαθέσιμες του γηπέδου.'
    const slots = allAvailabilities.filter(a => a.stadium_id === p.stadium_id)
    if (slots.length === 0)
      return 'Το γήπεδο δεν έχει ορισμένες διαθεσιμότητες.'
    const jsDay = new Date(`${datePart}T00:00:00`).getDay() // local midnight, safe for date
    const dayOfWeek = (jsDay + 6) % 7 // 0=Mon..6=Sun
    const daySlots = slots.filter(a => a.day === dayOfWeek)
    if (daySlots.length === 0)
      return `Το γήπεδο δεν είναι διαθέσιμο την επιλεγμένη ημέρα.`
    const match = daySlots.find(a => a.start_time.slice(0, 5) === timePart)
    if (!match)
      return `Η επιλεγμένη ώρα (${timePart}) δεν αντιστοιχεί σε διαθέσιμη ώρα έναρξης του γηπέδου.`
    return null
  }

  function validatePayload(p) {
    if (p.status === 'draft' || p.status === 'canceled') {
      if (p.home_team_id && p.away_team_id && p.home_team_id === p.away_team_id)
        return 'Η γηπεδούχος και η φιλοξενούμενη ομάδα δεν μπορούν να είναι ίδιες.'
      return null
    }
    if (p.tournament_id && !p.phase_id)
      return 'Ένας αγώνας τουρνουά πρέπει να ανήκει σε φάση.'
    if (p.phase_id) {
      const phase = phases.find(ph => ph.id === p.phase_id)
      if (phase) {
        if (p.home_team_id && !phase.team_ids.includes(p.home_team_id))
          return 'Η γηπεδούχος ομάδα δεν ανήκει σε αυτή τη φάση.'
        if (p.away_team_id && !phase.team_ids.includes(p.away_team_id))
          return 'Η φιλοξενούμενη ομάδα δεν ανήκει σε αυτή τη φάση.'
      }
    }
    if (p.home_team_id && p.away_team_id && p.home_team_id === p.away_team_id)
      return 'Η γηπεδούχος και η φιλοξενούμενη ομάδα δεν μπορούν να είναι ίδιες.'
    const isBye = p.tournament_id && (!p.home_team_id || !p.away_team_id) && (p.home_team_id || p.away_team_id)
    if (p.status === 'expected') {
      if (!isBye && (!p.home_team_id || !p.away_team_id))
        return 'Και οι δύο ομάδες είναι υποχρεωτικές για κατάσταση "Αναμενόμενο" (ή επιλέξτε BYE).'
      for (const f of ['referee_id', 'stadium_id', 'scheduled_at'])
        if (!p[f]) return `Το πεδίο "${f}" είναι υποχρεωτικό για κατάσταση "Αναμενόμενο".`
      if (p.home_score !== null || p.away_score !== null)
        return 'Το σκορ πρέπει να είναι κενό για κατάσταση "Αναμενόμενο".'
      const avErr = validateStadiumTime(p)
      if (avErr) return avErr
    }
    if (p.status === 'finished' && !isBye) {
      const avErr = validateStadiumTime(p)
      if (avErr) return avErr
      if (!p.home_team_id || !p.away_team_id)
        return 'Και οι δύο ομάδες είναι υποχρεωτικές για κατάσταση "Ολοκληρωμένο" (ή επιλέξτε BYE).'
      for (const f of ['referee_id', 'stadium_id', 'scheduled_at', 'home_score', 'away_score', 'home_fair_play', 'away_fair_play'])
        if (p[f] === null || p[f] === undefined) return `Το πεδίο "${f}" είναι υποχρεωτικό για κατάσταση "Ολοκληρωμένο".`
      if (p.home_score < 0 || p.away_score < 0)
        return 'Το σκορ δεν μπορεί να είναι αρνητικό.'
      if (p.home_fair_play < -5 || p.home_fair_play > 5 || p.away_fair_play < -5 || p.away_fair_play > 5)
        return 'Το Fair Play πρέπει να είναι μεταξύ -5 και 5.'
      if (p.tournament_id && p.home_score === p.away_score) {
        const tn = tournaments.find(t => t.id === p.tournament_id)
        if (tn?.type === 'knockout') {
          if (!p.penalty_winner_id)
            return 'Σε ισοπαλία νοκ-άουτ απαιτείται νικητής στα πέναλτι.'
          if (p.penalty_winner_id !== p.home_team_id && p.penalty_winner_id !== p.away_team_id)
            return 'Ο νικητής πέναλτι πρέπει να είναι μία από τις δύο ομάδες.'
        }
      }
    }
    return null
  }

  // Filters
  const [filterStatuses,   setFilterStatuses]   = useState(new Set())
  const [filterTournament, setFilterTournament] = useState(null)
  const [filterDays,       setFilterDays]       = useState(new Set())
  const [filterStadiums,   setFilterStadiums]   = useState(new Set())
  const [filterReferee,    setFilterReferee]    = useState(null)
  const [showConflictsOnly, setShowConflictsOnly] = useState(false)
  const [conflictPanelOpen, setConflictPanelOpen] = useState(false)

  // Keep backward compat alias for tests
  const activeStatuses = filterStatuses
  const setActiveStatuses = setFilterStatuses

  // Load entity lists once
  useEffect(() => {
    Promise.all([fetchTeams(), fetchReferees(), fetchStadiums(), fetchTournaments(), fetchPlayers(), fetchPhases(), fetchAllAvailabilities()]).then(([ts, rs, ss, tn, ps, ph, avs]) => {
      setTeams(ts)
      setReferees(rs)
      setStadiums(ss)
      setTournaments(tn)
      setAllPlayers(ps)
      setPhases(ph)
      setAllAvailabilities(avs)
    })
  }, [])

  // Load matches for the current week
  const loadMatches = useCallback(async () => {
    setLoading(true)
    try {
      const ms = await fetchMatches({
        scheduledFrom: isoDate(weekOf),
        scheduledTo:   isoDate(weekEnd),
      })
      // Also fetch draft matches (no scheduled_at) so they always show
      const drafts = await fetchMatches({ status: 'draft' })
      const draftIds = new Set(ms.map(m => m.id))
      const all = [...ms, ...drafts.filter(d => !draftIds.has(d.id))]
      setMatches(all)
    } catch {
      setMatches([])
    } finally {
      setLoading(false)
    }
  }, [weekOf])

  useEffect(() => { loadMatches() }, [loadMatches])

  // Persist an inline edit to the API
  async function handleInlineSave(match) {
    try {
      const payload = {
        status:          match.status,
        home_team_id:    match.home_team_id    ?? null,
        away_team_id:    match.away_team_id    ?? null,
        referee_id:      match.referee_id      ?? null,
        stadium_id:      match.stadium_id      ?? null,
        scheduled_at:    match.scheduled_at    ?? null,
        home_score:      match.home_score      ?? null,
        away_score:      match.away_score      ?? null,
        home_fair_play:  match.home_fair_play  ?? null,
        away_fair_play:  match.away_fair_play  ?? null,
        tournament_id:   match.tournament_id   ?? null,
        phase_id:        match.phase_id        ?? null,
        penalty_winner_id: match.penalty_winner_id ?? null,
        comments:        match.comments        ?? null,
      }
      const err = validatePayload(payload)
      if (err) { showToast(err); return }
      const updated = await updateMatch(match.id, payload)
      setMatches(prev => prev.map(m => m.id === match.id ? updated : m))
    } catch (e) {
      const msg = e?.detail?.[0]?.msg || e?.detail || 'Αποτυχία αποθήκευσης.'
      showToast(typeof msg === 'string' ? msg : JSON.stringify(msg))
    }
  }

  async function handleDelete(match) {
    if (!window.confirm('Διαγραφή αγώνα; Η ενέργεια δεν αναιρείται.')) return
    await deleteMatch(match.id)
    setMatches(prev => prev.filter(m => m.id !== match.id))
  }

  async function openMatch(match) {
    setSelected(match)
    setSelectedForm({ ...initMatchForm(match), _id: match.id })
    setMatchGoals([])
    setMatchCards([])
    const [goals, cards] = await Promise.all([
      fetchMatchGoals(match.id),
      fetchMatchCards(match.id),
    ])
    setMatchGoals(goals)
    setMatchCards(cards)
  }

  async function handleModalSave() {
    if (!selected || !selectedForm) return
    const payload = {
      status:         selectedForm.status,
      tournament_id:  selectedForm.tournament_id  ?? null,
      home_team_id:   selectedForm.home_team_id   ?? null,
      away_team_id:   selectedForm.away_team_id   ?? null,
      referee_id:     selectedForm.referee_id     ?? null,
      stadium_id:     selectedForm.stadium_id     ?? null,
      scheduled_at:   selectedForm.scheduled_at   || null,
      home_score:     selectedForm.home_score !== null && selectedForm.home_score !== '' ? Number(selectedForm.home_score) : null,
      away_score:     selectedForm.away_score !== null && selectedForm.away_score !== '' ? Number(selectedForm.away_score) : null,
      home_fair_play: selectedForm.home_fair_play !== null && selectedForm.home_fair_play !== '' ? Number(selectedForm.home_fair_play) : null,
      away_fair_play: selectedForm.away_fair_play !== null && selectedForm.away_fair_play !== '' ? Number(selectedForm.away_fair_play) : null,
      phase_id:       selectedForm.phase_id ?? null,
      penalty_winner_id: selectedForm.penalty_winner_id ?? null,
      comments:       selectedForm.comments || null,
    }
    const err = validatePayload(payload)
    if (err) { throw { detail: err } }
    const updated = await updateMatch(selected.id, payload)
    setMatches(prev => prev.map(m => m.id === selected.id ? updated : m))
    setSelected(null)
    setSelectedForm(null)
  }

  async function handleModalDelete() {
    if (!selected) return
    await deleteMatch(selected.id)
    setMatches(prev => prev.filter(m => m.id !== selected.id))
    setSelected(null)
    setSelectedForm(null)
  }

  const { conflictIndices, conflicts } = useMemo(() => detectConflicts(matches, allAvailabilities), [matches, allAvailabilities])
  const hasConflicts = conflicts.length > 0

  const filtered = useMemo(() => matches.map((m, i) => ({ m, i })).filter(({ m, i }) => {
    if (showConflictsOnly && !conflictIndices.has(i)) return false
    if (filterStatuses.size > 0 && !filterStatuses.has(m.status)) return false
    if (filterTournament && String(m.tournament_id) !== filterTournament) return false
    if (filterDays.size > 0) {
      const day = m.scheduled_at ? isoDate(new Date(m.scheduled_at)) : null
      if (!day || !filterDays.has(day)) return false
    }
    if (filterStadiums.size > 0 && !filterStadiums.has(String(m.stadium_id))) return false
    if (filterReferee && String(m.referee_id) !== filterReferee) return false
    return true
  }), [matches, filterStatuses, filterTournament, filterDays, filterStadiums, filterReferee, showConflictsOnly, conflictIndices])

  function toggleStatus(status) {
    setActiveStatuses(prev => {
      const next = new Set(prev)
      next.has(status) ? next.delete(status) : next.add(status)
      return next
    })
  }

  const hasFilters = filterStatuses.size > 0 || filterTournament || filterDays.size > 0 || filterStadiums.size > 0 || filterReferee || showConflictsOnly
  const pendingScores = matches.filter(m => m.status === 'expected').length

  // Week label
  const weekFromLabel = weekOf.toLocaleDateString(lang === 'gr' ? 'el-GR' : 'en-GB', { day: '2-digit', month: 'short' })
  const weekToLabel   = weekEnd.toLocaleDateString(lang === 'gr' ? 'el-GR' : 'en-GB', { day: '2-digit', month: 'short' })

  return (
    <div style={st.page}>

      {toast && (
        <div style={{ position: 'fixed', bottom: '1.5rem', left: '50%', transform: 'translateX(-50%)', zIndex: 999, backgroundColor: colors.error, color: colors.onError, padding: '0.75rem 1.5rem', borderRadius: radius.DEFAULT, fontFamily: fonts.body, fontSize: '0.875rem', fontWeight: 500, boxShadow: '0 4px 16px rgba(0,0,0,0.2)', maxWidth: '480px', textAlign: 'center' }}>
          {toast}
        </div>
      )}

      {/* Header */}
      <section style={st.header}>
        <div>
          <h1 style={st.title}>{t('db_title')}</h1>
          <p style={st.subtitle}>{t('db_subtitle')}</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={st.weekNav}>
            <button style={st.weekBtn} onClick={() => setWeekOf(d => addDays(d, -7))}>
              <span className="material-symbols-outlined" style={{ fontSize: '1.25rem', color: colors.onSurfaceVariant }}>chevron_left</span>
            </button>
            <span style={st.weekLabel} data-testid="week-label">{weekFromLabel} — {weekToLabel}</span>
            <button style={st.weekBtn} onClick={() => setWeekOf(d => addDays(d, 7))}>
              <span className="material-symbols-outlined" style={{ fontSize: '1.25rem', color: colors.onSurfaceVariant }}>chevron_right</span>
            </button>
          </div>
          <ExportCSVButton />
          <button style={st.addMatchBtn} onClick={() => setCreating(true)} data-testid="add-match-btn">
            <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>add</span>
            {t('db_add_match')}
          </button>
        </div>
      </section>

      {/* Stat Cards */}
      <div style={{ display: 'flex', gap: '1rem' }}>
        <StatCard label={t('db_total_matches')}  count={matches.length} accentColor={colors.tertiary} />
        <StatCard label={t('db_pending_scores')} count={pendingScores}  accentColor="#eab308" valueColor="#eab308" />
      </div>

      {/* Filters */}
      {(() => {
        // Build filter options from real data
        const statusOpts = ALL_STATUSES.map(s => ({ value: s, label: t('ms_' + s) }))

        const tournamentOpts = tournaments.map(tn => ({ value: String(tn.id), label: tn.name }))


        // Unique days from matches that have a scheduled_at
        const dayOpts = [...new Set(
          matches.filter(m => m.scheduled_at).map(m => isoDate(new Date(m.scheduled_at)))
        )].sort().map(d => {
          const date = new Date(d)
          const label = date.toLocaleDateString(lang === 'gr' ? 'el-GR' : 'en-GB', { weekday: 'short', day: '2-digit', month: 'short' })
          return { value: d, label }
        })

        const stadiumOpts = stadiums
          .filter(s => matches.some(m => m.stadium_id === s.id))
          .map(s => ({ value: String(s.id), label: s.name }))

        const refereeOpts = referees
          .filter(r => matches.some(m => m.referee_id === r.id))
          .map(r => ({ value: String(r.id), label: `${r.first_name} ${r.last_name}` }))

        return (
          <div style={st.filterBar}>
            <FilterDropdown
              label={t('db_col_status')}
              icon="flag"
              options={statusOpts}
              value={filterStatuses}
              onChange={setFilterStatuses}
              mode="multi"
            />
            <FilterDropdown
              label={t('db_col_tournament')}
              icon="emoji_events"
              options={tournamentOpts}
              value={filterTournament}
              onChange={setFilterTournament}
              mode="single"
            />
            <FilterDropdown
              label={t('db_col_date')}
              icon="calendar_today"
              options={dayOpts}
              value={filterDays}
              onChange={setFilterDays}
              mode="multi"
            />
            <FilterDropdown
              label={t('db_col_stadium')}
              icon="stadium"
              options={stadiumOpts}
              value={filterStadiums}
              onChange={setFilterStadiums}
              mode="multi"
            />
            <FilterDropdown
              label={t('db_col_referee')}
              icon="person"
              options={refereeOpts}
              value={filterReferee}
              onChange={setFilterReferee}
              mode="single"
            />

            <div style={st.filterDivider} />

            {/* Conflicts */}
            <button
              onClick={() => hasConflicts ? setShowConflictsOnly(v => !v) : null}
              style={{ ...st.conflictBtn, color: hasConflicts ? colors.error : '#22c55e', cursor: hasConflicts ? 'pointer' : 'default', backgroundColor: showConflictsOnly ? `${colors.errorContainer}88` : 'transparent' }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>{hasConflicts ? 'cancel' : 'check_circle'}</span>
              {hasConflicts ? `${conflicts.length} ${conflicts.length > 1 ? t('db_conflict_p') : t('db_conflict_s')}` : t('db_no_conflicts')}
            </button>
            {hasConflicts && (
              <button style={st.conflictInfoBtn} onClick={() => setConflictPanelOpen(v => !v)}>
                <span className="material-symbols-outlined" style={{ fontSize: '0.9rem' }}>info</span>
              </button>
            )}

            {hasFilters && (
              <button style={st.clearBtn} onClick={() => {
                setFilterStatuses(new Set()); setFilterTournament(null)
                setFilterDays(new Set()); setFilterStadiums(new Set())
                setFilterReferee(null); setShowConflictsOnly(false)
              }}>
                <span className="material-symbols-outlined" style={{ fontSize: '0.875rem' }}>close</span>
                {t('db_clear')}
              </button>
            )}
          </div>
        )
      })()}

      {/* Conflict Panel */}
      {conflictPanelOpen && hasConflicts && (
        <div style={st.conflictPanel}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ ...st.filterLabel, color: colors.error }}>
              <span className="material-symbols-outlined" style={{ fontSize: '0.875rem', verticalAlign: 'middle', marginRight: '0.375rem' }}>warning</span>
              {t('db_conf_title')}
            </span>
            <button style={st.conflictInfoBtn} onClick={() => setConflictPanelOpen(false)}>
              <span className="material-symbols-outlined" style={{ fontSize: '0.9rem' }}>close</span>
            </button>
          </div>
          {conflicts.map((c, i) => {
            const a = matches[c.indices[0]], b = matches[c.indices[1]]
            const aHome = teams.find(t => t.id === a.home_team_id)?.name ?? '?'
            const aAway = teams.find(t => t.id === a.away_team_id)?.name ?? '?'
            const bHome = teams.find(t => t.id === b.home_team_id)?.name ?? '?'
            const bAway = teams.find(t => t.id === b.away_team_id)?.name ?? '?'
            return (
              <div key={i} style={st.conflictItem}>
                <span className="material-symbols-outlined" style={{ fontSize: '0.875rem', color: colors.error, flexShrink: 0 }}>error</span>
                <div>
                  <span style={st.conflictReason}>{c.reason}</span>
                  <span style={st.conflictDetail}> — {aHome} vs {aAway} ({formatMatchDate(a.scheduled_at, lang)} {formatMatchTime(a.scheduled_at)}) &amp; {bHome} vs {bAway} ({formatMatchDate(b.scheduled_at, lang)} {formatMatchTime(b.scheduled_at)})</span>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Match Table */}
      <div style={st.tableWrap}>
        <div style={{ overflowX: 'auto' }}>
          <table style={st.table}>
            <colgroup>
              <col style={{ width: '140px' }} />{/* Tournament */}
              <col style={{ width: '48px'  }} />{/* Phase */}
              <col style={{ width: '120px' }} />{/* Status */}
              <col style={{ width: '130px' }} />{/* Date */}
              <col style={{ width: '70px'  }} />{/* Time */}
              <col style={{ width: '160px' }} />{/* Stadium */}
              <col style={{ width: '150px' }} />{/* Home */}
              <col style={{ width: '40px'  }} />{/* VS */}
              <col style={{ width: '150px' }} />{/* Away */}
              <col style={{ width: '60px'  }} />{/* Score 1 */}
              <col style={{ width: '60px'  }} />{/* Score 2 */}
              <col style={{ width: '140px' }} />{/* Referee */}
              <col style={{ width: '70px'  }} />{/* Actions */}
            </colgroup>
            <thead>
              <tr style={{ backgroundColor: colors.surfaceContainerHigh }}>
                {[t('db_col_tournament'), 'Φ', t('db_col_status'), t('db_col_date'), t('db_col_time'), t('db_col_stadium'), t('db_col_home'), 'VS', t('db_col_away'), t('db_col_score1'), t('db_col_score2'), t('db_col_referee'), ''].map((h, i) => (
                  <th key={i} style={{ ...st.th, textAlign: h === t('db_col_home') ? 'right' : h === 'VS' ? 'center' : 'left' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={13} style={{ ...st.td, textAlign: 'center', padding: '2rem', color: colors.onSurfaceVariant }}>Φόρτωση…</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={13} style={{ ...st.td, textAlign: 'center', padding: '2rem', color: colors.onSurfaceVariant }}>{t('db_no_matches')}</td></tr>
              ) : filtered.map(({ m, i }, rowIdx) => (
                <MatchRow
                  key={m.id}
                  match={m}
                  isFirst={rowIdx === 0}
                  isConflict={conflictIndices.has(i)}
                  teams={teams}
                  referees={referees}
                  stadiums={stadiums}
                  tournaments={tournaments}
                  phases={phases}
                  availabilities={allAvailabilities}
                  onSave={handleInlineSave}
                  onDelete={() => handleDelete(m)}
                  onView={() => openMatch(m)}
                />
              ))}
            </tbody>
          </table>
        </div>
        <div style={st.tableFooter}>
          <span>{t('db_showing')} {filtered.length} {t('db_of')} {matches.length} {t('db_matches_week')}</span>
        </div>
      </div>

      {selected && selectedForm && (
        <ItemModal
          title="Λεπτομέρειες Αγώνα"
          subtitle={`ID: ${selected.id}`}
          maxWidth="720px"
          onClose={() => { setSelected(null); setSelectedForm(null); setMatchGoals([]); setMatchCards([]) }}
          onDelete={handleModalDelete}
          onSave={handleModalSave}
          onEditingChange={editing => { if (!editing) setSelectedForm(initMatchForm(selected)) }}
        >
          {(editing) => (
            <MatchModalContent
              form={selectedForm}
              setForm={setSelectedForm}
              editing={editing}
              teams={teams}
              referees={referees}
              stadiums={stadiums}
              tournaments={tournaments}
              phases={phases}
              players={allPlayers}
              goals={matchGoals}
              cards={matchCards}
              onGoalAdded={g => setMatchGoals(prev => [...prev, g])}
              onGoalRemoved={async id => { await deleteMatchGoal(id); setMatchGoals(prev => prev.filter(g => g.id !== id)) }}
              onCardAdded={c => setMatchCards(prev => [...prev, c])}
              onCardRemoved={async id => { await deleteMatchCard(id); setMatchCards(prev => prev.filter(c => c.id !== id)) }}
            />
          )}
        </ItemModal>
      )}

      {creating && (
        <CreateMatchModal
          teams={teams}
          referees={referees}
          stadiums={stadiums}
          phases={phases}
          tournaments={tournaments}
          availabilities={allAvailabilities}
          onClose={() => setCreating(false)}
          onCreated={() => { setCreating(false); loadMatches() }}
        />
      )}

    </div>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const st = {
  page: { padding: '2.5rem', display: 'flex', flexDirection: 'column', gap: '2rem', fontFamily: fonts.body, backgroundColor: colors.surface, minHeight: '100%' },
  header: { display: 'flex', flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' },
  title: { fontSize: '2.25rem', fontWeight: 700, letterSpacing: '-0.025em', color: colors.onSurface, margin: '0 0 0.5rem', fontFamily: fonts.headline },
  subtitle: { fontSize: '0.75rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.1em', color: colors.onSurfaceVariant, margin: 0 },
  weekNav: { display: 'flex', alignItems: 'center', backgroundColor: colors.surfaceContainerLowest, border: `1px solid ${colors.outlineVariant}33`, borderRadius: radius.lg, padding: '0.25rem' },
  weekBtn: { display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer', padding: '0.375rem', borderRadius: radius.DEFAULT },
  weekLabel: { padding: '0 1rem', fontSize: '0.875rem', fontWeight: 600, color: colors.onSurface, minWidth: '9rem', textAlign: 'center' },
  filterBar: { display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', padding: '0.75rem 1rem', backgroundColor: colors.surfaceContainerLowest, border: `1px solid ${colors.outlineVariant}1a`, borderRadius: radius.DEFAULT },
  filterGroup: { display: 'flex', alignItems: 'center', gap: '0.625rem' },
  filterLabel: { fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: colors.onSurfaceVariant, fontFamily: fonts.label, whiteSpace: 'nowrap' },
  filterDivider: { width: '1px', height: '1.5rem', backgroundColor: `${colors.outlineVariant}44`, flexShrink: 0 },
  chip: { display: 'inline-flex', alignItems: 'center', padding: '0.25rem 0.625rem', borderRadius: radius.DEFAULT, fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', fontFamily: fonts.label, border: '1px solid', cursor: 'pointer', transition: 'background-color 0.15s, color 0.15s', whiteSpace: 'nowrap' },
  inlineValue: { display: 'inline-flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer', borderRadius: '3px', padding: '0.125rem 0.25rem', margin: '-0.125rem -0.25rem', fontSize: 'inherit', fontWeight: 'inherit', transition: 'background-color 0.15s' },
  inlineSelect: { fontSize: '0.8125rem', fontWeight: 600, fontFamily: fonts.body, color: colors.onSurface, backgroundColor: colors.surfaceContainerLow, border: `1px solid ${colors.primary}55`, borderRadius: radius.DEFAULT, padding: '0.125rem 0.375rem', outline: 'none', cursor: 'pointer' },
  actionBtn: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem', borderRadius: radius.DEFAULT, transition: 'color 0.15s, background-color 0.15s' },
  conflictBtn: { display: 'inline-flex', alignItems: 'center', gap: '0.25rem', background: 'none', border: `1px solid ${colors.outlineVariant}44`, borderRadius: radius.DEFAULT, padding: '0.25rem 0.5rem', fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', fontFamily: fonts.label, transition: 'background-color 0.15s' },
  conflictInfoBtn: { display: 'inline-flex', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer', padding: '0.125rem', color: colors.onSurfaceVariant },
  conflictPanel: { backgroundColor: `${colors.errorContainer}33`, border: `1px solid ${colors.error}33`, borderRadius: radius.DEFAULT, padding: '1rem 1.25rem' },
  conflictItem: { display: 'flex', alignItems: 'flex-start', gap: '0.5rem', padding: '0.375rem 0', borderTop: `1px solid ${colors.error}22` },
  conflictReason: { fontSize: '0.75rem', fontWeight: 700, color: colors.error, fontFamily: fonts.label },
  conflictDetail: { fontSize: '0.75rem', color: colors.onSurfaceVariant, fontFamily: fonts.body },
  clearBtn: { display: 'flex', alignItems: 'center', gap: '0.25rem', marginLeft: 'auto', background: 'none', border: 'none', fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: colors.onSurfaceVariant, cursor: 'pointer', fontFamily: fonts.label, padding: '0.25rem 0.5rem' },
  tableWrap: { backgroundColor: colors.surfaceContainerLowest, boxShadow: '0 1px 2px rgba(0,0,0,0.05)', border: `1px solid ${colors.outlineVariant}1a`, overflow: 'hidden' },
  table: { width: '100%', minWidth: '1290px', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8125rem', fontWeight: 500, tableLayout: 'fixed' },
  th: { padding: '0.875rem 1rem', borderRight: `1px solid ${colors.outlineVariant}1a`, fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: colors.onSurfaceVariant, fontFamily: fonts.label, whiteSpace: 'nowrap', overflow: 'hidden' },
  td: { padding: '0.75rem 1rem', borderRight: `1px solid ${colors.outlineVariant}1a`, color: colors.onSurface, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 0 },
  tdVs: { padding: '0.75rem 0.5rem', borderRight: `1px solid ${colors.outlineVariant}1a`, textAlign: 'center', color: colors.outline, fontWeight: 500, whiteSpace: 'nowrap' },
  badge: { display: 'inline-flex', alignItems: 'center', padding: '0.125rem 0.5rem', fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', borderRadius: radius.DEFAULT, fontFamily: fonts.label, whiteSpace: 'nowrap' },
  tableFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.875rem 1.5rem', borderTop: `1px solid ${colors.outlineVariant}1a`, backgroundColor: `${colors.surfaceContainerLow}4d`, fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: colors.onSurfaceVariant, fontFamily: fonts.label },
  // Modal
  overlay: { position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: `${colors.onSurface}66`, backdropFilter: 'blur(4px)' },
  modal: { backgroundColor: colors.surfaceContainerLowest, width: '100%', maxWidth: '540px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', borderRadius: radius.DEFAULT, border: `1px solid ${colors.outlineVariant}4d`, boxShadow: '0 12px 32px rgba(25,28,28,0.12)', overflow: 'hidden' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 2rem', backgroundColor: colors.surfaceContainerHigh, borderBottom: `1px solid ${colors.outlineVariant}80`, flexShrink: 0 },
  modalTitle: { fontSize: '1.25rem', fontWeight: 700, letterSpacing: '-0.02em', color: colors.onSurface, margin: 0, fontFamily: fonts.headline },
  closeBtn: { display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem', borderRadius: radius.DEFAULT },
  modalBody: { flex: 1, overflowY: 'auto', padding: '1.5rem 2rem', display: 'flex', flexDirection: 'column', gap: '1rem' },
  modalFooter: { display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', padding: '1rem 2rem', backgroundColor: colors.surfaceContainerLow, borderTop: `1px solid ${colors.outlineVariant}4d`, flexShrink: 0 },
  fieldRow: { display: 'flex', flexDirection: 'column', gap: '0.375rem' },
  fieldLabel: { fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: colors.onSurfaceVariant, fontFamily: fonts.label },
  fieldSelect: { backgroundColor: colors.surfaceContainer, border: 'none', borderBottom: `2px solid ${colors.outlineVariant}4d`, outline: 'none', padding: '0.5rem 0.75rem', fontSize: '0.875rem', fontWeight: 500, color: colors.onSurface, fontFamily: fonts.body, cursor: 'pointer' },
  fieldInput: { backgroundColor: colors.surfaceContainer, border: 'none', borderBottom: `2px solid ${colors.outlineVariant}4d`, outline: 'none', padding: '0.5rem 0.75rem', fontSize: '0.875rem', fontWeight: 500, color: colors.onSurface, fontFamily: fonts.body },
  cancelBtn: { padding: '0.5rem 1.25rem', backgroundColor: 'transparent', color: colors.onSurfaceVariant, border: `1px solid ${colors.outlineVariant}`, borderRadius: radius.DEFAULT, fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer', fontFamily: fonts.label },
  createBtn: { display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.5rem 1.5rem', backgroundColor: colors.primary, color: colors.onPrimary, border: 'none', borderRadius: radius.DEFAULT, fontSize: '0.875rem', fontWeight: 700, cursor: 'pointer', fontFamily: fonts.label },
  addMatchBtn: { display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.5rem 1.25rem', backgroundColor: colors.primary, color: colors.onPrimary, border: 'none', borderRadius: radius.DEFAULT, fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer', fontFamily: fonts.label, whiteSpace: 'nowrap' },
}
