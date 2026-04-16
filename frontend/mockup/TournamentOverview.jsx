import { useParams } from 'react-router-dom'
import { colors, fonts, radius } from './styles'

const MOCK_TOURNAMENTS = {
  '1': {
    id: 1, name: 'Tournament 1', status: 'ΕΝΕΡΓΟ',
    progress: 60, totalTeams: 8, teamsNote: '+2 Since Phase 1',
    startDate: '12/10/2024', type: 'Knockout', visibility: 'Visible',
    description: 'Tournament 1 is currently in the late Phase 2 stage. System logs indicate all knockout brackets are synchronized with real-time server updates. Ensure all visibility settings are finalized before the weekend cutoff.',
  },
  '2': {
    id: 2, name: 'Tournament 2', status: 'ΑΝΕΝΕΡΓΟ',
    progress: 25, totalTeams: 6, teamsNote: 'Registrations open',
    startDate: '15/01/2025', type: 'Round Robin', visibility: 'Hidden',
    description: 'Tournament 2 is in early configuration. Team registrations are open and bracket generation is pending. Confirm visibility settings before publishing.',
  },
}

function DataCell({ label, value, icon, last }) {
  return (
    <div style={{ ...st.dataCell, borderRight: last ? 'none' : `1px solid ${colors.outlineVariant}33` }}>
      <span style={st.dataCellLabel}>{label}</span>
      <div style={st.dataCellRow}>
        <span style={st.dataCellValue}>{value}</span>
        <span className="material-symbols-outlined" style={st.dataCellIcon}>{icon}</span>
      </div>
    </div>
  )
}

export default function TournamentOverview() {
  const { id } = useParams()
  const t = MOCK_TOURNAMENTS[id] ?? MOCK_TOURNAMENTS['1']

  return (
    <div style={st.page}>

      {/* Header */}
      <div style={st.header}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.375rem' }}>
            <h1 style={st.title}>{t.name.toUpperCase()}</h1>
            <div style={st.statusBadge}>
              {t.status}
              <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>arrow_drop_down</span>
            </div>
          </div>
          <p style={st.subtitle}>Configuration &amp; Management Dashboard</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button style={st.secondaryBtn}>
            <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>share</span>
            Share Access
          </button>
          <button style={st.primaryBtn}>
            <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>save</span>
            Save Changes
          </button>
        </div>
      </div>

      {/* Bento grid */}
      <div style={st.bentoGrid}>

        {/* Progress card */}
        <div style={st.progressCard}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={st.cardLabel}>Tournament Progress</span>
              <div style={st.progressNum}>{t.progress}%</div>
            </div>
            <button style={st.graphBtn}>
              <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>auto_graph</span>
              Generate Graph
            </button>
          </div>
          <div style={st.progressBarTrack}>
            <div style={{ ...st.progressBarFill, width: `${t.progress}%` }} />
          </div>
        </div>

        {/* Teams stat card */}
        <div style={st.teamsCard}>
          <span style={st.cardLabel}>Total Teams</span>
          <div style={st.teamsNum}>{t.totalTeams}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.5rem' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '0.875rem', color: colors.tertiary }}>arrow_upward</span>
            <span style={st.teamsNote}>{t.teamsNote}</span>
          </div>
        </div>

        {/* Data grid */}
        <div style={st.dataGrid}>
          <DataCell label="Start Date"        value={t.startDate} icon="calendar_today" />
          <DataCell label="Tournament Type"   value={t.type}      icon="schema"         />
          <DataCell label="Visibility"        value={t.visibility} icon="visibility"    last />
        </div>

        {/* Decorative card */}
        <div style={st.decoCard}>
          <img
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBDUKDE6blm6pJmeS_ira6JCjiBQCoPJZNHmDPn3q6oFKVeW1UKST3y4s7yBLhaXj4d8_ttMieYE5eLJYedlEWvcCVnQL84Uu2qaprwHT1soL1L-vkvI8rFSjZqwd79BIa_oHrXghxDQ0n2KGWxZvQzHusWd_D3ZVUTE5YYuCpUJX_daDRsBJHBNoP93bCkM_XWumIuBSDTpAi-O1tA1-6NLTUr9P8c1GFvsB0jobPP00CxMin07rfENwSwmyooSuJMq2cekjNkYlY"
            alt=""
            style={st.decoImg}
          />
          <div style={st.decoContent}>
            <h3 style={st.decoTitle}>League Environment</h3>
            <p style={st.decoText}>{t.description}</p>
            <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1.5rem' }}>
              <div style={st.indicator}>
                <span style={{ ...st.dot, backgroundColor: colors.tertiary }} />
                Real-time Sync
              </div>
              <div style={st.indicator}>
                <span style={{ ...st.dot, backgroundColor: colors.outlineVariant }} />
                Auto-Archive Enabled
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Danger Zone */}
      <div style={st.dangerZone}>
        <div>
          <p style={st.dangerTitle}>Danger Zone</p>
          <p style={st.dangerText}>Deleting a tournament is irreversible. All phases, team data, and generated reports will be permanently purged from the system.</p>
        </div>
        <button style={st.dangerBtn}>
          <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>delete_forever</span>
          Delete Tournament
        </button>
      </div>

    </div>
  )
}

const st = {
  page: {
    padding: '2rem 2.5rem',
    fontFamily: fonts.body,
    backgroundColor: colors.surface,
    display: 'flex',
    flexDirection: 'column',
    gap: '2rem',
  },

  // Header
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingBottom: '1.5rem',
    borderBottom: `1px solid ${colors.outlineVariant}33`,
  },
  title: {
    fontSize: '2rem',
    fontWeight: 800,
    letterSpacing: '-0.04em',
    color: colors.onSurface,
    margin: 0,
    fontFamily: fonts.headline,
  },
  subtitle: {
    fontSize: '0.875rem',
    color: colors.onSurfaceVariant,
    margin: 0,
    fontFamily: fonts.label,
  },
  statusBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.125rem',
    backgroundColor: colors.secondaryContainer,
    color: colors.onSecondaryContainer,
    padding: '0.1875rem 0.625rem 0.1875rem 0.75rem',
    borderRadius: radius.DEFAULT,
    fontSize: '0.625rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    cursor: 'pointer',
    fontFamily: fonts.label,
  },
  secondaryBtn: {
    display: 'flex', alignItems: 'center', gap: '0.5rem',
    padding: '0.5rem 1rem',
    backgroundColor: colors.surfaceContainerLowest,
    border: `1px solid ${colors.outlineVariant}`,
    borderRadius: radius.DEFAULT,
    fontSize: '0.875rem', fontWeight: 600,
    color: colors.onSurface,
    cursor: 'pointer', fontFamily: fonts.label,
  },
  primaryBtn: {
    display: 'flex', alignItems: 'center', gap: '0.5rem',
    padding: '0.5rem 1.5rem',
    backgroundColor: colors.tertiary,
    border: 'none',
    borderRadius: radius.DEFAULT,
    fontSize: '0.875rem', fontWeight: 600,
    color: colors.onTertiary,
    cursor: 'pointer', fontFamily: fonts.label,
  },

  // Bento
  bentoGrid: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr',
    gridTemplateRows: 'auto auto auto',
    gap: '1.5rem',
  },

  progressCard: {
    backgroundColor: colors.surfaceContainerLowest,
    borderLeft: `4px solid ${colors.tertiary}`,
    padding: '2rem',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    minHeight: '12rem',
  },
  cardLabel: {
    display: 'block',
    fontSize: '0.625rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.18em',
    color: colors.onSurfaceVariant,
    marginBottom: '0.75rem',
    fontFamily: fonts.label,
  },
  progressNum: {
    fontSize: '3rem',
    fontWeight: 800,
    letterSpacing: '-0.04em',
    color: colors.onSurface,
    lineHeight: 1,
    fontFamily: fonts.headline,
  },
  graphBtn: {
    display: 'flex', alignItems: 'center', gap: '0.5rem',
    padding: '0.5rem 1rem',
    backgroundColor: `${colors.primaryContainer}33`,
    color: colors.primary,
    border: 'none',
    borderRadius: radius.DEFAULT,
    fontSize: '0.6875rem', fontWeight: 700,
    textTransform: 'uppercase', letterSpacing: '0.06em',
    cursor: 'pointer', fontFamily: fonts.label,
    flexShrink: 0,
  },
  progressBarTrack: {
    width: '100%',
    height: '4px',
    backgroundColor: colors.surfaceContainer,
    borderRadius: radius.full,
    overflow: 'hidden',
    marginTop: '1rem',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.tertiary,
    borderRadius: radius.full,
    transition: 'width 0.8s ease',
  },

  teamsCard: {
    backgroundColor: colors.surfaceContainerLowest,
    borderLeft: `4px solid ${colors.primary}`,
    padding: '2rem',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  teamsNum: {
    fontSize: '2.5rem',
    fontWeight: 800,
    letterSpacing: '-0.04em',
    color: colors.onSurface,
    lineHeight: 1,
    fontFamily: fonts.headline,
  },
  teamsNote: {
    fontSize: '0.6875rem',
    fontWeight: 700,
    color: colors.tertiary,
    fontFamily: fonts.label,
  },

  dataGrid: {
    gridColumn: '1 / -1',
    backgroundColor: colors.surfaceContainerLowest,
    border: `1px solid ${colors.outlineVariant}33`,
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
  },
  dataCell: {
    padding: '1.5rem',
  },
  dataCellLabel: {
    display: 'block',
    fontSize: '0.625rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.18em',
    color: colors.onSurfaceVariant,
    marginBottom: '0.5rem',
    fontFamily: fonts.label,
  },
  dataCellRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dataCellValue: {
    fontSize: '1.125rem',
    fontWeight: 500,
    color: colors.onSurface,
  },
  dataCellIcon: {
    fontSize: '1.25rem',
    color: colors.onSurfaceVariant,
  },

  decoCard: {
    gridColumn: '1 / -1',
    position: 'relative',
    height: '16rem',
    overflow: 'hidden',
    backgroundColor: colors.surfaceContainerLowest,
  },
  decoImg: {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    opacity: 0.1,
    filter: 'grayscale(1)',
  },
  decoContent: {
    position: 'relative',
    zIndex: 1,
    padding: '2.5rem',
    maxWidth: '40rem',
  },
  decoTitle: {
    fontSize: '1.25rem',
    fontWeight: 800,
    letterSpacing: '-0.03em',
    textTransform: 'uppercase',
    color: colors.onSurface,
    margin: '0 0 0.75rem',
    fontFamily: fonts.headline,
  },
  decoText: {
    fontSize: '0.875rem',
    color: colors.onSurfaceVariant,
    lineHeight: 1.6,
    margin: 0,
  },
  indicator: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.6875rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    color: colors.primary,
    fontFamily: fonts.label,
  },
  dot: {
    width: '0.5rem',
    height: '0.5rem',
    borderRadius: radius.full,
    flexShrink: 0,
  },

  // Danger Zone
  dangerZone: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '2rem',
    borderTop: `1px solid ${colors.error}1a`,
    backgroundColor: `${colors.errorContainer}0d`,
  },
  dangerTitle: {
    fontSize: '0.875rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '-0.02em',
    color: colors.error,
    margin: '0 0 0.25rem',
    fontFamily: fonts.headline,
  },
  dangerText: {
    fontSize: '0.75rem',
    color: colors.onSurfaceVariant,
    margin: 0,
    maxWidth: '36rem',
    lineHeight: 1.5,
  },
  dangerBtn: {
    display: 'flex', alignItems: 'center', gap: '0.5rem',
    padding: '0.625rem 1.5rem',
    backgroundColor: 'transparent',
    border: `1px solid ${colors.error}`,
    borderRadius: radius.DEFAULT,
    fontSize: '0.75rem', fontWeight: 800,
    textTransform: 'uppercase', letterSpacing: '0.08em',
    color: colors.error,
    cursor: 'pointer', fontFamily: fonts.label,
    flexShrink: 0,
  },
}
