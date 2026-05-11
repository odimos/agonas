import { useState, useEffect, useCallback } from 'react'
import { colors, radius, s } from './styles'
import { PageHeader, StatCard } from './Buttons'
import { useLang } from './LangContext'
import DataTable from './DataTable'
import ItemModal from './ItemModal'
import PlayerModalContent, { initPlayerForm } from './PlayerModalContent'
import CreateModal from './CreateModal'
import { fetchPlayers, createPlayer, updatePlayer, deletePlayer } from './api/players'
import { fetchTeams } from './api/teams'

// ─── Column layout ────────────────────────────────────────────────────────────

const cols = {
  name:  { display: 'flex', alignItems: 'center', gap: '0.75rem', flex: '0 0 260px', padding: '0.75rem 0' },
  phone: { flex: '0 0 180px', padding: '0.75rem 1rem' },
  email: { flex: 1,           padding: '0.75rem 1rem' },
  team:  { flex: '0 0 180px', padding: '0.75rem 1rem' },
}

// ─── Player Row ───────────────────────────────────────────────────────────────

function PlayerRow({ player, isFirst, onClick, teamName }) {
  const [hovered, setHovered] = useState(false)
  const fullName = `${player.first_name} ${player.last_name}`
  return (
    <div
      data-testid="player-row"
      style={{
        display: 'flex',
        alignItems: 'center',
        borderTop: isFirst ? 'none' : `1px solid ${colors.outlineVariant}1a`,
        backgroundColor: hovered ? colors.surfaceContainerLow : 'transparent',
        transition: 'background-color 0.15s ease',
        cursor: 'pointer',
        padding: '0 1.5rem',
      }}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={cols.name}>
        <div>
          <p style={st.cellName}>{fullName}</p>
          {player.nickname && <p style={st.cellId}>{player.nickname}</p>}
        </div>
      </div>
      <div style={cols.phone}>
        <span style={st.cellMid}>{player.phone || '—'}</span>
      </div>
      <div style={cols.email}>
        <span style={st.cellMono}>{player.email || '—'}</span>
      </div>
      <div style={cols.team}>
        <span style={st.cellMid}>{teamName || '—'}</span>
      </div>
    </div>
  )
}

// ─── Players Page ─────────────────────────────────────────────────────────────

export default function Players() {
  const { t } = useLang()
  const [players, setPlayers] = useState([])
  const [teams, setTeams] = useState([])
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)
  const [selectedForm, setSelectedForm] = useState(null)
  const [creating, setCreating] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [ps, ts] = await Promise.all([fetchPlayers(search), fetchTeams()])
      setPlayers(ps)
      setTeams(ts)
    } catch {
      setError('Failed to load players')
    } finally {
      setLoading(false)
    }
  }, [search])

  useEffect(() => { load() }, [load])

  function openPlayer(player) {
    setSelected(player)
    setSelectedForm(initPlayerForm(player))
  }

  async function handleSave() {
    if (!selected || !selectedForm) return
    const payload = {
      first_name: selectedForm.firstName.trim(),
      last_name:  selectedForm.lastName.trim(),
      nickname:   selectedForm.nickname,
      phone:      selectedForm.phone,
      email:      selectedForm.email,
      team_id:    selectedForm.team_id ?? null,
      comments:   selectedForm.comments || null,
    }
    await updatePlayer(selected.id, payload)
    setSelected(null)
    load()
  }

  async function handleDelete() {
    if (!selected) return
    await deletePlayer(selected.id)
    setSelected(null)
    load()
  }

  function handleClose() {
    setSelected(null)
    setSelectedForm(null)
  }

  const teamMap = Object.fromEntries(teams.map(t => [t.id, t.name]))

  const COLUMNS = [
    { header: t('players_col_name'),  style: cols.name  },
    { header: t('players_col_phone'), style: cols.phone },
    { header: t('players_col_email'), style: cols.email },
    { header: t('modal_team_field'),  style: cols.team  },
  ]

  return (
    <div style={s.entitiesPage}>
      <PageHeader title={t('players_title')} addLabel={t('add_player')} onAdd={() => setCreating(true)} addTestId="add-player-btn" />
      <div style={{ display: 'flex', gap: '1rem' }}>
        <StatCard label={t('players_active')} count={players.length} />
      </div>
      {error && <p style={{ color: colors.error }}>{error}</p>}
      <DataTable
        columns={COLUMNS}
        rows={players}
        renderRow={(row, isFirst) => (
          <PlayerRow
            key={row.id}
            player={row}
            isFirst={isFirst}
            teamName={teamMap[row.team_id]}
            onClick={() => openPlayer(row)}
          />
        )}
        search={search}
        onSearch={setSearch}
        total={players.length}
        loading={loading}
      />
      {selected && selectedForm && (
        <ItemModal
          title="Λεπτομέρειες Παίκτη"
          subtitle={`ID: ${selected.id}`}
          onClose={handleClose}
          onDelete={handleDelete}
          onSave={handleSave}
          onEditingChange={editing => { if (!editing) setSelectedForm(initPlayerForm(selected)) }}
        >
          {(editing) => (
            <PlayerModalContent
              form={selectedForm}
              setForm={setSelectedForm}
              editing={editing}
              teams={teams}
            />
          )}
        </ItemModal>
      )}
      {creating && (
        <CreateModal
          type="player"
          teams={teams}
          onClose={() => setCreating(false)}
          onCreated={() => { setCreating(false); load() }}
        />
      )}
    </div>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const st = {
  cellName: { fontSize: '0.875rem', fontWeight: 600, color: colors.onSurface, margin: 0 },
  cellId:   { fontSize: '0.625rem', textTransform: 'uppercase', color: colors.onSurfaceVariant, margin: '2px 0 0', letterSpacing: '0.05em' },
  cellMid:  { fontSize: '0.875rem', fontWeight: 400, color: colors.onSurfaceVariant },
  cellMono: { fontSize: '0.8125rem', color: colors.onSurfaceVariant, fontFamily: 'monospace' },
}
