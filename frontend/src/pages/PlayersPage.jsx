import { useState, useEffect, useCallback } from 'react'
import { fetchPlayers } from '../api/players'
import AddPlayerModal from '../components/players/AddPlayerModal'
import DetailsModal from '../components/players/DetailsModal'
import EditPlayerModal from '../components/players/EditPlayerModal'
import DeleteModal from '../components/players/DeleteModal'

export default function PlayersPage() {
  const [players, setPlayers] = useState([])
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState(null)

  const load = useCallback(async () => {
    setPlayers(await fetchPlayers())
  }, [])

  useEffect(() => { load() }, [load])

  const term = search.toLowerCase()
  const visible = players.filter(p =>
    `${p.first_name} ${p.last_name}`.toLowerCase().includes(term)
  )

  const close = () => setModal(null)
  const afterSave = () => { close(); load() }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '28px 16px' }}>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
        <h2 style={{ margin: 0 }}>Players</h2>
        <button
          data-testid="add-player-btn"
          onClick={() => setModal({ type: 'add' })}
          style={{
            padding: '8px 16px', background: '#2563eb', color: '#fff',
            border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 14,
          }}
        >
          + Add Player
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
          display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 2fr',
          padding: '10px 14px', background: '#f9fafb',
          borderBottom: '1px solid #e5e7eb',
          fontSize: 12, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase',
        }}>
          <span>Name</span><span>Nickname</span><span>Phone</span><span>Email</span>
        </div>

        {visible.map(p => (
          <div
            key={p.id}
            data-testid="player-row"
            onClick={() => setModal({ type: 'details', player: p })}
            style={{
              display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 2fr',
              padding: '12px 14px', borderBottom: '1px solid #f3f4f6',
              cursor: 'pointer', fontSize: 14,
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#f0f9ff'}
            onMouseLeave={e => e.currentTarget.style.background = ''}
          >
            <span>{p.first_name} {p.last_name}</span>
            <span style={{ color: p.nickname ? '#111' : '#9ca3af' }}>{p.nickname || '—'}</span>
            <span style={{ color: p.phone ? '#111' : '#9ca3af' }}>{p.phone || '—'}</span>
            <span style={{ color: p.email ? '#111' : '#9ca3af' }}>{p.email || '—'}</span>
          </div>
        ))}

        {visible.length === 0 && (
          <p style={{ textAlign: 'center', padding: '24px 0', color: '#9ca3af', margin: 0, fontSize: 14 }}>
            No players found.
          </p>
        )}
      </div>

      {modal?.type === 'add' && (
        <AddPlayerModal onClose={close} onSave={afterSave} />
      )}
      {modal?.type === 'details' && (
        <DetailsModal
          player={modal.player}
          onClose={close}
          onEdit={() => setModal({ type: 'edit', player: modal.player })}
          onDelete={() => setModal({ type: 'delete', player: modal.player })}
        />
      )}
      {modal?.type === 'edit' && (
        <EditPlayerModal player={modal.player} onClose={close} onSave={afterSave} />
      )}
      {modal?.type === 'delete' && (
        <DeleteModal player={modal.player} onClose={close} onDelete={afterSave} />
      )}
    </div>
  )
}
