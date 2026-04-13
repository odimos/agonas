import Modal from '../Modal'
import { updatePlayer } from '../../api/players'

const row = { display: 'flex', gap: 8, marginBottom: 10, fontSize: 14 }
const lbl = { color: '#6b7280', minWidth: 110 }
const btn = (v) => ({
  padding: '8px 18px', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 14,
  background: v === 'danger' ? '#dc2626' : '#2563eb', color: '#fff',
})
const smallBtn = (v) => ({
  padding: '3px 10px', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 12,
  background: v === 'danger' ? '#dc2626' : '#6b7280',
  color: '#fff',
})

export default function DetailsModal({ team, players, onClose, onEdit, onDelete, onPlayerRemoved }) {
  const findPlayer = (id) => {
    if (!id) return '—'
    const p = players.find(p => p.id === id)
    if (!p) return '—'
    const phone = p.phone ? ` · ${p.phone}` : ''
    return `${p.first_name} ${p.last_name}${phone}`
  }

  const teamPlayers = players.filter(p => p.team_id === team.id)

  const handleRemove = async (p) => {
    if (!window.confirm(`Remove ${p.first_name} ${p.last_name} from this team?`)) return
    await updatePlayer(p.id, { ...p, team_id: null })
    onPlayerRemoved?.()
  }

  return (
    <Modal
      title="Team Details"
      onClose={onClose}
      width={580}
      footer={
        <>
          <button data-testid="btn-edit" style={btn('primary')} onClick={onEdit}>Edit</button>
          <button data-testid="btn-delete" style={btn('danger')} onClick={onDelete}>Delete</button>
        </>
      }
    >
      <div style={row}><span style={lbl}>Name</span><span>{team.name}</span></div>
      <div style={row}>
        <span style={lbl}>Status</span>
        <span style={{ color: team.is_active ? '#16a34a' : '#6b7280' }}>
          {team.is_active ? 'Active' : 'Inactive'}
        </span>
      </div>
      <div style={row}><span style={lbl}>Captain</span><span>{findPlayer(team.captain_id)}</span></div>
      <div style={row}><span style={lbl}>Vice-Captain</span><span>{findPlayer(team.vice_captain_id)}</span></div>
      <div style={row}>
        <span style={lbl}>Comments</span>
        <span style={{ whiteSpace: 'pre-wrap' }}>{team.comments || '—'}</span>
      </div>

      <div style={{ marginTop: 16, borderTop: '1px solid #e5e7eb', paddingTop: 14 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', marginBottom: 8 }}>
          Players ({teamPlayers.length})
        </div>
        {teamPlayers.length === 0 ? (
          <p style={{ margin: 0, fontSize: 13, color: '#9ca3af' }}>No players assigned to this team.</p>
        ) : (
          <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
            {teamPlayers.map(p => (
              <li
                key={p.id}
                data-testid="team-detail-player"
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '6px 0', borderBottom: '1px solid #f3f4f6', fontSize: 14, gap: 8,
                }}
              >
                <span style={{ flex: 1 }}>{p.first_name} {p.last_name}{p.nickname && <span style={{ color: '#9ca3af', fontSize: 13, marginLeft: 6 }}>{p.nickname}</span>}</span>

                <span style={{ display: 'flex', gap: 4 }}>
                    <button
                      data-testid="player-view-btn"
                      style={smallBtn('view')}
                      onClick={() => window.open(`/players?player=${p.id}`, '_blank')}
                    >
                      View
                    </button>
                    <button
                      data-testid="player-remove-btn"
                      style={smallBtn('danger')}
                      onClick={() => handleRemove(p)}
                    >
                      Remove
                    </button>
                  </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Modal>
  )
}
