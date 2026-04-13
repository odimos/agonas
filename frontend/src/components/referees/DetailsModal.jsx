import Modal from './Modal'

const row = { display: 'flex', gap: 8, marginBottom: 10, fontSize: 14 }
const lbl = { color: '#6b7280', minWidth: 90 }
const btn = (variant) => ({
  padding: '8px 18px', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 14,
  background: variant === 'danger' ? '#dc2626' : '#2563eb', color: '#fff',
})

export default function DetailsModal({ referee, onClose, onEdit, onDelete }) {
  return (
    <Modal
      title="Referee Details"
      onClose={onClose}
      footer={
        <>
          <button data-testid="btn-edit" style={btn('primary')} onClick={onEdit}>Edit</button>
          <button data-testid="btn-delete" style={btn('danger')} onClick={onDelete}>Delete</button>
        </>
      }
    >
      <div style={row}><span style={lbl}>First Name *</span><span>{referee.first_name}</span></div>
      <div style={row}><span style={lbl}>Last Name *</span><span>{referee.last_name}</span></div>
      <div style={row}><span style={lbl}>Phone *</span><span>{referee.phone}</span></div>
      <div style={row}><span style={lbl}>Email</span><span>{referee.email || '—'}</span></div>
      <div style={row}><span style={lbl}>Comments</span><span style={{ whiteSpace: 'pre-wrap' }}>{referee.comments || '—'}</span></div>
    </Modal>
  )
}
