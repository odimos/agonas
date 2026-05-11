import { useState, useEffect, useCallback } from 'react'
import { colors, radius, s } from './styles'
import { PageHeader, StatCard } from './Buttons'
import DataTable from './DataTable'
import ItemModal from './ItemModal'
import TeamModalContent, { initTeamForm } from './TeamModalContent'
import CreateModal from './CreateModal'
import { useLang } from './LangContext'
import TableRow from './TableRow'
import { fetchTeams, updateTeam, deleteTeam } from './api/teams'
import { fetchPlayers, updatePlayer } from './api/players'

// ─── Column layout ────────────────────────────────────────────────────────────

const cols = {
  name:    { display: 'flex', alignItems: 'center', gap: '0.875rem', flex: '0 0 280px', padding: '0.875rem 0' },
  captain: { flex: '0 0 200px', padding: '0.875rem 1rem' },
  players: { flex: '0 0 100px', padding: '0.875rem 1rem' },
  status:  { flex: '0 0 140px', padding: '0.875rem 1rem' },
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

const STATUS_STYLES = {
  true:  { backgroundColor: colors.secondaryContainer, color: colors.onSecondaryContainer },
  false: { backgroundColor: colors.surfaceVariant,     color: colors.onSurfaceVariant },
}

function StatusBadge({ isActive }) {
  const { t } = useLang()
  const label = isActive ? 'ΕΝΕΡΓΗ' : 'ΑΝΕΝΕΡΓΗ'
  return (
    <span style={{ ...st.badge, ...(STATUS_STYLES[isActive] ?? STATUS_STYLES[false]) }}>
      {t(label)}
    </span>
  )
}

// ─── Team Row ─────────────────────────────────────────────────────────────────

function TeamRow({ team, captainName, playerCount, isFirst, onClick }) {
  return (
    <TableRow testId="team-row" isFirst={isFirst} onClick={onClick} borderOpacity="33">
      <div style={cols.name}>
        <div style={st.thumb}>
          <span className="material-symbols-outlined" style={{ fontSize: '1.25rem', color: colors.onSurfaceVariant }}>groups</span>
        </div>
        <span style={st.cellName}>{team.name}</span>
      </div>
      <div style={cols.captain}>
        <span style={st.cellMid}>{captainName || '—'}</span>
      </div>
      <div style={cols.players}>
        <span style={st.cellMid}>{playerCount}</span>
      </div>
      <div style={cols.status}>
        <StatusBadge isActive={team.is_active} />
      </div>
    </TableRow>
  )
}

// ─── Teams ────────────────────────────────────────────────────────────────────

export default function Teams() {
  const { t } = useLang()
  const [teams, setTeams] = useState([])
  const [allPlayers, setAllPlayers] = useState([])
  const [search, setSearch] = useState('')
  const [ordering, setOrdering] = useState('created_at')
  const [selected, setSelected] = useState(null)
  const [selectedForm, setSelectedForm] = useState(null)
  const [selectedPlayers, setSelectedPlayers] = useState([])
  const [creating, setCreating] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [ts, ps] = await Promise.all([fetchTeams(search, ordering), fetchPlayers()])
      setTeams(ts)
      setAllPlayers(ps)
    } catch {
      setError('Failed to load teams')
    } finally {
      setLoading(false)
    }
  }, [search, ordering])

  useEffect(() => { load() }, [load])

  async function openTeam(team) {
    setSelected(team)
    setSelectedForm(initTeamForm(team))
    // fetch players belonging to this team
    try {
      const ps = await fetchPlayers('', team.id)
      setSelectedPlayers(ps)
    } catch {
      setSelectedPlayers([])
    }
  }

  async function handleAddPlayer(playerId) {
    const player = allPlayers.find(p => p.id === playerId)
    if (!player || !selected) return
    await updatePlayer(playerId, {
      first_name: player.first_name,
      last_name:  player.last_name,
      nickname:   player.nickname,
      phone:      player.phone,
      email:      player.email,
      comments:   player.comments ?? null,
      team_id:    selected.id,
    })
    const ps = await fetchPlayers('', selected.id)
    setSelectedPlayers(ps)
    // refresh allPlayers so the list and available players update
    const all = await fetchPlayers()
    setAllPlayers(all)
  }

  async function handleRemovePlayer(player) {
    await updatePlayer(player.id, {
      first_name: player.first_name,
      last_name:  player.last_name,
      nickname:   player.nickname,
      phone:      player.phone,
      email:      player.email,
      comments:   player.comments ?? null,
      team_id:    null,
    })
    const ps = await fetchPlayers('', selected.id)
    setSelectedPlayers(ps)
    const all = await fetchPlayers()
    setAllPlayers(all)
  }

  async function handleSave() {
    if (!selected || !selectedForm) return
    await updateTeam(selected.id, {
      name:            selectedForm.name.trim(),
      is_active:       selectedForm.is_active,
      captain_id:      selectedForm.captain_id ?? null,
      vice_captain_id: selectedForm.vice_captain_id ?? null,
      comments:        selectedForm.comments || null,
    })
    setSelected(null)
    load()
  }

  async function handleDelete() {
    if (!selected) return
    await deleteTeam(selected.id)
    setSelected(null)
    load()
  }

  function handleClose() {
    setSelected(null)
    setSelectedForm(null)
    setSelectedPlayers([])
  }

  // players with no team assigned — available to be added to the selected team
  const availablePlayers = allPlayers.filter(p => p.team_id === null || p.team_id === undefined)

  // build lookup maps
  const playerMap = Object.fromEntries(allPlayers.map(p => [p.id, p]))
  const playerCountByTeam = allPlayers.reduce((acc, p) => {
    if (p.team_id) acc[p.team_id] = (acc[p.team_id] ?? 0) + 1
    return acc
  }, {})

  const activeCount = teams.filter(t => t.is_active).length

  const COLUMNS = [
    { header: t('teams_col_name'),    style: cols.name    },
    { header: t('teams_col_captain'), style: cols.captain },
    { header: t('modal_players_label'), style: cols.players },
    { header: t('teams_col_status'),  style: cols.status  },
  ]

  return (
    <div style={s.entitiesPage}>
      <PageHeader title={t('teams_title')} addLabel={t('add_team')} onAdd={() => setCreating(true)} addTestId="add-team-btn" />
      <div style={st.statsGrid}>
        <StatCard label={t('teams_active')} count={activeCount} />
      </div>
      {error && <p style={{ color: colors.error }}>{error}</p>}
      <DataTable
        columns={COLUMNS}
        rows={teams}
        renderRow={(row, isFirst) => {
          const cap = row.captain_id ? playerMap[row.captain_id] : null
          const captainName = cap ? `${cap.first_name} ${cap.last_name}` : null
          return (
            <TeamRow
              key={row.id}
              team={row}
              captainName={captainName}
              playerCount={playerCountByTeam[row.id] ?? 0}
              isFirst={isFirst}
              onClick={() => openTeam(row)}
            />
          )
        }}
        search={search}
        onSearch={setSearch}
        ordering={ordering}
        onOrdering={setOrdering}
        total={teams.length}
        loading={loading}
      />
      {selected && selectedForm && (
        <ItemModal
          title="Λεπτομέρειες Ομάδας"
          subtitle={`ID: ${selected.id} · ${selected.name}`}
          onClose={handleClose}
          onDelete={handleDelete}
          onSave={handleSave}
          onEditingChange={editing => { if (!editing) setSelectedForm(initTeamForm(selected)) }}
        >
          {(editing) => (
            <TeamModalContent
              form={selectedForm}
              setForm={setSelectedForm}
              editing={editing}
              players={selectedPlayers}
              availablePlayers={availablePlayers}
              onAddPlayer={handleAddPlayer}
              onRemovePlayer={handleRemovePlayer}
            />
          )}
        </ItemModal>
      )}
      {creating && (
        <CreateModal
          type="team"
          onClose={() => setCreating(false)}
          onCreated={() => { setCreating(false); load() }}
        />
      )}
    </div>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const st = {
  statsGrid: { display: 'flex', gap: '1rem' },
  thumb: {
    width: '2.5rem',
    height: '2.5rem',
    borderRadius: radius.DEFAULT,
    overflow: 'hidden',
    backgroundColor: colors.surfaceContainerHigh,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  cellName: { fontSize: '0.875rem', fontWeight: 700, color: colors.onSurface },
  cellMid:  { fontSize: '0.875rem', fontWeight: 400, color: colors.onSurface },
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '0.1875rem 0.5rem',
    borderRadius: radius.DEFAULT,
    fontSize: '0.6875rem',
    fontWeight: 700,
    letterSpacing: '0.04em',
  },
}
