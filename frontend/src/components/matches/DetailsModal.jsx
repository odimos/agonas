import Modal from '../Modal'

const row = { display: 'flex', gap: 8, marginBottom: 10, fontSize: 14 }
const lbl = { color: '#6b7280', minWidth: 120, flexShrink: 0 }
const btn = (v) => ({
  padding: '8px 18px', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 14,
  background: v === 'danger' ? '#dc2626' : '#2563eb', color: '#fff',
})
const linkBtn = {
  background: 'none', border: 'none', padding: 0, cursor: 'pointer',
  color: '#2563eb', fontSize: 14, textDecoration: 'underline',
}

const STATUS_COLORS = {
  expected: { bg: '#dbeafe', color: '#1d4ed8' },
  finished: { bg: '#dcfce7', color: '#15803d' },
  canceled: { bg: '#fee2e2', color: '#b91c1c' },
  draft: { bg: '#f3f4f6', color: '#6b7280' },
}

function fmtDate(val) {
  if (!val) return '—'
  return new Date(val).toLocaleString()
}

export default function DetailsModal({ match, teams, referees, stadiums, onClose, onEdit, onDelete }) {
  const homeTeam = teams.find(t => t.id === match.home_team_id)
  const awayTeam = teams.find(t => t.id === match.away_team_id)
  const referee = referees.find(r => r.id === match.referee_id)
  const stadium = stadiums.find(s => s.id === match.stadium_id)

  const statusStyle = STATUS_COLORS[match.status] || STATUS_COLORS.draft

  return (
    <Modal
      title="Match Details"
      onClose={onClose}
      width={560}
      footer={
        <>
          <button data-testid="btn-edit" style={btn('primary')} onClick={onEdit}>Edit</button>
          <button data-testid="btn-delete" style={btn('danger')} onClick={onDelete}>Delete</button>
        </>
      }
    >
      <div style={row}>
        <span style={lbl}>Status</span>
        <span style={{ padding: '2px 10px', borderRadius: 12, fontSize: 12, background: statusStyle.bg, color: statusStyle.color }}>
          {match.status.charAt(0).toUpperCase() + match.status.slice(1)}
        </span>
      </div>

      <div style={row}>
        <span style={lbl}>Home Team</span>
        {homeTeam ? (
          <button style={linkBtn} onClick={() => window.open(`/teams?team=${homeTeam.id}`, '_blank')}>
            {homeTeam.name}
          </button>
        ) : <span style={{ color: '#9ca3af' }}>—</span>}
      </div>

      <div style={row}>
        <span style={lbl}>Away Team</span>
        {awayTeam ? (
          <button style={linkBtn} onClick={() => window.open(`/teams?team=${awayTeam.id}`, '_blank')}>
            {awayTeam.name}
          </button>
        ) : <span style={{ color: '#9ca3af' }}>—</span>}
      </div>

      <div style={row}>
        <span style={lbl}>Scheduled At</span>
        <span>{fmtDate(match.scheduled_at)}</span>
      </div>

      <div style={row}>
        <span style={lbl}>Referee</span>
        {referee ? (
          <button style={linkBtn} onClick={() => window.open('/referees', '_blank')}>
            {referee.first_name} {referee.last_name}
          </button>
        ) : <span style={{ color: '#9ca3af' }}>—</span>}
      </div>

      <div style={row}>
        <span style={lbl}>Stadium</span>
        {stadium ? (
          <button style={linkBtn} onClick={() => window.open('/stadiums', '_blank')}>
            {stadium.name}
          </button>
        ) : <span style={{ color: '#9ca3af' }}>—</span>}
      </div>

      {match.status === 'finished' && (
        <>
          <div style={row}>
            <span style={lbl}>Score</span>
            <span style={{ fontWeight: 600 }}>{match.home_score} – {match.away_score}</span>
          </div>
          <div style={row}>
            <span style={lbl}>Fair Play</span>
            <span>{match.home_fair_play} / {match.away_fair_play}</span>
          </div>
        </>
      )}

      <div style={row}>
        <span style={lbl}>Comments</span>
        <span style={{ whiteSpace: 'pre-wrap' }}>{match.comments || '—'}</span>
      </div>
    </Modal>
  )
}
