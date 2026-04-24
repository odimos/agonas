import { useState, useEffect } from 'react'
import Modal from '../Modal'
import { fetchMatchGoals, createMatchGoal, deleteMatchGoal } from '../../api/match_player_goals'
import { fetchMatchCards, createMatchCard, deleteMatchCard } from '../../api/match_player_cards'

function extractError(err) {
  const detail = err?.detail
  if (!detail) return 'An error occurred.'
  if (typeof detail === 'string') return detail
  if (Array.isArray(detail)) return detail.map(d => d.msg).join('; ')
  return 'An error occurred.'
}

const row = { display: 'flex', gap: 8, marginBottom: 10, fontSize: 14 }
const lbl = { color: '#6b7280', minWidth: 120, flexShrink: 0 }
const btn = (v) => ({
  padding: '8px 18px', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 14,
  background: v === 'danger' ? '#dc2626' : '#2563eb', color: '#fff',
})
const smallBtn = (v) => ({
  padding: '3px 10px', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 12,
  background: v === 'danger' ? '#dc2626' : '#6b7280', color: '#fff',
})
const linkBtn = {
  background: 'none', border: 'none', padding: 0, cursor: 'pointer',
  color: '#2563eb', fontSize: 14, textDecoration: 'underline',
}
const inputSt = {
  padding: '6px 8px', border: '1px solid #d1d5db', borderRadius: 4,
  fontSize: 13, boxSizing: 'border-box',
}

const STATUS_COLORS = {
  expected: { bg: '#dbeafe', color: '#1d4ed8' },
  finished: { bg: '#dcfce7', color: '#15803d' },
  canceled: { bg: '#fee2e2', color: '#b91c1c' },
  draft: { bg: '#f3f4f6', color: '#6b7280' },
}

function fmtDate(val) {
  if (!val) return '—'
  return new Date(val).toLocaleString()
}

const EMPTY_GOAL = { team_id: '', player_id: '', minute: '', own_goal: false }
const EMPTY_CARD = { team_id: '', player_id: '', minute: '', card_type: 'yellow' }

export default function DetailsModal({ match, teams, referees, stadiums, players, onClose, onEdit, onDelete }) {
  const [goals, setGoals] = useState([])
  const [cards, setCards] = useState([])
  const [showAddGoal, setShowAddGoal] = useState(false)
  const [showAddCard, setShowAddCard] = useState(false)
  const [goalForm, setGoalForm] = useState(EMPTY_GOAL)
  const [cardForm, setCardForm] = useState(EMPTY_CARD)
  const [goalError, setGoalError] = useState('')
  const [cardError, setCardError] = useState('')

  const isFinished = match.status === 'finished'

  const loadGoals = () => fetchMatchGoals(match.id).then(setGoals)
  const loadCards = () => fetchMatchCards(match.id).then(setCards)

  useEffect(() => {
    if (isFinished) {
      loadGoals()
      loadCards()
    }
  }, [match.id])

  const homeTeam = teams.find(t => t.id === match.home_team_id)
  const awayTeam = teams.find(t => t.id === match.away_team_id)
  const referee = referees.find(r => r.id === match.referee_id)
  const stadium = stadiums.find(s => s.id === match.stadium_id)
  const statusStyle = STATUS_COLORS[match.status] || STATUS_COLORS.draft

  // Players belonging to the match teams only
  const matchTeamIds = [match.home_team_id, match.away_team_id].filter(Boolean)
  const matchPlayers = players.filter(p => matchTeamIds.includes(p.team_id))

  function playersForTeam(teamId) {
    return teamId ? players.filter(p => p.team_id === parseInt(teamId)) : matchPlayers
  }

  function playerName(id) {
    const p = players.find(p => p.id === id)
    return p ? `${p.first_name} ${p.last_name}` : '—'
  }

  // ── Goal form handlers ──────────────────────────────────────────
  const setGF = (k) => (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setGoalForm(f => ({ ...f, [k]: val, ...(k === 'team_id' ? { player_id: '' } : {}) }))
  }

  const handleAddGoal = async () => {
    setGoalError('')
    if (!goalForm.team_id) { setGoalError('Please select a team.'); return }
    if (!goalForm.player_id) { setGoalError('Please select a player.'); return }
    if (goalForm.minute === '') { setGoalError('Please enter the minute.'); return }
    const min = parseInt(goalForm.minute)
    if (isNaN(min) || min < 0 || min > 130) { setGoalError('Minute must be between 0 and 130.'); return }
    try {
      await createMatchGoal({
        match_id: match.id,
        team_id: parseInt(goalForm.team_id),
        player_id: parseInt(goalForm.player_id),
        minute: min,
        own_goal: goalForm.own_goal,
      })
      setGoalForm(EMPTY_GOAL)
      setShowAddGoal(false)
      loadGoals()
    } catch (err) {
      setGoalError(extractError(err))
    }
  }

  const handleRemoveGoal = async (id) => {
    await deleteMatchGoal(id)
    loadGoals()
  }

  // ── Card form handlers ──────────────────────────────────────────
  const setCF = (k) => (e) => {
    setCardForm(f => ({ ...f, [k]: e.target.value, ...(k === 'team_id' ? { player_id: '' } : {}) }))
  }

  const handleAddCard = async () => {
    setCardError('')
    if (!cardForm.team_id) { setCardError('Please select a team.'); return }
    if (!cardForm.player_id) { setCardError('Please select a player.'); return }
    if (cardForm.minute === '') { setCardError('Please enter the minute.'); return }
    const min = parseInt(cardForm.minute)
    if (isNaN(min) || min < 0 || min > 130) { setCardError('Minute must be between 0 and 130.'); return }
    try {
      await createMatchCard({
        match_id: match.id,
        team_id: parseInt(cardForm.team_id),
        player_id: parseInt(cardForm.player_id),
        minute: min,
        card_type: cardForm.card_type,
      })
      setCardForm(EMPTY_CARD)
      setShowAddCard(false)
      loadCards()
    } catch (err) {
      setCardError(extractError(err))
    }
  }

  const handleRemoveCard = async (id) => {
    await deleteMatchCard(id)
    loadCards()
  }

  const sectionHdr = { fontSize: 12, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', marginBottom: 8 }
  const sectionWrap = { marginTop: 16, borderTop: '1px solid #e5e7eb', paddingTop: 14 }
  const itemRow = {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '5px 0', borderBottom: '1px solid #f3f4f6', fontSize: 14, gap: 8,
  }
  const formBox = {
    background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 6,
    padding: '12px', marginTop: 8, display: 'flex', flexDirection: 'column', gap: 8,
  }
  const formRow = { display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }

  return (
    <Modal
      title="Match Details"
      onClose={onClose}
      width={580}
      footer={
        <>
          <button data-testid="btn-edit" style={btn('primary')} onClick={onEdit}>Edit</button>
          <button data-testid="btn-delete" style={btn('danger')} onClick={onDelete}>Delete</button>
        </>
      }
    >
      {/* ── Core fields ── */}
      <div style={row}>
        <span style={lbl}>Status</span>
        <span style={{ padding: '2px 10px', borderRadius: 12, fontSize: 12, background: statusStyle.bg, color: statusStyle.color }}>
          {match.status.charAt(0).toUpperCase() + match.status.slice(1)}
        </span>
      </div>

      <div style={row}>
        <span style={lbl}>Home Team</span>
        {homeTeam
          ? <button style={linkBtn} onClick={() => window.open(`/teams?team=${homeTeam.id}`, '_blank')}>{homeTeam.name}</button>
          : <span style={{ color: '#9ca3af' }}>—</span>}
      </div>

      <div style={row}>
        <span style={lbl}>Away Team</span>
        {awayTeam
          ? <button style={linkBtn} onClick={() => window.open(`/teams?team=${awayTeam.id}`, '_blank')}>{awayTeam.name}</button>
          : <span style={{ color: '#9ca3af' }}>—</span>}
      </div>

      <div style={row}>
        <span style={lbl}>Scheduled At</span>
        <span>{fmtDate(match.scheduled_at)}</span>
      </div>

      <div style={row}>
        <span style={lbl}>Referee</span>
        {referee
          ? <button style={linkBtn} onClick={() => window.open('/referees', '_blank')}>{referee.first_name} {referee.last_name}</button>
          : <span style={{ color: '#9ca3af' }}>—</span>}
      </div>

      <div style={row}>
        <span style={lbl}>Stadium</span>
        {stadium
          ? <button style={linkBtn} onClick={() => window.open('/stadiums', '_blank')}>{stadium.name}</button>
          : <span style={{ color: '#9ca3af' }}>—</span>}
      </div>

      {isFinished && (
        <div style={row}>
          <span style={lbl}>Score</span>
          <span style={{ fontWeight: 600 }}>{match.home_score} – {match.away_score}</span>
        </div>
      )}
      {isFinished && (
        <div style={row}>
          <span style={lbl}>Fair Play</span>
          <span>{match.home_fair_play} / {match.away_fair_play}</span>
        </div>
      )}

      <div style={row}>
        <span style={lbl}>Comments</span>
        <span style={{ whiteSpace: 'pre-wrap' }}>{match.comments || '—'}</span>
      </div>

      {/* ── Goals section (finished only) ── */}
      {isFinished && (
        <div style={sectionWrap}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <div style={sectionHdr}>Goals ({goals.length})</div>
            {!showAddGoal && (
              <button
                data-testid="add-goal-btn"
                style={{ ...smallBtn('view'), background: '#2563eb' }}
                onClick={() => setShowAddGoal(true)}
              >
                + Add Goal
              </button>
            )}
          </div>

          {goals.length === 0 && !showAddGoal && (
            <p style={{ margin: 0, fontSize: 13, color: '#9ca3af' }}>No goals recorded.</p>
          )}

          {goals.map(g => (
            <div key={g.id} data-testid="goal-row" style={itemRow}>
              <span>
                <strong>{g.minute}'</strong> {playerName(g.player_id)}
                {g.own_goal && <span style={{ color: '#dc2626', fontSize: 12, marginLeft: 6 }}>OG</span>}
              </span>
              <button data-testid="goal-remove-btn" style={smallBtn('danger')} onClick={() => handleRemoveGoal(g.id)}>Remove</button>
            </div>
          ))}

          {showAddGoal && (
            <div style={formBox}>
              {goalError && <p style={{ color: '#dc2626', margin: 0, fontSize: 13 }}>{goalError}</p>}
              <div style={formRow}>
                <select
                  data-testid="goal-team-select"
                  style={{ ...inputSt, flex: 1 }}
                  value={goalForm.team_id}
                  onChange={setGF('team_id')}
                >
                  <option value="">All teams</option>
                  {homeTeam && <option value={homeTeam.id}>{homeTeam.name}</option>}
                  {awayTeam && <option value={awayTeam.id}>{awayTeam.name}</option>}
                </select>
                <select
                  data-testid="goal-player-select"
                  style={{ ...inputSt, flex: 1 }}
                  value={goalForm.player_id}
                  onChange={setGF('player_id')}
                >
                  <option value="">— player —</option>
                  {playersForTeam(goalForm.team_id).map(p => (
                    <option key={p.id} value={p.id}>{p.first_name} {p.last_name}</option>
                  ))}
                </select>
                <input
                  data-testid="goal-minute-input"
                  type="number" min="0" max="130"
                  placeholder="Min"
                  style={{ ...inputSt, width: 64 }}
                  value={goalForm.minute}
                  onChange={setGF('minute')}
                />
                <label style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap' }}>
                  <input
                    data-testid="goal-own-goal-check"
                    type="checkbox"
                    checked={goalForm.own_goal}
                    onChange={setGF('own_goal')}
                  />
                  Own goal
                </label>
              </div>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button style={smallBtn('secondary')} onClick={() => { setShowAddGoal(false); setGoalForm(EMPTY_GOAL); setGoalError('') }}>Cancel</button>
                <button data-testid="goal-add-btn" style={{ ...smallBtn('view'), background: '#2563eb' }} onClick={handleAddGoal}>Add</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Cards section (finished only) ── */}
      {isFinished && (
        <div style={sectionWrap}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <div style={sectionHdr}>Cards ({cards.length})</div>
            {!showAddCard && (
              <button
                data-testid="add-card-btn"
                style={{ ...smallBtn('view'), background: '#2563eb' }}
                onClick={() => setShowAddCard(true)}
              >
                + Add Card
              </button>
            )}
          </div>

          {cards.length === 0 && !showAddCard && (
            <p style={{ margin: 0, fontSize: 13, color: '#9ca3af' }}>No cards recorded.</p>
          )}

          {cards.map(c => (
            <div key={c.id} data-testid="card-row" style={itemRow}>
              <span>
                <span style={{
                  display: 'inline-block', width: 12, height: 16, borderRadius: 2, marginRight: 6,
                  background: c.card_type === 'yellow' ? '#facc15' : '#dc2626',
                  verticalAlign: 'middle',
                }} />
                <strong>{c.minute}'</strong> {playerName(c.player_id)}
              </span>
              <button data-testid="card-remove-btn" style={smallBtn('danger')} onClick={() => handleRemoveCard(c.id)}>Remove</button>
            </div>
          ))}

          {showAddCard && (
            <div style={formBox}>
              {cardError && <p style={{ color: '#dc2626', margin: 0, fontSize: 13 }}>{cardError}</p>}
              <div style={formRow}>
                <select
                  data-testid="card-team-select"
                  style={{ ...inputSt, flex: 1 }}
                  value={cardForm.team_id}
                  onChange={setCF('team_id')}
                >
                  <option value="">All teams</option>
                  {homeTeam && <option value={homeTeam.id}>{homeTeam.name}</option>}
                  {awayTeam && <option value={awayTeam.id}>{awayTeam.name}</option>}
                </select>
                <select
                  data-testid="card-player-select"
                  style={{ ...inputSt, flex: 1 }}
                  value={cardForm.player_id}
                  onChange={setCF('player_id')}
                >
                  <option value="">— player —</option>
                  {playersForTeam(cardForm.team_id).map(p => (
                    <option key={p.id} value={p.id}>{p.first_name} {p.last_name}</option>
                  ))}
                </select>
                <input
                  data-testid="card-minute-input"
                  type="number" min="0" max="130"
                  placeholder="Min"
                  style={{ ...inputSt, width: 64 }}
                  value={cardForm.minute}
                  onChange={setCF('minute')}
                />
                <select
                  data-testid="card-type-select"
                  style={{ ...inputSt }}
                  value={cardForm.card_type}
                  onChange={setCF('card_type')}
                >
                  <option value="yellow">Yellow</option>
                  <option value="red">Red</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button style={smallBtn('secondary')} onClick={() => { setShowAddCard(false); setCardForm(EMPTY_CARD); setCardError('') }}>Cancel</button>
                <button data-testid="card-add-btn" style={{ ...smallBtn('view'), background: '#2563eb' }} onClick={handleAddCard}>Add</button>
              </div>
            </div>
          )}
        </div>
      )}
    </Modal>
  )
}
