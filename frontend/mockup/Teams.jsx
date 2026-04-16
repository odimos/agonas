import { useState } from 'react'
import { colors, fonts, radius, s } from './styles'

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({ label, value, accentColor }) {
  return (
    <div style={{ ...st.statCard, borderLeftColor: accentColor }}>
      <p style={st.statLabel}>{label}</p>
      <div style={st.statValue}>{value}</div>
    </div>
  )
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

const STATUS_STYLES = {
  Active:    { backgroundColor: colors.secondaryContainer, color: colors.onSecondaryContainer },
  Suspended: { backgroundColor: colors.errorContainer,     color: colors.onErrorContainer },
  Inactive:  { backgroundColor: colors.surfaceVariant,     color: colors.onSurfaceVariant },
}

function StatusBadge({ status }) {
  return (
    <span style={{ ...st.badge, ...(STATUS_STYLES[status] ?? STATUS_STYLES.Inactive) }}>
      {status}
    </span>
  )
}

// ─── Team Row ─────────────────────────────────────────────────────────────────

function TeamRow({ team, onViewDetails }) {
  const [hovered, setHovered] = useState(false)
  return (
    <tr
      style={{ backgroundColor: hovered ? colors.surfaceContainerLow : 'transparent', transition: 'background-color 0.15s ease' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <td style={st.cell}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={st.avatar}>
            {team.logo
              ? <img src={team.logo} alt={team.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <span style={{ fontWeight: 700, color: colors.primary }}>{team.name[0]}</span>
            }
          </div>
          <div>
            <p style={st.teamName}>{team.name}</p>
            <p style={st.teamMeta}>Established {team.established}</p>
          </div>
        </div>
      </td>
      <td style={st.cell}><span style={st.cellText}>{team.captain}</span></td>
      <td style={st.cell}><span style={{ ...st.cellText, color: colors.onSurfaceVariant, fontFamily: 'monospace' }}>{team.contact}</span></td>
      <td style={st.cell}><StatusBadge status={team.status} /></td>
      <td style={{ ...st.cell, textAlign: 'right' }}>
        <button style={st.actionBtn} onClick={() => onViewDetails(team)}>View Details</button>
      </td>
    </tr>
  )
}

// ─── Details Modal ────────────────────────────────────────────────────────────

function DetailsModal({ team, onClose }) {
  if (!team) return null
  return (
    <div style={st.overlay} onClick={onClose}>
      <div style={st.dialog} onClick={e => e.stopPropagation()}>
        <div style={st.modalHeader}>
          <div>
            <h3 style={st.modalTitle}>Team Profile: {team.name}</h3>
            <p style={st.modalSubtitle}>Registry ID: {team.registryId}</p>
          </div>
          <button style={st.closeBtn} onClick={onClose}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <div style={st.modalBody}>
          <div style={st.modalGrid}>
            <div>
              <label style={st.sectionLabel}>Management</label>
              <div style={{ marginBottom: '1rem' }}>
                <p style={st.fieldLabel}>Head Coach</p>
                <p style={st.fieldValue}>{team.headCoach}</p>
              </div>
              <div>
                <p style={st.fieldLabel}>Team Physician</p>
                <p style={st.fieldValue}>{team.physician}</p>
              </div>
            </div>
            <div>
              <label style={st.sectionLabel}>Facility</label>
              <div style={{ marginBottom: '1rem' }}>
                <p style={st.fieldLabel}>Primary Pitch</p>
                <p style={st.fieldValue}>{team.primaryPitch}</p>
              </div>
              <div>
                <p style={st.fieldLabel}>Training Grounds</p>
                <p style={st.fieldValue}>{team.trainingGrounds}</p>
              </div>
            </div>
          </div>
          <div style={st.complianceBox}>
            <p style={st.complianceLabel}>Compliance Notes</p>
            <p style={st.complianceText}>{team.complianceNotes}</p>
          </div>
        </div>
        <div style={st.modalFooter}>
          <button style={st.btnClose} onClick={onClose}>Close</button>
          <button style={st.btnEdit}>Edit Profile</button>
        </div>
      </div>
    </div>
  )
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_TEAMS = [
  {
    id: 1, name: 'North Star Rangers', established: 2018,
    captain: 'Alexander Vance', contact: 'vance.a@northstars.com', status: 'Active',
    registryId: '88293-F', headCoach: 'Dominic Sterling', physician: 'Dr. Helen K. Miller',
    primaryPitch: 'Highland Park Arena', trainingGrounds: 'Vance Memorial Fields',
    complianceNotes: 'All seasonal fees paid. Player insurance certificates are current until 12/2024. Team uniform colors verified for tournament play.',
    logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCINzVJCj9R8ZkjVYYRd6Ca9PDYndD_OFwn-7WmRE-BmlSle8-rnBa8soT0UPmJ1OasE8wojKO0EP0k7DGZ1ZQ73hRxC2oQwqqECuu2mgrYTMbd9tckN4f4dOdkzuLW3suj_gQkhsHo-76fuq6fonb2qRjiwMMly_eVsvzHgn_kYb67XqkIJkZJJEsTnWuHdkdB83wxm1INfpeeAWRexQP8cAcHWI_T9VN3ICrtKMXg6Kl_kLILUVo8FP-tKgz9uKCZJQ6iZhZ1oqc',
  },
  {
    id: 2, name: 'Metropolitan United', established: 2021,
    captain: 'Sarah Sterling', contact: 'admin@metroutd.io', status: 'Active',
    registryId: '91042-M', headCoach: 'James Holloway', physician: 'Dr. Patricia Wei',
    primaryPitch: 'Metro Central Stadium', trainingGrounds: 'Eastfield Training Complex',
    complianceNotes: 'All documents up to date.',
    logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD-6YlMQxFxBdjTu9qWwSg8E5JObKBlspxg5fmbXNL-qF7cHS7BYCE1HzpWODmSqohrvJa6GJLch-RTmfWyV1rRSAOqBH2Jp35WMUdrCG0Jo5EmVFmPlzpqzcm7Xi3oK70gt-nWIvWeuP5ZozGXNY3M047Rs77BoLt7ouGzxwBKVnZb2yDJoH9De7gSWoBmWF0yAE9qh5md4DQqFB3I0YD1XbSVEHbjpAetW3RXYaMSfbf718qgYsiSv3FmZPTbvZ5YxQE2HWchNCc',
  },
  {
    id: 3, name: 'Harbor City FC', established: 2015,
    captain: 'Marcus Thorne', contact: 'm.thorne@harborcity.net', status: 'Suspended',
    registryId: '74820-H', headCoach: 'Colin Marsh', physician: 'Dr. Sandra Liu',
    primaryPitch: 'Harbor Grounds', trainingGrounds: 'Dock Street Fields',
    complianceNotes: 'Suspension pending review of financial compliance breach.',
    logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDAMmCV_EYnv7UsY0_h-iG951R8VYw-s_SZ1dj4ngpChHuHj054LOghlTryM9i9X0lt1gJeBzNj_Nwc7OVkikknqgLq4CD6P3d3zp4B6oXFJc5JMU4_4uVLTAaT19D0dzT1hHtF28GpQf84PLV8EmjN0BLFMNbMD3o_P4mORQqu2uYzAAzuDH4nEC0Bnlbp7_Sdpll0oMZeoz3F0GJYBoDPXdzPrc6AN_XkAhEr3lLH336I3y7GPwVvZcwFseD-zJ2-9NBWcMasc4Y',
  },
  {
    id: 4, name: 'Valley Falcons', established: 2023,
    captain: 'Elena Rodriguez', contact: 'elena.r@falcons.com', status: 'Inactive',
    registryId: '60311-V', headCoach: 'Tom Nkosi', physician: 'Dr. Ahmed Karimi',
    primaryPitch: 'Valley Sports Park', trainingGrounds: 'Ridgeline Training Facility',
    complianceNotes: 'Awaiting renewal of player registration documents.',
    logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBEbGdhAPVF5vf84llZvH_7jG93eTenACQ8Z-_EhJVkUu-YNDQoDauHkLKbCeOFkfZcniUOL7CsbhmQxZStT09OzsYpsqYC-h6daQXg2kd6BGdgooYdp0k3cggUtAv5MFmbd9ZLGI2H00ItQ2oyA0K41XDwRQavAMgnO9YMao32tEdkePTmaRwMHlfv7u2juLkyZJvnwPJpvPBDidKiTmzzQBYkCe9rJx6Ztol1pIzD3zQJQKRtVxI8v_DtXeuGsIisjXxVEQS9DN8',
  },
]

const STATS = [
  { label: 'Total Teams',       value: '24',  accent: colors.tertiary },
  { label: 'Active Squads',     value: '22',  accent: colors.primaryContainer },
  { label: 'Open Applications', value: '03',  accent: colors.secondary },
  { label: 'Compliance Rate',   value: '98%', accent: colors.outlineVariant },
]

// ─── Teams ────────────────────────────────────────────────────────────────────

export default function Teams() {
  const [selectedTeam, setSelectedTeam] = useState(null)

  return (
    <div style={st.page}>
      {/* Page Header */}
      <div style={st.pageHeader}>
        <div>
          <h1 style={st.pageTitle}>Registered Teams</h1>
          <p style={st.pageSubtitle}>League Operations &amp; Directory</p>
        </div>
        <button style={s.btnPrimary}>
          <span className="material-symbols-outlined" style={{ fontSize: '1rem', verticalAlign: 'middle', marginRight: '0.4rem' }}>add</span>
          Register New Team
        </button>
      </div>

      {/* Stats */}
      <div style={st.statsGrid}>
        {STATS.map(stat => (
          <StatCard key={stat.label} label={stat.label} value={stat.value} accentColor={stat.accent} />
        ))}
      </div>

      {/* Table */}
      <div style={st.tableWrapper}>
        <div style={{ overflowX: 'auto' }}>
          <table style={st.table}>
            <thead>
              <tr style={st.theadRow}>
                {['Team Name', 'Captain', 'Contact Info', 'Status', 'Actions'].map((h, i) => (
                  <th key={h} style={{ ...st.th, textAlign: i === 4 ? 'right' : 'left' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MOCK_TEAMS.map(team => (
                <TeamRow key={team.id} team={team} onViewDetails={setSelectedTeam} />
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div style={st.pagination}>
          <p style={st.paginationInfo}>Showing {MOCK_TEAMS.length} of 24 teams</p>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
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

      {selectedTeam && <DetailsModal team={selectedTeam} onClose={() => setSelectedTeam(null)} />}
    </div>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const st = {
  page: {
    padding: '2rem',
    fontFamily: fonts.body,
    backgroundColor: colors.surface,
    minHeight: '100%',
  },
  pageHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: '2.5rem',
  },
  pageTitle: {
    fontSize: '1.875rem',
    fontWeight: 800,
    letterSpacing: '-0.02em',
    color: colors.onSurface,
    margin: 0,
  },
  pageSubtitle: {
    fontSize: '0.875rem',
    fontWeight: 500,
    color: colors.onSurfaceVariant,
    margin: '4px 0 0',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '1rem',
    marginBottom: '2rem',
  },
  statCard: {
    backgroundColor: colors.surfaceContainerLowest,
    padding: '1.25rem',
    borderRadius: radius.lg,
    borderLeft: '4px solid',
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
  },
  statLabel: {
    fontSize: '0.625rem',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    color: colors.onSurfaceVariant,
    fontWeight: 700,
    margin: '0 0 4px',
  },
  statValue: {
    fontSize: '1.5rem',
    fontWeight: 700,
    color: colors.onSurface,
  },
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '0.125rem 0.5rem',
    borderRadius: radius.DEFAULT,
    fontSize: '0.625rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  tableWrapper: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radius.lg,
    overflow: 'hidden',
    border: `1px solid ${colors.outlineVariant}33`,
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
  },
  theadRow: {
    backgroundColor: colors.surfaceContainerLow,
    borderBottom: `1px solid ${colors.outlineVariant}4d`,
  },
  th: {
    padding: '1rem 1.5rem',
    fontSize: '0.6875rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    color: colors.onSurfaceVariant,
  },
  cell: {
    padding: '1rem 1.5rem',
    borderBottom: `1px solid ${colors.outlineVariant}22`,
  },
  avatar: {
    height: '2.5rem',
    width: '2.5rem',
    backgroundColor: colors.surfaceContainer,
    borderRadius: radius.lg,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: `1px solid ${colors.outlineVariant}33`,
    overflow: 'hidden',
    flexShrink: 0,
  },
  teamName: {
    fontSize: '0.875rem',
    fontWeight: 700,
    color: colors.onSurface,
    margin: 0,
  },
  teamMeta: {
    fontSize: '0.6875rem',
    color: colors.onSurfaceVariant,
    margin: '2px 0 0',
  },
  cellText: {
    fontSize: '0.875rem',
    fontWeight: 500,
    color: colors.onSurface,
  },
  actionBtn: {
    fontSize: '0.6875rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    color: colors.tertiary,
    background: 'none',
    border: 'none',
    cursor: 'pointer',
  },
  pagination: {
    padding: '1rem 1.5rem',
    backgroundColor: colors.surfaceContainerLow,
    borderTop: `1px solid ${colors.outlineVariant}4d`,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  paginationInfo: {
    fontSize: '0.75rem',
    color: colors.onSurfaceVariant,
    margin: 0,
  },
  pageBtn: {
    padding: '0.375rem 0.625rem',
    borderRadius: radius.DEFAULT,
    border: `1px solid ${colors.outlineVariant}4d`,
    backgroundColor: 'transparent',
    cursor: 'pointer',
    fontSize: '0.75rem',
    fontWeight: 700,
    color: colors.onSurface,
    display: 'flex',
    alignItems: 'center',
  },
  pageBtnActive: {
    backgroundColor: colors.surfaceContainerLowest,
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
  },
  // Modal
  overlay: {
    position: 'fixed',
    inset: 0,
    backgroundColor: `${colors.onSurface}33`,
    backdropFilter: 'blur(4px)',
    zIndex: 60,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '1rem',
  },
  dialog: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
    maxWidth: '42rem',
    width: '100%',
    border: `1px solid ${colors.outlineVariant}4d`,
  },
  modalHeader: {
    padding: '1.5rem',
    borderBottom: `1px solid ${colors.outlineVariant}33`,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  modalTitle: {
    fontSize: '1.25rem',
    fontWeight: 700,
    color: colors.onSurface,
    margin: 0,
  },
  modalSubtitle: {
    fontSize: '0.875rem',
    color: colors.onSurfaceVariant,
    margin: '4px 0 0',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: colors.onSurfaceVariant,
    display: 'flex',
    alignItems: 'center',
  },
  modalBody: {
    padding: '2rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  modalGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '2rem',
  },
  sectionLabel: {
    display: 'block',
    fontSize: '0.625rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    color: colors.onSurfaceVariant,
    marginBottom: '1rem',
  },
  fieldLabel: {
    fontSize: '0.6875rem',
    color: colors.onSurfaceVariant,
    margin: 0,
  },
  fieldValue: {
    fontSize: '0.875rem',
    fontWeight: 500,
    color: colors.onSurface,
    margin: '2px 0 0',
  },
  complianceBox: {
    backgroundColor: colors.surfaceContainer,
    padding: '1rem',
    borderRadius: radius.DEFAULT,
    border: `1px solid ${colors.outlineVariant}33`,
  },
  complianceLabel: {
    fontSize: '0.625rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    color: colors.onSurfaceVariant,
    margin: '0 0 0.5rem',
  },
  complianceText: {
    fontSize: '0.75rem',
    lineHeight: 1.6,
    color: colors.onSurfaceVariant,
    fontStyle: 'italic',
    margin: 0,
  },
  modalFooter: {
    padding: '1.25rem 1.5rem',
    backgroundColor: colors.surfaceContainerLow,
    borderTop: `1px solid ${colors.outlineVariant}33`,
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '0.75rem',
    borderRadius: `0 0 ${radius.lg} ${radius.lg}`,
  },
  btnClose: {
    padding: '0.5rem 1.25rem',
    fontSize: '0.875rem',
    fontWeight: 600,
    color: colors.onSurfaceVariant,
    backgroundColor: 'transparent',
    border: `1px solid ${colors.outlineVariant}4d`,
    borderRadius: radius.DEFAULT,
    cursor: 'pointer',
  },
  btnEdit: {
    padding: '0.5rem 1.25rem',
    fontSize: '0.875rem',
    fontWeight: 600,
    backgroundColor: colors.tertiary,
    color: colors.onTertiary,
    border: 'none',
    borderRadius: radius.DEFAULT,
    cursor: 'pointer',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
}
