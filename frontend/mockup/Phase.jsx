import { useParams } from 'react-router-dom'
import { colors, fonts, radius } from './styles'

const MOCK_PHASES = {
  '1-1': {
    name: 'Phase One', number: '01', status: 'Active',
    teams: [
      { id: 'TA-01', name: 'Team A', leaguePoints: 1420, status: 'normal' },
      { id: 'TB-02', name: 'Team B', leaguePoints: 1385, status: 'selected' },
      { id: 'TC-03', name: 'Team C', leaguePoints: 890,  status: 'eliminated' },
      { id: 'TD-04', name: 'Team D', leaguePoints: 1210, status: 'normal' },
    ],
    matches: [
      { teamA: 'Team A', teamB: 'Team B', scoreA: 2, scoreB: 1, status: 'Final',      datetime: 'Mar 12, 18:00', location: null },
      { teamA: 'Team C', teamB: 'Team D', scoreA: 0, scoreB: 3, status: 'Final',      datetime: 'Mar 12, 20:30', location: null },
      { teamA: 'Team B', teamB: 'Team D', scoreA: null, scoreB: null, status: 'InProgress', datetime: null, location: 'Pitch 01' },
      { teamA: 'Team A', teamB: 'Team D', scoreA: null, scoreB: null, status: 'Scheduled', datetime: 'Mar 14, 15:00', location: null },
      { teamA: 'Team B', teamB: 'Team C', scoreA: null, scoreB: null, status: 'Scheduled', datetime: 'Mar 14, 17:30', location: null },
    ],
  },
  '1-2': {
    name: 'Phase Two', number: '02', status: 'Active',
    teams: [
      { id: 'TA-01', name: 'Team A', leaguePoints: 1520, status: 'selected' },
      { id: 'TB-02', name: 'Team B', leaguePoints: 1385, status: 'normal' },
      { id: 'TD-04', name: 'Team D', leaguePoints: 1310, status: 'normal' },
      { id: 'TE-05', name: 'Team E', leaguePoints: 760,  status: 'eliminated' },
    ],
    matches: [
      { teamA: 'Team A', teamB: 'Team D', scoreA: 3, scoreB: 0, status: 'Final',      datetime: 'Apr 02, 17:00', location: null },
      { teamA: 'Team B', teamB: 'Team E', scoreA: 2, scoreB: 2, status: 'Final',      datetime: 'Apr 02, 19:30', location: null },
      { teamA: 'Team A', teamB: 'Team B', scoreA: null, scoreB: null, status: 'InProgress', datetime: null, location: 'Pitch 02' },
      { teamA: 'Team D', teamB: 'Team E', scoreA: null, scoreB: null, status: 'Scheduled', datetime: 'Apr 05, 16:00', location: null },
    ],
  },
  '1-3': {
    name: 'Phase Three', number: '03', status: 'Inactive',
    teams: [
      { id: 'TA-01', name: 'Team A', leaguePoints: 1620, status: 'normal' },
      { id: 'TB-02', name: 'Team B', leaguePoints: 1490, status: 'normal' },
    ],
    matches: [
      { teamA: 'Team A', teamB: 'Team B', scoreA: null, scoreB: null, status: 'Scheduled', datetime: 'May 10, 18:00', location: null },
    ],
  },
  '1-4': {
    name: 'Phase Four', number: '04', status: 'Inactive',
    teams: [
      { id: 'TA-01', name: 'Team A', leaguePoints: 1620, status: 'normal' },
    ],
    matches: [],
  },
  '2-1': {
    name: 'Phase One', number: '01', status: 'Active',
    teams: [
      { id: 'TF-01', name: 'Team F', leaguePoints: 980,  status: 'normal' },
      { id: 'TG-02', name: 'Team G', leaguePoints: 1100, status: 'selected' },
      { id: 'TH-03', name: 'Team H', leaguePoints: 870,  status: 'eliminated' },
      { id: 'TI-04', name: 'Team I', leaguePoints: 1050, status: 'normal' },
    ],
    matches: [
      { teamA: 'Team F', teamB: 'Team G', scoreA: 1, scoreB: 2, status: 'Final',      datetime: 'Mar 20, 18:00', location: null },
      { teamA: 'Team H', teamB: 'Team I', scoreA: null, scoreB: null, status: 'Scheduled', datetime: 'Mar 22, 17:00', location: null },
    ],
  },
  '2-2': {
    name: 'Phase Two', number: '02', status: 'Inactive',
    teams: [
      { id: 'TF-01', name: 'Team F', leaguePoints: 1080, status: 'normal' },
      { id: 'TG-02', name: 'Team G', leaguePoints: 1200, status: 'normal' },
    ],
    matches: [],
  },
}

function TeamCard({ team }) {
  const isSelected   = team.status === 'selected'
  const isEliminated = team.status === 'eliminated'

  const cardStyle = {
    ...st.teamCard,
    ...(isSelected   ? st.teamCardSelected   : {}),
    ...(isEliminated ? st.teamCardEliminated : {}),
  }

  return (
    <div style={cardStyle}>
      {isSelected && <div style={st.selectedBadge}>Selected</div>}
      <div style={st.teamCardTop}>
        <div style={{ ...st.teamIcon, ...(isSelected ? st.teamIconSelected : {}) }}>
          <span className="material-symbols-outlined" style={{ color: isEliminated ? colors.outline : isSelected ? colors.tertiary : colors.outline }}>
            {isEliminated ? 'close' : 'shield'}
          </span>
        </div>
        {isSelected ? (
          <button style={st.deleteBtn}>
            <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>delete</span>
            <span style={{ fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase' }}>Delete</span>
          </button>
        ) : (
          <span style={st.teamId}>{isEliminated ? 'Eliminated' : `ID: ${team.id}`}</span>
        )}
      </div>
      <h4 style={st.teamName}>{team.name}</h4>
      <p style={st.teamPoints}>League Points: {team.leaguePoints.toLocaleString()}</p>
    </div>
  )
}

function MatchCard({ match }) {
  const isFinal      = match.status === 'Final'
  const isInProgress = match.status === 'InProgress'
  const isScheduled  = match.status === 'Scheduled'

  return (
    <div style={{ ...st.matchCard, ...(isScheduled ? st.matchCardScheduled : {}), ...(isInProgress ? st.matchCardInProgress : {}) }}>
      <div style={st.matchTeams}>
        <div style={st.matchRow}>
          <span style={st.matchTeamName}>{match.teamA}</span>
          <span style={{ ...st.matchScore, ...(isScheduled ? st.matchScoreMuted : {}) }}>
            {isFinal ? match.scoreA : isInProgress ? 'Live' : '--'}
          </span>
        </div>
        <div style={st.matchRow}>
          <span style={st.matchTeamName}>{match.teamB}</span>
          <span style={{ ...st.matchScore, ...(isScheduled ? st.matchScoreMuted : {}) }}>
            {isFinal ? match.scoreB : isInProgress ? 'Live' : '--'}
          </span>
        </div>
      </div>
      <div style={st.matchFooter}>
        {isFinal      && <span style={st.matchStatusFinal}>Final</span>}
        {isInProgress && <span style={st.matchStatusLive}>In Progress</span>}
        {isScheduled  && <span style={st.matchStatusScheduled}>Scheduled</span>}
        <span style={st.matchMeta}>{match.location ?? match.datetime}</span>
      </div>
    </div>
  )
}

export default function Phase() {
  const { id, phaseId } = useParams()
  const key   = `${id}-${phaseId}`
  const phase = MOCK_PHASES[key] ?? MOCK_PHASES['1-1']

  return (
    <div style={st.page}>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}.phase-pulse{animation:pulse 1.5s ease-in-out infinite}`}</style>

      {/* Header */}
      <div style={st.header}>
        <div>
          <span style={st.headerLabel}>Current Management</span>
          <h1 style={st.title}>{phase.number} {phase.name}</h1>
        </div>
        <div style={st.headerRight}>
          <button style={st.statusBadge}>
            <span style={{ ...st.statusDot, backgroundColor: phase.status === 'Active' ? colors.tertiary : colors.outline }} />
            Status: {phase.status}
            <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>expand_more</span>
          </button>
        </div>
      </div>

      {/* Teams */}
      <section style={st.section}>
        <div style={st.sectionHeader}>
          <h3 style={st.sectionTitle}>Qualified Teams</h3>
          <span style={st.sectionCount}>{phase.teams.length} total participating</span>
        </div>
        <div style={st.teamsRow}>
          {phase.teams.map(team => <TeamCard key={team.id} team={team} />)}
        </div>
      </section>

      {/* Matches */}
      <section style={st.section}>
        <div style={st.sectionHeader}>
          <h3 style={st.sectionTitle}>Scheduled Matches</h3>
          <div style={{ display: 'flex', gap: '0.25rem' }}>
            <button style={st.viewBtn}>
              <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>grid_view</span>
            </button>
            <button style={{ ...st.viewBtn, color: colors.outline }}>
              <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>list</span>
            </button>
          </div>
        </div>
        <div style={st.matchGrid}>
          {phase.matches.map((match, i) => <MatchCard key={i} match={match} />)}
          <div style={st.addMatchCard}>
            <span className="material-symbols-outlined" style={{ color: colors.outlineVariant }}>add_circle</span>
            <span style={st.addMatchLabel}>Add Match</span>
          </div>
        </div>
      </section>

      {/* Footer spacer so content isn't hidden behind fixed bar */}
      <div style={{ height: '5rem' }} />

      {/* Fixed footer */}
      <div style={st.footer}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button style={st.footerOutlineBtn}>
            Generate Program
            <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>expand_more</span>
          </button>
          <button style={st.footerGhostBtn}>Preview Ruleset</button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button style={st.footerDiscardBtn}>Discard Changes</button>
          <button style={st.footerFinishBtn}>Finish Phase</button>
        </div>
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
  headerLabel: {
    display: 'block',
    fontSize: '0.625rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.18em',
    color: colors.tertiary,
    marginBottom: '0.25rem',
    fontFamily: fonts.label,
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: 800,
    letterSpacing: '-0.04em',
    color: colors.onSurface,
    margin: 0,
    fontFamily: fonts.headline,
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  statusBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.5rem 1rem',
    backgroundColor: colors.surfaceContainerLowest,
    border: `1px solid ${colors.outlineVariant}4d`,
    borderRadius: radius.DEFAULT,
    fontSize: '0.875rem',
    fontWeight: 500,
    color: colors.onSurface,
    cursor: 'pointer',
    fontFamily: fonts.label,
  },
  statusDot: {
    width: '0.5rem',
    height: '0.5rem',
    borderRadius: '50%',
    flexShrink: 0,
  },

  // Sections
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: '0.625rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.18em',
    color: colors.onSurfaceVariant,
    margin: 0,
    fontFamily: fonts.label,
  },
  sectionCount: {
    fontSize: '0.75rem',
    color: colors.outline,
    fontFamily: fonts.label,
  },

  // Teams
  teamsRow: {
    display: 'flex',
    gap: '1rem',
    overflowX: 'auto',
    paddingBottom: '0.5rem',
  },
  teamCard: {
    minWidth: '240px',
    backgroundColor: colors.surfaceContainerLowest,
    padding: '1.25rem',
    border: `1px solid ${colors.outlineVariant}33`,
    cursor: 'pointer',
    position: 'relative',
    flexShrink: 0,
  },
  teamCardSelected: {
    border: `2px solid ${colors.tertiary}`,
    boxShadow: `0 0 0 4px ${colors.tertiary}0d`,
  },
  teamCardEliminated: {
    backgroundColor: colors.surfaceContainerLow,
    border: `1px solid ${colors.outlineVariant}1a`,
    opacity: 0.6,
    filter: 'grayscale(1)',
  },
  selectedBadge: {
    position: 'absolute',
    top: '-0.5rem',
    right: '-0.5rem',
    backgroundColor: colors.tertiary,
    color: colors.onTertiary,
    fontSize: '0.5rem',
    fontWeight: 900,
    padding: '0.125rem 0.5rem',
    textTransform: 'uppercase',
    letterSpacing: '-0.02em',
    fontFamily: fonts.label,
  },
  teamCardTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '1rem',
  },
  teamIcon: {
    width: '2.5rem',
    height: '2.5rem',
    backgroundColor: colors.surfaceContainerLow,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  teamIconSelected: {
    backgroundColor: `${colors.tertiary}1a`,
  },
  teamId: {
    fontSize: '0.625rem',
    fontWeight: 700,
    color: `${colors.onSurfaceVariant}66`,
    fontFamily: fonts.label,
  },
  deleteBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
    padding: '0.25rem 0.5rem',
    color: colors.error,
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    borderRadius: radius.DEFAULT,
    fontFamily: fonts.label,
  },
  teamName: {
    fontSize: '0.9375rem',
    fontWeight: 700,
    color: colors.onSurface,
    margin: '0 0 0.25rem',
    fontFamily: fonts.headline,
  },
  teamPoints: {
    fontSize: '0.75rem',
    color: colors.onSurfaceVariant,
    margin: 0,
    fontFamily: fonts.body,
  },

  // Matches
  viewBtn: {
    padding: '0.25rem',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: colors.onSurfaceVariant,
    display: 'flex',
    alignItems: 'center',
  },
  matchGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '1px',
    backgroundColor: colors.outlineVariant + '1a',
  },
  matchCard: {
    backgroundColor: colors.surfaceContainerLowest,
    padding: '1rem',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    height: '8rem',
  },
  matchCardScheduled: {
    opacity: 0.4,
  },
  matchCardInProgress: {
    borderLeft: `4px solid ${colors.tertiary}`,
  },
  matchTeams: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  matchRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  matchTeamName: {
    fontSize: '0.875rem',
    fontWeight: 600,
    color: colors.onSurface,
    fontFamily: fonts.body,
  },
  matchScore: {
    fontSize: '0.875rem',
    fontWeight: 700,
    fontFamily: 'monospace',
    color: colors.onSurface,
  },
  matchScoreMuted: {
    color: colors.outline,
    fontStyle: 'italic',
  },
  matchFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: '0.5rem',
    borderTop: `1px solid ${colors.outlineVariant}1a`,
  },
  matchStatusFinal: {
    fontSize: '0.625rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    color: colors.tertiary,
    fontFamily: fonts.label,
  },
  matchStatusLive: {
    fontSize: '0.625rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    color: colors.tertiary,
    fontFamily: fonts.label,
    animation: 'pulse 1.5s ease-in-out infinite',
  },
  matchStatusScheduled: {
    fontSize: '0.625rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    color: colors.outline,
    fontFamily: fonts.label,
  },
  matchMeta: {
    fontSize: '0.625rem',
    color: colors.outline,
    fontFamily: fonts.label,
  },
  addMatchCard: {
    backgroundColor: colors.surfaceContainerLowest,
    border: `1px dashed ${colors.outlineVariant}66`,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '8rem',
    cursor: 'pointer',
    gap: '0.5rem',
  },
  addMatchLabel: {
    fontSize: '0.625rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    color: colors.outlineVariant,
    fontFamily: fonts.label,
  },

  // Footer
  footer: {
    position: 'fixed',
    bottom: 0,
    left: '16rem',
    right: 0,
    padding: '1rem 1.5rem',
    backgroundColor: `${colors.surface}e6`,
    backdropFilter: 'blur(4px)',
    borderTop: `1px solid ${colors.outlineVariant}33`,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 30,
  },
  footerOutlineBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.625rem 1.25rem',
    backgroundColor: colors.surfaceContainerLowest,
    border: `1px solid ${colors.outlineVariant}`,
    borderRadius: radius.DEFAULT,
    fontSize: '0.875rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '-0.02em',
    color: colors.onSurface,
    cursor: 'pointer',
    fontFamily: fonts.label,
  },
  footerGhostBtn: {
    padding: '0.5rem 1rem',
    background: 'none',
    border: 'none',
    fontSize: '0.875rem',
    fontWeight: 500,
    color: colors.onSurfaceVariant,
    cursor: 'pointer',
    fontFamily: fonts.label,
  },
  footerDiscardBtn: {
    padding: '0.625rem 1.5rem',
    backgroundColor: colors.surfaceContainerLow,
    border: `1px solid ${colors.outlineVariant}`,
    borderRadius: radius.DEFAULT,
    fontSize: '0.875rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '-0.02em',
    color: colors.onSurface,
    cursor: 'pointer',
    fontFamily: fonts.label,
  },
  footerFinishBtn: {
    padding: '0.625rem 2rem',
    backgroundColor: colors.tertiary,
    border: 'none',
    borderRadius: radius.DEFAULT,
    fontSize: '0.875rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '-0.02em',
    color: colors.onTertiary,
    cursor: 'pointer',
    fontFamily: fonts.label,
  },
}
