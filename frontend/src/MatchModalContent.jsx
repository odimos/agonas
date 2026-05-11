import { useState } from 'react'
import { colors, fonts, radius } from './styles'
import { useLang } from './LangContext'

const ALL_STATUSES = ['draft', 'expected', 'finished', 'canceled']
const GHOST = `1px solid ${colors.outlineVariant}33`
const FAIR_PLAY_OPTS = ['–', '-5', '-4', '-3', '-2', '-1', '0', '1', '2', '3', '4', '5']

export function initMatchForm(match = {}) {
  return {
    status:          match.status          ?? 'draft',
    tournament_id:   match.tournament_id   ?? null,
    home_team_id:    match.home_team_id    ?? null,
    away_team_id:    match.away_team_id    ?? null,
    referee_id:      match.referee_id      ?? null,
    stadium_id:      match.stadium_id      ?? null,
    scheduled_at:    match.scheduled_at    ? match.scheduled_at.slice(0, 16) : '',
    home_score:      match.home_score      ?? null,
    away_score:      match.away_score      ?? null,
    home_fair_play:  match.home_fair_play  ?? null,
    away_fair_play:  match.away_fair_play  ?? null,
    comments:        match.comments        ?? '',
    phase_id:        match.phase_id        ?? null,
    _id:             match.id              ?? null,
  }
}

// ─── Shared primitives ────────────────────────────────────────────────────────

function SectionHeader({ icon, label, onAdd, editing }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.625rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span className="material-symbols-outlined" style={{ fontSize: '1.1rem', color: colors.tertiary }}>{icon}</span>
        <span style={{ fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: colors.onSurface, fontFamily: fonts.label }}>{label}</span>
      </div>
      {editing && onAdd && (
        <button onClick={onAdd} style={st.addCircle}>+</button>
      )}
    </div>
  )
}

function FieldSelect({ label, value, options, editing, onChange, testId, required }) {
  return (
    <div style={{ flex: 1, minWidth: 0 }}>
      {label && <label style={st.fieldLabel}>{label}</label>}
      <div style={{ position: 'relative' }}>
        <select
          style={{
            ...st.fieldSelectInput,
            borderBottomColor: editing ? colors.primary : `${colors.outlineVariant}33`,
            pointerEvents: editing ? 'auto' : 'none',
            cursor: editing ? 'pointer' : 'default',
          }}
          value={value ?? ''}
          onChange={e => onChange(e.target.value || null)}
          data-testid={testId}
        >
          {!required && <option value="">—</option>}
          {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <span className="material-symbols-outlined" style={st.selectChevron}>expand_more</span>
      </div>
    </div>
  )
}

// ─── Goal pill ────────────────────────────────────────────────────────────────

function GoalPill({ goal, players, editing, onRemove }) {
  const player = players.find(p => p.id === goal.player_id)
  const pName = player ? `${player.first_name} ${player.last_name}` : `#${goal.player_id}`
  return (
    <div style={st.pill}>
      <span className="material-symbols-outlined" style={{ fontSize: '0.9rem', color: colors.tertiary, flexShrink: 0 }}>sports_soccer</span>
      <span style={st.pillMinute}>{goal.minute}΄</span>
      <span style={st.pillPlayer}>{pName}</span>
      {goal.own_goal && <span style={st.tagOG}>ΑΓ</span>}
      {editing && (
        <button onClick={onRemove} style={st.pillRemove}>
          <span className="material-symbols-outlined" style={{ fontSize: '0.9rem' }}>close</span>
        </button>
      )}
    </div>
  )
}

// ─── Card pill ────────────────────────────────────────────────────────────────

function CardPill({ card, players, editing, onRemove }) {
  const player = players.find(p => p.id === card.player_id)
  const pName = player ? `${player.first_name} ${player.last_name}` : `#${card.player_id}`
  const isYellow = card.card_type === 'yellow'
  return (
    <div style={st.pill}>
      <span style={{ ...st.cardRect, backgroundColor: isYellow ? '#f59e0b' : colors.error }} />
      <span style={st.pillMinute}>{card.minute}΄</span>
      <span style={st.pillPlayer}>{pName}</span>
      <span style={{ ...st.tagOG, color: isYellow ? '#92400e' : colors.onErrorContainer, backgroundColor: isYellow ? '#fef3c7' : colors.errorContainer }}>
        {isYellow ? 'Κίτρινη' : 'Κόκκινη'}
      </span>
      {editing && (
        <button onClick={onRemove} style={st.pillRemove}>
          <span className="material-symbols-outlined" style={{ fontSize: '0.9rem' }}>close</span>
        </button>
      )}
    </div>
  )
}

// ─── Inline add forms ─────────────────────────────────────────────────────────

function AddGoalForm({ teams, players, matchId, homeTeamId, awayTeamId, onAdded }) {
  const [teamId, setTeamId]   = useState('')
  const [playerId, setPlayer] = useState('')
  const [minute, setMinute]   = useState('')
  const [ownGoal, setOwnGoal] = useState(false)
  const [busy, setBusy]       = useState(false)

  const teamOpts = teams.filter(t => t.id === homeTeamId || t.id === awayTeamId)
  const playerOpts = players.filter(p => p.team_id === Number(teamId))

  async function submit() {
    if (!teamId || !playerId || !minute) return
    setBusy(true)
    try {
      const { createMatchGoal } = await import('./api/match_player_goals')
      const goal = await createMatchGoal({ match_id: matchId, team_id: Number(teamId), player_id: Number(playerId), minute: Number(minute), own_goal: ownGoal })
      onAdded(goal)
      setTeamId(''); setPlayer(''); setMinute(''); setOwnGoal(false)
    } finally { setBusy(false) }
  }

  return (
    <div style={st.addForm}>
      <select style={st.addSelect} value={teamId} onChange={e => { setTeamId(e.target.value); setPlayer('') }}>
        <option value="">Ομάδα…</option>
        {teamOpts.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
      </select>
      <select style={st.addSelect} value={playerId} onChange={e => setPlayer(e.target.value)} disabled={!teamId}>
        <option value="">Παίκτης…</option>
        {playerOpts.map(p => <option key={p.id} value={p.id}>{p.first_name} {p.last_name}</option>)}
      </select>
      <input style={st.addMinute} type="number" min={0} max={130} placeholder="΄" value={minute} onChange={e => setMinute(e.target.value)} />
      <label style={st.checkLabel}>
        <input type="checkbox" checked={ownGoal} onChange={e => setOwnGoal(e.target.checked)} /> ΑΓ
      </label>
      <button style={st.addBtn} onClick={submit} disabled={busy || !teamId || !playerId || !minute}>+</button>
    </div>
  )
}

function AddCardForm({ teams, players, matchId, homeTeamId, awayTeamId, onAdded }) {
  const [teamId, setTeamId]   = useState('')
  const [playerId, setPlayer] = useState('')
  const [minute, setMinute]   = useState('')
  const [cardType, setCard]   = useState('yellow')
  const [busy, setBusy]       = useState(false)

  const teamOpts = teams.filter(t => t.id === homeTeamId || t.id === awayTeamId)
  const playerOpts = players.filter(p => p.team_id === Number(teamId))

  async function submit() {
    if (!teamId || !playerId || !minute) return
    setBusy(true)
    try {
      const { createMatchCard } = await import('./api/match_player_cards')
      const card = await createMatchCard({ match_id: matchId, team_id: Number(teamId), player_id: Number(playerId), minute: Number(minute), card_type: cardType })
      onAdded(card)
      setTeamId(''); setPlayer(''); setMinute(''); setCard('yellow')
    } finally { setBusy(false) }
  }

  return (
    <div style={st.addForm}>
      <select style={st.addSelect} value={teamId} onChange={e => { setTeamId(e.target.value); setPlayer('') }}>
        <option value="">Ομάδα…</option>
        {teamOpts.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
      </select>
      <select style={st.addSelect} value={playerId} onChange={e => setPlayer(e.target.value)} disabled={!teamId}>
        <option value="">Παίκτης…</option>
        {playerOpts.map(p => <option key={p.id} value={p.id}>{p.first_name} {p.last_name}</option>)}
      </select>
      <input style={st.addMinute} type="number" min={0} max={130} placeholder="΄" value={minute} onChange={e => setMinute(e.target.value)} />
      <select style={st.addSelect} value={cardType} onChange={e => setCard(e.target.value)}>
        <option value="yellow">Κίτρινη</option>
        <option value="red">Κόκκινη</option>
      </select>
      <button style={st.addBtn} onClick={submit} disabled={busy || !teamId || !playerId || !minute}>+</button>
    </div>
  )
}

// ─── Stepper ──────────────────────────────────────────────────────────────────

function ScoreStepper({ label, value, editing, onChange }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', padding: '0.625rem 1rem', borderBottom: GHOST }}>
      {/* Team name — takes remaining space */}
      <span style={{ fontSize: '0.9375rem', fontWeight: 700, color: colors.onSurface, flex: 1 }}>{label}</span>
      {/* Fixed-width right block so numbers always align */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', width: '9rem', justifyContent: 'flex-end' }}>
        {editing && (
          <button onClick={() => onChange(Math.max(0, (value ?? 0) - 1))} style={st.stepper}>−</button>
        )}
        <span style={{ fontSize: '1.5rem', fontWeight: 900, color: value === null ? colors.outline : colors.onSurface, width: '2rem', textAlign: 'center', lineHeight: 1 }}>
          {value === null ? '—' : value}
        </span>
        {editing && (
          <button onClick={() => onChange(value === null ? 0 : value + 1)} style={st.stepper}>+</button>
        )}
        {editing && value !== null && (
          <button onClick={() => onChange(null)} style={{ ...st.stepper, fontSize: '0.75rem', color: colors.outline }} title="Μηδενισμός">×</button>
        )}
      </div>
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function MatchModalContent({
  form, setForm, editing,
  teams = [], referees = [], stadiums = [], tournaments = [], phases = [], players = [],
  goals = [], cards = [],
  onGoalAdded, onGoalRemoved,
  onCardAdded, onCardRemoved,
}) {
  const { t } = useLang()
  const set = field => value => setForm(f => ({ ...f, [field]: value }))

  const homeTeam = teams.find(t => t.id === form.home_team_id)
  const awayTeam = teams.find(t => t.id === form.away_team_id)
  const homeName = homeTeam?.name ?? '—'
  const awayName = awayTeam?.name ?? '—'

  const selectedPhase  = phases.find(p => p.id === form.phase_id)
  const eligibleTeams  = form.phase_id && selectedPhase
    ? teams.filter(t => selectedPhase.team_ids.includes(t.id))
    : teams
  const teamOpts       = [
    ...(form.tournament_id ? [{ value: 'bye', label: 'BYE' }] : []),
    ...eligibleTeams.map(t => ({ value: String(t.id), label: t.name })),
  ]
  const refereeOpts    = referees.map(r => ({ value: String(r.id), label: `${r.first_name} ${r.last_name}` }))
  const stadiumOpts    = stadiums.map(s => ({ value: String(s.id), label: s.name }))
  const tournamentOpts = tournaments.map(tn => ({ value: String(tn.id), label: tn.name }))
  const phaseOpts      = phases
    .filter(p => {
      if (!form.tournament_id || p.tournament_id !== form.tournament_id) return false
      // always include the currently selected phase; otherwise only open ones
      return p.is_open || String(p.id) === String(form.phase_id)
    })
    .map(p => ({ value: String(p.id), label: String(p.order) }))
  const statusOpts     = ALL_STATUSES.map(s => ({ value: s, label: t('ms_' + s) }))
  const fairPlayOpts   = FAIR_PLAY_OPTS.map(v => ({ value: v === '–' ? '' : v, label: v }))

  const matchId    = form._id
  const isFinished = form.status === 'finished'
  const scoresEditable = form.status === 'finished' || form.status === 'expected' || form.status === 'draft'

  return (
    <div style={st.body}>

      {/* ── Match info ─────────────────────────────────────────────────── */}
      <section>
        <SectionHeader icon="info" label="Στοιχεία Αγώνα" />
        <div style={st.infoCard}>

          {/* Status + Tournament + Phase */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <FieldSelect label="Κατάσταση" value={form.status} options={statusOpts}
              editing={editing} onChange={v => set('status')(v ?? 'draft')} testId="input-status" />
            <FieldSelect label="Τουρνουά" value={form.tournament_id ? String(form.tournament_id) : ''}
              options={tournamentOpts} editing={editing}
              onChange={v => {
                const tournamentId = v ? Number(v) : null
                set('tournament_id')(tournamentId)
                if (tournamentId) {
                  const tournamentPhases = phases.filter(p => p.tournament_id === tournamentId && p.is_open)
                  const lastOpen = tournamentPhases[tournamentPhases.length - 1]
                  set('phase_id')(lastOpen?.id ?? null)
                } else {
                  set('phase_id')(null)
                }
              }} testId="input-tournament" />
            <FieldSelect label="Φάση" value={form.phase_id ? String(form.phase_id) : ''}
              options={phaseOpts} editing={editing && !!form.tournament_id}
              onChange={v => set('phase_id')(v ? Number(v) : null)} testId="input-phase"
              required={!!form.tournament_id} />
          </div>

          {/* Date/time */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={st.fieldLabel}>Ημερομηνία & Ώρα</label>
            <input
              style={{ ...st.fieldSelectInput, borderBottomColor: editing ? colors.primary : `${colors.outlineVariant}33`, cursor: editing ? 'text' : 'default' }}
              type="datetime-local" value={form.scheduled_at} readOnly={!editing}
              onChange={e => set('scheduled_at')(e.target.value)} data-testid="input-scheduled-at"
            />
          </div>

          {/* Teams */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <FieldSelect label="Γηπεδούχος" value={form.home_team_id ? String(form.home_team_id) : (form.tournament_id && !form.home_team_id ? 'bye' : '')}
              options={teamOpts} editing={editing}
              onChange={v => set('home_team_id')(v && v !== 'bye' ? Number(v) : null)} testId="input-home-team" />
            <FieldSelect label="Φιλοξενούμενος" value={form.away_team_id ? String(form.away_team_id) : (form.tournament_id && !form.away_team_id ? 'bye' : '')}
              options={teamOpts} editing={editing}
              onChange={v => set('away_team_id')(v && v !== 'bye' ? Number(v) : null)} testId="input-away-team" />
          </div>

          {/* Referee + Stadium */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <FieldSelect label="Διαιτητής" value={form.referee_id ? String(form.referee_id) : ''}
              options={refereeOpts} editing={editing}
              onChange={v => set('referee_id')(v ? Number(v) : null)} testId="input-referee" />
            <FieldSelect label="Γήπεδο" value={form.stadium_id ? String(form.stadium_id) : ''}
              options={stadiumOpts} editing={editing}
              onChange={v => set('stadium_id')(v ? Number(v) : null)} testId="input-stadium" />
          </div>
        </div>
      </section>

      {/* ── Score ──────────────────────────────────────────────────────── */}
      <section>
        <SectionHeader icon="scoreboard" label="Αποτέλεσμα" />
        <div style={st.ghostCard}>
          <ScoreStepper label={homeName} value={form.home_score} editing={editing && scoresEditable} onChange={v => set('home_score')(v)} />
          <ScoreStepper label={awayName} value={form.away_score} editing={editing && scoresEditable} onChange={v => set('away_score')(v)} />
        </div>
        {editing && !scoresEditable && (
          <p style={{ fontSize: '0.7rem', color: colors.onSurfaceVariant, margin: '0.375rem 0 0', fontStyle: 'italic' }}>
            Το σκορ επεξεργάζεται μόνο σε αγώνα "Αναμενόμενο" ή "Ολοκληρωμένο".
          </p>
        )}
      </section>

      {/* ── Scorers ────────────────────────────────────────────────────── */}
      <section>
        <SectionHeader icon="sports_soccer" label={`Σκόρερ (${goals.length})`}
          editing={editing && !!form.home_team_id && !!form.away_team_id} onAdd={() => {}} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
          {goals.length === 0 && <p style={st.emptyMsg}>Δεν καταχωρήθηκαν γκολ</p>}
          {goals.map(g => (
            <GoalPill key={g.id} goal={g} players={players} editing={editing}
              onRemove={() => onGoalRemoved?.(g.id)} />
          ))}
        </div>
        {editing && form.home_team_id && form.away_team_id && (
          <AddGoalForm teams={teams} players={players} matchId={matchId}
            homeTeamId={form.home_team_id} awayTeamId={form.away_team_id}
            onAdded={onGoalAdded} />
        )}
      </section>

      {/* ── Cards ──────────────────────────────────────────────────────── */}
      <section>
        <SectionHeader icon="style" label={`Κάρτες (${cards.length})`}
          editing={editing && !!form.home_team_id && !!form.away_team_id} onAdd={() => {}} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
          {cards.length === 0 && <p style={st.emptyMsg}>Δεν καταχωρήθηκαν κάρτες</p>}
          {cards.map(c => (
            <CardPill key={c.id} card={c} players={players} editing={editing}
              onRemove={() => onCardRemoved?.(c.id)} />
          ))}
        </div>
        {editing && form.home_team_id && form.away_team_id && (
          <AddCardForm teams={teams} players={players} matchId={matchId}
            homeTeamId={form.home_team_id} awayTeamId={form.away_team_id}
            onAdded={onCardAdded} />
        )}
      </section>

      {/* ── Fair Play ──────────────────────────────────────────────────── */}
      <section>
        <SectionHeader icon="handshake" label="Fair Play (−5 έως +5)" />
        <div style={{ ...st.ghostCard, display: 'flex', padding: 0, borderRadius: radius.DEFAULT }}>
          {[
            { label: homeName, field: 'home_fair_play' },
            { label: awayName, field: 'away_fair_play' },
          ].map(({ label, field }, i) => (
            <div key={field} style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.625rem 0.875rem', borderRight: i === 0 ? GHOST : 'none' }}>
              <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: colors.onSurface, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{label}</span>
              <select
                style={{ fontSize: '0.875rem', fontWeight: 700, color: colors.onSurface, background: colors.surfaceContainerLow, border: GHOST, borderRadius: radius.DEFAULT, padding: '0.25rem 0.5rem', outline: 'none', cursor: editing ? 'pointer' : 'default', pointerEvents: editing ? 'auto' : 'none' }}
                value={form[field] !== null && form[field] !== undefined ? String(form[field]) : ''}
                onChange={e => set(field)(e.target.value === '' ? null : Number(e.target.value))}
                data-testid={`input-${field.replace('_', '-')}`}
              >
                {fairPlayOpts.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          ))}
        </div>
      </section>

      {/* ── Comments ───────────────────────────────────────────────────── */}
      <section>
        <SectionHeader icon="rate_review" label="Σχόλια" />
        <textarea
          style={{
            width: '100%', boxSizing: 'border-box', fontSize: '0.875rem', color: colors.onSurface,
            background: colors.surfaceContainerLowest, border: GHOST, borderRadius: radius.DEFAULT,
            padding: '0.75rem 1rem', resize: 'none', outline: 'none', fontFamily: fonts.body, lineHeight: 1.5,
            borderColor: editing ? colors.primary : undefined, cursor: editing ? 'text' : 'default',
          }}
          value={form.comments}
          readOnly={!editing}
          onChange={e => set('comments')(e.target.value)}
          rows={3}
          placeholder={editing ? 'Σημειώσεις αγώνα, ειδικές οδηγίες…' : ''}
          data-testid="input-comments"
        />
      </section>

    </div>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const st = {
  body:  { display: 'flex', flexDirection: 'column', gap: '1.75rem' },

  fieldLabel: {
    display: 'block', fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase',
    letterSpacing: '0.1em', color: colors.onSurfaceVariant, marginBottom: '0.375rem', fontFamily: fonts.label,
  },
  fieldSelectInput: {
    width: '100%', backgroundColor: colors.surfaceContainer, border: 'none', borderBottom: '2px solid',
    outline: 'none', padding: '0.5rem 1.75rem 0.5rem 0.75rem', fontSize: '0.875rem', fontWeight: 500,
    color: colors.onSurface, fontFamily: fonts.label, appearance: 'none', WebkitAppearance: 'none',
    boxSizing: 'border-box', display: 'block',
  },
  selectChevron: {
    position: 'absolute', right: '0.375rem', top: '50%', transform: 'translateY(-50%)',
    fontSize: '1.25rem', color: colors.onSurfaceVariant, pointerEvents: 'none',
  },

  infoCard: {
    backgroundColor: colors.surfaceContainerLowest, border: GHOST,
    borderRadius: radius.DEFAULT, padding: '1rem',
  },
  ghostCard: {
    backgroundColor: colors.surfaceContainerLowest, borderTop: GHOST, borderBottom: GHOST,
    overflow: 'hidden',
  },

  stepper: {
    width: '1.75rem', height: '1.75rem', borderRadius: '50%', border: GHOST,
    background: colors.surfaceContainer, color: colors.onSurface, fontSize: '1rem',
    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: fonts.body, flexShrink: 0,
  },

  pill: {
    display: 'flex', alignItems: 'center', gap: '0.5rem',
    background: colors.surfaceContainerLow, borderRadius: radius.lg,
    padding: '0.4rem 0.75rem', border: GHOST,
  },
  pillMinute: { fontSize: '0.75rem', fontWeight: 700, fontStyle: 'italic', color: colors.onSurfaceVariant, flexShrink: 0 },
  pillPlayer: { fontSize: '0.8125rem', fontWeight: 600, color: colors.onSurface, flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  pillRemove: { background: 'none', border: 'none', cursor: 'pointer', color: colors.onSurfaceVariant, display: 'flex', padding: '0.1rem', flexShrink: 0 },
  cardRect: { width: '0.875rem', height: '1.25rem', borderRadius: '0.125rem', flexShrink: 0 },
  tagOG: {
    display: 'inline-flex', alignItems: 'center', padding: '0.125rem 0.375rem',
    borderRadius: radius.DEFAULT, fontSize: '0.6rem', fontWeight: 700,
    textTransform: 'uppercase', letterSpacing: '0.04em',
    color: colors.onErrorContainer, backgroundColor: colors.errorContainer,
    flexShrink: 0,
  },

  addCircle: {
    width: '1.75rem', height: '1.75rem', borderRadius: '0.25rem',
    background: colors.tertiary, border: 'none', cursor: 'pointer',
    color: '#fff', fontSize: '1.25rem', lineHeight: 1,
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  addForm: {
    display: 'flex', alignItems: 'center', gap: '0.375rem', flexWrap: 'wrap',
    marginTop: '0.5rem', padding: '0.5rem', background: colors.surfaceContainerLow,
    borderRadius: radius.DEFAULT, border: GHOST,
  },
  addSelect: {
    flex: '1 1 100px', backgroundColor: 'transparent', border: 'none',
    borderBottom: `1px solid ${colors.outlineVariant}`, outline: 'none',
    padding: '0.25rem 0.25rem', fontSize: '0.75rem', color: colors.onSurface,
    fontFamily: fonts.body, cursor: 'pointer',
  },
  addMinute: {
    width: '3rem', backgroundColor: 'transparent', border: 'none',
    borderBottom: `1px solid ${colors.outlineVariant}`, outline: 'none',
    padding: '0.25rem', fontSize: '0.75rem', color: colors.onSurface,
    fontFamily: fonts.body, textAlign: 'center', flexShrink: 0,
  },
  checkLabel: { display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: colors.onSurfaceVariant, whiteSpace: 'nowrap', cursor: 'pointer' },
  addBtn: {
    padding: '0.25rem 0.75rem', backgroundColor: colors.primary, color: colors.onPrimary,
    border: 'none', borderRadius: radius.DEFAULT, fontSize: '0.875rem', fontWeight: 700,
    cursor: 'pointer', fontFamily: fonts.label, flexShrink: 0,
  },
  emptyMsg: { fontSize: '0.75rem', color: colors.outline, fontStyle: 'italic', margin: '0.125rem 0' },
}
