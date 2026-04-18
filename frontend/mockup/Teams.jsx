import { useState } from 'react'
import { colors, radius, s } from './styles'
import { PageHeader, StatCard } from './Buttons'
import DataTable from './DataTable'
import ItemModal from './ItemModal'
import TeamModalContent from './TeamModalContent'
import CreateModal from './CreateModal'

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_TEAMS = [
  {
    id: 1, name: 'North Star Rangers', status: 'ΕΝΕΡΓΗ',
    captainId: 'NS-001', viceId: 'NS-002',
    comments: 'Team has consistently shown high sportsmanship. Noted interest in early slot scheduling for regional rounds. Paperwork for secondary sponsorship is pending approval.',
    players: [
      { id: 'NS-001', name: 'Marcus Thorne',     email: 'm.thorne@northstars.com',   phone: '+1 (555) 010-2233' },
      { id: 'NS-002', name: 'Julianna Sterling',  email: 'j.sterling@northstars.com', phone: '+1 (555) 902-1143' },
      { id: 'NS-003', name: 'Dominic Reed',       email: 'd.reed@northstars.com',     phone: '+1 (555) 320-8844' },
    ],
    logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCINzVJCj9R8ZkjVYYRd6Ca9PDYndD_OFwn-7WmRE-BmlSle8-rnBa8soT0UPmJ1OasE8wojKO0EP0k7DGZ1ZQ73hRxC2oQwqqECuu2mgrYTMbd9tckN4f4dOdkzuLW3suj_gQkhsHo-76fuq6fonb2qRjiwMMly_eVsvzHgn_kYb67XqkIJkZJJEsTnWuHdkdB83wxm1INfpeeAWRexQP8cAcHWI_T9VN3ICrtKMXg6Kl_kLILUVo8FP-tKgz9uKCZJQ6iZhZ1oqc',
  },
  {
    id: 2, name: 'Metropolitan United', status: 'ΕΝΕΡΓΗ',
    captainId: 'MU-001', viceId: 'MU-002',
    comments: 'Promoted from regional division last season. Strong midfield coordination.',
    players: [
      { id: 'MU-001', name: 'Kaelan Brooks',    email: 'k.brooks@metroutd.io',   phone: '+1 (555) 445-9900' },
      { id: 'MU-002', name: 'Elena Rodriguez',  email: 'e.rodriguez@metroutd.io', phone: '+1 (555) 234-7711' },
    ],
    logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD-6YlMQxFxBdjTu9qWwSg8E5JObKBlspxg5fmbXNL-qF7cHS7BYCE1HzpWODmSqohrvJa6GJLch-RTmfWyV1rRSAOqBH2Jp35WMUdrCG0Jo5EmVFmPlzpqzcm7Xi3oK70gt-nWIvWeuP5ZozGXNY3M047Rs77BoLt7ouGzxwBKVnZb2yDJoH9De7gSWoBmWF0yAE9qh5md4DQqFB3I0YD1XbSVEHbjpAetW3RXYaMSfbf718qgYsiSv3FmZPTbvZ5YxQE2HWchNCc',
  },
  {
    id: 3, name: 'Valley Falcons', status: 'ΑΝΕΝΕΡΓΗ',
    captainId: '', viceId: '',
    comments: '',
    players: [],
    logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBEbGdhAPVF5vf84llZvH_7jG93eTenACQ8Z-_EhJVkUu-YNDQoDauHkLKbCeOFkfZcniUOL7CsbhmQxZStT09OzsYpsqYC-h6daQXg2kd6BGdgooYdp0k3cggUtAv5MFmbd9ZLGI2H00ItQ2oyA0K41XDwRQavAMgnO9YMao32tEdkePTmaRwMHlfv7u2juLkyZJvnwPJpvPBDidKiTmzzQBYkCe9rJx6Ztol1pIzD3zQJQKRtVxI8v_DtXeuGsIisjXxVEQS9DN8',
  },
  {
    id: 4, name: 'Harbor City FC', status: 'ΕΝΕΡΓΗ',
    captainId: 'HC-001', viceId: 'HC-002',
    comments: 'Consistent top-3 finisher. Captain under review for league ambassador role next season.',
    players: [
      { id: 'HC-001', name: 'Alexander Vance',    email: 'a.vance@harborcity.net',   phone: '+1 (555) 012-4455' },
      { id: 'HC-002', name: 'Dominic Reed',       email: 'd.reed@harborcity.net',     phone: '+1 (555) 882-9011' },
      { id: 'HC-003', name: 'Kaelan Brooks',      email: 'k.brooks@harborcity.net',   phone: '+1 (555) 445-9900' },
      { id: 'HC-004', name: 'Julianna Sterling',  email: 'j.sterling@harborcity.net', phone: '+1 (555) 320-8844' },
    ],
    logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDAMmCV_EYnv7UsY0_h-iG951R8VYw-s_SZ1dj4ngpChHuHj054LOghlTryM9i9X0lt1gJeBzNj_Nwc7OVkikknqgLq4CD6P3d3zp4B6oXFJc5JMU4_4uVLTAaT19D0dzT1hHtF28GpQf84PLV8EmjN0BLFMNbMD3o_P4mORQqu2uYzAAzuDH4nEC0Bnlbp7_Sdpll0oMZeoz3F0GJYBoDPXdzPrc6AN_XkAhEr3lLH336I3y7GPwVvZcwFseD-zJ2-9NBWcMasc4Y',
  },
]

// ─── Column layout ────────────────────────────────────────────────────────────

const cols = {
  name:    { display: 'flex', alignItems: 'center', gap: '0.875rem', flex: '0 0 280px', padding: '0.875rem 0' },
  captain: { flex: '0 0 200px', padding: '0.875rem 1rem' },
  contact: { flex: 1,           padding: '0.875rem 1rem' },
  status:  { flex: '0 0 140px', padding: '0.875rem 1rem' },
}

const COLUMNS = [
  { header: 'ΟΝΟΜΑ ΟΜΑΔΑΣ', style: cols.name    },
  { header: 'ΑΡΧΗΓΟΣ',      style: cols.captain },
  { header: 'ΕΠΙΚΟΙΝΩΝΙΑ',  style: cols.contact },
  { header: 'ΚΑΤΑΣΤΑΣΗ',    style: cols.status  },
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

function TeamRow({ team, isFirst, onClick }) {
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
        <div style={st.thumb}>
          {team.logo
            ? <img src={team.logo} alt={team.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : <span className="material-symbols-outlined" style={{ fontSize: '1.25rem', color: colors.onSurfaceVariant }}>groups</span>
          }
        </div>
        <span style={st.cellName}>{team.name}</span>
      </div>
      <div style={cols.captain}>
        <span style={st.cellMid}>{team.players.find(p => p.id === team.captainId)?.name ?? '—'}</span>
      </div>
      <div style={cols.contact}>
        <span style={st.cellMono}>{team.contact}</span>
      </div>
      <div style={cols.status}>
        <StatusBadge status={team.status} />
      </div>
    </div>
  )
}

// ─── Teams ────────────────────────────────────────────────────────────────────

export default function Teams() {
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)
  const [creating, setCreating] = useState(false)

  const filtered = MOCK_TEAMS.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div style={s.EntitiesPage}>
      <PageHeader title="Ομάδες" addName="Ομάδας" onAdd={() => setCreating(true)} />
      <div style={st.statsGrid}>
        <StatCard label="ΕΝΕΡΓΕΣ ΟΜΑΔΕΣ" count={24} />
        <StatCard label="ΑΙΤΗΜΑΤΑ ΕΓΓΡΑΦΗΣ" count="03" accentColor="#eab308" valueColor="#eab308" />
      </div>
      <DataTable
        columns={COLUMNS}
        rows={filtered}
        renderRow={(row, isFirst) => (
          <TeamRow key={row.id} team={row} isFirst={isFirst} onClick={() => setSelected(row)} />
        )}
        search={search}
        onSearch={setSearch}
        total={24}
      />
      {selected && (
        <ItemModal
          title={selected.name}
          subtitle={`ID: TEAM-${selected.id}`}
          badge={<StatusBadge status={selected.status} />}
          onClose={() => setSelected(null)}
        >
          {(editing) => <TeamModalContent team={selected} editing={editing} />}
        </ItemModal>
      )}
      {creating && <CreateModal type="team" onClose={() => setCreating(false)} />}
    </div>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const st = {
  statsGrid: {
    display: 'flex',
    gap: '1rem',
  },
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
}
