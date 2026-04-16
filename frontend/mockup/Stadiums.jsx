import { useState } from 'react'
import { colors, fonts, radius, s } from './styles'

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_STADIUMS = [
  { id: 1, name: 'Emerald Arena',   capacity: '45,000', address: '1221 Sports Way, North District', zone: 'Metro Zone A',      costPerHour: 30 },
  { id: 2, name: 'Old Stone Field', capacity: '12,000', address: '45 Heritage Blvd, West Village',  zone: 'Historic District',  costPerHour: 45 },
  { id: 3, name: 'Summit Stadium',  capacity: '65,000', address: '1 Apex Plaza, Mountain View',     zone: 'High Altitude Zone', costPerHour: 25 },
  { id: 4, name: 'River Bank Oval', capacity: '28,000', address: '900 Waterfront Dr, East Bay',     zone: 'Coastal Zone',       costPerHour: 30 },
]

// ─── Stadium Row ──────────────────────────────────────────────────────────────

function StadiumRow({ stadium, isFirst }) {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        borderTop: isFirst ? 'none' : `1px solid ${colors.outlineVariant}33`,
        backgroundColor: hovered ? colors.surfaceContainerLow : 'transparent',
        transition: 'background-color 0.15s ease',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Name + Thumb */}
      <div style={st.colName}>
        <div style={st.thumb}>
          <span className="material-symbols-outlined" style={{ fontSize: '1.25rem', color: colors.onSurfaceVariant }}>stadium</span>
        </div>
        <div>
          <p style={st.stadiumName}>{stadium.name}</p>
          <p style={st.stadiumMeta}>Capacity: {stadium.capacity}</p>
        </div>
      </div>

      {/* Address */}
      <div style={st.colAddress}>
        <p style={st.cellText}>{stadium.address}</p>
        <p style={st.cellSub}>{stadium.zone}</p>
      </div>

      {/* Cost */}
      <div style={st.colCost}>
        <p style={st.costText}>{stadium.costPerHour}</p>
      </div>
    </div>
  )
}

// ─── Stadiums ─────────────────────────────────────────────────────────────────

export default function Stadiums() {
  return (
    <div style={st.page}>

      {/* Page Header */}
      <div style={st.pageHeader}>
        <h1 style={st.pageTitle}>Γήπεδα</h1>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button style={s.btnOutline}>Κατέβασε τα Δεδομένα</button>
          <button style={s.btnPrimary}>
            <span className="material-symbols-outlined" style={{ fontSize: '1rem', verticalAlign: 'middle', marginRight: '0.35rem' }}>add</span>
            Προσθεσε Γήπεδο
          </button>
        </div>
      </div>

      {/* Active Stadiums Card */}
      <div style={st.statsRow}>
        <div style={st.statCard}>
          <p style={st.statLabel}>ΕΝΕΡΓΑ ΓΗΠΕΔΑ</p>
          <p style={st.statValue}>12</p>
          <div style={st.statFooter}>
            <span className="material-symbols-outlined" style={{ fontSize: '0.875rem', color: colors.tertiary }}>check_circle</span>
            <span style={st.statFooterText}>All safety certified</span>
          </div>
        </div>
      </div>

      {/* Directory Table */}
      <div style={st.tableWrapper}>
        {/* Table Header */}
        <div style={st.thead}>
          <div style={st.colName}><span style={st.th}>ΟΝΟΜΑ</span></div>
          <div style={st.colAddress}><span style={st.th}>ΔΙΕΥΘΥΝΣΗ</span></div>
          <div style={st.colCost}><span style={st.th}>ΚΟΣΤΟΣ/ΩΡΑ</span></div>
        </div>

        {/* Rows */}
        {MOCK_STADIUMS.map((stadium, i) => (
          <StadiumRow key={stadium.id} stadium={stadium} isFirst={i === 0} />
        ))}

        {/* Pagination */}
        <div style={st.pagination}>
          <p style={st.paginationInfo}>Showing 1 to 4 of 12 stadiums</p>
          <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
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
    padding: '2.5rem',
    fontFamily: fonts.body,
    backgroundColor: colors.surface,
    minHeight: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: '2rem',
  },
  pageHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pageTitle: {
    fontSize: '2rem',
    fontWeight: 800,
    letterSpacing: '-0.03em',
    color: colors.onSurface,
    margin: 0,
  },

  // Stat card — single card, right-aligned, plain white with border
  statsRow: {
    display: 'flex',
    justifyContent: 'flex-end',
  },
  statCard: {
    width: '50%',
    backgroundColor: colors.surfaceContainerLowest,
    border: `1px solid ${colors.outlineVariant}4d`,
    borderRadius: radius.lg,
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
  },
  statLabel: {
    fontSize: '0.625rem',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.12em',
    color: colors.onSurfaceVariant,
    margin: 0,
  },
  statValue: {
    fontSize: '1.5rem',
    fontWeight: 700,
    color: colors.onSurface,
    margin: '0.25rem 0',
  },
  statFooter: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    marginTop: '0.5rem',
  },
  statFooterText: {
    fontSize: '0.8125rem',
    color: colors.onSurfaceVariant,
  },

  // Table
  tableWrapper: {
    backgroundColor: colors.surfaceContainerLowest,
    border: `1px solid ${colors.outlineVariant}33`,
    borderRadius: radius.lg,
    overflow: 'hidden',
    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
  },
  thead: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: `${colors.surfaceContainerLow}80`,
    borderBottom: `1px solid ${colors.outlineVariant}33`,
  },
  th: {
    fontSize: '0.6875rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    color: colors.onSurfaceVariant,
  },

  // Column widths — mirror the TSX source
  colName: {
    width: '242px',
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '0.875rem 2rem',
    flexShrink: 0,
  },
  colAddress: {
    width: '302px',
    padding: '0.875rem 2rem',
    flexShrink: 0,
  },
  colCost: {
    width: '160px',
    padding: '0.875rem 2rem',
    flexShrink: 0,
  },

  thumb: {
    width: '3rem',
    height: '3rem',
    backgroundColor: colors.surfaceContainerHigh,
    borderRadius: radius.DEFAULT,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  stadiumName: {
    fontSize: '0.875rem',
    fontWeight: 700,
    color: colors.onSurface,
    margin: 0,
  },
  stadiumMeta: {
    fontSize: '0.75rem',
    color: colors.onSurfaceVariant,
    margin: '2px 0 0',
  },
  cellText: {
    fontSize: '0.875rem',
    color: colors.onSurface,
    margin: 0,
  },
  cellSub: {
    fontSize: '0.75rem',
    color: colors.onSurfaceVariant,
    margin: '2px 0 0',
  },
  costText: {
    fontSize: '0.875rem',
    fontWeight: 600,
    color: colors.onSurface,
    margin: 0,
  },

  pagination: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.875rem 2rem',
    borderTop: `1px solid ${colors.outlineVariant}1a`,
    backgroundColor: `${colors.surfaceContainerLow}80`,
  },
  paginationInfo: {
    fontSize: '0.75rem',
    fontWeight: 500,
    color: colors.onSurfaceVariant,
    margin: 0,
  },
  pageBtn: {
    width: '2rem',
    height: '2rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.DEFAULT,
    border: 'none',
    backgroundColor: colors.surfaceContainerLow,
    cursor: 'pointer',
    fontSize: '0.75rem',
    fontWeight: 700,
    color: colors.onSurfaceVariant,
  },
  pageBtnActive: {
    backgroundColor: colors.primary,
    color: colors.onPrimary,
  },
}
