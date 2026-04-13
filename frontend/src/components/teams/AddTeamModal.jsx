import { useState, useEffect } from 'react'
import Modal from '../Modal'
import { createTeam } from '../../api/teams'
import { fetchPlayers } from '../../api/players'

const field = { marginBottom: 14 }
const label = { display: 'block', marginBottom: 4, fontSize: 14 }
const input = {
  width: '100%', padding: '7px 10px', border: '1px solid #d1d5db',
  borderRadius: 4, fontSize: 14, boxSizing: 'border-box',
}
const btn = (v) => ({
  padding: '8px 18px', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 14,
  background: v === 'primary' ? '#2563eb' : '#6b7280', color: '#fff',
})

const empty = { name: '', is_active: true, comments: '', captain_id: '', vice_captain_id: '' }

export default function AddTeamModal({ onClose, onSave }) {
  const [form, setForm] = useState(empty)
  const [players, setPlayers] = useState([])
  const [error, setError] = useState('')

  useEffect(() => { fetchPlayers().then(setPlayers).catch(() => {}) }, [])

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))
  const setCheck = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.checked }))

  const handleSave = async () => {
    setError('')
    try {
      await createTeam({
        ...form,
        captain_id: form.captain_id ? Number(form.captain_id) : null,
        vice_captain_id: form.vice_captain_id ? Number(form.vice_captain_id) : null,
        comments: form.comments || null,
      })
      onSave()
    } catch {
      setError('Please fill all required fields correctly.')
    }
  }

  return (
    <Modal
      title="Add Team"
      onClose={onClose}
      footer={
        <>
          <button style={btn('secondary')} onClick={onClose}>Cancel</button>
          <button data-testid="btn-save" style={btn('primary')} onClick={handleSave}>Save</button>
        </>
      }
    >
      {error && <p style={{ color: '#dc2626', marginTop: 0, marginBottom: 12, fontSize: 13 }}>{error}</p>}
      <div style={field}>
        <label style={label}>Name *</label>
        <input data-testid="input-name" style={input} value={form.name} onChange={set('name')} />
      </div>
      <div style={{ ...field, display: 'flex', alignItems: 'center', gap: 8 }}>
        <input
          data-testid="input-is-active"
          type="checkbox"
          id="is_active_add"
          checked={form.is_active}
          onChange={setCheck('is_active')}
        />
        <label htmlFor="is_active_add" style={{ fontSize: 14, cursor: 'pointer' }}>Active</label>
      </div>
      <div style={field}>
        <label style={label}>Captain</label>
        <select data-testid="input-captain" style={input} value={form.captain_id} onChange={set('captain_id')}>
          <option value="">— None —</option>
          {players.map(p => (
            <option key={p.id} value={p.id}>{p.first_name} {p.last_name}</option>
          ))}
        </select>
      </div>
      <div style={field}>
        <label style={label}>Vice-Captain</label>
        <select data-testid="input-vice-captain" style={input} value={form.vice_captain_id} onChange={set('vice_captain_id')}>
          <option value="">— None —</option>
          {players.map(p => (
            <option key={p.id} value={p.id}>{p.first_name} {p.last_name}</option>
          ))}
        </select>
      </div>
      <div style={field}>
        <label style={label}>Comments</label>
        <textarea
          data-testid="input-comments"
          style={{ ...input, resize: 'vertical', minHeight: 72 }}
          value={form.comments}
          onChange={set('comments')}
        />
      </div>
    </Modal>
  )
}
