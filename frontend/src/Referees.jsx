import { useState, useEffect, useCallback } from 'react'
import { colors, radius, s } from './styles'
import { PageHeader, StatCard } from './Buttons'
import { useLang } from './LangContext'
import DataTable from './DataTable'
import TableRow from './TableRow'
import ItemModal from './ItemModal'
import RefereeModalContent, { initRefereeForm } from './RefereeModalContent'
import CreateModal from './CreateModal'
import { fetchReferees, updateReferee, deleteReferee } from './api/referees'

// ─── Column layout ────────────────────────────────────────────────────────────

const cols = {
  name:  { flex: '0 0 280px', padding: '0.875rem 0' },
  phone: { flex: '0 0 200px', padding: '0.875rem 1rem' },
  email: { flex: 1,           padding: '0.875rem 1rem' },
}

// ─── Referee Row ──────────────────────────────────────────────────────────────

function RefereeRow({ referee, isFirst, onClick }) {
  const fullName = `${referee.first_name} ${referee.last_name}`
  return (
    <TableRow testId="referee-row" isFirst={isFirst} onClick={onClick} borderOpacity="22">
      <div style={cols.name}>
        <span style={st.cellName}>{fullName}</span>
      </div>
      <div style={cols.phone}>
        <span style={st.cellMid}>{referee.phone || '—'}</span>
      </div>
      <div style={cols.email}>
        <span style={st.cellMono}>{referee.email || '—'}</span>
      </div>
    </TableRow>
  )
}

// ─── Referees Page ────────────────────────────────────────────────────────────

export default function Referees() {
  const { t } = useLang()
  const [referees, setReferees] = useState([])
  const [search, setSearch] = useState('')
  const [ordering, setOrdering] = useState('created_at')
  const [selected, setSelected] = useState(null)
  const [selectedForm, setSelectedForm] = useState(null)
  const [creating, setCreating] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setReferees(await fetchReferees(search, ordering))
    } catch {
      setError('Failed to load referees')
    } finally {
      setLoading(false)
    }
  }, [search, ordering])

  useEffect(() => { load() }, [load])

  function openReferee(referee) {
    setSelected(referee)
    setSelectedForm(initRefereeForm(referee))
  }

  async function handleSave() {
    if (!selected || !selectedForm) return
    await updateReferee(selected.id, {
      first_name: selectedForm.firstName.trim(),
      last_name:  selectedForm.lastName.trim(),
      phone:      selectedForm.phone.trim(),
      email:      selectedForm.email || '',
      comments:   selectedForm.comments || null,
    })
    setSelected(null)
    load()
  }

  async function handleDelete() {
    if (!selected) return
    await deleteReferee(selected.id)
    setSelected(null)
    load()
  }

  function handleClose() {
    setSelected(null)
    setSelectedForm(null)
  }

  const COLUMNS = [
    { header: t('referees_col_name'),  style: cols.name  },
    { header: t('referees_col_phone'), style: cols.phone },
    { header: t('referees_col_email'), style: cols.email },
  ]

  return (
    <div style={s.entitiesPage}>
      <PageHeader title={t('referees_title')} addLabel={t('add_referee')} onAdd={() => setCreating(true)} addTestId="add-referee-btn" />
      <div style={{ display: 'flex', gap: '1rem' }}>
        <StatCard label={t('referees_active')} count={referees.length} />
      </div>
      {error && <p style={{ color: colors.error }}>{error}</p>}
      <DataTable
        columns={COLUMNS}
        rows={referees}
        renderRow={(row, isFirst) => (
          <RefereeRow key={row.id} referee={row} isFirst={isFirst} onClick={() => openReferee(row)} />
        )}
        search={search}
        onSearch={setSearch}
        ordering={ordering}
        onOrdering={setOrdering}
        total={referees.length}
        loading={loading}
      />
      {selected && selectedForm && (
        <ItemModal
          title="Λεπτομέρειες Διαιτητή"
          subtitle={`ID: ${selected.id}`}
          onClose={handleClose}
          onDelete={handleDelete}
          onSave={handleSave}
          onEditingChange={editing => { if (!editing) setSelectedForm(initRefereeForm(selected)) }}
        >
          {(editing) => (
            <RefereeModalContent form={selectedForm} setForm={setSelectedForm} editing={editing} />
          )}
        </ItemModal>
      )}
      {creating && (
        <CreateModal
          type="referee"
          onClose={() => setCreating(false)}
          onCreated={() => { setCreating(false); load() }}
        />
      )}
    </div>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const st = {
  cellName: { fontSize: '0.875rem', fontWeight: 600, color: colors.onSurface },
  cellMid:  { fontSize: '0.875rem', fontWeight: 400, color: colors.onSurfaceVariant },
  cellMono: { fontSize: '0.8125rem', color: colors.onSurfaceVariant, fontFamily: 'monospace' },
}
