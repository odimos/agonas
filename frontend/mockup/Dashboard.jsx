import { useState, useMemo, useEffect, useRef } from 'react'
import { colors, fonts, radius } from './styles'
import { StatCard } from './Buttons'

// ─── Mock Data ────────────────────────────────────────────────────────────────

const DAYS_GR = ['Κυριακή', 'Δευτέρα', 'Τρίτη', 'Τετάρτη', 'Πέμπτη', 'Παρασκευή', 'Σάββατο']

function formatDate(ddmmyyyy) {
  const [dd, mm, yyyy] = ddmmyyyy.split('/')
  const d = new Date(parseInt(yyyy), parseInt(mm) - 1, parseInt(dd))
  return `${DAYS_GR[d.getDay()]}, ${dd}/${mm}`
}

const MATCHES = [
  { tournament: 'Pro-League Winter', status: 'Finished', date: '14/12/2024', time: '18:30', stadium: 'Municipal Stadium A', home: 'Titans FC',     groupHome: 'Group A', away: 'Ajax Metro',   groupAway: 'Group A', score1: '2', score2: '1', referee: 'M. Koutsoukos' },
  { tournament: 'Regional Cup',      status: 'Expected', date: '15/12/2024', time: '21:00', stadium: 'North Arena',         home: 'Golden Eagles', groupHome: 'Group C', away: 'United Blue',  groupAway: 'Group C', score1: '—', score2: '—', referee: 'L. Georgiou'   },
  { tournament: 'Pro-League Winter', status: 'Canceled', date: '14/12/2024', time: '15:00', stadium: 'Olympic Fields',      home: 'Spartans',      groupHome: 'Group B', away: 'Red Knights',  groupAway: 'Group B', score1: '—', score2: '—', referee: 'A. Pappas'     },
  { tournament: 'Under-21 Series',   status: 'Draft',    date: '16/12/2024', time: '11:00', stadium: 'Training Ground 4',   home: 'Future Stars',  groupHome: 'Group A', away: 'Academy XI',   groupAway: 'Group A', score1: '—', score2: '—', referee: 'D. Nikolaou'   },
  { tournament: 'Pro-League Winter', status: 'Finished', date: '12/12/2024', time: '20:45', stadium: 'Central Dome',        home: 'Victory FC',    groupHome: 'Group B', away: 'Storm United', groupAway: 'Group B', score1: '1', score2: '0', referee: 'P. Stefanatos' },
  { tournament: 'Regional Cup',      status: 'Draft',    date: '17/12/2024', time: '19:00', stadium: 'North Arena',         home: 'Iron Wolves',   groupHome: 'Group A', away: 'Blue Falcons', groupAway: 'Group B', score1: '—', score2: '—', referee: 'N. Alexiou'    },
  { tournament: 'Under-21 Series',   status: 'Expected', date: '18/12/2024', time: '14:00', stadium: 'Training Ground 4',   home: 'Rising Stars',  groupHome: 'Group B', away: 'City Hawks',   groupAway: 'Group C', score1: '—', score2: '—', referee: 'K. Papadakis'  },
  { tournament: 'Pro-League Winter', status: 'Expected', date: '19/12/2024', time: '20:00', stadium: 'Central Dome',        home: 'Ajax Metro',    groupHome: 'Group A', away: 'Red Knights',  groupAway: 'Group B', score1: '—', score2: '—', referee: 'M. Koutsoukos' },
  { tournament: 'Regional Cup',      status: 'Expected', date: '15/12/2024', time: '19:30', stadium: 'Olympic Fields',      home: 'Midnight FC',   groupHome: 'Group B', away: 'Coastal XI',   groupAway: 'Group A', score1: '—', score2: '—', referee: 'L. Georgiou'   },
  { tournament: 'Under-21 Series',   status: 'Draft',    date: '16/12/2024', time: '11:00', stadium: 'North Arena',         home: 'Ember United',  groupHome: 'Group C', away: 'Silver Squad', groupAway: 'Group C', score1: '—', score2: '—', referee: 'A. Pappas'     },
]

// ─── Conflict Detection ───────────────────────────────────────────────────────

function detectConflicts(matches) {
  const conflictIndices = new Set()
  const conflicts = []

  for (let i = 0; i < matches.length; i++) {
    for (let j = i + 1; j < matches.length; j++) {
      const a = matches[i], b = matches[j]
      if (a.date !== b.date) continue
      const refereeConflict = a.referee === b.referee
      const stadiumConflict = a.stadium === b.stadium
      if (refereeConflict || stadiumConflict) {
        conflictIndices.add(i)
        conflictIndices.add(j)
        conflicts.push({
          indices: [i, j],
          reason: refereeConflict ? `Referee ${a.referee} double-booked` : `Stadium ${a.stadium} double-booked`,
        })
      }
    }
  }
  return { conflictIndices, conflicts }
}

const ALL_STATUSES   = ['Draft', 'Expected', 'Finished', 'Canceled']
const ALL_TOURNAMENTS = ['Pro-League Winter', 'Regional Cup', 'Under-21 Series', '(Friendly)']
const ALL_STADIUMS    = ['Municipal Stadium A', 'North Arena', 'Olympic Fields', 'Training Ground 4', 'Central Dome', 'River Bank Oval', 'Summit Stadium']

const STATUS_STYLES = {
  Finished: { backgroundColor: colors.tertiaryContainer,  color: colors.onTertiary           },
  Expected: { backgroundColor: colors.secondaryContainer, color: colors.onSecondaryContainer },
  Canceled: { backgroundColor: colors.errorContainer,     color: colors.onErrorContainer     },
  Draft:    { backgroundColor: colors.surfaceContainer,   color: colors.onSurfaceVariant     },
}

// ─── Components ───────────────────────────────────────────────────────────────

function MatchStatusBadge({ status }) {
  return (
    <span style={{ ...st.badge, ...(STATUS_STYLES[status] ?? STATUS_STYLES.Expected) }}>
      {status}
    </span>
  )
}

function toInputDate(ddmmyyyy) {
  const [dd, mm, yyyy] = ddmmyyyy.split('/')
  return `${yyyy}-${mm}-${dd}`
}

function fromInputDate(yyyymmdd) {
  const [yyyy, mm, dd] = yyyymmdd.split('-')
  return `${dd}/${mm}/${yyyy}`
}

function InlineDatePicker({ value, onChange }) {
  const ref = useRef(null)

  function handleClick() {
    ref.current?.showPicker?.()
  }

  return (
    <span style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
      <span onClick={handleClick} style={{ ...st.inlineValue, cursor: 'pointer' }}>
        {formatDate(value)}
      </span>
      <input
        ref={ref}
        type="date"
        value={toInputDate(value)}
        onChange={e => { if (e.target.value) onChange(fromInputDate(e.target.value)) }}
        style={{
          position: 'absolute',
          opacity: 0,
          pointerEvents: 'none',
          width: 0,
          height: 0,
          top: '100%',
          left: 0,
        }}
      />
    </span>
  )
}

function InlineTimePicker({ value, onChange }) {
  const [editing, setEditing] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (editing && ref.current) {
      ref.current.focus()
      ref.current.select?.()
    }
  }, [editing])

  if (editing) {
    return (
      <input
        ref={ref}
        type="time"
        defaultValue={value}
        onChange={e => { if (e.target.value) onChange(e.target.value) }}
        onBlur={() => setEditing(false)}
        style={{ ...st.inlineSelect, width: '7rem' }}
      />
    )
  }
  return (
    <span onClick={() => setEditing(true)} style={{ ...st.inlineValue, cursor: 'pointer' }}>
      {value}
    </span>
  )
}

function InlineSelect({ value, options, onChange, style }) {
  return (
    <span style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
      <span style={{ ...st.inlineValue, ...style }}>{value}</span>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{
          position: 'absolute',
          inset: 0,
          opacity: 0,
          cursor: 'pointer',
          width: '100%',
          height: '100%',
          fontSize: 'inherit',
        }}
      >
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </span>
  )
}

function MatchRow({ match, isFirst, isConflict, onUpdate }) {
  const [hovered, setHovered] = useState(false)
  const baseBg = isConflict ? `${colors.errorContainer}55` : 'transparent'
  return (
    <tr
      style={{ borderTop: isFirst ? 'none' : `1px solid ${colors.outlineVariant}1a`, backgroundColor: hovered ? colors.surfaceContainerLow : baseBg, transition: 'background-color 0.15s' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <td style={{ ...st.td }}>
        <InlineSelect value={match.tournament} options={ALL_TOURNAMENTS} onChange={v => onUpdate({ tournament: v })} style={{ color: colors.primary, fontWeight: 600 }} />
      </td>
      <td style={st.td}>
        <InlineSelect
          value={match.status}
          options={ALL_STATUSES}
          onChange={v => onUpdate({ status: v })}
          style={{ ...STATUS_STYLES[match.status], ...st.badge }}
        />
      </td>
      <td style={st.td}><InlineDatePicker value={match.date} onChange={v => onUpdate({ date: v })} /></td>
      <td style={st.td}><InlineTimePicker value={match.time} onChange={v => onUpdate({ time: v })} /></td>
      <td style={{ ...st.td }}>
        <InlineSelect value={match.stadium} options={ALL_STADIUMS} onChange={v => onUpdate({ stadium: v })} style={{ color: colors.onSurfaceVariant }} />
      </td>
      <td style={{ ...st.td, textAlign: 'right', fontWeight: 700 }}>{match.home}</td>
      <td style={{ ...st.td, textAlign: 'center', color: colors.onSurfaceVariant }}>{match.groupHome}</td>
      <td style={{ ...st.tdVs }}>vs</td>
      <td style={{ ...st.td, textAlign: 'center', color: colors.onSurfaceVariant }}>{match.groupAway}</td>
      <td style={{ ...st.td, fontWeight: 700 }}>{match.away}</td>
      <td style={{ ...st.td, textAlign: 'center', backgroundColor: colors.surfaceContainerLow, fontWeight: 700 }}>{match.score1}</td>
      <td style={{ ...st.td, textAlign: 'center', backgroundColor: colors.surfaceContainerLow, fontWeight: 700 }}>{match.score2}</td>
      <td style={{ ...st.td }}>{match.referee}</td>
      <td style={{ ...st.td, padding: '0.5rem 0.75rem' }}>
        <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
          <ActionBtn icon="visibility" title="View" color={colors.primary} />
          <ActionBtn icon="delete" title="Delete" color={colors.error} />
        </div>
      </td>
    </tr>
  )
}

function ActionBtn({ icon, title, color }) {
  const [hovered, setHovered] = useState(false)
  return (
    <button
      title={title}
      style={{
        ...st.actionBtn,
        color: hovered ? color : colors.onSurfaceVariant,
        backgroundColor: hovered ? `${color}15` : 'transparent',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>{icon}</span>
    </button>
  )
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export default function Dashboard() {
  const [matches, setMatches] = useState(MATCHES)
  const [week, setWeek] = useState(12)
  const [activeStatuses, setActiveStatuses] = useState(new Set())
  const [tournamentFilter, setTournamentFilter] = useState('')
  const [showConflictsOnly, setShowConflictsOnly] = useState(false)
  const [conflictPanelOpen, setConflictPanelOpen] = useState(false)

  function updateMatch(idx, patch) {
    setMatches(prev => prev.map((m, i) => i === idx ? { ...m, ...patch } : m))
  }

  const tournaments = useMemo(() => [...new Set(matches.map(m => m.tournament))], [matches])
  const { conflictIndices, conflicts } = useMemo(() => detectConflicts(matches), [matches])
  const hasConflicts = conflicts.length > 0

  const filtered = useMemo(() => matches.map((m, i) => ({ m, i })).filter(({ m, i }) => {
    if (showConflictsOnly && !conflictIndices.has(i)) return false
    if (activeStatuses.size > 0 && !activeStatuses.has(m.status)) return false
    if (tournamentFilter && m.tournament !== tournamentFilter) return false
    return true
  }), [matches, activeStatuses, tournamentFilter, showConflictsOnly, conflictIndices])

  function toggleStatus(status) {
    setActiveStatuses(prev => {
      const next = new Set(prev)
      next.has(status) ? next.delete(status) : next.add(status)
      return next
    })
  }

  const hasFilters = activeStatuses.size > 0 || tournamentFilter !== '' || showConflictsOnly

  return (
    <div style={st.page}>

      {/* Header */}
      <section style={st.header}>
        <div>
          <h1 style={st.title}>Match Schedule</h1>
          <p style={st.subtitle}>Executive League Management Console</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={st.weekNav}>
            <button style={st.weekBtn} onClick={() => setWeek(w => Math.max(1, w - 1))}>
              <span className="material-symbols-outlined" style={{ fontSize: '1.25rem', color: colors.onSurfaceVariant }}>chevron_left</span>
            </button>
            <span style={st.weekLabel}>Week {week}</span>
            <button style={st.weekBtn} onClick={() => setWeek(w => w + 1)}>
              <span className="material-symbols-outlined" style={{ fontSize: '1.25rem', color: colors.onSurfaceVariant }}>chevron_right</span>
            </button>
          </div>
          <button style={st.addBtn}>
            <span className="material-symbols-outlined" style={{ fontSize: '1.25rem' }}>add_circle</span>
            + Add Match
          </button>
        </div>
      </section>

      {/* Stat Cards */}
      <div style={{ display: 'flex', gap: '1rem' }}>
        <StatCard label="TOTAL MATCHES"  count="124" accentColor={colors.tertiary} />
        <StatCard label="PENDING SCORES" count="08"  accentColor="#eab308" valueColor="#eab308" />
      </div>

      {/* Filters */}
      <div style={st.filterBar}>
        <div style={st.filterGroup}>
          <span style={st.filterLabel}>Status</span>
          <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
            {ALL_STATUSES.map(s => {
              const active = activeStatuses.has(s)
              const colors_ = STATUS_STYLES[s]
              return (
                <button
                  key={s}
                  onClick={() => toggleStatus(s)}
                  style={{
                    ...st.chip,
                    backgroundColor: active ? colors_.backgroundColor : 'transparent',
                    color: active ? colors_.color : colors.onSurfaceVariant,
                    borderColor: active ? colors_.backgroundColor : `${colors.outlineVariant}55`,
                  }}
                >
                  {s}
                </button>
              )
            })}
          </div>
        </div>

        <div style={st.filterDivider} />

        <div style={st.filterGroup}>
          <span style={st.filterLabel}>Tournament</span>
          <select
            value={tournamentFilter}
            onChange={e => setTournamentFilter(e.target.value)}
            style={st.select}
          >
            <option value="">All tournaments</option>
            {tournaments.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        <div style={st.filterDivider} />

        <div style={st.filterGroup}>
          <span style={st.filterLabel}>Conflicts</span>
          <button
            onClick={() => hasConflicts ? setShowConflictsOnly(v => !v) : null}
            style={{
              ...st.conflictBtn,
              color: hasConflicts ? colors.error : '#22c55e',
              cursor: hasConflicts ? 'pointer' : 'default',
              backgroundColor: showConflictsOnly ? `${colors.errorContainer}88` : 'transparent',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>
              {hasConflicts ? 'cancel' : 'check_circle'}
            </span>
            {hasConflicts ? `${conflicts.length} conflict${conflicts.length > 1 ? 's' : ''}` : 'None'}
          </button>
          {hasConflicts && (
            <button
              style={{ ...st.conflictInfoBtn }}
              onClick={() => setConflictPanelOpen(v => !v)}
              title="Show conflict details"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '0.9rem' }}>info</span>
            </button>
          )}
        </div>

        {hasFilters && (
          <button
            style={st.clearBtn}
            onClick={() => { setActiveStatuses(new Set()); setTournamentFilter(''); setShowConflictsOnly(false) }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '0.875rem' }}>close</span>
            Clear
          </button>
        )}
      </div>

      {/* Conflict Panel */}
      {conflictPanelOpen && hasConflicts && (
        <div style={st.conflictPanel}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ ...st.filterLabel, color: colors.error }}>
              <span className="material-symbols-outlined" style={{ fontSize: '0.875rem', verticalAlign: 'middle', marginRight: '0.375rem' }}>warning</span>
              Scheduling Conflicts
            </span>
            <button style={{ ...st.conflictInfoBtn }} onClick={() => setConflictPanelOpen(false)}>
              <span className="material-symbols-outlined" style={{ fontSize: '0.9rem' }}>close</span>
            </button>
          </div>
          {conflicts.map((c, i) => {
            const a = matches[c.indices[0]], b = matches[c.indices[1]]
            return (
              <div key={i} style={st.conflictItem}>
                <span className="material-symbols-outlined" style={{ fontSize: '0.875rem', color: colors.error, flexShrink: 0 }}>error</span>
                <div>
                  <span style={st.conflictReason}>{c.reason}</span>
                  <span style={st.conflictDetail}> — {a.home} vs {a.away} ({formatDate(a.date)} {a.time}) &amp; {b.home} vs {b.away} ({formatDate(b.date)} {b.time})</span>
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
            <thead>
              <tr style={{ backgroundColor: colors.surfaceContainerHigh }}>
                {['Tournament', 'Status', 'Date', 'Time', 'Stadium', 'Home Team', 'Group', 'VS', 'Group', 'Away Team', 'Score 1', 'Score 2', 'Referee', ''].map((h, i) => (
                  <th key={i} style={{ ...st.th, textAlign: h === 'Home Team' ? 'right' : h === 'VS' ? 'center' : 'left' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0
                ? (
                  <tr>
                    <td colSpan={13} style={{ ...st.td, textAlign: 'center', padding: '2rem', color: colors.onSurfaceVariant }}>
                      No matches match the current filters.
                    </td>
                  </tr>
                )
                : filtered.map(({ m, i }, rowIdx) => (
                    <MatchRow key={i} match={m} isFirst={rowIdx === 0} isConflict={conflictIndices.has(i)} onUpdate={patch => updateMatch(i, patch)} />
                  ))
              }
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div style={st.tableFooter}>
          <span>Showing {filtered.length} of {matches.length} matches this week</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <button style={st.footerLink}>Export to CSV</button>
            <button style={st.footerLink}>Print Sheet</button>
            <div style={{ display: 'flex', gap: '0.375rem' }}>
              {[1, 2, 3].map(n => (
                <button key={n} style={{ ...st.pageBtn, ...(n === 1 ? st.pageBtnActive : {}) }}>{n}</button>
              ))}
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const st = {
  page: {
    padding: '2.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '2rem',
    fontFamily: fonts.body,
    backgroundColor: colors.surface,
    minHeight: '100%',
  },

  // Header
  header: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: '1rem',
    flexWrap: 'wrap',
  },
  title: {
    fontSize: '2.25rem',
    fontWeight: 700,
    letterSpacing: '-0.025em',
    color: colors.onSurface,
    margin: '0 0 0.5rem',
    fontFamily: fonts.headline,
  },
  subtitle: {
    fontSize: '0.75rem',
    fontWeight: 500,
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    color: colors.onSurfaceVariant,
    margin: 0,
  },
  weekNav: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: colors.surfaceContainerLowest,
    border: `1px solid ${colors.outlineVariant}33`,
    borderRadius: radius.lg,
    padding: '0.25rem',
  },
  weekBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '0.375rem',
    borderRadius: radius.DEFAULT,
  },
  weekLabel: {
    padding: '0 1rem',
    fontSize: '0.875rem',
    fontWeight: 600,
    color: colors.onSurface,
    minWidth: '6rem',
    textAlign: 'center',
  },
  addBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.625rem 1rem',
    backgroundColor: colors.primary,
    color: colors.onPrimary,
    border: 'none',
    borderRadius: radius.DEFAULT,
    fontSize: '0.875rem',
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: fonts.label,
  },

  // Filters
  filterBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.25rem',
    flexWrap: 'wrap',
    padding: '0.875rem 1.25rem',
    backgroundColor: colors.surfaceContainerLowest,
    border: `1px solid ${colors.outlineVariant}1a`,
    borderRadius: radius.DEFAULT,
  },
  filterGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.625rem',
  },
  filterLabel: {
    fontSize: '0.625rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    color: colors.onSurfaceVariant,
    fontFamily: fonts.label,
    whiteSpace: 'nowrap',
  },
  filterDivider: {
    width: '1px',
    height: '1.5rem',
    backgroundColor: `${colors.outlineVariant}44`,
    flexShrink: 0,
  },
  chip: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '0.25rem 0.625rem',
    borderRadius: radius.DEFAULT,
    fontSize: '0.625rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    fontFamily: fonts.label,
    border: '1px solid',
    cursor: 'pointer',
    transition: 'background-color 0.15s, color 0.15s',
    whiteSpace: 'nowrap',
  },
  select: {
    fontSize: '0.75rem',
    fontWeight: 500,
    fontFamily: fonts.body,
    color: colors.onSurface,
    backgroundColor: colors.surfaceContainerLow,
    border: `1px solid ${colors.outlineVariant}44`,
    borderRadius: radius.DEFAULT,
    padding: '0.3rem 0.625rem',
    cursor: 'pointer',
    outline: 'none',
  },
  inlineValue: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem',
    cursor: 'pointer',
    borderRadius: '3px',
    padding: '0.125rem 0.25rem',
    margin: '-0.125rem -0.25rem',
    fontSize: 'inherit',
    fontWeight: 'inherit',
    transition: 'background-color 0.15s',
  },
  inlineEditIcon: {
    fontSize: '0.7rem',
    opacity: 0.35,
    color: colors.onSurfaceVariant,
  },
  inlineSelect: {
    fontSize: '0.8125rem',
    fontWeight: 600,
    fontFamily: fonts.body,
    color: colors.onSurface,
    backgroundColor: colors.surfaceContainerLow,
    border: `1px solid ${colors.primary}55`,
    borderRadius: radius.DEFAULT,
    padding: '0.125rem 0.375rem',
    outline: 'none',
    cursor: 'pointer',
  },
  actionBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '0.25rem',
    borderRadius: radius.DEFAULT,
    transition: 'color 0.15s, background-color 0.15s',
  },
  conflictBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem',
    background: 'none',
    border: `1px solid ${colors.outlineVariant}44`,
    borderRadius: radius.DEFAULT,
    padding: '0.25rem 0.5rem',
    fontSize: '0.625rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    fontFamily: fonts.label,
    transition: 'background-color 0.15s',
  },
  conflictInfoBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '0.125rem',
    color: colors.onSurfaceVariant,
  },
  conflictPanel: {
    backgroundColor: `${colors.errorContainer}33`,
    border: `1px solid ${colors.error}33`,
    borderRadius: radius.DEFAULT,
    padding: '1rem 1.25rem',
  },
  conflictItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.5rem',
    padding: '0.375rem 0',
    borderTop: `1px solid ${colors.error}22`,
  },
  conflictReason: {
    fontSize: '0.75rem',
    fontWeight: 700,
    color: colors.error,
    fontFamily: fonts.label,
  },
  conflictDetail: {
    fontSize: '0.75rem',
    color: colors.onSurfaceVariant,
    fontFamily: fonts.body,
  },
  clearBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
    marginLeft: 'auto',
    background: 'none',
    border: 'none',
    fontSize: '0.625rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    color: colors.onSurfaceVariant,
    cursor: 'pointer',
    fontFamily: fonts.label,
    padding: '0.25rem 0.5rem',
  },

  // Table
  tableWrap: {
    backgroundColor: colors.surfaceContainerLowest,
    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
    border: `1px solid ${colors.outlineVariant}1a`,
    overflow: 'hidden',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
    fontSize: '0.8125rem',
    fontWeight: 500,
  },
  th: {
    padding: '0.875rem 1rem',
    borderRight: `1px solid ${colors.outlineVariant}1a`,
    fontSize: '0.625rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    color: colors.onSurfaceVariant,
    fontFamily: fonts.label,
    whiteSpace: 'nowrap',
  },
  td: {
    padding: '0.75rem 1rem',
    borderRight: `1px solid ${colors.outlineVariant}1a`,
    color: colors.onSurface,
    whiteSpace: 'nowrap',
  },
  tdVs: {
    padding: '0.75rem 0.5rem',
    borderRight: `1px solid ${colors.outlineVariant}1a`,
    textAlign: 'center',
    color: colors.outline,
    fontWeight: 500,
    whiteSpace: 'nowrap',
  },
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '0.125rem 0.5rem',
    fontSize: '0.625rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    borderRadius: radius.DEFAULT,
    fontFamily: fonts.label,
    whiteSpace: 'nowrap',
  },

  // Table footer
  tableFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.875rem 1.5rem',
    borderTop: `1px solid ${colors.outlineVariant}1a`,
    backgroundColor: `${colors.surfaceContainerLow}4d`,
    fontSize: '0.6875rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    color: colors.onSurfaceVariant,
    fontFamily: fonts.label,
  },
  footerLink: {
    background: 'none',
    border: 'none',
    fontSize: '0.6875rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    color: colors.onSurfaceVariant,
    cursor: 'pointer',
    fontFamily: fonts.label,
    padding: 0,
  },
  pageBtn: {
    width: '1.5rem',
    height: '1.5rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: `1px solid ${colors.outlineVariant}33`,
    backgroundColor: colors.surfaceContainerLowest,
    fontSize: '0.75rem',
    fontWeight: 600,
    cursor: 'pointer',
    color: colors.onSurfaceVariant,
    fontFamily: fonts.body,
  },
  pageBtnActive: {
    backgroundColor: colors.primary,
    color: colors.onPrimary,
    border: `1px solid ${colors.primary}`,
  },
}
