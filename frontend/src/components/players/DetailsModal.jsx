import { useNavigate } from 'react-router-dom'
import Modal from '../Modal'

const row = { display: 'flex', gap: 8, marginBottom: 10, fontSize: 14 }
const lbl = { color: '#6b7280', minWidth: 90 }
const btn = (v) => ({
  padding: '8px 18px', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 14,
  background: v === 'danger' ? '#dc2626' : '#2563eb', color: '#fff',
})

export default function DetailsModal({ player, teams = [], onClose, onEdit, onDelete }) {
  const navigate = useNavigate()
  const team = teams.find(t => t.id === player.team_id)

  const goToTeam = () => {
    onClose()
    navigate(`/teams?team=${team.id}`)
  }

  return (
    <Modal
      title="Player Details"
      onClose={onClose}
      footer={
        <>
          <button data-testid="btn-edit" style={btn('primary')} onClick={onEdit}>Edit</button>
          <button data-testid="btn-delete" style={btn('danger')} onClick={onDelete}>Delete</button>
        </>
      }
    >
      <div style={row}><span style={lbl}>First Name</span><span>{player.first_name}</span></div>
      <div style={row}><span style={lbl}>Last Name</span><span>{player.last_name}</span></div>
      <div style={row}><span style={lbl}>Nickname</span><span>{player.nickname || '—'}</span></div>
      <div style={row}><span style={lbl}>Phone</span><span>{player.phone || '—'}</span></div>
      <div style={row}><span style={lbl}>Email</span><span>{player.email || '—'}</span></div>
      <div style={row}>
        <span style={lbl}>Team</span>
        {team ? (
          <button
            onClick={goToTeam}
            style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: '#2563eb', fontSize: 14, textDecoration: 'underline' }}
          >
            {team.name}
          </button>
        ) : (
          <span>—</span>
        )}
      </div>
      <div style={row}><span style={lbl}>Comments</span><span style={{ whiteSpace: 'pre-wrap' }}>{player.comments || '—'}</span></div>
    </Modal>
  )
}
