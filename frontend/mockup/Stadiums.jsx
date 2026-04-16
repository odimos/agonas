import { useState } from 'react'
import { colors, radius, s } from './styles'
import { PageHeader, StatCard } from './Buttons'
import DataTable from './DataTable'

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_STADIUMS = [
  { id: 1, name: 'Emerald Arena',   capacity: '45,000', address: '1221 Sports Way, North District', zone: 'Metro Zone A',      costPerHour: 30 },
  { id: 2, name: 'Old Stone Field', capacity: '12,000', address: '45 Heritage Blvd, West Village',  zone: 'Historic District',  costPerHour: 45 },
  { id: 3, name: 'Summit Stadium',  capacity: '65,000', address: '1 Apex Plaza, Mountain View',     zone: 'High Altitude Zone', costPerHour: 25 },
  { id: 4, name: 'River Bank Oval', capacity: '28,000', address: '900 Waterfront Dr, East Bay',     zone: 'Coastal Zone',       costPerHour: 30 },
]

// ─── Column layout ────────────────────────────────────────────────────────────

const cols = {
  name:    { display: 'flex', alignItems: 'center', gap: '1rem', flex: '0 0 242px', padding: '0.875rem 0' },
  address: { flex: '0 0 302px', padding: '0.875rem 2rem' },
  cost:    { flex: 1,           padding: '0.875rem 2rem' },
}

const COLUMNS = [
  { header: 'ΟΝΟΜΑ',       style: cols.name    },
  { header: 'ΔΙΕΥΘΥΝΣΗ',  style: cols.address },
  { header: 'ΚΟΣΤΟΣ/ΩΡΑ', style: cols.cost    },
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
        padding: '0 1.5rem',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={cols.name}>
        <div style={st.thumb}>
          <span className="material-symbols-outlined" style={{ fontSize: '1.25rem', color: colors.onSurfaceVariant }}>stadium</span>
        </div>
        <div>
          <p style={st.stadiumName}>{stadium.name}</p>
          <p style={st.stadiumMeta}>Capacity: {stadium.capacity}</p>
        </div>
      </div>
      <div style={cols.address}>
        <p style={st.cellText}>{stadium.address}</p>
        <p style={st.cellSub}>{stadium.zone}</p>
      </div>
      <div style={cols.cost}>
        <p style={st.costText}>{stadium.costPerHour}</p>
      </div>
    </div>
  )
}

// ─── Stadiums ─────────────────────────────────────────────────────────────────

export default function Stadiums() {
  const [search, setSearch] = useState('')

  const filtered = MOCK_STADIUMS.filter(stadium =>
    stadium.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div style={s.infoPage}>
      <PageHeader title="Γήπεδα" addName="Γηπέδου" />
      <div style={{ alignSelf: 'flex-start' }}>
        <StatCard label="ΕΝΕΡΓΑ ΓΗΠΕΔΑ" count={12} />
      </div>
      <DataTable
        columns={COLUMNS}
        rows={filtered}
        renderRow={(row, isFirst) => <StadiumRow key={row.id} stadium={row} isFirst={isFirst} />}
        search={search}
        onSearch={setSearch}
        total={12}
      />
    </div>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const st = {
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
  stadiumName: { fontSize: '0.875rem', fontWeight: 700, color: colors.onSurface, margin: 0 },
  stadiumMeta: { fontSize: '0.75rem', color: colors.onSurfaceVariant, margin: '2px 0 0' },
  cellText:    { fontSize: '0.875rem', color: colors.onSurface, margin: 0 },
  cellSub:     { fontSize: '0.75rem', color: colors.onSurfaceVariant, margin: '2px 0 0' },
  costText:    { fontSize: '0.875rem', fontWeight: 600, color: colors.onSurface, margin: 0 },
}
