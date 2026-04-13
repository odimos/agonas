import { useState } from 'react'
import Modal from '../Modal'
import { updateMatch } from '../../api/matches'

const field = { marginBottom: 14 }
const label = { display: 'block', marginBottom: 4, fontSize: 14 }
const input = {
  width: '100%', padding: '7px 10px', border: '1px solid #d1d5db',
  borderRadius: 4, fontSize: 14, boxSizing: 'border-box',
}
const btn = (variant) => ({
  padding: '8px 18px', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 14,
  background: variant === 'primary' ? '#2563eb' : '#6b7280', color: '#fff',
})

const STATUSES = ['draft', 'canceled', 'expected', 'finished']

function toDatetimeLocal(val) {
  if (!val) return ''
  return val.slice(0, 16)
}

export default function EditMatchModal({ match, onClose, onSave, teams, referees, stadiums }) {
  const [form, setForm] = useState({
    status: match.status,
    home_team_id: match.home_team_id ?? '',
    away_team_id: match.away_team_id ?? '',
    referee_id: match.referee_id ?? '',
    stadium_id: match.stadium_id ?? '',
    scheduled_at: toDatetimeLocal(match.scheduled_at),
    home_score: match.home_score ?? '',
    away_score: match.away_score ?? '',
    home_fair_play: match.home_fair_play ?? '',
    away_fair_play: match.away_fair_play ?? '',
    comments: match.comments ?? '',
    tournament_id: match.tournament_id ?? '',
  })
  const [error, setError] = useState('')

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSave = async () => {
    setError('')
    const payload = {
      status: form.status,
      home_team_id: form.home_team_id !== '' ? parseInt(form.home_team_id) : null,
      away_team_id: form.away_team_id !== '' ? parseInt(form.away_team_id) : null,
      referee_id: form.referee_id !== '' ? parseInt(form.referee_id) : null,
      stadium_id: form.stadium_id !== '' ? parseInt(form.stadium_id) : null,
      scheduled_at: form.scheduled_at || null,
      home_score: form.home_score !== '' ? parseInt(form.home_score) : null,
      away_score: form.away_score !== '' ? parseInt(form.away_score) : null,
      home_fair_play: form.home_fair_play !== '' ? parseInt(form.home_fair_play) : null,
      away_fair_play: form.away_fair_play !== '' ? parseInt(form.away_fair_play) : null,
      comments: form.comments || null,
      tournament_id: form.tournament_id !== '' ? parseInt(form.tournament_id) : null,
    }
    try {
      await updateMatch(match.id, payload)
      onSave()
    } catch (err) {
      const detail = err?.detail
      if (Array.isArray(detail)) {
        setError(detail.map(d => d.msg).join('; '))
      } else {
        setError('Please check all required fields.')
      }
    }
  }

  const isExpected = form.status === 'expected'
  const isFinished = form.status === 'finished'

  return (
    <Modal
      title="Edit Match"
      onClose={onClose}
      width={560}
      footer={
        <>
          <button style={btn('secondary')} onClick={onClose}>Cancel</button>
          <button data-testid="btn-save-changes" style={btn('primary')} onClick={handleSave}>Save Changes</button>
        </>
      }
    >
      {error && <p style={{ color: '#dc2626', marginTop: 0, marginBottom: 12, fontSize: 13 }}>{error}</p>}

      <div style={field}>
        <label style={label}>Status *</label>
        <select data-testid="input-status" style={input} value={form.status} onChange={set('status')}>
          {STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
        </select>
      </div>

      <div style={field}>
        <label style={label}>Home Team{(isExpected || isFinished) ? ' *' : ''}</label>
        <select data-testid="input-home-team" style={input} value={form.home_team_id} onChange={set('home_team_id')}>
          <option value="">— select —</option>
          {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
      </div>

      <div style={field}>
        <label style={label}>Away Team{(isExpected || isFinished) ? ' *' : ''}</label>
        <select data-testid="input-away-team" style={input} value={form.away_team_id} onChange={set('away_team_id')}>
          <option value="">— select —</option>
          {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
      </div>

      <div style={field}>
        <label style={label}>Referee{(isExpected || isFinished) ? ' *' : ''}</label>
        <select data-testid="input-referee" style={input} value={form.referee_id} onChange={set('referee_id')}>
          <option value="">— select —</option>
          {referees.map(r => <option key={r.id} value={r.id}>{r.first_name} {r.last_name}</option>)}
        </select>
      </div>

      <div style={field}>
        <label style={label}>Stadium{(isExpected || isFinished) ? ' *' : ''}</label>
        <select data-testid="input-stadium" style={input} value={form.stadium_id} onChange={set('stadium_id')}>
          <option value="">— select —</option>
          {stadiums.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </div>

      <div style={field}>
        <label style={label}>Scheduled At{(isExpected || isFinished) ? ' *' : ''}</label>
        <input data-testid="input-scheduled-at" type="datetime-local" style={input} value={form.scheduled_at} onChange={set('scheduled_at')} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div style={field}>
          <label style={label}>Home Score{isFinished ? ' *' : ''}</label>
          <input data-testid="input-home-score" type="number" min="0" style={input} value={form.home_score} onChange={set('home_score')} />
        </div>
        <div style={field}>
          <label style={label}>Away Score{isFinished ? ' *' : ''}</label>
          <input data-testid="input-away-score" type="number" min="0" style={input} value={form.away_score} onChange={set('away_score')} />
        </div>
        <div style={field}>
          <label style={label}>Home Fair Play{isFinished ? ' *' : ''} (-5 to 5)</label>
          <input data-testid="input-home-fp" type="number" min="-5" max="5" style={input} value={form.home_fair_play} onChange={set('home_fair_play')} />
        </div>
        <div style={field}>
          <label style={label}>Away Fair Play{isFinished ? ' *' : ''} (-5 to 5)</label>
          <input data-testid="input-away-fp" type="number" min="-5" max="5" style={input} value={form.away_fair_play} onChange={set('away_fair_play')} />
        </div>
      </div>

      <div style={field}>
        <label style={label}>Comments</label>
        <textarea
          data-testid="input-comments"
          style={{ ...input, resize: 'vertical', minHeight: 64 }}
          value={form.comments}
          onChange={set('comments')}
        />
      </div>
    </Modal>
  )
}
