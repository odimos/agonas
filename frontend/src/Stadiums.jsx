import { useState, useEffect, useCallback } from 'react'
import { colors, s } from './styles'
import { PageHeader, StatCard } from './Buttons'
import { useLang } from './LangContext'
import DataTable from './DataTable'
import TableRow from './TableRow'
import ItemModal from './ItemModal'
import StadiumModalContent, { initStadiumForm } from './StadiumModalContent'
import CreateModal from './CreateModal'
import { fetchStadiums, updateStadium, deleteStadium } from './api/stadiums'

// ─── Column layout ────────────────────────────────────────────────────────────

const cols = {
  name:    { flex: '0 0 242px', padding: '0.875rem 0' },
  address: { flex: '0 0 302px', padding: '0.875rem 2rem' },
  cost:    { flex: 1,           padding: '0.875rem 2rem' },
}

// ─── Stadium Row ──────────────────────────────────────────────────────────────

function StadiumRow({ stadium, isFirst, onClick }) {
  return (
    <TableRow testId="stadium-row" isFirst={isFirst} onClick={onClick} borderOpacity="33">
      <div style={cols.name}>
        <p style={st.stadiumName}>{stadium.name}</p>
      </div>
      <div style={cols.address}>
        <p style={st.cellText}>{stadium.address}</p>
      </div>
      <div style={cols.cost}>
        <p style={st.costText}>{stadium.cost != null ? `€${stadium.cost}` : '—'}</p>
      </div>
    </TableRow>
  )
}

// ─── Stadiums Page ────────────────────────────────────────────────────────────

export default function Stadiums() {
  const { t } = useLang()
  const [stadiums, setStadiums] = useState([])
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
      setStadiums(await fetchStadiums('', ordering))
    } catch {
      setError('Failed to load stadiums')
    } finally {
      setLoading(false)
    }
  }, [ordering])

  useEffect(() => { load() }, [load])

  function openStadium(stadium) {
    setSelected(stadium)
    setSelectedForm(initStadiumForm(stadium))
  }

  async function handleSave() {
    if (!selected || !selectedForm) return
    await updateStadium(selected.id, {
      name:     selectedForm.name.trim(),
      phone:    selectedForm.phone.trim(),
      address:  selectedForm.address.trim(),
      email:    selectedForm.email    || '',
      cost:     selectedForm.cost     || null,
      map_url:  selectedForm.map_url  || '',
      comments: selectedForm.comments || null,
    })
    setSelected(null)
    load()
  }

  async function handleDelete() {
    if (!selected) return
    await deleteStadium(selected.id)
    setSelected(null)
    load()
  }

  function handleClose() {
    setSelected(null)
    setSelectedForm(null)
  }

  const COLUMNS = [
    { header: t('stadiums_col_name'),    style: cols.name    },
    { header: t('stadiums_col_address'), style: cols.address },
    { header: t('stadiums_col_cost'),    style: cols.cost    },
  ]

  return (
    <div style={s.entitiesPage}>
      <PageHeader title={t('stadiums_title')} addLabel={t('add_stadium')} onAdd={() => setCreating(true)} addTestId="add-stadium-btn" />
      <div style={{ alignSelf: 'flex-start' }}>
        <StatCard label={t('stadiums_active')} count={stadiums.length} />
      </div>
      {error && <p style={{ color: colors.error }}>{error}</p>}
      <DataTable
        columns={COLUMNS}
        rows={stadiums}
        renderRow={(row, isFirst) => (
          <StadiumRow key={row.id} stadium={row} isFirst={isFirst} onClick={() => openStadium(row)} />
        )}
        search={search}
        onSearch={setSearch}
        searchFields={['name']}
        ordering={ordering}
        onOrdering={setOrdering}
        loading={loading}
      />
      {selected && selectedForm && (
        <ItemModal
          title="Λεπτομέρειες Γηπέδου"
          subtitle={`ID: ${selected.id}`}
          maxWidth="896px"
          onClose={handleClose}
          onDelete={handleDelete}
          onSave={handleSave}
          onEditingChange={editing => { if (!editing) setSelectedForm(initStadiumForm(selected)) }}
        >
          {(editing) => (
            <StadiumModalContent form={selectedForm} setForm={setSelectedForm} editing={editing} stadiumId={selected.id} />
          )}
        </ItemModal>
      )}
      {creating && (
        <CreateModal
          type="stadium"
          onClose={() => setCreating(false)}
          onCreated={() => { setCreating(false); load() }}
        />
      )}
    </div>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const st = {
  stadiumName: { fontSize: '0.875rem', fontWeight: 700, color: colors.onSurface, margin: 0 },
  cellText:    { fontSize: '0.875rem', color: colors.onSurface, margin: 0 },
  costText:    { fontSize: '0.875rem', fontWeight: 600, color: colors.onSurface, margin: 0 },
}
