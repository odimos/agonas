import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { colors, fonts, radius } from './styles'
import { useLang } from './LangContext'

const MOCK_PHASES = {
  '1-1': {
    name: 'Phase One', number: '01', status: 'Active',
    teams: [
      { id: 'TA-01', name: 'Team Alpha',   leaguePoints: 1420, status: 'normal' },
      { id: 'TB-02', name: 'Team Bravo',   leaguePoints: 1385, status: 'selected' },
      { id: 'TC-03', name: 'Team Charlie', leaguePoints: 890,  status: 'eliminated' },
      { id: 'TD-04', name: 'Team Delta',   leaguePoints: 1210, status: 'normal' },
      { id: 'TE-05', name: 'Team Echo',    leaguePoints: 1050, status: 'normal' },
      { id: 'TF-06', name: 'Team Foxtrot', leaguePoints: 970,  status: 'eliminated' },
      { id: 'TG-07', name: 'Team Golf',    leaguePoints: 1300, status: 'normal' },
      { id: 'TH-08', name: 'Team Hotel',   leaguePoints: 1140, status: 'normal' },
    ],
    matches: [
      { teamA: 'Team Alpha',   teamB: 'Team Bravo',   scoreA: 2, scoreB: 1, status: 'Final',     datetime: 'Mar 12, 18:00' },
      { teamA: 'Team Charlie', teamB: 'Team Delta',   scoreA: 0, scoreB: 3, status: 'Final',     datetime: 'Mar 12, 20:30' },
      { teamA: 'Team Echo',    teamB: 'Team Foxtrot', scoreA: 1, scoreB: 1, status: 'Final',     datetime: 'Mar 13, 17:00' },
      { teamA: 'Team Golf',    teamB: 'Team Hotel',   scoreA: 4, scoreB: 2, status: 'Final',     datetime: 'Mar 13, 19:30' },
      { teamA: 'Team Bravo',   teamB: 'Team Delta',   scoreA: null, scoreB: null, status: 'Scheduled', datetime: 'Mar 15, 18:00' },
      { teamA: 'Team Alpha',   teamB: 'Team Golf',    scoreA: null, scoreB: null, status: 'Scheduled', datetime: 'Mar 15, 20:00' },
      { teamA: 'Team Echo',    teamB: 'Team Hotel',   scoreA: null, scoreB: null, status: 'Scheduled', datetime: 'Mar 16, 17:30' },
      { teamA: 'Team Charlie', teamB: 'Team Foxtrot', scoreA: null, scoreB: null, status: 'Scheduled', datetime: 'Mar 16, 19:00' },
      { teamA: 'Team Alpha',   teamB: 'Team Echo',    scoreA: null, scoreB: null, status: 'Scheduled', datetime: 'Mar 17, 17:00' },
      { teamA: 'Team Delta',   teamB: 'Team Hotel',   scoreA: null, scoreB: null, status: 'Scheduled', datetime: 'Mar 17, 19:00' },
      { teamA: 'Team Bravo',   teamB: 'Team Foxtrot', scoreA: null, scoreB: null, status: 'Scheduled', datetime: 'Mar 18, 18:00' },
      { teamA: 'Team Golf',    teamB: 'Team Charlie', scoreA: null, scoreB: null, status: 'Scheduled', datetime: 'Mar 18, 20:00' },
      { teamA: 'Team Alpha',   teamB: 'Team Hotel',   scoreA: null, scoreB: null, status: 'Scheduled', datetime: 'Mar 19, 18:00' },
    ],
  },
  '1-2': {
    name: 'Phase Two', number: '02', status: 'Active',
    teams: [
      { id: 'TA-01', name: 'Team Alpha', leaguePoints: 1520, status: 'selected' },
      { id: 'TB-02', name: 'Team Bravo', leaguePoints: 1385, status: 'normal' },
      { id: 'TD-04', name: 'Team Delta', leaguePoints: 1310, status: 'normal' },
      { id: 'TG-07', name: 'Team Golf',  leaguePoints: 1280, status: 'normal' },
      { id: 'TH-08', name: 'Team Hotel', leaguePoints: 1140, status: 'eliminated' },
    ],
    matches: [
      { teamA: 'Team Alpha', teamB: 'Team Delta', scoreA: 3, scoreB: 0, status: 'Final',     datetime: 'Apr 02, 17:00' },
      { teamA: 'Team Bravo', teamB: 'Team Golf',  scoreA: 2, scoreB: 2, status: 'Final',     datetime: 'Apr 02, 19:30' },
      { teamA: 'Team Alpha', teamB: 'Team Bravo', scoreA: null, scoreB: null, status: 'Scheduled', datetime: 'Apr 05, 17:00' },
      { teamA: 'Team Delta', teamB: 'Team Golf',  scoreA: null, scoreB: null, status: 'Scheduled', datetime: 'Apr 05, 19:30' },
      { teamA: 'Team Hotel', teamB: 'Team Bravo', scoreA: null, scoreB: null, status: 'Scheduled', datetime: 'Apr 06, 18:00' },
    ],
  },
  '1-3': {
    name: 'Phase Three', number: '03', status: 'Inactive',
    teams: [
      { id: 'TA-01', name: 'Team Alpha', leaguePoints: 1620, status: 'normal' },
      { id: 'TB-02', name: 'Team Bravo', leaguePoints: 1490, status: 'normal' },
      { id: 'TG-07', name: 'Team Golf',  leaguePoints: 1350, status: 'normal' },
    ],
    matches: [
      { teamA: 'Team Alpha', teamB: 'Team Bravo', scoreA: null, scoreB: null, status: 'Scheduled', datetime: 'May 10, 18:00' },
      { teamA: 'Team Alpha', teamB: 'Team Golf',  scoreA: null, scoreB: null, status: 'Scheduled', datetime: 'May 10, 20:00' },
      { teamA: 'Team Bravo', teamB: 'Team Golf',  scoreA: null, scoreB: null, status: 'Scheduled', datetime: 'May 11, 18:00' },
    ],
  },
  '1-4': {
    name: 'Phase Four', number: '04', status: 'Inactive',
    teams: [
      { id: 'TA-01', name: 'Team Alpha', leaguePoints: 1620, status: 'normal' },
      { id: 'TB-02', name: 'Team Bravo', leaguePoints: 1490, status: 'normal' },
    ],
    matches: [
      { teamA: 'Team Alpha', teamB: 'Team Bravo', scoreA: null, scoreB: null, status: 'Scheduled', datetime: 'Jun 01, 18:00' },
    ],
  },
  '2-1': {
    name: 'Phase One', number: '01', status: 'Active',
    teams: [
      { id: 'TI-01', name: 'Team India',   leaguePoints: 980,  status: 'normal' },
      { id: 'TJ-02', name: 'Team Juliet',  leaguePoints: 1100, status: 'selected' },
      { id: 'TK-03', name: 'Team Kilo',    leaguePoints: 870,  status: 'eliminated' },
      { id: 'TL-04', name: 'Team Lima',    leaguePoints: 1050, status: 'normal' },
      { id: 'TM-05', name: 'Team Mike',    leaguePoints: 1190, status: 'normal' },
      { id: 'TN-06', name: 'Team November',leaguePoints: 930,  status: 'eliminated' },
    ],
    matches: [
      { teamA: 'Team India',   teamB: 'Team Juliet',  scoreA: 1, scoreB: 2, status: 'Final',     datetime: 'Mar 20, 18:00' },
      { teamA: 'Team Kilo',    teamB: 'Team Lima',    scoreA: 0, scoreB: 1, status: 'Final',     datetime: 'Mar 20, 20:00' },
      { teamA: 'Team Mike',    teamB: 'Team November',scoreA: 3, scoreB: 1, status: 'Final',     datetime: 'Mar 21, 18:00' },
      { teamA: 'Team Juliet',  teamB: 'Team Lima',    scoreA: null, scoreB: null, status: 'Scheduled', datetime: 'Mar 23, 17:00' },
      { teamA: 'Team India',   teamB: 'Team Mike',    scoreA: null, scoreB: null, status: 'Scheduled', datetime: 'Mar 23, 19:30' },
    ],
  },
  '2-2': {
    name: 'Phase Two', number: '02', status: 'Inactive',
    teams: [
      { id: 'TJ-02', name: 'Team Juliet', leaguePoints: 1200, status: 'normal' },
      { id: 'TL-04', name: 'Team Lima',   leaguePoints: 1080, status: 'normal' },
      { id: 'TM-05', name: 'Team Mike',   leaguePoints: 1190, status: 'normal' },
    ],
    matches: [
      { teamA: 'Team Juliet', teamB: 'Team Lima', scoreA: null, scoreB: null, status: 'Scheduled', datetime: 'Apr 15, 18:00' },
      { teamA: 'Team Juliet', teamB: 'Team Mike', scoreA: null, scoreB: null, status: 'Scheduled', datetime: 'Apr 15, 20:00' },
    ],
  },
}

function TeamCard({ team, isSelected, onSelect, t }) {
  const isEliminated = team.status === 'eliminated'

  const cardStyle = {
    ...st.teamCard,
    ...(isSelected   ? st.teamCardSelected   : {}),
    ...(isEliminated ? st.teamCardEliminated : {}),
  }

  return (
    <div style={cardStyle} onClick={() => !isEliminated && onSelect(team.id)}>
      <div style={st.teamCardTop}>
        <div style={{ ...st.teamIcon, ...(isSelected ? st.teamIconSelected : {}) }}>
          <span className="material-symbols-outlined" style={{ color: isEliminated ? colors.outline : isSelected ? colors.tertiary : colors.outline }}>
            {isEliminated ? 'close' : 'shield'}
          </span>
        </div>
        {isSelected ? (
          <button style={st.deleteBtn} onClick={e => e.stopPropagation()}>
            <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>delete</span>
            <span style={{ fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase' }}>{t('ph_delete')}</span>
          </button>
        ) : (
          <span style={st.teamId}>{isEliminated ? t('ph_eliminated') : `ID: ${team.id}`}</span>
        )}
      </div>
      <h4 style={st.teamName}>{team.name}</h4>
      <p style={st.teamPoints}>{t('ph_points')} {team.leaguePoints.toLocaleString()}</p>
    </div>
  )
}

function MatchCard({ match, t }) {
  const isFinal     = match.status === 'Final'
  const isScheduled = match.status === 'Scheduled'

  return (
    <div style={{ ...st.matchCard, ...(isScheduled ? st.matchCardScheduled : {}) }}>
      <div style={st.matchTeams}>
        <div style={st.matchRow}>
          <span style={st.matchTeamName}>{match.teamA}</span>
          <span style={{ ...st.matchScore, ...(isScheduled ? st.matchScoreMuted : {}) }}>
            {isFinal ? match.scoreA : '--'}
          </span>
        </div>
        <div style={st.matchRow}>
          <span style={st.matchTeamName}>{match.teamB}</span>
          <span style={{ ...st.matchScore, ...(isScheduled ? st.matchScoreMuted : {}) }}>
            {isFinal ? match.scoreB : '--'}
          </span>
        </div>
      </div>
      <div style={st.matchFooter}>
        {isFinal     && <span style={st.matchStatusFinal}>{t('ph_final')}</span>}
        {isScheduled && <span style={st.matchStatusScheduled}>{t('ph_scheduled')}</span>}
        <span style={st.matchMeta}>{match.datetime}</span>
      </div>
    </div>
  )
}

export default function Phase() {
  const { id, phaseId } = useParams()
  const { t } = useLang()
  const key   = `${id}-${phaseId}`
  const phase = MOCK_PHASES[key] ?? MOCK_PHASES['1-1']
  const [teamSearch, setTeamSearch] = useState('')
  const [selectedTeamId, setSelectedTeamId] = useState(
    () => phase.teams.find(t => t.status === 'selected')?.id ?? null
  )

  function handleSelectTeam(teamId) {
    setSelectedTeamId(prev => prev === teamId ? null : teamId)
  }

  const filteredTeams = phase.teams.filter(t =>
    t.name.toLowerCase().includes(teamSearch.toLowerCase())
  )

  return (
    <div style={st.page}>
      {/* Header */}
      <div style={st.header}>
        <div>
          <span style={st.headerLabel}>{t('ph_label')}</span>
          <h1 style={st.title}>{t('phase_label')} {phase.number}</h1>
        </div>
        <div style={st.headerRight}>
          <button style={st.statusBadge}>
            <span style={{ ...st.statusDot, backgroundColor: phase.status === 'Active' ? colors.tertiary : colors.outline }} />
            {t('ph_status')}: {t(phase.status === 'Active' ? 'ph_status_active' : 'ph_status_inactive')}
            <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>expand_more</span>
          </button>
        </div>
      </div>

      {/* Teams */}
      <section style={st.section}>
        <div style={st.sectionHeader}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <h3 style={st.sectionTitle}>{t('ph_qual_teams')}</h3>
            <span style={st.sectionCount}>{phase.teams.length} {t('ph_participating')}</span>
          </div>
          <button style={st.addTeamBtn}>
            <span className="material-symbols-outlined" style={{ fontSize: '0.875rem' }}>add</span>
            {t('ph_add_team')}
          </button>
        </div>
        <div style={st.teamsSearchWrap}>
          <span className="material-symbols-outlined" style={st.teamsSearchIcon}>search</span>
          <input
            style={st.teamsSearchInput}
            placeholder={t('ph_search')}
            value={teamSearch}
            onChange={e => setTeamSearch(e.target.value)}
          />
        </div>
        <style>{`.teams-row::-webkit-scrollbar{height:8px}.teams-row::-webkit-scrollbar-track{background:${colors.surfaceContainerLow};border-radius:4px}.teams-row::-webkit-scrollbar-thumb{background:${colors.outlineVariant};border-radius:4px}`}</style>
        <div className="teams-row" style={st.teamsRow}>
          {filteredTeams.map(team => (
            <TeamCard
              key={team.id}
              team={team}
              isSelected={selectedTeamId === team.id}
              onSelect={handleSelectTeam}
              t={t}
            />
          ))}
        </div>
      </section>

      {/* Matches */}
      <section style={st.section}>
        <div style={st.sectionHeader}>
          <h3 style={st.sectionTitle}>{t('ph_matches')}</h3>
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
          {phase.matches.map((match, i) => <MatchCard key={i} match={match} t={t} />)}
        </div>
      </section>

      {/* Footer spacer so content isn't hidden behind fixed bar */}
      <div style={{ height: '5rem' }} />

      {/* Fixed footer */}
      <div style={st.footer}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button style={st.footerOutlineBtn}>
            {t('ph_gen_program')}
            <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>expand_more</span>
          </button>
          <button style={st.footerGhostBtn}>{t('ph_preview')}</button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button style={st.footerFinishBtn}>{t('ph_finish')}</button>
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
  teamsSearchWrap: {
    position: 'relative',
    maxWidth: '320px',
  },
  teamsSearchIcon: {
    position: 'absolute',
    left: '0.75rem',
    top: '50%',
    transform: 'translateY(-50%)',
    fontSize: '0.9375rem',
    color: colors.outline,
  },
  teamsSearchInput: {
    width: '100%',
    padding: '0.5rem 0.75rem 0.5rem 2.375rem',
    backgroundColor: colors.surfaceContainerLowest,
    border: `1px solid ${colors.outlineVariant}33`,
    borderRadius: radius.DEFAULT,
    fontSize: '0.875rem',
    color: colors.onSurface,
    fontFamily: fonts.body,
    outline: 'none',
    boxSizing: 'border-box',
  },
  teamsRow: {
    display: 'flex',
    gap: '1rem',
    overflowX: 'auto',
    paddingBottom: '0.5rem',
    scrollbarWidth: 'auto',
  },
  teamCard: {
    minWidth: '180px',
    backgroundColor: colors.surfaceContainerLowest,
    padding: '0.75rem 1rem',
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
  teamCardTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '0.5rem',
  },
  addTeamBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
    padding: '0.375rem 0.75rem',
    backgroundColor: colors.surfaceContainerLowest,
    border: `1px solid ${colors.outlineVariant}`,
    borderRadius: radius.DEFAULT,
    fontSize: '0.75rem',
    fontWeight: 600,
    color: colors.onSurface,
    cursor: 'pointer',
    fontFamily: fonts.label,
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
    gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
    gap: '0.5rem',
  },
  matchCard: {
    backgroundColor: colors.surfaceContainerLowest,
    padding: '0.625rem 0.875rem',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    height: '5.5rem',
  },
  matchCardScheduled: {
    opacity: 0.4,
  },
  matchTeams: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
  },
  matchRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  matchTeamName: {
    fontSize: '0.75rem',
    fontWeight: 600,
    color: colors.onSurface,
    fontFamily: fonts.body,
  },
  matchScore: {
    fontSize: '0.75rem',
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
