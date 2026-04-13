import { useState, useEffect, useCallback } from 'react'
import { fetchReferees } from '../api/referees'
import AddRefereeModal from '../components/referees/AddRefereeModal'
import DetailsModal from '../components/referees/DetailsModal'
import EditRefereeModal from '../components/referees/EditRefereeModal'
import DeleteModal from '../components/referees/DeleteModal'

export default function RefereesPage() {
  const [referees, setReferees] = useState([])
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState(null) // null | { type, referee? }

  const load = useCallback(async () => {
    setReferees(await fetchReferees())
  }, [])

  useEffect(() => { load() }, [load])

  const term = search.toLowerCase()
  const visible = referees.filter(r =>
    `${r.first_name} ${r.last_name}`.toLowerCase().includes(term)
  )

  const close = () => setModal(null)
  const afterSave = () => { close(); load() }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '28px 16px' }}>

      {/* header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
        <h2 style={{ margin: 0 }}>Referees</h2>
        <button
          data-testid="add-referee-btn"
          onClick={() => setModal({ type: 'add' })}
          style={{
            padding: '8px 16px', background: '#2563eb', color: '#fff',
            border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 14,
          }}
        >
          + Add Referee
        </button>
      </div>

      {/* search */}
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

      {/* list */}
      <div style={{ border: '1px solid #e5e7eb', borderRadius: 6, overflow: 'hidden' }}>
        {/* column headers */}
        <div style={{
          display: 'grid', gridTemplateColumns: '2fr 1fr 2fr',
          padding: '10px 14px', background: '#f9fafb',
          borderBottom: '1px solid #e5e7eb',
          fontSize: 12, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase',
        }}>
          <span>Name</span><span>Phone</span><span>Email</span>
        </div>

        {visible.map(r => (
          <div
            key={r.id}
            data-testid="referee-row"
            onClick={() => setModal({ type: 'details', referee: r })}
            style={{
              display: 'grid', gridTemplateColumns: '2fr 1fr 2fr',
              padding: '12px 14px', borderBottom: '1px solid #f3f4f6',
              cursor: 'pointer', fontSize: 14,
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#f0f9ff'}
            onMouseLeave={e => e.currentTarget.style.background = ''}
          >
            <span>{r.first_name} {r.last_name}</span>
            <span>{r.phone}</span>
            <span style={{ color: r.email ? '#111' : '#9ca3af' }}>{r.email || '—'}</span>
          </div>
        ))}

        {visible.length === 0 && (
          <p style={{ textAlign: 'center', padding: '24px 0', color: '#9ca3af', margin: 0, fontSize: 14 }}>
            No referees found.
          </p>
        )}
      </div>

      {/* modals */}
      {modal?.type === 'add' && (
        <AddRefereeModal onClose={close} onSave={afterSave} />
      )}
      {modal?.type === 'details' && (
        <DetailsModal
          referee={modal.referee}
          onClose={close}
          onEdit={() => setModal({ type: 'edit', referee: modal.referee })}
          onDelete={() => setModal({ type: 'delete', referee: modal.referee })}
        />
      )}
      {modal?.type === 'edit' && (
        <EditRefereeModal referee={modal.referee} onClose={close} onSave={afterSave} />
      )}
      {modal?.type === 'delete' && (
        <DeleteModal referee={modal.referee} onClose={close} onDelete={afterSave} />
      )}
    </div>
  )
}
