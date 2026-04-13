import Modal from '../Modal'
import { deleteMatch } from '../../api/matches'

const btn = (variant) => ({
  padding: '8px 18px', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 14,
  background: variant === 'danger' ? '#dc2626' : '#6b7280', color: '#fff',
})

function matchLabel(match, teams) {
  const home = teams.find(t => t.id === match.home_team_id)
  const away = teams.find(t => t.id === match.away_team_id)
  if (home && away) return `${home.name} vs ${away.name}`
  return `Match #${match.id}`
}

export default function DeleteModal({ match, teams, onClose, onDelete }) {
  const handleDelete = async () => {
    await deleteMatch(match.id)
    onDelete()
  }

  return (
    <Modal
      title="Delete Match"
      onClose={onClose}
      footer={
        <>
          <button style={btn('secondary')} onClick={onClose}>Cancel</button>
          <button data-testid="btn-confirm-delete" style={btn('danger')} onClick={handleDelete}>Delete</button>
        </>
      }
    >
      <p style={{ margin: 0, fontSize: 14 }}>
        Are you sure you want to delete <strong>{matchLabel(match, teams)}</strong>?
      </p>
      <p style={{ marginBottom: 0, fontSize: 13, color: '#6b7280' }}>This action cannot be undone.</p>
    </Modal>
  )
}
