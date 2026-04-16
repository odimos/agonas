import { useState } from 'react'
import { colors, fonts, radius } from './styles'
import { PageHeader, StatCard } from './Buttons'

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_REFEREES = [
  { id: 1, name: 'Marcus Bennett',  phone: '(555) 124-5678', email: 'm.bennett@leagueref.org',   status: 'ΕΝΕΡΓΟΣ'   },
  { id: 2, name: 'Sarah Rodriguez', phone: '(555) 982-1134', email: 'sarah.r@officiating.com',   status: 'ΕΝΕΡΓΟΣ'   },
  { id: 3, name: 'James Loughton',  phone: '(555) 443-8890', email: 'loughton.ref@net.com',      status: 'ΑΝΕΝΕΡΓΟΣ' },
  { id: 4, name: 'Elena Chen',      phone: '(555) 671-2209', email: 'echen@proref.org',           status: 'ΕΝΕΡΓΟΣ'   },
  { id: 5, name: 'David Watson',    phone: '(555) 303-9112', email: 'dwatson@official.io',        status: 'ΕΝΕΡΓΟΣ'   },
]

// ─── Status Badge ─────────────────────────────────────────────────────────────

const STATUS_STYLES = {
  'ΕΝΕΡΓΟΣ':   { backgroundColor: colors.secondaryContainer, color: colors.onSecondaryContainer },
  'ΑΝΕΝΕΡΓΟΣ': { backgroundColor: colors.errorContainer,     color: colors.onErrorContainer },
}

function StatusBadge({ status }) {
  return (
    <span style={{ ...st.badge, ...(STATUS_STYLES[status] ?? STATUS_STYLES['ΑΝΕΝΕΡΓΟΣ']) }}>
      {status}
    </span>
  )
}

// ─── Referee Row ──────────────────────────────────────────────────────────────

function RefereeRow({ referee, isFirst }) {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        borderTop: isFirst ? 'none' : `1px solid ${colors.outlineVariant}22`,
        backgroundColor: hovered ? colors.surfaceContainerLow : 'transparent',
        transition: 'background-color 0.15s ease',
        cursor: 'pointer',
        padding: '0 1.5rem',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={st.colName}>
        <span style={st.cellName}>{referee.name}</span>
      </div>
      <div style={st.colPhone}>
        <span style={st.cellMid}>{referee.phone}</span>
      </div>
      <div style={st.colEmail}>
        <span style={st.cellMono}>{referee.email}</span>
      </div>
      <div style={st.colStatus}>
        <StatusBadge status={referee.status} />
      </div>
    </div>
  )
}

// ─── Referees Page ────────────────────────────────────────────────────────────

export default function Referees() {
  const [search, setSearch] = useState('')

  const filtered = MOCK_REFEREES.filter(r =>
    r.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div style={st.page}>

      <PageHeader title="Διαιτητές" addName="Διαιτητή" />

      <div style={{ alignSelf: 'flex-start' }}>
        <StatCard label="ΕΝΕΡΓΟΙ ΔΙΑΙΤΗΤΕΣ" count={42} />
      </div>

      {/* Table Card */}
      <div style={st.tableCard}>

        {/* Search Bar */}
        <div style={st.toolbar}>
          <div style={st.searchWrap}>
            <span className="material-symbols-outlined" style={st.searchIcon}>search</span>
            <input
              style={st.searchInput}
              placeholder="Search by name..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button style={st.iconBtn}>
              <span className="material-symbols-outlined" style={{ fontSize: '1.1rem', color: colors.onSurfaceVariant }}>filter_list</span>
            </button>
            <button style={st.iconBtn}>
              <span className="material-symbols-outlined" style={{ fontSize: '1.1rem', color: colors.onSurfaceVariant }}>sort</span>
            </button>
          </div>
        </div>

        {/* Table Header */}
        <div style={st.thead}>
          <div style={st.colName}><span style={st.th}>ΟΝΟΜΑ</span></div>
          <div style={st.colPhone}><span style={st.th}>ΤΗΛΕΦΩΝΟ</span></div>
          <div style={st.colEmail}><span style={st.th}>EMAIL</span></div>
          <div style={st.colStatus}><span style={st.th}>ΚΑΤΑΣΤΑΣΗ</span></div>
        </div>

        {/* Rows */}
        <div>
          {filtered.map((referee, i) => (
            <RefereeRow key={referee.id} referee={referee} isFirst={i === 0} />
          ))}
        </div>

        {/* Pagination */}
        <div style={st.pagination}>
          <span style={st.paginationInfo}>Showing 1 to {filtered.length} of 42 referees</span>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <button style={{ ...st.pageBtn, opacity: 0.4 }} disabled>Previous</button>
            {[1, 2, 3].map(n => (
              <button key={n} style={{ ...st.pageBtn, ...(n === 1 ? st.pageBtnActive : {}) }}>{n}</button>
            ))}
            <button style={st.pageBtn}>ΕΠΟΜΕΝΟ</button>
          </div>
        </div>
      </div>

    </div>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const st = {
  page: {
    padding: '2rem 2.5rem',
    fontFamily: fonts.body,
    backgroundColor: colors.surface,
    minHeight: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.75rem',
  },
  pageHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pageTitle: {
    fontSize: '2.25rem',
    fontWeight: 800,
    letterSpacing: '-0.025em',
    color: colors.onSurface,
    margin: 0,
  },

  // Stat card
  statCard: {
    display: 'inline-flex',
    flexDirection: 'column',
    gap: '0.25rem',
    backgroundColor: colors.surfaceContainerLowest,
    borderLeft: `4px solid ${colors.tertiary}`,
    borderRadius: radius.lg,
    padding: '1.5rem 1.5rem 1.5rem 1.75rem',
    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
    minWidth: '200px',
  },
  statLabel: {
    fontSize: '0.6875rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.12em',
    color: colors.onSurfaceVariant,
    margin: 0,
  },
  statValue: {
    fontSize: '2rem',
    fontWeight: 800,
    color: colors.onSurface,
    margin: 0,
    lineHeight: '2.25rem',
  },

  // Table card
  tableCard: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radius.lg,
    overflow: 'hidden',
    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
    border: `1px solid ${colors.outlineVariant}22`,
  },

  // Search toolbar
  toolbar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0.875rem 1.5rem',
    borderBottom: `1px solid ${colors.outlineVariant}22`,
  },
  searchWrap: {
    position: 'relative',
    flex: 1,
    maxWidth: '560px',
  },
  searchIcon: {
    position: 'absolute',
    left: '0.75rem',
    top: '50%',
    transform: 'translateY(-50%)',
    fontSize: '0.9375rem',
    color: colors.outline,
  },
  searchInput: {
    width: '100%',
    padding: '0.5rem 0.75rem 0.5rem 2.375rem',
    backgroundColor: colors.surfaceContainerLow,
    border: 'none',
    borderRadius: radius.DEFAULT,
    fontSize: '0.875rem',
    color: colors.onSurface,
    fontFamily: fonts.body,
    outline: 'none',
    boxSizing: 'border-box',
  },
  iconBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0.375rem',
    backgroundColor: 'transparent',
    border: 'none',
    borderRadius: radius.DEFAULT,
    cursor: 'pointer',
  },

  // Table
  thead: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: `${colors.surfaceContainerHigh}80`,
    padding: '0 1.5rem',
    borderBottom: `1px solid ${colors.outlineVariant}22`,
  },
  th: {
    fontSize: '0.625rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    color: colors.onSurfaceVariant,
  },

  // Column widths
  colName:   { flex: '0 0 280px', padding: '0.875rem 0' },
  colPhone:  { flex: '0 0 200px', padding: '0.875rem 1rem' },
  colEmail:  { flex: 1,           padding: '0.875rem 1rem' },
  colStatus: { flex: '0 0 150px', padding: '0.875rem 1rem' },

  cellName: { fontSize: '0.875rem', fontWeight: 600, color: colors.onSurface },
  cellMid:  { fontSize: '0.875rem', fontWeight: 400, color: colors.onSurfaceVariant },
  cellMono: { fontSize: '0.8125rem', color: colors.onSurfaceVariant, fontFamily: 'monospace' },

  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '0.125rem 0.5rem',
    borderRadius: radius.DEFAULT,
    fontSize: '0.625rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  },

  // Pagination
  pagination: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.875rem 1.5rem',
    borderTop: `1px solid ${colors.outlineVariant}22`,
  },
  paginationInfo: {
    fontSize: '0.875rem',
    color: colors.onSurfaceVariant,
  },
  pageBtn: {
    padding: '0.3125rem 0.8125rem',
    border: `1px solid ${colors.outlineVariant}`,
    borderRadius: radius.DEFAULT,
    backgroundColor: 'transparent',
    fontSize: '0.875rem',
    color: colors.onSurfaceVariant,
    cursor: 'pointer',
    fontFamily: fonts.body,
  },
  pageBtnActive: {
    backgroundColor: colors.primary,
    color: colors.onPrimary,
    border: `1px solid ${colors.primary}`,
  },
}
