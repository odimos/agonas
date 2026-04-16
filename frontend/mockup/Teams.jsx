import { useState } from 'react'
import { colors, fonts, radius, s } from './styles'

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_TEAMS = [
  {
    id: 1, name: 'North Star Rangers',  captain: 'Alexander Vance', contact: 'vance.a@northstars.com',  status: 'ΕΝΕΡΓΗ',
    logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCINzVJCj9R8ZkjVYYRd6Ca9PDYndD_OFwn-7WmRE-BmlSle8-rnBa8soT0UPmJ1OasE8wojKO0EP0k7DGZ1ZQ73hRxC2oQwqqECuu2mgrYTMbd9tckN4f4dOdkzuLW3suj_gQkhsHo-76fuq6fonb2qRjiwMMly_eVsvzHgn_kYb67XqkIJkZJJEsTnWuHdkdB83wxm1INfpeeAWRexQP8cAcHWI_T9VN3ICrtKMXg6Kl_kLILUVo8FP-tKgz9uKCZJQ6iZhZ1oqc',
  },
  {
    id: 2, name: 'Metropolitan United', captain: 'Sarah Sterling',  contact: 'admin@metroutd.io',        status: 'ΕΝΕΡΓΗ',
    logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD-6YlMQxFxBdjTu9qWwSg8E5JObKBlspxg5fmbXNL-qF7cHS7BYCE1HzpWODmSqohrvJa6GJLch-RTmfWyV1rRSAOqBH2Jp35WMUdrCG0Jo5EmVFmPlzpqzcm7Xi3oK70gt-nWIvWeuP5ZozGXNY3M047Rs77BoLt7ouGzxwBKVnZb2yDJoH9De7gSWoBmWF0yAE9qh5md4DQqFB3I0YD1XbSVEHbjpAetW3RXYaMSfbf718qgYsiSv3FmZPTbvZ5YxQE2HWchNCc',
  },
  {
    id: 3, name: 'Valley Falcons',      captain: 'Elena Rodriguez', contact: 'elena.r@falcons.com',      status: 'ΑΝΕΝΕΡΓΗ',
    logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBEbGdhAPVF5vf84llZvH_7jG93eTenACQ8Z-_EhJVkUu-YNDQoDauHkLKbCeOFkfZcniUOL7CsbhmQxZStT09OzsYpsqYC-h6daQXg2kd6BGdgooYdp0k3cggUtAv5MFmbd9ZLGI2H00ItQ2oyA0K41XDwRQavAMgnO9YMao32tEdkePTmaRwMHlfv7u2juLkyZJvnwPJpvPBDidKiTmzzQBYkCe9rJx6Ztol1pIzD3zQJQKRtVxI8v_DtXeuGsIisjXxVEQS9DN8',
  },
  {
    id: 4, name: 'Harbor City FC',      captain: 'Marcus Thorne',   contact: 'm.thorne@harborcity.net', status: 'ΕΝΕΡΓΗ',
    logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDAMmCV_EYnv7UsY0_h-iG951R8VYw-s_SZ1dj4ngpChHuHj054LOghlTryM9i9X0lt1gJeBzNj_Nwc7OVkikknqgLq4CD6P3d3zp4B6oXFJc5JMU4_4uVLTAaT19D0dzT1hHtF28GpQf84PLV8EmjN0BLFMNbMD3o_P4mORQqu2uYzAAzuDH4nEC0Bnlbp7_Sdpll0oMZeoz3F0GJYBoDPXdzPrc6AN_XkAhEr3lLH336I3y7GPwVvZcwFseD-zJ2-9NBWcMasc4Y',
  },
]

// ─── Status Badge ─────────────────────────────────────────────────────────────

const STATUS_STYLES = {
  'ΕΝΕΡΓΗ':   { backgroundColor: colors.secondaryContainer, color: colors.onSecondaryContainer },
  'ΑΝΕΝΕΡΓΗ': { backgroundColor: colors.surfaceVariant,     color: colors.onSurfaceVariant },
}

function StatusBadge({ status }) {
  return (
    <span style={{ ...st.badge, ...(STATUS_STYLES[status] ?? STATUS_STYLES['ΑΝΕΝΕΡΓΗ']) }}>
      {status}
    </span>
  )
}

// ─── Team Row ─────────────────────────────────────────────────────────────────

function TeamRow({ team, isFirst }) {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        borderTop: isFirst ? 'none' : `1px solid ${colors.outlineVariant}33`,
        backgroundColor: hovered ? colors.surfaceContainerLow : 'transparent',
        transition: 'background-color 0.15s ease',
        padding: '0 1.5rem',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Name + Logo */}
      <div style={st.colName}>
        <div style={st.thumb}>
          {team.logo
            ? <img src={team.logo} alt={team.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : <span className="material-symbols-outlined" style={{ fontSize: '1.25rem', color: colors.onSurfaceVariant }}>groups</span>
          }
        </div>
        <span style={st.cellName}>{team.name}</span>
      </div>

      <div style={st.colCaptain}>
        <span style={st.cellMid}>{team.captain}</span>
      </div>

      <div style={st.colContact}>
        <span style={st.cellMono}>{team.contact}</span>
      </div>

      <div style={st.colStatus}>
        <StatusBadge status={team.status} />
      </div>
    </div>
  )
}

// ─── Teams ────────────────────────────────────────────────────────────────────

export default function Teams() {
  const [search, setSearch] = useState('')

  const filtered = MOCK_TEAMS.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div style={st.page}>

      {/* Page Header */}
      <div style={st.pageHeader}>
        <h1 style={st.pageTitle}>Ομάδες</h1>
        <button style={s.btnPrimary}>
          <span className="material-symbols-outlined" style={{ fontSize: '0.875rem', verticalAlign: 'middle', marginRight: '0.35rem' }}>add</span>
          ΠΡΟΣΘΗΚΗ ΟΜΑΔΑΣ
        </button>
      </div>

      {/* Two Stat Cards */}
      <div style={st.statsGrid}>
        <div style={{ ...st.statCard, borderLeftColor: colors.tertiary }}>
          <p style={st.statLabel}>ΣΥΝΟΛΟ ΟΜΑΔΩΝ</p>
          <p style={{ ...st.statValue, color: colors.onSurface }}>24</p>
        </div>
        <div style={{ ...st.statCard, borderLeftColor: colors.error }}>
          <p style={st.statLabel}>ΑΙΤΗΜΑΤΑ ΕΓΓΡΑΦΗΣ</p>
          <p style={{ ...st.statValue, color: colors.error }}>03</p>
        </div>
      </div>

      {/* Table Card */}
      <div style={st.tableCard}>

        {/* Search + Filter Bar */}
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
          <div style={st.colName}><span style={st.th}>ΟΝΟΜΑ ΟΜΑΔΑΣ</span></div>
          <div style={st.colCaptain}><span style={st.th}>ΑΡΧΗΓΟΣ</span></div>
          <div style={st.colContact}><span style={st.th}>ΕΠΙΚΟΙΝΩΝΙΑ</span></div>
          <div style={st.colStatus}><span style={st.th}>ΚΑΤΑΣΤΑΣΗ</span></div>
        </div>

        {/* Rows */}
        <div>
          {filtered.map((team, i) => (
            <TeamRow key={team.id} team={team} isFirst={i === 0} />
          ))}
        </div>

        {/* Pagination */}
        <div style={st.pagination}>
          <span style={st.paginationInfo}>Showing 4 of 24 teams</span>
          <div style={{ display: 'flex', gap: '0.375rem', alignItems: 'center' }}>
            <button style={{ ...st.pageBtn, opacity: 0.4 }} disabled>
              <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>chevron_left</span>
            </button>
            {[1, 2, 3].map(n => (
              <button key={n} style={{ ...st.pageBtn, ...(n === 1 ? st.pageBtnActive : {}) }}>{n}</button>
            ))}
            <button style={st.pageBtn}>
              <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>chevron_right</span>
            </button>
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
    lineHeight: '2.5rem',
  },

  // Two stat cards
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1rem',
  },
  statCard: {
    backgroundColor: colors.surfaceContainerLowest,
    borderLeft: '4px solid',
    borderRadius: radius.lg,
    padding: '1.5rem 1.5rem 1.5rem 1.75rem',
    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.35rem',
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
    fontSize: '1.875rem',
    fontWeight: 800,
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

  // Toolbar
  toolbar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '1rem 1.5rem',
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
    padding: '0.5625rem 0.75rem 0.5625rem 2.375rem',
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
    backgroundColor: colors.surfaceContainerLow,
    padding: '0 1.5rem',
    borderBottom: `1px solid ${colors.outlineVariant}33`,
  },
  th: {
    fontSize: '0.6875rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.07em',
    color: colors.onSurfaceVariant,
  },

  // Column layout
  colName:    { display: 'flex', alignItems: 'center', gap: '0.875rem', flex: '0 0 280px', padding: '0.875rem 0' },
  colCaptain: { flex: '0 0 200px', padding: '0.875rem 1rem' },
  colContact: { flex: 1,          padding: '0.875rem 1rem' },
  colStatus:  { flex: '0 0 140px', padding: '0.875rem 1rem' },

  thumb: {
    width: '2.5rem',
    height: '2.5rem',
    borderRadius: radius.DEFAULT,
    overflow: 'hidden',
    backgroundColor: colors.surfaceContainerHigh,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  cellName:  { fontSize: '0.875rem', fontWeight: 700, color: colors.onSurface },
  cellMid:   { fontSize: '0.875rem', fontWeight: 400, color: colors.onSurface },
  cellMono:  { fontSize: '0.8125rem', fontWeight: 400, color: colors.onSurfaceVariant, fontFamily: 'monospace' },

  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '0.1875rem 0.5rem',
    borderRadius: radius.DEFAULT,
    fontSize: '0.6875rem',
    fontWeight: 700,
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
    fontSize: '0.8125rem',
    color: colors.onSurfaceVariant,
  },
  pageBtn: {
    minWidth: '2rem',
    height: '2rem',
    padding: '0 0.5rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.DEFAULT,
    border: `1px solid ${colors.outlineVariant}`,
    backgroundColor: 'transparent',
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontWeight: 600,
    color: colors.onSurfaceVariant,
    fontFamily: fonts.body,
  },
  pageBtnActive: {
    backgroundColor: colors.primary,
    color: colors.onPrimary,
    border: `1px solid ${colors.primary}`,
  },
}
