import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { colors, fonts, radius } from './styles'
import { useLang } from './LangContext'
import { fetchPhase, fetchPhases, createPhase, updatePhase } from './api/phases'
import { fetchMatches, updateMatch } from './api/matches'
import { fetchTeams } from './api/teams'
import { fetchReferees } from './api/referees'

const BASE = import.meta.env.VITE_API_URL

const DAY_NAMES = ['Δευτ', 'Τρίτ', 'Τετ', 'Πέμπ', 'Παρ', 'Σαββ', 'Κυρ']

function ScheduleModal({ phaseId, teams, referees, tournamentType, onClose, onApplied }) {
  const today = new Date().toISOString().slice(0, 10)
  const oneWeek = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10)

  const [startDate,   setStartDate]   = useState(today)
  const [endDate,     setEndDate]     = useState(oneWeek)
  const [fromScratch, setFromScratch] = useState(true)
  const mode = tournamentType === 'knockout' ? 'knockout' : 'league'
  const [loading,   setLoading]   = useState(false)
  const [applying,  setApplying]  = useState(false)
  const [preview,   setPreview]   = useState(null)
  const [error,     setError]     = useState('')

  async function handleGenerate() {
    setLoading(true); setError(''); setPreview(null)
    try {
      const res = await fetch(`${BASE}/schedule/generate?phase_id=${phaseId}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ start_date: startDate, end_date: endDate, mode, from_scratch: fromScratch }),
      })
      if (!res.ok) { setError('Σφάλμα κατά τη δημιουργία προγράμματος.'); return }
      setPreview(await res.json())
    } catch { setError('Σφάλμα σύνδεσης.') }
    finally { setLoading(false) }
  }

  async function handleApply() {
    if (!preview) return
    setApplying(true)
    try {
      const res = await fetch(`${BASE}/schedule/apply?phase_id=${phaseId}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ suggestions: preview.suggestions }),
      })
      if (!res.ok) { setError('Σφάλμα κατά την εφαρμογή.'); return }
      onApplied(); onClose()
    } catch { setError('Σφάλμα σύνδεσης.') }
    finally { setApplying(false) }
  }

  function teamName(id) { return id ? (teams.find(t => t.id === id)?.name ?? `#${id}`) : 'BYE' }
  function refName(id) {
    if (!id) return null
    const r = referees.find(r => r.id === id)
    return r ? `${r.first_name} ${r.last_name}` : `#${id}`
  }

  function formatDt(iso) {
    const d = new Date(iso)
    const dow = (d.getDay() + 6) % 7
    return `${DAY_NAMES[dow]} ${d.toLocaleDateString('el-GR', { day:'2-digit', month:'2-digit' })} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`
  }

  function scoreBadge(score, isBye) {
    if (isBye) return <span style={{ fontSize:'0.625rem', fontWeight:700, color:'#9e9e9e', fontFamily:fonts.label }}>BYE</span>
    const max = 9
    const pct = Math.round((score / max) * 100)
    const color = score >= 7 ? '#4caf50' : score >= 4 ? '#ff9800' : score >= 1 ? '#ffc107' : '#9e9e9e'
    return <span style={{ fontSize:'0.625rem', fontWeight:700, color, fontFamily:fonts.label }}>{pct}%</span>
  }

  const totalScheduled = preview ? preview.suggestions.length : 0
  const totalUnscheduled = preview ? preview.unscheduled.length : 0

  return (
    <div style={sm.overlay} onClick={onClose}>
      <div style={sm.modal} onClick={e => e.stopPropagation()}>
        <div style={sm.header}>
          <h2 style={sm.title}>Δημιουργία Προγράμματος</h2>
          <button style={sm.closeBtn} onClick={onClose}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div style={sm.body}>
          {/* From scratch / keep matches toggle */}
          <div style={{ display:'flex', gap:'0.5rem' }}>
            {[
              { value: true,  label: 'Από την αρχή' },
              { value: false, label: 'Διατήρηση αγώνων' },
            ].map(opt => (
              <button
                key={String(opt.value)}
                style={{
                  ...sm.toggleBtn,
                  ...(fromScratch === opt.value ? sm.toggleBtnActive : {}),
                }}
                onClick={() => { setFromScratch(opt.value); setPreview(null) }}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Date range */}
          <div style={{ display:'flex', gap:'0.75rem', alignItems:'flex-end', flexWrap:'wrap' }}>
            <div style={sm.field}>
              <label style={sm.label}>Από</label>
              <input type="date" style={sm.input} value={startDate} onChange={e => setStartDate(e.target.value)} />
            </div>
            <div style={sm.field}>
              <label style={sm.label}>Έως</label>
              <input type="date" style={sm.input} value={endDate} onChange={e => setEndDate(e.target.value)} />
            </div>
            <button style={sm.generateBtn} onClick={handleGenerate} disabled={loading}>
              {loading ? '...' : 'Δημιουργία'}
            </button>
          </div>

          <p style={{ margin:0, fontSize:'0.75rem', color:colors.onSurfaceVariant }}>
            Λειτουργία: <strong>{mode === 'knockout' ? 'Knockout — κάθε ομάδα παίζει έναν αγώνα' : 'League — round-robin'}</strong>
            {mode === 'knockout' && ', BYE για μονό αριθμό ομάδων'}
          </p>

          {error && <p style={{ color: colors.error, fontSize:'0.875rem', margin:0 }}>{error}</p>}

          {/* Preview */}
          {preview && (
            <div style={{ display:'flex', flexDirection:'column', gap:'0.75rem' }}>
              <p style={{ margin:0, fontSize:'0.8125rem', color:colors.onSurfaceVariant }}>
                {totalScheduled} αγώνες προγραμματίστηκαν
                {totalUnscheduled > 0 && ` · ${totalUnscheduled} δεν βρέθηκε θέση`}
              </p>

              <div style={{ display:'flex', flexDirection:'column', gap:'0.375rem', maxHeight:'16rem', overflowY:'auto' }}>
                {preview.suggestions.map((s, i) => (
                  <div key={i} style={{ ...sm.row, ...(s.is_bye ? { opacity: 0.7 } : {}) }}>
                    <div style={{ flex:1, minWidth:0 }}>
                      <span style={sm.matchLabel}>
                        {teamName(s.home_team_id)} vs {teamName(s.away_team_id)}
                        {s.is_bye && <span style={{ fontSize:'0.625rem', color:'#9e9e9e', marginLeft:'0.375rem' }}>(BYE)</span>}
                      </span>
                      <span style={sm.slotLabel}>
                        {formatDt(s.scheduled_at)} · {s.stadium_name}
                        {refName(s.referee_id) && ` · ${refName(s.referee_id)}`}
                      </span>
                    </div>
                    {scoreBadge(s.score, s.is_bye)}
                  </div>
                ))}
              </div>

              {preview.unscheduled.length > 0 && (
                <div style={{ padding:'0.5rem 0.75rem', backgroundColor:`${colors.error}0d`, borderRadius:radius.DEFAULT, border:`1px solid ${colors.error}33` }}>
                  <p style={{ margin:0, fontSize:'0.8125rem', color:colors.error, fontWeight:600 }}>
                    Δεν βρέθηκε θέση για {preview.unscheduled.length} αγώνα(ες). Προσθέστε περισσότερες διαθεσιμότητες γηπέδων.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        <div style={sm.footer}>
          <button style={sm.cancelBtn} onClick={onClose}>Ακύρωση</button>
          {preview && preview.suggestions.length > 0 && (
            <button style={sm.applyBtn} onClick={handleApply} disabled={applying}>
              {applying ? '...' : `Εφαρμογή (${preview.suggestions.length} αγώνες)`}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function TeamCard({ team, isSelected, isOpen, onSelect, onDelete, t }) {
  return (
    <div style={{ ...st.teamCard, ...(isSelected ? st.teamCardSelected : {}) }} onClick={() => isOpen && onSelect(team.id)}>
      <div style={st.teamCardTop}>
        <div style={{ ...st.teamIcon, ...(isSelected ? st.teamIconSelected : {}) }}>
          {team.photo_url
            ? <img src={team.photo_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : <span className="material-symbols-outlined" style={{ color: isSelected ? colors.tertiary : colors.outline }}>shield</span>
          }
        </div>
        {isOpen && isSelected ? (
          <button style={st.deleteBtn} onClick={e => { e.stopPropagation(); onDelete(team.id) }}>
            <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>delete</span>
            <span style={{ fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase' }}>{t('ph_delete')}</span>
          </button>
        ) : (
          <span style={st.teamId}>ID: {team.id}</span>
        )}
      </div>
      <h4 style={st.teamName}>{team.name}</h4>
    </div>
  )
}

function MatchCard({ match, teams, t }) {
  const isFinal  = match.status === 'finished'
  const isPending = match.status !== 'finished'
  const homeTeam = teams.find(t => t.id === match.home_team_id)
  const awayTeam = teams.find(t => t.id === match.away_team_id)
  const datetime = match.scheduled_at
    ? new Date(match.scheduled_at).toLocaleString('el-GR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    : '—'

  return (
    <div style={st.matchCard}>
      {/* Teams + scores */}
      <div style={st.matchTeams}>
        <div style={st.matchRow}>
          <span style={st.matchTeamName}>{homeTeam?.name ?? '—'}</span>
          <span style={{ ...st.matchScore, ...(isPending ? st.matchScoreMuted : {}) }}>
            {isFinal ? match.home_score : '--'}
          </span>
        </div>
        <div style={st.matchRow}>
          <span style={st.matchTeamName}>{awayTeam?.name ?? '—'}</span>
          <span style={{ ...st.matchScore, ...(isPending ? st.matchScoreMuted : {}) }}>
            {isFinal ? match.away_score : '--'}
          </span>
        </div>
      </div>
      {isFinal && match.penalty_winner_id && (
        <div style={{ fontSize: '0.6875rem', fontWeight: 600, color: colors.tertiary, padding: '0.25rem 0', textAlign: 'center' }}>
          πεν. {teams.find(tm => tm.id === match.penalty_winner_id)?.name ?? '—'}
        </div>
      )}
      <div style={st.matchFooter}>
        {isFinal  && <span style={st.matchStatusFinal}>{t('ph_final')}</span>}
        {isPending && <span style={st.matchStatusScheduled}>{t('ph_scheduled')}</span>}
        <span style={st.matchMeta}>{datetime}</span>
      </div>
    </div>
  )
}

export default function Phase() {
  const { id: tournamentId, phaseId } = useParams()
  const { t } = useLang()
  const navigate = useNavigate()

  const [phase,          setPhase]          = useState(null)
  const [tournament,     setTournament]     = useState(null)
  const [teams,          setTeams]          = useState([])
  const [referees,       setReferees]       = useState([])
  const [matches,        setMatches]        = useState([])
  const [teamSearch,     setTeamSearch]     = useState('')
  const [selectedTeamId, setSelectedTeamId] = useState(null)
  const [completing,     setCompleting]     = useState(false)
  const [notPlayedModal, setNotPlayedModal] = useState(null)
  const [addingTeam,     setAddingTeam]     = useState(false)
  const [teamPickSearch, setTeamPickSearch] = useState('')
  const [showSchedule,   setShowSchedule]   = useState(false)

  useEffect(() => {
    fetchPhase(phaseId).then(p => {
      setPhase(p)
      // fetch tournament for its type
      fetch(`${BASE}/tournaments/${p.tournament_id}`).then(r=>r.json()).then(setTournament).catch(() => {})
    }).catch(() => {})
    fetchMatches({ phaseId }).then(ms => setMatches(ms.filter(m => m.status === 'expected' || m.status === 'finished'))).catch(() => {})
    fetchTeams().then(setTeams).catch(() => {})
    fetchReferees().then(setReferees).catch(() => {})
  }, [phaseId])

  function handleSelectTeam(teamId) {
    setSelectedTeamId(prev => prev === teamId ? null : teamId)
  }

  async function handleAddTeam(teamId) {
    const newTeamIds = [...phase.team_ids, teamId]
    const updated = await updatePhase(phase.id, { order: phase.order, is_open: phase.is_open, team_ids: newTeamIds })
    setPhase(updated)
    setAddingTeam(false)
    setTeamPickSearch('')
  }

  async function handleDeleteTeam(teamId) {
    const newTeamIds = phase.team_ids.filter(id => id !== teamId)
    const updated = await updatePhase(phase.id, { order: phase.order, is_open: phase.is_open, team_ids: newTeamIds })
    setPhase(updated)
    setSelectedTeamId(null)
  }

  async function handleCompletePhase() {
    if (!phase) return
    setCompleting(true)
    try {
      // fetch all finished matches in this phase
      const allMatches = await fetchMatches({ phaseId })
      const finishedMatches = allMatches.filter(m => m.status === 'finished')

      // teams that have played = appeared in at least one finished match
      const playedTeamIds = new Set()
      for (const m of finishedMatches) {
        if (m.home_team_id) playedTeamIds.add(m.home_team_id)
        if (m.away_team_id) playedTeamIds.add(m.away_team_id)
      }

      const phaseTeamIds = phase.team_ids
      const notPlayed = phaseTeamIds.filter(id => !playedTeamIds.has(id))

      if (notPlayed.length > 0) {
        setNotPlayedModal(notPlayed)
        return
      }

      // Determine winners from finished matches, but only teams still in the phase
      const currentTeamIds = new Set(phase.team_ids)
      const winnerIds = new Set()
      for (const m of finishedMatches) {
        const isBye = !m.home_team_id || !m.away_team_id
        if (isBye) {
          // bye: the one team advances only if still in the phase
          if (m.home_team_id && currentTeamIds.has(m.home_team_id)) winnerIds.add(m.home_team_id)
          if (m.away_team_id && currentTeamIds.has(m.away_team_id)) winnerIds.add(m.away_team_id)
        } else {
          if (m.home_score > m.away_score && currentTeamIds.has(m.home_team_id)) winnerIds.add(m.home_team_id)
          else if (m.away_score > m.home_score && currentTeamIds.has(m.away_team_id)) winnerIds.add(m.away_team_id)
          else {
            // draw: both advance if still in the phase
            if (currentTeamIds.has(m.home_team_id)) winnerIds.add(m.home_team_id)
            if (currentTeamIds.has(m.away_team_id)) winnerIds.add(m.away_team_id)
          }
        }
      }

      // Close this phase
      await updatePhase(phase.id, { order: phase.order, is_open: false, team_ids: phase.team_ids })
      setPhase(p => ({ ...p, is_open: false }))

      // Create next phase with winners
      const existing = await fetchPhases(tournamentId)
      const nextOrder = Math.max(...existing.map(p => p.order)) + 1
      const newPhase = await createPhase(tournamentId, nextOrder)
      // Set winners as teams of new phase and open it
      await updatePhase(newPhase.id, { order: nextOrder, is_open: true, team_ids: [...winnerIds] })

      navigate(`/tournaments/${tournamentId}/phases/${newPhase.id}`)
    } catch (e) {
      console.error(e)
    } finally {
      setCompleting(false)
    }
  }

  if (!phase) return null

  const phaseTeams    = teams.filter(t => phase.team_ids.includes(t.id))
  const filteredTeams = phaseTeams.filter(t =>
    t.name.toLowerCase().includes(teamSearch.toLowerCase())
  )

  const isFinish = phase.team_ids.length === 1
  if (isFinish) {
    const winner = phaseTeams[0]
    return (
      <div style={st.page}>
        <div style={st.header}>
          <div>
            <span style={st.headerLabel}>{t('finish_label')}</span>
            <h1 style={st.title}>{t('finish_label')}</h1>
          </div>
        </div>
        <section style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', padding: '3rem 1rem' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '5rem', color: colors.tertiary }}>emoji_events</span>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.18em', color: colors.onSurfaceVariant, fontFamily: fonts.label }}>
            {t('winner_label')}
          </span>
          {winner ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              {winner.photo_url && <img src={winner.photo_url} alt="" style={{ width: '4rem', height: '4rem', borderRadius: radius.DEFAULT, objectFit: 'cover' }} />}
              <h2 style={{ fontSize: '2rem', fontWeight: 800, color: colors.onSurface, margin: 0, fontFamily: fonts.headline }}>{winner.name}</h2>
            </div>
          ) : (
            <p style={{ color: colors.outline }}>—</p>
          )}
        </section>
      </div>
    )
  }

  return (
    <div style={st.page}>

      {/* Not-played warning modal */}
      {notPlayedModal && (
        <div style={ms.overlay} onClick={() => setNotPlayedModal(null)}>
          <div style={ms.modal} onClick={e => e.stopPropagation()}>
            <div style={ms.header}>
              <span className="material-symbols-outlined" style={{ color: colors.error, fontSize: '1.5rem' }}>warning</span>
              <h3 style={ms.title}>Δεν μπορεί να ολοκληρωθεί η φάση</h3>
            </div>
            <p style={ms.body}>Οι παρακάτω ομάδες δεν έχουν παίξει αγώνα σε αυτή τη φάση:</p>
            <ul style={ms.list}>
              {notPlayedModal.map(id => {
                const team = teams.find(t => t.id === id)
                return <li key={id} style={ms.listItem}>{team?.name ?? `ID ${id}`}</li>
              })}
            </ul>
            <button style={ms.closeBtn} onClick={() => setNotPlayedModal(null)}>Κλείσιμο</button>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={st.header}>
        <div>
          <span style={st.headerLabel}>{t('ph_label')}</span>
          <h1 style={st.title}>{t('phase_label')} {phase.order}</h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ ...st.statusDot, backgroundColor: phase.is_open ? colors.tertiary : colors.outline }} />
          <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: phase.is_open ? colors.tertiary : colors.outline }}>
            {phase.is_open ? 'Ανοιχτή' : 'Κλειστή'}
          </span>
        </div>
      </div>

      {/* Teams */}
      <section style={st.section}>
        <div style={st.sectionHeader}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <h3 style={st.sectionTitle}>{t('ph_qual_teams')}</h3>
            <span style={st.sectionCount}>{phaseTeams.length} {t('ph_participating')}</span>
          </div>
          {phase.is_open && (
            <div style={{ position: 'relative' }}>
              <button style={st.addTeamBtn} onClick={() => { setAddingTeam(v => !v); setTeamPickSearch('') }}>
                <span className="material-symbols-outlined" style={{ fontSize: '0.875rem' }}>add</span>
                {t('ph_add_team')}
              </button>
              {addingTeam && (
                <div style={st.teamPicker}>
                  <input
                    autoFocus
                    style={st.teamPickerInput}
                    placeholder="Αναζήτηση..."
                    value={teamPickSearch}
                    onChange={e => setTeamPickSearch(e.target.value)}
                  />
                  <div style={st.teamPickerList}>
                    {teams
                      .filter(t => !phase.team_ids.includes(t.id) && t.name.toLowerCase().includes(teamPickSearch.toLowerCase()))
                      .map(t => (
                        <button key={t.id} style={st.teamPickerItem} onClick={() => handleAddTeam(t.id)}>
                          {t.name}
                        </button>
                      ))
                    }
                    {teams.filter(t => !phase.team_ids.includes(t.id)).length === 0 && (
                      <span style={{ fontSize: '0.8125rem', color: colors.outline, padding: '0.5rem 0.75rem', display: 'block' }}>
                        Δεν υπάρχουν διαθέσιμες ομάδες.
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
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
              isOpen={phase.is_open}
              onSelect={handleSelectTeam}
              onDelete={handleDeleteTeam}
              t={t}
            />
          ))}
        </div>
      </section>

      {/* Matches */}
      <section style={st.section}>
        <div style={st.sectionHeader}>
          <h3 style={st.sectionTitle}>{t('ph_matches')}</h3>
        </div>
        <div style={st.matchGrid}>
          {matches.map(match => <MatchCard key={match.id} match={match} teams={teams} t={t} />)}
        </div>
      </section>

      {/* Footer spacer so content isn't hidden behind fixed bar */}
      <div style={{ height: '5rem' }} />

      {/* Schedule modal */}
      {showSchedule && (
        <ScheduleModal
          phaseId={phaseId}
          teams={teams}
          referees={referees}
          tournamentType={tournament?.type ?? 'league'}
          onClose={() => setShowSchedule(false)}
          onApplied={() => {
            fetchMatches({ phaseId }).then(ms => setMatches(ms.filter(m => m.status === 'expected' || m.status === 'finished'))).catch(() => {})
          }}
        />
      )}

      {/* Fixed footer */}
      <div style={st.footer}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button style={st.footerOutlineBtn} onClick={() => setShowSchedule(true)}>
            {t('ph_gen_program')}
          </button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {phase.is_open && (
            <button style={st.footerFinishBtn} onClick={handleCompletePhase} disabled={completing}>
              {completing ? '...' : t('ph_finish')}
            </button>
          )}
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
  teamPicker: {
    position: 'absolute',
    top: 'calc(100% + 0.375rem)',
    right: 0,
    backgroundColor: colors.surfaceContainerLowest,
    border: `1px solid ${colors.outlineVariant}`,
    borderRadius: radius.DEFAULT,
    boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
    zIndex: 60,
    minWidth: '14rem',
    maxHeight: '16rem',
    display: 'flex',
    flexDirection: 'column',
  },
  teamPickerInput: {
    padding: '0.5rem 0.75rem',
    border: 'none',
    borderBottom: `1px solid ${colors.outlineVariant}33`,
    fontSize: '0.875rem',
    color: colors.onSurface,
    backgroundColor: 'transparent',
    outline: 'none',
    fontFamily: fonts.body,
  },
  teamPickerList: {
    overflowY: 'auto',
    flex: 1,
  },
  teamPickerItem: {
    display: 'block',
    width: '100%',
    padding: '0.5rem 0.875rem',
    background: 'none',
    border: 'none',
    textAlign: 'left',
    fontSize: '0.8125rem',
    color: colors.onSurface,
    cursor: 'pointer',
    fontFamily: fonts.body,
    borderBottom: `1px solid ${colors.outlineVariant}1a`,
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
    overflow: 'hidden',
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
    minHeight: '6.5rem',
  },
  matchCardScheduled: {
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
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    marginRight: '0.25rem',
  },
  matchScore: {
    fontSize: '0.75rem',
    fontWeight: 700,
    fontFamily: 'monospace',
    color: colors.onSurface,
    flexShrink: 0,
  },
  matchScoreMuted: {
    color: colors.outline,
    fontStyle: 'italic',
  },
  matchFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: '0.375rem',
    borderTop: `1px solid ${colors.outlineVariant}1a`,
    lineHeight: 1,
  },
  matchStatusFinal: {
    fontSize: '0.5625rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    color: colors.tertiary,
    fontFamily: fonts.label,
    lineHeight: 1,
  },
  matchStatusScheduled: {
    fontSize: '0.5625rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    color: colors.outline,
    fontFamily: fonts.label,
    lineHeight: 1,
  },
  matchMeta: {
    fontSize: '0.5625rem',
    color: colors.outline,
    fontFamily: fonts.label,
    lineHeight: 1,
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

const ms = {
  overlay: {
    position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)',
    zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  modal: {
    backgroundColor: colors.surface, borderRadius: radius.lg,
    width: '400px', padding: '2rem', fontFamily: fonts.body,
    boxShadow: '0 8px 32px rgba(0,0,0,0.18)', display: 'flex', flexDirection: 'column', gap: '1rem',
  },
  header: {
    display: 'flex', alignItems: 'center', gap: '0.75rem',
  },
  title: {
    fontSize: '1rem', fontWeight: 700, color: colors.onSurface, margin: 0,
    fontFamily: fonts.headline,
  },
  body: {
    fontSize: '0.875rem', color: colors.onSurfaceVariant, margin: 0,
  },
  list: {
    margin: 0, paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.25rem',
  },
  listItem: {
    fontSize: '0.875rem', fontWeight: 600, color: colors.onSurface,
  },
  closeBtn: {
    alignSelf: 'flex-end', padding: '0.5rem 1.25rem',
    backgroundColor: colors.primary, color: colors.onPrimary,
    border: 'none', borderRadius: radius.DEFAULT,
    fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer', fontFamily: fonts.label,
  },
}

const sm = {
  overlay: {
    position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.45)',
    zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  modal: {
    backgroundColor: colors.surface, borderRadius: radius.lg,
    width: '540px', maxHeight: '85vh', display: 'flex', flexDirection: 'column',
    fontFamily: fonts.body, boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
  },
  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '1.25rem 1.5rem', borderBottom: `1px solid ${colors.outlineVariant}33`,
  },
  title: {
    margin: 0, fontSize: '1.125rem', fontWeight: 700,
    color: colors.onSurface, fontFamily: fonts.headline,
  },
  closeBtn: {
    background: 'none', border: 'none', cursor: 'pointer',
    color: colors.onSurfaceVariant, display: 'flex', padding: '0.25rem',
  },
  body: {
    padding: '1.25rem 1.5rem', overflowY: 'auto',
    display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1,
  },
  field: { display: 'flex', flexDirection: 'column', gap: '0.25rem' },
  label: {
    fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase',
    letterSpacing: '0.08em', color: colors.onSurfaceVariant, fontFamily: fonts.label,
  },
  input: {
    padding: '0.5rem 0.75rem', border: `1px solid ${colors.outlineVariant}`,
    borderRadius: radius.DEFAULT, fontSize: '0.875rem', color: colors.onSurface,
    backgroundColor: colors.surfaceContainerLowest, outline: 'none', fontFamily: fonts.body,
  },
  generateBtn: {
    padding: '0.5rem 1.25rem', backgroundColor: colors.primary, border: 'none',
    borderRadius: radius.DEFAULT, fontSize: '0.875rem', fontWeight: 600,
    color: colors.onPrimary, cursor: 'pointer', fontFamily: fonts.label, alignSelf: 'flex-end',
  },
  row: {
    display: 'flex', alignItems: 'center', gap: '0.75rem',
    padding: '0.5rem 0.75rem', borderRadius: radius.DEFAULT,
    backgroundColor: colors.surfaceContainerLow,
    border: `1px solid ${colors.outlineVariant}33`,
  },
  matchLabel: {
    display: 'block', fontSize: '0.875rem', fontWeight: 600, color: colors.onSurface,
  },
  slotLabel: {
    display: 'block', fontSize: '0.75rem', color: colors.onSurfaceVariant, marginTop: '0.125rem',
  },
  footer: {
    display: 'flex', justifyContent: 'flex-end', gap: '0.75rem',
    padding: '1rem 1.5rem', borderTop: `1px solid ${colors.outlineVariant}33`,
  },
  cancelBtn: {
    padding: '0.5rem 1.25rem', background: 'none',
    border: `1px solid ${colors.outlineVariant}`, borderRadius: radius.DEFAULT,
    fontSize: '0.875rem', fontWeight: 500, color: colors.onSurface,
    cursor: 'pointer', fontFamily: fonts.label,
  },
  applyBtn: {
    padding: '0.5rem 1.5rem', backgroundColor: colors.tertiary, border: 'none',
    borderRadius: radius.DEFAULT, fontSize: '0.875rem', fontWeight: 700,
    color: colors.onTertiary, cursor: 'pointer', fontFamily: fonts.label,
  },
  toggleBtn: {
    flex: 1, padding: '0.5rem 0.75rem',
    backgroundColor: colors.surfaceContainerLow,
    border: `1px solid ${colors.outlineVariant}`,
    borderRadius: radius.DEFAULT, fontSize: '0.8125rem', fontWeight: 600,
    color: colors.onSurfaceVariant, cursor: 'pointer', fontFamily: fonts.label,
  },
  toggleBtnActive: {
    backgroundColor: colors.primary, border: `1px solid ${colors.primary}`,
    color: colors.onPrimary,
  },
}
