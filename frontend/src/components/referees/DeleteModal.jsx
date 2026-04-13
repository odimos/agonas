import Modal from './Modal'
import { deleteReferee } from '../../api/referees'

const btn = (variant) => ({
  padding: '8px 18px', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 14,
  background: variant === 'danger' ? '#dc2626' : '#6b7280', color: '#fff',
})

export default function DeleteModal({ referee, onClose, onDelete }) {
  const handleDelete = async () => {
    await deleteReferee(referee.id)
    onDelete()
  }

  return (
    <Modal
      title="Delete Referee"
      onClose={onClose}
      footer={
        <>
          <button style={btn('secondary')} onClick={onClose}>Cancel</button>
          <button data-testid="btn-confirm-delete" style={btn('danger')} onClick={handleDelete}>Delete</button>
        </>
      }
    >
      <p style={{ margin: 0, fontSize: 14 }}>
        Are you sure you want to delete <strong>{referee.first_name} {referee.last_name}</strong>?
      </p>
      <p style={{ marginBottom: 0, fontSize: 13, color: '#6b7280' }}>This action cannot be undone.</p>
    </Modal>
  )
}
