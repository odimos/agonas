import { useState, useEffect, useCallback } from 'react'
import { fetchTeams } from '../api/teams'
import { fetchPlayers } from '../api/players'
import AddTeamModal from '../components/teams/AddTeamModal'
import DetailsModal from '../components/teams/DetailsModal'
import EditTeamModal from '../components/teams/EditTeamModal'
import DeleteModal from '../components/teams/DeleteModal'

export default function TeamsPage() {
  const [teams, setTeams] = useState([])
  const [players, setPlayers] = useState([])
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState(null)

  const load = useCallback(async () => {
    const [t, p] = await Promise.all([fetchTeams(), fetchPlayers()])
    setTeams(t)
    setPlayers(p)
    return t
  }, [])

  useEffect(() => {
    load().then(t => {
      const params = new URLSearchParams(window.location.search)
      const teamId = parseInt(params.get('team'), 10)
      if (teamId) {
        const found = t.find(x => x.id === teamId)
        if (found) setModal({ type: 'details', team: found })
      }
    })
  }, [load])

  const term = search.toLowerCase()
  const visible = teams.filter(t => t.name.toLowerCase().includes(term))

  const close = () => setModal(null)
  const afterSave = () => { close(); load() }

  const findPlayer = (id) => {
    if (!id) return '—'
    const p = players.find(p => p.id === id)
    return p ? `${p.first_name} ${p.last_name}` : '—'
  }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '28px 16px' }}>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
        <h2 style={{ margin: 0 }}>Teams</h2>
        <button
          data-testid="add-team-btn"
          onClick={() => setModal({ type: 'add' })}
          style={{
            padding: '8px 16px', background: '#2563eb', color: '#fff',
            border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 14,
          }}
        >
          + Add Team
        </button>
      </div>

      <input
        data-testid="search-input"
        type="text"
        placeholder="Search by name…"
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
          display: 'grid', gridTemplateColumns: '2fr 1fr 2fr',
          padding: '10px 14px', background: '#f9fafb',
          borderBottom: '1px solid #e5e7eb',
          fontSize: 12, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase',
        }}>
          <span>Name</span><span>Status</span><span>Captain</span>
        </div>

        {visible.map(t => (
          <div
            key={t.id}
            data-testid="team-row"
            onClick={() => setModal({ type: 'details', team: t })}
            style={{
              display: 'grid', gridTemplateColumns: '2fr 1fr 2fr',
              padding: '12px 14px', borderBottom: '1px solid #f3f4f6',
              cursor: 'pointer', fontSize: 14,
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#f0f9ff'}
            onMouseLeave={e => e.currentTarget.style.background = ''}
          >
            <span>{t.name}</span>
            <span style={{
              display: 'inline-block', padding: '2px 8px', borderRadius: 12, fontSize: 12,
              background: t.is_active ? '#dcfce7' : '#f3f4f6',
              color: t.is_active ? '#16a34a' : '#6b7280',
            }}>
              {t.is_active ? 'Active' : 'Inactive'}
            </span>
            <span style={{ color: t.captain_id ? '#111' : '#9ca3af' }}>{findPlayer(t.captain_id)}</span>
          </div>
        ))}

        {visible.length === 0 && (
          <p style={{ textAlign: 'center', padding: '24px 0', color: '#9ca3af', margin: 0, fontSize: 14 }}>
            No teams found.
          </p>
        )}
      </div>

      {modal?.type === 'add' && (
        <AddTeamModal onClose={close} onSave={afterSave} />
      )}
      {modal?.type === 'details' && (
        <DetailsModal
          team={modal.team}
          players={players}
          onClose={close}
          onEdit={() => setModal({ type: 'edit', team: modal.team })}
          onDelete={() => setModal({ type: 'delete', team: modal.team })}
          onPlayerRemoved={load}
        />
      )}
      {modal?.type === 'edit' && (
        <EditTeamModal team={modal.team} onClose={close} onSave={afterSave} />
      )}
      {modal?.type === 'delete' && (
        <DeleteModal team={modal.team} onClose={close} onDelete={afterSave} />
      )}
    </div>
  )
}
