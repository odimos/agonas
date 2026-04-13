import Modal from '../Modal'

const row = { display: 'flex', gap: 8, marginBottom: 10, fontSize: 14 }
const lbl = { color: '#6b7280', minWidth: 90 }
const btn = (variant) => ({
  padding: '8px 18px', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 14,
  background: variant === 'danger' ? '#dc2626' : '#2563eb', color: '#fff',
})

export default function DetailsModal({ stadium, onClose, onEdit, onDelete }) {
  return (
    <Modal
      title="Stadium Details"
      onClose={onClose}
      footer={
        <>
          <button data-testid="btn-edit" style={btn('primary')} onClick={onEdit}>Edit</button>
          <button data-testid="btn-delete" style={btn('danger')} onClick={onDelete}>Delete</button>
        </>
      }
    >
      <div style={row}><span style={lbl}>Name *</span><span>{stadium.name}</span></div>
      <div style={row}><span style={lbl}>Phone *</span><span>{stadium.phone}</span></div>
      <div style={row}><span style={lbl}>Address *</span><span>{stadium.address}</span></div>
      <div style={row}><span style={lbl}>Email</span><span>{stadium.email || '—'}</span></div>
      <div style={row}><span style={lbl}>Cost</span><span>{stadium.cost != null ? `€${stadium.cost}` : '—'}</span></div>
      <div style={row}><span style={lbl}>Map URL</span><span>{stadium.map_url ? <a href={stadium.map_url} target="_blank" rel="noreferrer">Open map</a> : '—'}</span></div>
      <div style={row}><span style={lbl}>Comments</span><span style={{ whiteSpace: 'pre-wrap' }}>{stadium.comments || '—'}</span></div>
    </Modal>
  )
}
