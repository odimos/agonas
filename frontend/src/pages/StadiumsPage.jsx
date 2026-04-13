import { useState, useEffect, useCallback } from 'react'
import { fetchStadiums } from '../api/stadiums'
import AddStadiumModal from '../components/stadiums/AddStadiumModal'
import DetailsModal from '../components/stadiums/DetailsModal'
import EditStadiumModal from '../components/stadiums/EditStadiumModal'
import DeleteModal from '../components/stadiums/DeleteModal'

export default function StadiumsPage() {
  const [stadiums, setStadiums] = useState([])
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState(null)

  const load = useCallback(async () => {
    setStadiums(await fetchStadiums())
  }, [])

  useEffect(() => { load() }, [load])

  const term = search.toLowerCase()
  const visible = stadiums.filter(s => s.name.toLowerCase().includes(term))

  const close = () => setModal(null)
  const afterSave = () => { close(); load() }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '28px 16px' }}>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
        <h2 style={{ margin: 0 }}>Stadiums</h2>
        <button
          data-testid="add-stadium-btn"
          onClick={() => setModal({ type: 'add' })}
          style={{
            padding: '8px 16px', background: '#2563eb', color: '#fff',
            border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 14,
          }}
        >
          + Add Stadium
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
          display: 'grid', gridTemplateColumns: '2fr 1fr 2fr 1fr',
          padding: '10px 14px', background: '#f9fafb',
          borderBottom: '1px solid #e5e7eb',
          fontSize: 12, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase',
        }}>
          <span>Name</span><span>Phone</span><span>Address</span><span>Cost</span>
        </div>

        {visible.map(s => (
          <div
            key={s.id}
            data-testid="stadium-row"
            onClick={() => setModal({ type: 'details', stadium: s })}
            style={{
              display: 'grid', gridTemplateColumns: '2fr 1fr 2fr 1fr',
              padding: '12px 14px', borderBottom: '1px solid #f3f4f6',
              cursor: 'pointer', fontSize: 14,
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#f0f9ff'}
            onMouseLeave={e => e.currentTarget.style.background = ''}
          >
            <span>{s.name}</span>
            <span>{s.phone}</span>
            <span>{s.address || '—'}</span>
            <span style={{ color: s.cost != null ? '#111' : '#9ca3af' }}>{s.cost != null ? `€${s.cost}` : '—'}</span>
          </div>
        ))}

        {visible.length === 0 && (
          <p style={{ textAlign: 'center', padding: '24px 0', color: '#9ca3af', margin: 0, fontSize: 14 }}>
            No stadiums found.
          </p>
        )}
      </div>

      {modal?.type === 'add' && (
        <AddStadiumModal onClose={close} onSave={afterSave} />
      )}
      {modal?.type === 'details' && (
        <DetailsModal
          stadium={modal.stadium}
          onClose={close}
          onEdit={() => setModal({ type: 'edit', stadium: modal.stadium })}
          onDelete={() => setModal({ type: 'delete', stadium: modal.stadium })}
        />
      )}
      {modal?.type === 'edit' && (
        <EditStadiumModal stadium={modal.stadium} onClose={close} onSave={afterSave} />
      )}
      {modal?.type === 'delete' && (
        <DeleteModal stadium={modal.stadium} onClose={close} onDelete={afterSave} />
      )}
    </div>
  )
}
