import { useState, useEffect, useCallback } from 'react'
import { fetchMatches } from '../api/matches'
import { fetchTeams } from '../api/teams'
import { fetchReferees } from '../api/referees'
import { fetchStadiums } from '../api/stadiums'
import { fetchPlayers } from '../api/players'
import AddMatchModal from '../components/matches/AddMatchModal'
import DetailsModal from '../components/matches/DetailsModal'
import EditMatchModal from '../components/matches/EditMatchModal'
import DeleteModal from '../components/matches/DeleteModal'

const STATUS_COLORS = {
  expected: { bg: '#dbeafe', color: '#1d4ed8' },
  finished: { bg: '#dcfce7', color: '#15803d' },
  canceled: { bg: '#fee2e2', color: '#b91c1c' },
  draft: { bg: '#f3f4f6', color: '#6b7280' },
}

function fmtDate(val) {
  if (!val) return '—'
  return new Date(val).toLocaleDateString()
}

export default function MatchesPage() {
  const [matches, setMatches] = useState([])
  const [teams, setTeams] = useState([])
  const [referees, setReferees] = useState([])
  const [stadiums, setStadiums] = useState([])
  const [players, setPlayers] = useState([])
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState(null)

  const load = useCallback(async () => {
    const [m, t, r, s, p] = await Promise.all([fetchMatches(), fetchTeams(), fetchReferees(), fetchStadiums(), fetchPlayers()])
    setMatches(m)
    setTeams(t)
    setReferees(r)
    setStadiums(s)
    setPlayers(p)
  }, [])

  useEffect(() => { load() }, [load])

  const term = search.toLowerCase()
  const visible = matches.filter(m => {
    const home = teams.find(t => t.id === m.home_team_id)
    const away = teams.find(t => t.id === m.away_team_id)
    const label = `${home?.name ?? ''} ${away?.name ?? ''}`.toLowerCase()
    return label.includes(term) || m.status.includes(term)
  })

  const findTeam = (id) => teams.find(t => t.id === id)

  const close = () => setModal(null)
  const afterSave = () => { close(); load() }

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: '28px 16px' }}>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
        <h2 style={{ margin: 0 }}>Matches</h2>
        <button
          data-testid="add-match-btn"
          onClick={() => setModal({ type: 'add' })}
          style={{
            padding: '8px 16px', background: '#2563eb', color: '#fff',
            border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 14,
          }}
        >
          + Add Match
        </button>
      </div>

      <input
        data-testid="search-input"
        type="text"
        placeholder="Search by team name…"
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{
          width: '100%', padding: '8px 10px', marginBottom: 16,
          border: '1px solid #d1d5db', borderRadius: 4,
          fontSize: 14, boxSizing: 'border-box',
        }}
      />

      <div style={{ border: '1px solid #e5e7eb', borderRadius: 6, overflow: 'hidden' }}>
        <div style={{
          display: 'grid', gridTemplateColumns: '3fr 1fr 2fr 1fr',
          padding: '10px 14px', background: '#f9fafb',
          borderBottom: '1px solid #e5e7eb',
          fontSize: 12, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase',
        }}>
          <span>Match</span><span>Status</span><span>Date</span><span>Score</span>
        </div>

        {visible.map(m => {
          const home = findTeam(m.home_team_id)
          const away = findTeam(m.away_team_id)
          const sc = STATUS_COLORS[m.status] || STATUS_COLORS.draft
          return (
            <div
              key={m.id}
              data-testid="match-row"
              onClick={() => setModal({ type: 'details', match: m })}
              style={{
                display: 'grid', gridTemplateColumns: '3fr 1fr 2fr 1fr',
                padding: '12px 14px', borderBottom: '1px solid #f3f4f6',
                cursor: 'pointer', fontSize: 14,
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#f0f9ff'}
              onMouseLeave={e => e.currentTarget.style.background = ''}
            >
              <span>
                {home && away
                  ? <><strong>{home.name}</strong> vs <strong>{away.name}</strong></>
                  : <span style={{ color: '#9ca3af' }}>— draft —</span>
                }
              </span>
              <span>
                <span style={{ padding: '2px 8px', borderRadius: 12, fontSize: 12, background: sc.bg, color: sc.color }}>
                  {m.status.charAt(0).toUpperCase() + m.status.slice(1)}
                </span>
              </span>
              <span style={{ color: m.scheduled_at ? '#111' : '#9ca3af' }}>{fmtDate(m.scheduled_at)}</span>
              <span style={{ color: m.status === 'finished' ? '#111' : '#9ca3af' }}>
                {m.status === 'finished' ? `${m.home_score} – ${m.away_score}` : '—'}
              </span>
            </div>
          )
        })}

        {visible.length === 0 && (
          <p style={{ textAlign: 'center', padding: '24px 0', color: '#9ca3af', margin: 0, fontSize: 14 }}>
            No matches found.
          </p>
        )}
      </div>

      {modal?.type === 'add' && (
        <AddMatchModal
          onClose={close} onSave={afterSave}
          teams={teams} referees={referees} stadiums={stadiums}
        />
      )}
      {modal?.type === 'details' && (
        <DetailsModal
          match={modal.match}
          teams={teams} referees={referees} stadiums={stadiums} players={players}
          onClose={close}
          onEdit={() => setModal({ type: 'edit', match: modal.match })}
          onDelete={() => setModal({ type: 'delete', match: modal.match })}
        />
      )}
      {modal?.type === 'edit' && (
        <EditMatchModal
          match={modal.match}
          onClose={close} onSave={afterSave}
          teams={teams} referees={referees} stadiums={stadiums}
        />
      )}
      {modal?.type === 'delete' && (
        <DeleteModal match={modal.match} teams={teams} onClose={close} onDelete={afterSave} />
      )}
    </div>
  )
}
