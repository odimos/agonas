import { useState } from 'react'
import { colors, radius, s } from './styles'
import { PageHeader, StatCard } from './Buttons'
import DataTable from './DataTable'
import ItemModal from './ItemModal'
import StadiumModalContent from './StadiumModalContent'
import CreateModal from './CreateModal'

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_STADIUMS = [
  {
    id: 1, name: 'Emerald Arena', address: '1221 Sports Way, North District',
    phone: '+1 (210) 000-0055', email: 'facility@emeraldarena.com',
    costPerHour: 450, mapUrl: 'https://maps.google.com/?q=1221+Sports+Way',
    comments: 'Main venue for championship rounds. Requires 48h advance booking. Floodlights operational until 23:00.',
  },
  {
    id: 2, name: 'Old Stone Field', address: '45 Heritage Blvd, West Village',
    phone: '+1 (210) 000-0088', email: 'admin@oldstonefield.com',
    costPerHour: 600, mapUrl: 'https://maps.google.com/?q=45+Heritage+Blvd',
    comments: 'Historic venue. Grass pitch — no cleats over 12mm. Parking limited to 80 vehicles.',
  },
  {
    id: 3, name: 'Summit Stadium', address: '1 Apex Plaza, Mountain View',
    phone: '+1 (210) 000-0012', email: 'ops@summitstadium.com',
    costPerHour: 320, mapUrl: '',
    comments: '',
  },
  {
    id: 4, name: 'River Bank Oval', address: '900 Waterfront Dr, East Bay',
    phone: '+1 (210) 000-0033', email: 'riverbank@eastbay.net',
    costPerHour: 380, mapUrl: 'https://maps.google.com/?q=900+Waterfront+Dr',
    comments: 'Flood risk in winter months — check availability Nov–Feb. Surface recently resurfaced (2024).',
  },
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

function StadiumRow({ stadium, isFirst, onClick }) {
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
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={cols.name}>
        <div>
          <p style={st.stadiumName}>{stadium.name}</p>
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
  const [selected, setSelected] = useState(null)
  const [creating, setCreating] = useState(false)

  const filtered = MOCK_STADIUMS.filter(stadium =>
    stadium.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div style={s.entitiesPage}>
      <PageHeader title="Γήπεδα" addName="Γηπέδου" onAdd={() => setCreating(true)} />
      <div style={{ alignSelf: 'flex-start' }}>
        <StatCard label="ΕΝΕΡΓΑ ΓΗΠΕΔΑ" count={12} />
      </div>
      <DataTable
        columns={COLUMNS}
        rows={filtered}
        renderRow={(row, isFirst) => (
          <StadiumRow key={row.id} stadium={row} isFirst={isFirst} onClick={() => setSelected(row)} />
        )}
        search={search}
        onSearch={setSearch}
        total={12}
      />
      {selected && (
        <ItemModal
          title={selected.name}
          subtitle={`ID: STAD-${selected.id}`}
          maxWidth="896px"
          onClose={() => setSelected(null)}
        >
          {(editing) => <StadiumModalContent stadium={selected} editing={editing} />}
        </ItemModal>
      )}
      {creating && <CreateModal type="stadium" onClose={() => setCreating(false)} />}
    </div>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const st = {
  stadiumName: { fontSize: '0.875rem', fontWeight: 700, color: colors.onSurface, margin: 0 },
  cellText:    { fontSize: '0.875rem', color: colors.onSurface, margin: 0 },
  cellSub:     { fontSize: '0.75rem', color: colors.onSurfaceVariant, margin: '2px 0 0' },
  costText:    { fontSize: '0.875rem', fontWeight: 600, color: colors.onSurface, margin: 0 },
}
