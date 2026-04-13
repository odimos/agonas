import { useState } from 'react'
import Modal from '../Modal'
import { createStadium } from '../../api/stadiums'

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

const empty = { name: '', phone: '', address: '', email: '', cost: '', map_url: '', comments: '' }

export default function AddStadiumModal({ onClose, onSave }) {
  const [form, setForm] = useState(empty)
  const [error, setError] = useState('')

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSave = async () => {
    setError('')
    try {
      await createStadium({ ...form, cost: form.cost === '' ? null : form.cost })
      onSave()
    } catch {
      setError('Please fill all required fields correctly.')
    }
  }

  return (
    <Modal
      title="Add Stadium"
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
      <div style={field}>
        <label style={label}>Phone *</label>
        <input data-testid="input-phone" style={input} value={form.phone} onChange={set('phone')} />
      </div>
      <div style={field}>
        <label style={label}>Address *</label>
        <input data-testid="input-address" style={input} value={form.address} onChange={set('address')} />
      </div>
      <div style={field}>
        <label style={label}>Email</label>
        <input data-testid="input-email" style={input} value={form.email} onChange={set('email')} />
      </div>
      <div style={field}>
        <label style={label}>Cost (€)</label>
        <input data-testid="input-cost" type="number" min="0" step="0.01" style={input} value={form.cost} onChange={set('cost')} />
      </div>
      <div style={field}>
        <label style={label}>Map URL</label>
        <input data-testid="input-map-url" style={input} value={form.map_url} onChange={set('map_url')} placeholder="https://maps.google.com/..." />
      </div>
      <div style={field}>
        <label style={label}>Comments</label>
        <textarea data-testid="input-comments" style={{ ...input, resize: 'vertical', minHeight: 72 }} value={form.comments} onChange={set('comments')} />
      </div>
    </Modal>
  )
}
