import { useState } from 'react'
import Modal from '../Modal'
import { updatePlayer } from '../../api/players'

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

export default function EditPlayerModal({ player, teams = [], onClose, onSave }) {
  const [form, setForm] = useState({
    first_name: player.first_name,
    last_name: player.last_name,
    nickname: player.nickname ?? '',
    phone: player.phone ?? '',
    email: player.email ?? '',
    comments: player.comments ?? '',
    team_id: player.team_id ?? '',
  })
  const [error, setError] = useState('')

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSave = async () => {
    setError('')
    try {
      await updatePlayer(player.id, {
        ...form,
        team_id: form.team_id ? Number(form.team_id) : null,
        comments: form.comments || null,
      })
      onSave()
    } catch {
      setError('Please fill all required fields correctly.')
    }
  }

  return (
    <Modal
      title="Edit Player"
      onClose={onClose}
      footer={
        <>
          <button style={btn('secondary')} onClick={onClose}>Cancel</button>
          <button data-testid="btn-save-changes" style={btn('primary')} onClick={handleSave}>Save Changes</button>
        </>
      }
    >
      {error && <p style={{ color: '#dc2626', marginTop: 0, marginBottom: 12, fontSize: 13 }}>{error}</p>}
      <div style={field}>
        <label style={label}>First Name *</label>
        <input data-testid="input-first-name" style={input} value={form.first_name} onChange={set('first_name')} />
      </div>
      <div style={field}>
        <label style={label}>Last Name *</label>
        <input data-testid="input-last-name" style={input} value={form.last_name} onChange={set('last_name')} />
      </div>
      <div style={field}>
        <label style={label}>Nickname</label>
        <input data-testid="input-nickname" style={input} value={form.nickname} onChange={set('nickname')} />
      </div>
      <div style={field}>
        <label style={label}>Phone</label>
        <input data-testid="input-phone" style={input} value={form.phone} onChange={set('phone')} />
      </div>
      <div style={field}>
        <label style={label}>Email</label>
        <input data-testid="input-email" style={input} value={form.email} onChange={set('email')} />
      </div>
      <div style={field}>
        <label style={label}>Team</label>
        <select data-testid="input-team" style={input} value={form.team_id} onChange={set('team_id')}>
          <option value="">— None —</option>
          {teams.map(t => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>
      </div>
      <div style={field}>
        <label style={label}>Comments</label>
        <textarea data-testid="input-comments" style={{ ...input, resize: 'vertical', minHeight: 72 }} value={form.comments} onChange={set('comments')} />
      </div>
    </Modal>
  )
}
