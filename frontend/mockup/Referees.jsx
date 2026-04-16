import { useState } from 'react'
import { colors, radius, s } from './styles'
import { PageHeader, StatCard } from './Buttons'
import DataTable from './DataTable'
import ItemModal from './ItemModal'

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_REFEREES = [
  { id: 1,  name: 'Marcus Bennett',    phone: '(555) 124-5678', email: 'm.bennett@leagueref.org',    status: 'ΕΝΕΡΓΟΣ'   },
  { id: 2,  name: 'Sarah Rodriguez',   phone: '(555) 982-1134', email: 'sarah.r@officiating.com',    status: 'ΕΝΕΡΓΟΣ'   },
  { id: 3,  name: 'James Loughton',    phone: '(555) 443-8890', email: 'loughton.ref@net.com',       status: 'ΑΝΕΝΕΡΓΟΣ' },
  { id: 4,  name: 'Elena Chen',        phone: '(555) 671-2209', email: 'echen@proref.org',            status: 'ΕΝΕΡΓΟΣ'   },
  { id: 5,  name: 'David Watson',      phone: '(555) 303-9112', email: 'dwatson@official.io',         status: 'ΕΝΕΡΓΟΣ'   },
  { id: 6,  name: 'Priya Nair',        phone: '(555) 210-4456', email: 'p.nair@proref.org',           status: 'ΕΝΕΡΓΟΣ'   },
  { id: 7,  name: 'Carlos Mendez',     phone: '(555) 887-3300', email: 'c.mendez@leagueref.org',     status: 'ΑΝΕΝΕΡΓΟΣ' },
  { id: 8,  name: 'Fiona Gallagher',   phone: '(555) 556-7712', email: 'fgallagher@official.io',     status: 'ΕΝΕΡΓΟΣ'   },
  { id: 9,  name: 'Tomasz Wierzbicki', phone: '(555) 334-9988', email: 't.wierzbicki@eurref.com',    status: 'ΕΝΕΡΓΟΣ'   },
  { id: 10, name: 'Aisha Okonkwo',     phone: '(555) 778-1123', email: 'a.okonkwo@officiating.com',  status: 'ΕΝΕΡΓΟΣ'   },
  { id: 11, name: 'Brett Harrington',  phone: '(555) 445-6601', email: 'b.harrington@leagueref.org', status: 'ΑΝΕΝΕΡΓΟΣ' },
  { id: 12, name: 'Yuki Tanaka',       phone: '(555) 990-2234', email: 'y.tanaka@proref.org',        status: 'ΕΝΕΡΓΟΣ'   },
  { id: 13, name: 'Omar Hassan',       phone: '(555) 661-8870', email: 'o.hassan@official.io',       status: 'ΕΝΕΡΓΟΣ'   },
  { id: 14, name: 'Lucia Ferrara',     phone: '(555) 123-9945', email: 'l.ferrara@eurref.com',       status: 'ΕΝΕΡΓΟΣ'   },
  { id: 15, name: 'Kevin O\'Brien',    phone: '(555) 302-5567', email: 'k.obrien@leagueref.org',     status: 'ΑΝΕΝΕΡΓΟΣ' },
]

// ─── Column layout (shared between header and rows) ───────────────────────────

const cols = {
  name:   { flex: '0 0 280px', padding: '0.875rem 0' },
  phone:  { flex: '0 0 200px', padding: '0.875rem 1rem' },
  email:  { flex: 1,           padding: '0.875rem 1rem' },
  status: { flex: '0 0 150px', padding: '0.875rem 1rem' },
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

// ─── Referee Row ──────────────────────────────────────────────────────────────

function RefereeRow({ referee, isFirst, onClick }) {
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
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={cols.name}>
        <span style={st.cellName}>{referee.name}</span>
      </div>
      <div style={cols.phone}>
        <span style={st.cellMid}>{referee.phone}</span>
      </div>
      <div style={cols.email}>
        <span style={st.cellMono}>{referee.email}</span>
      </div>
      <div style={cols.status}>
        <StatusBadge status={referee.status} />
      </div>
    </div>
  )
}

// ─── Referees Page ────────────────────────────────────────────────────────────

export default function Referees() {
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)

  const filtered = MOCK_REFEREES.filter(r =>
    r.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div style={s.infoPage}>
      <PageHeader title="Διαιτητές" addName="Διαιτητή" />
      <div style={{ alignSelf: 'flex-start' }}>
        <StatCard label="ΕΝΕΡΓΟΙ ΔΙΑΙΤΗΤΕΣ" count={42} />
      </div>
      <DataTable
        columns={COLUMNS}
        rows={filtered}
        renderRow={(row, isFirst) => (
          <RefereeRow key={row.id} referee={row} isFirst={isFirst} onClick={() => setSelected(row)} />
        )}
        search={search}
        onSearch={setSearch}
        total={42}
      />
      {selected && (
        <ItemModal
          title="Λεπτομέρειες Διαιτητή"
          subtitle={`ID: REF-${selected.id}`}
          onClose={() => setSelected(null)}
        >
          {(editing) => (
            <p style={{ color: colors.onSurfaceVariant, fontSize: '0.875rem' }}>
              Content for <strong>{selected.name}</strong> — form fields coming soon.
            </p>
          )}
        </ItemModal>
      )}
    </div>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const st = {
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
}
