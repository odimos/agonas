import { useState } from 'react'
import { colors, fonts, radius } from './styles'
import { PageHeader, StatCard } from './Buttons'

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_PLAYERS = [
  {
    id: 'EL-9942', name: 'Alexander Vance',   nickname: '"The Ghost"',  phone: '+1 (555) 012-4455', email: 'a.vance@emeraldcity.com',   team: 'Emerald City United', status: 'ΕΝΕΡΓΟΣ',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDMTrrLhJHQQr_zhxshgpKN8vyEy4m96YlVqv1XG_cyS1LcW2h_DuUl8MbdXSuoZbHeKb9E9lOdPq2C08ma63WYH2umnce0LFTFGdpJJ5cPV6IfXYB6wp9ADqYe_ff-FWZNdqlXfo1--cOy8vw_znAS20bu8txivOt3bk1a8CWBNfzEod4YCw5PZHPp2qsnMbc0cN0I0X1-oQW-LxMrq17Wck4UMcPMxw2t8YTk3xM7wx9mE63GNKG2qiPEUXMTydfG-PzdjLHaHwM',
  },
  {
    id: 'EL-8812', name: 'Marcus Thorne',     nickname: '"Iron Wall"',   phone: '+1 (555) 882-9011', email: 'm.thorne@stonegate.com',     team: 'Stone Gate FC',       status: 'ΕΝΕΡΓΟΣ',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCC1yJ9A1AA7G9JRWXDrQ6uTggIc40XAQ87xF-vzeFd1hF3YkXwcpYdxx0_21EW8ZNk44JQ-3kqDZoerTb-pYigDZeF8uaiqyo_-pUjzs4qlIiWrExY96axAvhAeiZbRO7LA-3S0tmA_EGROOn__x2G8erkLvjnnKm4BJG10BQcc0nHJniQNUNP-yQri4aYNsiWL2UjMDDFL356ITO0Wfd1edC1BY0l7I4PM5W4Bq0KEvyFZx9f17DMK2UqHm1-FyxW285aiBi0La0',
  },
  {
    id: 'EL-7622', name: 'Julianna Sterling', nickname: '"Ace"',          phone: '+1 (555) 234-7711', email: 'j.sterling@emeraldcity.com', team: 'Emerald City United', status: 'ΑΝΕΝΕΡΓΟΣ',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD7H2ofh9oiZ56Mh1-TT5fYHx4HIGOT0DbPmTel6pI_vdzZChXSFeDINCaP3gLOlT2CZ9ZbI2PRwtSZoSClpZqHAsgRZ5JSY1TMU4eB_kNxzMJoxKHr7Dw8MLZdQJOCO22mfmVAz2rRcqO1yx3gVLthQQSHaC9yGm3wvAXI4g3hzBEy-AVlu7MDC7PHaL1QZL7rFUPVJO3Bl7gy1lST2weEdxzwh0i88i_uP880b2F1GpjOa7dOxayGYYEYqtPzBjJU1XdvoEsNrNk',
  },
  {
    id: 'EL-1104', name: 'Dominic Reed',      nickname: '"Old Guard"',   phone: '+1 (555) 900-3322', email: 'd.reed@riverside.com',       team: 'Riverside Rangers',   status: 'ΕΝΕΡΓΟΣ',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAWpZchrcsuX74HmLIfyVj1wKLI2tVlpAS6yPtp13dDw9K-ea4dHhXLd78aQiai6kC1w61P7fmuBTD66_ZK88IbD-5hNfkrp1cC_ckGlAnOclDl7zynKrs3VkxXLz-I2ngrVaYm4cOKeUdRAMORpFxDKs56TWVKJq076LdveVfoav38zGT_bdxDvmmP_MO9p5m-GQV317YA-JBDZVtMnnZSATA0bFU_8P30K-IqkPDl2SeEVWqhXKmyk0PTCryMnTTM4Po5n-aFFyo',
  },
  {
    id: 'EL-4491', name: 'Kaelan Brooks',     nickname: '"Lightning"',   phone: '+1 (555) 445-9900', email: 'k.brooks@emeraldcity.com',   team: 'Emerald City United', status: 'ΕΝΕΡΓΟΣ',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAmEIKjH0PQpc1LqPvHVMw9UAUtSHRnKYGSJ_6BAZev02oHKitq4E9k3xitTePb_MgT1SWBqUz2TYcXpaho_hXK6MLipza7687njAXqP3vtIM1J8ntEr1_lTxN6t9sXJjfj7adgrt84fDCDlFnr95uq-p_YtyKR6ABrYPGnrTDuY31iAtL_akkPN_sRAQp5SgFyo7WyKOVaqwtm5_gaUuIIFL81BvY18SutvDLSDyQO6knUlACuG8nFkwtCZpY_KH2wYuBRPKVUJPU',
  },
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

// ─── Team Badge ───────────────────────────────────────────────────────────────

const TEAM_COLORS = {
  'Emerald City United': { backgroundColor: colors.secondaryContainer, color: colors.onSecondaryContainer },
  default:               { backgroundColor: colors.surfaceVariant,     color: colors.onSurfaceVariant },
}

function TeamBadge({ team }) {
  const style = TEAM_COLORS[team] ?? TEAM_COLORS.default
  return <span style={{ ...st.badge, ...style }}>{team.toUpperCase()}</span>
}

// ─── Player Row ───────────────────────────────────────────────────────────────

function PlayerRow({ player, isFirst }) {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        borderTop: isFirst ? 'none' : `1px solid ${colors.outlineVariant}1a`,
        backgroundColor: hovered ? colors.surfaceContainerLow : 'transparent',
        transition: 'background-color 0.15s ease',
        cursor: 'pointer',
        padding: '0 1.5rem',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Name + Avatar */}
      <div style={st.colName}>
        <div style={st.avatar}>
          <img src={player.avatar} alt={player.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
        <div>
          <p style={st.cellName}>{player.name}</p>
          <p style={st.cellId}>ID: {player.id}</p>
        </div>
      </div>

      {/* Phone */}
      <div style={st.colPhone}>
        <span style={st.cellMid}>{player.phone}</span>
      </div>

      {/* Email */}
      <div style={st.colEmail}>
        <span style={st.cellMono}>{player.email}</span>
      </div>

      {/* Status */}
      <div style={st.colStatus}>
        <StatusBadge status={player.status} />
      </div>

      {/* Actions */}
      <div style={st.colActions}>
        {hovered && (
          <button style={st.moreBtn}>
            <span className="material-symbols-outlined" style={{ fontSize: '1.25rem', color: colors.onSurfaceVariant }}>more_vert</span>
          </button>
        )}
      </div>
    </div>
  )
}

// ─── Metric Bento ─────────────────────────────────────────────────────────────

function MetricBento() {
  return (
    <div style={st.bento}>
      {/* Total Squad Size */}
      <div style={{ ...st.bentoCard, borderLeft: `4px solid ${colors.tertiary}`, flex: '0 0 calc(33% - 0.75rem)' }}>
        <p style={st.bentoLabel}>Total Squad Size</p>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
          <span style={st.bentoBig}>1,248</span>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: colors.tertiary, paddingBottom: '4px' }}>+4.2%</span>
        </div>
        <p style={st.bentoSub}>Active registrations for 2024 Season</p>
      </div>

      {/* Registry Health */}
      <div style={{ ...st.bentoCard, border: `1px solid ${colors.outlineVariant}33`, flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <p style={st.bentoLabel}>Registry Health</p>
          <div style={{ display: 'flex', gap: '2rem', marginTop: '1rem' }}>
            <div>
              <p style={st.bentoSub}>Medical Clearance</p>
              <p style={st.bentoMid}>98.2%</p>
            </div>
            <div style={{ borderLeft: `1px solid ${colors.outlineVariant}33`, paddingLeft: '2rem' }}>
              <p style={st.bentoSub}>Contract Validity</p>
              <p style={st.bentoMid}>1,120</p>
            </div>
            <div style={{ borderLeft: `1px solid ${colors.outlineVariant}33`, paddingLeft: '2rem' }}>
              <p style={st.bentoSub}>Suspensions</p>
              <p style={{ ...st.bentoMid, color: colors.error }}>14</p>
            </div>
          </div>
        </div>
        <div style={st.bentoViz}>
          <p style={{ fontSize: '0.5625rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: colors.onSurfaceVariant, textAlign: 'right', padding: '0.75rem' }}>
            Registry Flow
          </p>
        </div>
      </div>
    </div>
  )
}

// ─── Players Page ─────────────────────────────────────────────────────────────

export default function Players() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All Players')

  const filtered = MOCK_PLAYERS.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === 'All Players' || p.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div style={st.page}>

      <PageHeader title="Παίκτες" addName="Παίκτη" />

      <div style={{ alignSelf: 'flex-start' }}>
        <StatCard label="ΕΝΕΡΓΟΙ ΠΑΙΚΤΕΣ" count={42} />
      </div>

      {/* Filter + Table Card */}
      <div style={st.tableCard}>

        {/* Filter Bar */}
        <div style={st.filterBar}>
          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
            <div style={st.filterGroup}>
              <span style={st.filterLabel}>Status:</span>
              <select
                style={st.filterSelect}
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
              >
                <option>All Players</option>
                <option value="ΕΝΕΡΓΟΣ">Active</option>
                <option value="ΑΝΕΝΕΡΓΟΣ">Suspended</option>
              </select>
            </div>
            <div style={{ ...st.filterGroup, borderLeft: `1px solid ${colors.outlineVariant}4d`, paddingLeft: '1.5rem' }}>
              <span style={st.filterLabel}>Season:</span>
              <select style={st.filterSelect}>
                <option>2024 Championship</option>
                <option>2023 Invitational</option>
              </select>
            </div>
          </div>
          <span style={st.filterCount}>Showing {filtered.length} Players</span>
        </div>

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
          <div style={st.colName}>
            <span style={st.th}>ΟΝΟΜΑ</span>
            <span className="material-symbols-outlined" style={{ fontSize: '0.875rem', color: colors.onSurfaceVariant, marginLeft: '0.25rem' }}>arrow_drop_down</span>
          </div>
          <div style={st.colPhone}><span style={st.th}>ΤΗΛΕΦΩΝΟ</span></div>
          <div style={st.colEmail}><span style={st.th}>EMAIL</span></div>
          <div style={st.colStatus}><span style={st.th}>ΚΑΤΑΣΤΑΣΗ</span></div>
          <div style={st.colActions} />
        </div>

        {/* Rows */}
        <div>
          {filtered.map((player, i) => (
            <PlayerRow key={player.id} player={player} isFirst={i === 0} />
          ))}
        </div>

        {/* Pagination */}
        <div style={st.pagination}>
          <span style={st.paginationInfo}>Page 1 of 12</span>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button style={{ ...st.pageBtn, opacity: 0.3 }} disabled>Previous</button>
            {[1, 2, 3].map(n => (
              <button key={n} style={{ ...st.pageBtn, ...(n === 1 ? st.pageBtnActive : {}) }}>{n}</button>
            ))}
            <button style={st.pageBtn}>ΕΠΟΜΕΝΟ</button>
          </div>
        </div>
      </div>

      {/* Metric Bento */}
      <MetricBento />

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
    alignItems: 'flex-end',
  },
  breadcrumb: {
    display: 'flex',
    gap: '0.5rem',
    fontSize: '0.625rem',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    color: colors.onSurfaceVariant,
    marginBottom: '0.5rem',
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

  // Filter bar
  filterBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '1rem 1.5rem',
    backgroundColor: colors.surfaceContainerLow,
    borderBottom: `1px solid ${colors.outlineVariant}22`,
    borderRadius: `${radius.lg} ${radius.lg} 0 0`,
  },
  filterGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  filterLabel: {
    fontSize: '0.625rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    color: colors.onSurfaceVariant,
  },
  filterSelect: {
    background: 'transparent',
    border: 'none',
    fontSize: '0.75rem',
    fontWeight: 500,
    color: colors.tertiary,
    cursor: 'pointer',
    fontFamily: fonts.body,
    outline: 'none',
  },
  filterCount: {
    fontSize: '0.625rem',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    color: colors.onSurfaceVariant,
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
  colName:    { display: 'flex', alignItems: 'center', gap: '0.75rem', flex: '0 0 260px', padding: '0.75rem 0' },
  colPhone:   { flex: '0 0 180px', padding: '0.75rem 1rem' },
  colEmail:   { flex: 1,           padding: '0.75rem 1rem' },
  colStatus:  { flex: '0 0 140px', padding: '0.75rem 1rem' },
  colActions: { flex: '0 0 48px',  padding: '0.75rem 0',  display: 'flex', justifyContent: 'flex-end' },

  avatar: {
    width: '2rem',
    height: '2rem',
    borderRadius: radius.DEFAULT,
    overflow: 'hidden',
    backgroundColor: `${colors.primaryContainer}33`,
    border: `1px solid ${colors.primaryContainer}4d`,
    flexShrink: 0,
  },
  cellName:  { fontSize: '0.875rem', fontWeight: 600, color: colors.onSurface, margin: 0 },
  cellId:    { fontSize: '0.625rem', textTransform: 'uppercase', color: colors.onSurfaceVariant, margin: '2px 0 0', letterSpacing: '0.05em' },
  cellMid:   { fontSize: '0.875rem', fontWeight: 400, color: colors.onSurfaceVariant },
  cellMono:  { fontSize: '0.8125rem', color: colors.onSurfaceVariant, fontFamily: 'monospace' },

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
  moreBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '0.25rem',
    display: 'flex',
    alignItems: 'center',
    borderRadius: radius.DEFAULT,
  },

  // Pagination
  pagination: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.75rem 1.5rem',
    borderTop: `1px solid ${colors.outlineVariant}1a`,
    backgroundColor: `${colors.surfaceContainerHigh}22`,
  },
  paginationInfo: {
    fontSize: '0.625rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
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

  // Metric bento
  bento: {
    display: 'flex',
    gap: '1.5rem',
  },
  bentoCard: {
    backgroundColor: colors.surfaceContainerLowest,
    padding: '1.5rem',
    borderRadius: radius.DEFAULT,
    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
  },
  bentoLabel: {
    fontSize: '0.625rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    color: colors.onSurfaceVariant,
    margin: 0,
  },
  bentoBig: {
    fontSize: '2.5rem',
    fontWeight: 800,
    letterSpacing: '-0.03em',
    color: colors.onSurface,
  },
  bentoMid: {
    fontSize: '1.25rem',
    fontWeight: 700,
    color: colors.onSurface,
    margin: '0.25rem 0 0',
  },
  bentoSub: {
    fontSize: '0.6875rem',
    color: colors.onSurfaceVariant,
    margin: '0.5rem 0 0',
  },
  bentoViz: {
    width: '12rem',
    height: '6rem',
    backgroundColor: colors.surfaceContainer,
    borderRadius: radius.DEFAULT,
    overflow: 'hidden',
    flexShrink: 0,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end',
  },
}
