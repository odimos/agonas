import { useState } from 'react'
import Modal from './Modal'
import { updateReferee } from '../../api/referees'

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

export default function EditRefereeModal({ referee, onClose, onSave }) {
  const [form, setForm] = useState({
    first_name: referee.first_name,
    last_name: referee.last_name,
    phone: referee.phone,
    email: referee.email ?? '',
    comments: referee.comments ?? '',
  })
  const [error, setError] = useState('')

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSave = async () => {
    setError('')
    try {
      await updateReferee(referee.id, form)
      onSave()
    } catch (err) {
      setError('Please fill all required fields correctly.')
    }
  }

  return (
    <Modal
      title="Edit Referee"
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
        <label style={label}>Phone *</label>
        <input data-testid="input-phone" style={input} value={form.phone} onChange={set('phone')} />
      </div>
      <div style={field}>
        <label style={label}>Email</label>
        <input data-testid="input-email" style={input} value={form.email} onChange={set('email')} />
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
