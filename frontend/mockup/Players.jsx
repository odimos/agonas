import { useState } from 'react'
import { colors, radius, s } from './styles'
import { PageHeader, StatCard } from './Buttons'
import DataTable from './DataTable'
import ItemModal from './ItemModal'
import PlayerModalContent from './PlayerModalContent'

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_PLAYERS = [
  {
    id: 'EL-9942', name: 'Alexander Vance',   phone: '+1 (555) 012-4455', email: 'a.vance@emeraldcity.com',   status: 'ΕΝΕΡΓΟΣ',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDMTrrLhJHQQr_zhxshgpKN8vyEy4m96YlVqv1XG_cyS1LcW2h_DuUl8MbdXSuoZbHeKb9E9lOdPq2C08ma63WYH2umnce0LFTFGdpJJ5cPV6IfXYB6wp9ADqYe_ff-FWZNdqlXfo1--cOy8vw_znAS20bu8txivOt3bk1a8CWBNfzEod4YCw5PZHPp2qsnMbc0cN0I0X1-oQW-LxMrq17Wck4UMcPMxw2t8YTk3xM7wx9mE63GNKG2qiPEUXMTydfG-PzdjLHaHwM',
  },
  {
    id: 'EL-8812', name: 'Marcus Thorne',     phone: '+1 (555) 882-9011', email: 'm.thorne@stonegate.com',     status: 'ΕΝΕΡΓΟΣ',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCC1yJ9A1AA7G9JRWXDrQ6uTggIc40XAQ87xF-vzeFd1hF3YkXwcpYdxx0_21EW8ZNk44JQ-3kqDZoerTb-pYigDZeF8uaiqyo_-pUjzs4qlIiWrExY96axAvhAeiZbRO7LA-3S0tmA_EGROOn__x2G8erkLvjnnKm4BJG10BQcc0nHJniQNUNP-yQri4aYNsiWL2UjMDDFL356ITO0Wfd1edC1BY0l7I4PM5W4Bq0KEvyFZx9f17DMK2UqHm1-FyxW285aiBi0La0',
  },
  {
    id: 'EL-7622', name: 'Julianna Sterling', phone: '+1 (555) 234-7711', email: 'j.sterling@emeraldcity.com', status: 'ΑΝΕΝΕΡΓΟΣ',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD7H2ofh9oiZ56Mh1-TT5fYHx4HIGOT0DbPmTel6pI_vdzZChXSFeDINCaP3gLOlT2CZ9ZbI2PRwtSZoSClpZqHAsgRZ5JSY1TMU4eB_kNxzMJoxKHr7Dw8MLZdQJOCO22mfmVAz2rRcqO1yx3gVLthQQSHaC9yGm3wvAXI4g3hzBEy-AVlu7MDC7PHaL1QZL7rFUPVJO3Bl7gy1lST2weEdxzwh0i88i_uP880b2F1GpjOa7dOxayGYYEYqtPzBjJU1XdvoEsNrNk',
  },
  {
    id: 'EL-1104', name: 'Dominic Reed',      phone: '+1 (555) 900-3322', email: 'd.reed@riverside.com',       status: 'ΕΝΕΡΓΟΣ',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAWpZchrcsuX74HmLIfyVj1wKLI2tVlpAS6yPtp13dDw9K-ea4dHhXLd78aQiai6kC1w61P7fmuBTD66_ZK88IbD-5hNfkrp1cC_ckGlAnOclDl7zynKrs3VkxXLz-I2ngrVaYm4cOKeUdRAMORpFxDKs56TWVKJq076LdveVfoav38zGT_bdxDvmmP_MO9p5m-GQV317YA-JBDZVtMnnZSATA0bFU_8P30K-IqkPDl2SeEVWqhXKmyk0PTCryMnTTM4Po5n-aFFyo',
  },
  {
    id: 'EL-4491', name: 'Kaelan Brooks',     phone: '+1 (555) 445-9900', email: 'k.brooks@emeraldcity.com',   status: 'ΕΝΕΡΓΟΣ',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAmEIKjH0PQpc1LqPvHVMw9UAUtSHRnKYGSJ_6BAZev02oHKitq4E9k3xitTePb_MgT1SWBqUz2TYcXpaho_hXK6MLipza7687njAXqP3vtIM1J8ntEr1_lTxN6t9sXJjfj7adgrt84fDCDlFnr95uq-p_YtyKR6ABrYPGnrTDuY31iAtL_akkPN_sRAQp5SgFyo7WyKOVaqwtm5_gaUuIIFL81BvY18SutvDLSDyQO6knUlACuG8nFkwtCZpY_KH2wYuBRPKVUJPU',
  },
]

// ─── Column layout ────────────────────────────────────────────────────────────

const cols = {
  name:   { display: 'flex', alignItems: 'center', gap: '0.75rem', flex: '0 0 260px', padding: '0.75rem 0' },
  phone:  { flex: '0 0 180px', padding: '0.75rem 1rem' },
  email:  { flex: 1,           padding: '0.75rem 1rem' },
  status: { flex: '0 0 140px', padding: '0.75rem 1rem' },
}

const COLUMNS = [
  { header: 'ΟΝΟΜΑ',      style: cols.name   },
  { header: 'ΤΗΛΕΦΩΝΟ',  style: cols.phone  },
  { header: 'EMAIL',      style: cols.email  },
  { header: 'ΚΑΤΑΣΤΑΣΗ', style: cols.status },
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

// ─── Player Row ───────────────────────────────────────────────────────────────

function PlayerRow({ player, isFirst, onClick }) {
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
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={cols.name}>
        <div style={st.avatar}>
          <img src={player.avatar} alt={player.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
        <div>
          <p style={st.cellName}>{player.name}</p>
          <p style={st.cellId}>ID: {player.id}</p>
        </div>
      </div>
      <div style={cols.phone}>
        <span style={st.cellMid}>{player.phone}</span>
      </div>
      <div style={cols.email}>
        <span style={st.cellMono}>{player.email}</span>
      </div>
      <div style={cols.status}>
        <StatusBadge status={player.status} />
      </div>
    </div>
  )
}

// ─── Players Page ─────────────────────────────────────────────────────────────

export default function Players() {
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)

  const filtered = MOCK_PLAYERS.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div style={s.infoPage}>
      <PageHeader title="Παίκτες" addName="Παίκτη" />
      <div style={{ alignSelf: 'flex-start' }}>
        <StatCard label="ΕΝΕΡΓΟΙ ΠΑΙΚΤΕΣ" count={42} />
      </div>
      <DataTable
        columns={COLUMNS}
        rows={filtered}
        renderRow={(row, isFirst) => (
          <PlayerRow key={row.id} player={row} isFirst={isFirst} onClick={() => setSelected(row)} />
        )}
        search={search}
        onSearch={setSearch}
        total={42}
      />
      {selected && (
        <ItemModal
          title="Λεπτομέρειες Παίκτη"
          subtitle={`ID: ${selected.id}`}
          onClose={() => setSelected(null)}
        >
          {(editing) => <PlayerModalContent player={selected} editing={editing} />}
        </ItemModal>
      )}
    </div>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const st = {
  avatar: {
    width: '2rem',
    height: '2rem',
    borderRadius: radius.DEFAULT,
    overflow: 'hidden',
    backgroundColor: `${colors.primaryContainer}33`,
    border: `1px solid ${colors.primaryContainer}4d`,
    flexShrink: 0,
  },
  cellName: { fontSize: '0.875rem', fontWeight: 600, color: colors.onSurface, margin: 0 },
  cellId:   { fontSize: '0.625rem', textTransform: 'uppercase', color: colors.onSurfaceVariant, margin: '2px 0 0', letterSpacing: '0.05em' },
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
}
