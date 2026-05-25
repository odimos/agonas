import { useState, useEffect, useCallback } from 'react'
import { colors, fonts, radius, s } from './styles'
import { PageHeader, StatCard } from './Buttons'
import { useLang } from './LangContext'
import DataTable from './DataTable'
import TableRow from './TableRow'
import { fetchUsers, createUser, updateUser, deleteUser } from './api/users'
import { fetchPlayers } from './api/players'
import { fetchReferees } from './api/referees'

const ROLE_META = {
  player:       { label: 'Παίκτης' },
  captain:      { label: 'Αρχηγός' },
  vice_captain: { label: 'Υπαρχηγός' },
  referee:      { label: 'Διαιτητής' },
}
const ROLE_COLOR = colors.tertiary

const cols = {
  username: { flex: '0 0 180px', padding: '0.875rem 0' },
  roles:    { flex: 1,           padding: '0.875rem 1rem' },
  phone:    { flex: '0 0 160px', padding: '0.875rem 1rem' },
  email:    { flex: '0 0 240px', padding: '0.875rem 1rem' },
  actions:  { flex: '0 0 80px',  padding: '0.875rem 1rem', textAlign: 'right' },
}

function RoleChips({ roles }) {
  if (!roles || roles.length === 0) {
    return <span style={{ fontSize: '0.75rem', color: colors.outline, fontStyle: 'italic' }}>—</span>
  }
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
      {roles.map(r => {
        const meta = ROLE_META[r] ?? { label: r }
        return (
          <span key={r} style={{
            display: 'inline-flex', alignItems: 'center',
            padding: '0.125rem 0.5rem', borderRadius: radius.DEFAULT,
            fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.04em',
            color: ROLE_COLOR, border: `1px solid ${ROLE_COLOR}55`,
            backgroundColor: `${ROLE_COLOR}11`,
          }}>{meta.label}</span>
        )
      })}
    </div>
  )
}

function UserRow({ user, isFirst, onClick }) {
  return (
    <TableRow testId="user-row" isFirst={isFirst} onClick={onClick} borderOpacity="22">
      <div style={cols.username}><span style={st.cellName}>{user.username}</span></div>
      <div style={cols.roles}><RoleChips roles={user.roles} /></div>
      <div style={cols.phone}><span style={st.cellMid}>{user.phone || '—'}</span></div>
      <div style={cols.email}><span style={st.cellMono}>{user.email || '—'}</span></div>
      <div style={cols.actions}>{/* spacer; actions live in modal */}</div>
    </TableRow>
  )
}

function DetailRow({ label, value }) {
  return (
    <div style={st.detailRow}>
      <span style={st.detailLabel}>{label}</span>
      <span style={st.detailValue}>{value ?? '—'}</span>
    </div>
  )
}

function UserDetailModal({ user, players, referees, onClose, onDelete, onSaved }) {
  const [editing, setEditing] = useState(false)
  const [isPlayer, setIsPlayer]   = useState(!!user.player_id)
  const [isReferee, setIsReferee] = useState(!!user.referee_id)
  const [playerId, setPlayerId]   = useState(user.player_id ?? '')
  const [refereeId, setRefereeId] = useState(user.referee_id ?? '')
  const [saving, setSaving] = useState(false)
  const [error, setError]   = useState('')

  function cancelEdit() {
    setIsPlayer(!!user.player_id)
    setIsReferee(!!user.referee_id)
    setPlayerId(user.player_id ?? '')
    setRefereeId(user.referee_id ?? '')
    setError('')
    setEditing(false)
  }

  async function handleSave() {
    if (!isPlayer && !isReferee) { setError('Επιλέξτε τουλάχιστον έναν ρόλο.'); return }
    if (isPlayer && !playerId)   { setError('Επιλέξτε παίκτη.'); return }
    if (isReferee && !refereeId) { setError('Επιλέξτε διαιτητή.'); return }
    setSaving(true)
    setError('')
    try {
      const updated = await updateUser(user.id, {
        player_id:  isPlayer  ? Number(playerId)  : null,
        referee_id: isReferee ? Number(refereeId) : null,
      })
      onSaved(updated)
      setEditing(false)
    } catch (e) {
      setError(e?.detail ?? 'Σφάλμα αποθήκευσης.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={ms.overlay} onClick={onClose}>
      <div style={ms.modal} onClick={e => e.stopPropagation()}>
        <div style={ms.header}>
          <div>
            <h2 style={ms.title}>{user.username}</h2>
            <p style={ms.subtitle}>ID: {user.id}</p>
          </div>
          <button style={ms.closeBtn} onClick={onClose}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div style={ms.body}>
          {!editing ? (
            <>
              <div>
                <label style={st.sectionLabel}>Ρόλοι</label>
                <RoleChips roles={user.roles} />
              </div>

              {user.player_id && (
                <div>
                  <label style={st.sectionLabel}>Στοιχεία Παίκτη</label>
                  <DetailRow label="Όνομα" value={user.player_name} />
                  <DetailRow label="ID Παίκτη" value={user.player_id} />
                  <DetailRow label="Ομάδα" value={user.team_name} />
                </div>
              )}

              {(user.captain_team_id || user.vice_team_id) && (
                <div>
                  <label style={st.sectionLabel}>Ομαδικοί Ρόλοι</label>
                  {user.captain_team_id && <DetailRow label="Αρχηγός" value={user.captain_team_name} />}
                  {user.vice_team_id && <DetailRow label="Υπαρχηγός" value={user.vice_team_name} />}
                </div>
              )}

              {user.referee_id && (
                <div>
                  <label style={st.sectionLabel}>Στοιχεία Διαιτητή</label>
                  <DetailRow label="Όνομα" value={user.referee_name} />
                  <DetailRow label="ID Διαιτητή" value={user.referee_id} />
                </div>
              )}

              <div>
                <label style={st.sectionLabel}>Επικοινωνία</label>
                <DetailRow label="Τηλέφωνο" value={user.phone} />
                <DetailRow label="Email" value={user.email} />
              </div>

              {user.bio && (
                <div>
                  <label style={st.sectionLabel}>Bio</label>
                  <p style={{ fontSize: '0.875rem', color: colors.onSurface, margin: 0 }}>{user.bio}</p>
                </div>
              )}
            </>
          ) : (
            <div style={st.field}>
              <label style={st.sectionLabel}>Ρόλοι</label>

              <label style={st.checkRow}>
                <input type="checkbox" checked={isPlayer} onChange={e => { setIsPlayer(e.target.checked); if (!e.target.checked) setPlayerId('') }} />
                <span>Παίκτης</span>
              </label>
              {isPlayer && (
                <select style={{ ...st.input, marginTop: '0.375rem' }} value={playerId} onChange={e => setPlayerId(e.target.value)}>
                  <option value="">— Επιλέξτε παίκτη —</option>
                  {players.map(p => (
                    <option key={p.id} value={p.id}>{p.first_name} {p.last_name}</option>
                  ))}
                </select>
              )}

              <label style={{ ...st.checkRow, marginTop: '0.75rem' }}>
                <input type="checkbox" checked={isReferee} onChange={e => { setIsReferee(e.target.checked); if (!e.target.checked) setRefereeId('') }} />
                <span>Διαιτητής</span>
              </label>
              {isReferee && (
                <select style={{ ...st.input, marginTop: '0.375rem' }} value={refereeId} onChange={e => setRefereeId(e.target.value)}>
                  <option value="">— Επιλέξτε διαιτητή —</option>
                  {referees.map(r => (
                    <option key={r.id} value={r.id}>{r.first_name} {r.last_name}</option>
                  ))}
                </select>
              )}

              <p style={{ marginTop: '0.75rem', fontSize: '0.75rem', color: colors.outline, fontStyle: 'italic' }}>
                Αρχηγός / Υπαρχηγός ορίζονται από την ομάδα και δεν αλλάζουν εδώ.
              </p>

              {error && <p style={{ margin: '0.5rem 0 0', fontSize: '0.8125rem', color: colors.error }}>{error}</p>}
            </div>
          )}
        </div>

        <div style={ms.footer}>
          {!editing ? (
            <>
              <button style={ms.deleteBtn} onClick={onDelete}>
                <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>delete</span>
                Διαγραφή
              </button>
              <button style={ms.cancelBtn} onClick={onClose}>Κλείσιμο</button>
              <button style={ms.okBtn} onClick={() => setEditing(true)}>
                <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>edit</span>
                Επεξεργασία
              </button>
            </>
          ) : (
            <>
              <button style={ms.cancelBtn} onClick={cancelEdit} disabled={saving}>Ακύρωση</button>
              <button style={ms.okBtn} onClick={handleSave} disabled={saving}>
                {saving ? '...' : 'Αποθήκευση'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function ConfirmDeleteModal({ user, onCancel, onConfirm }) {
  return (
    <div style={ms.overlay} onClick={onCancel}>
      <div style={{ ...ms.modal, width: '22rem' }} onClick={e => e.stopPropagation()}>
        <h2 style={ms.title}>Διαγραφή χρήστη</h2>
        <p style={{ fontSize: '0.875rem', color: colors.onSurface, margin: 0 }}>
          Είστε σίγουρος ότι θέλετε να διαγράψετε τον χρήστη <strong>{user.username}</strong>; Η ενέργεια δεν αναιρείται.
        </p>
        <div style={ms.footer}>
          <button style={ms.cancelBtn} onClick={onCancel}>Ακύρωση</button>
          <button style={ms.deleteBtn} onClick={onConfirm}>Διαγραφή</button>
        </div>
      </div>
    </div>
  )
}

function CreateUserModal({ players, referees, onClose, onCreated }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isPlayer, setIsPlayer] = useState(false)
  const [isReferee, setIsReferee] = useState(false)
  const [playerId, setPlayerId] = useState('')
  const [refereeId, setRefereeId] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit() {
    if (!username.trim() || !password.trim()) { setError('Username και password είναι υποχρεωτικά.'); return }
    if (!isPlayer && !isReferee) { setError('Επιλέξτε τουλάχιστον έναν ρόλο.'); return }
    if (isPlayer && !playerId) { setError('Επιλέξτε παίκτη.'); return }
    if (isReferee && !refereeId) { setError('Επιλέξτε διαιτητή.'); return }
    setSaving(true)
    setError('')
    try {
      await createUser({
        username: username.trim(),
        password: password.trim(),
        player_id:  isPlayer  ? Number(playerId)  : null,
        referee_id: isReferee ? Number(refereeId) : null,
      })
      onCreated()
    } catch (e) {
      setError(e?.detail ?? 'Σφάλμα δημιουργίας.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={ms.overlay} onClick={onClose}>
      <div style={ms.modal} onClick={e => e.stopPropagation()}>
        <h2 style={ms.title}>Νέος Χρήστης</h2>

        <div style={st.field}>
          <label style={st.fieldLabel}>Username</label>
          <input style={st.input} value={username} onChange={e => setUsername(e.target.value)} />
        </div>

        <div style={st.field}>
          <label style={st.fieldLabel}>Password</label>
          <input style={st.input} type="password" value={password} onChange={e => setPassword(e.target.value)} />
        </div>

        <div style={st.field}>
          <label style={st.fieldLabel}>Ρόλοι</label>

          <label style={st.checkRow}>
            <input type="checkbox" checked={isPlayer} onChange={e => { setIsPlayer(e.target.checked); if (!e.target.checked) setPlayerId('') }} />
            <span>Παίκτης</span>
          </label>
          {isPlayer && (
            <select style={{ ...st.input, marginTop: '0.375rem' }} value={playerId} onChange={e => setPlayerId(e.target.value)}>
              <option value="">— Επιλέξτε παίκτη —</option>
              {players.map(p => (
                <option key={p.id} value={p.id}>{p.first_name} {p.last_name}</option>
              ))}
            </select>
          )}

          <label style={{ ...st.checkRow, marginTop: '0.5rem' }}>
            <input type="checkbox" checked={isReferee} onChange={e => { setIsReferee(e.target.checked); if (!e.target.checked) setRefereeId('') }} />
            <span>Διαιτητής</span>
          </label>
          {isReferee && (
            <select style={{ ...st.input, marginTop: '0.375rem' }} value={refereeId} onChange={e => setRefereeId(e.target.value)}>
              <option value="">— Επιλέξτε διαιτητή —</option>
              {referees.map(r => (
                <option key={r.id} value={r.id}>{r.first_name} {r.last_name}</option>
              ))}
            </select>
          )}
        </div>

        {error && <p style={{ margin: 0, fontSize: '0.8125rem', color: colors.error }}>{error}</p>}

        <div style={ms.footer}>
          <button style={ms.cancelBtn} onClick={onClose}>Ακύρωση</button>
          <button style={ms.okBtn} onClick={handleSubmit} disabled={saving}>
            {saving ? '...' : 'Δημιουργία'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Users() {
  const { t } = useLang()
  const [users, setUsers] = useState([])
  const [players, setPlayers] = useState([])
  const [referees, setReferees] = useState([])
  const [search, setSearch] = useState('')
  const [ordering, setOrdering] = useState('username')
  const [creating, setCreating] = useState(false)
  const [selected, setSelected] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [us, ps, rs] = await Promise.all([fetchUsers(), fetchPlayers(), fetchReferees()])
      setUsers(us)
      setPlayers(ps)
      setReferees(rs)
    } catch {
      setError('Failed to load users')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  async function handleConfirmDelete() {
    const u = confirmDelete
    setConfirmDelete(null)
    setSelected(null)
    await deleteUser(u.id)
    load()
  }

  const COLUMNS = [
    { header: 'USERNAME',  style: cols.username },
    { header: 'ΡΟΛΟΙ',     style: cols.roles },
    { header: 'ΤΗΛΕΦΩΝΟ', style: cols.phone },
    { header: 'EMAIL',     style: cols.email },
    { header: '',          style: cols.actions },
  ]

  return (
    <div style={s.entitiesPage}>
      <PageHeader title="Χρήστες" addLabel="Προσθήκη Χρήστη" onAdd={() => setCreating(true)} addTestId="add-user-btn" />
      <div style={{ display: 'flex', gap: '1rem' }}>
        <StatCard label="ΕΓΓΕΓΡΑΜΜΕΝΟΙ ΧΡΗΣΤΕΣ" count={users.length} />
      </div>
      {error && <p style={{ color: colors.error }}>{error}</p>}
      <DataTable
        columns={COLUMNS}
        rows={users}
        renderRow={(row, isFirst) => (
          <UserRow key={row.id} user={row} isFirst={isFirst} onClick={() => setSelected(row)} />
        )}
        search={search}
        onSearch={setSearch}
        searchFields={['username', 'player_name', 'referee_name', 'email']}
        ordering={ordering}
        onOrdering={setOrdering}
        loading={loading}
      />
      {selected && (
        <UserDetailModal
          user={selected}
          players={players}
          referees={referees}
          onClose={() => setSelected(null)}
          onDelete={() => setConfirmDelete(selected)}
          onSaved={updated => { setSelected(updated); load() }}
        />
      )}
      {confirmDelete && (
        <ConfirmDeleteModal
          user={confirmDelete}
          onCancel={() => setConfirmDelete(null)}
          onConfirm={handleConfirmDelete}
        />
      )}
      {creating && (
        <CreateUserModal
          players={players}
          referees={referees}
          onClose={() => setCreating(false)}
          onCreated={() => { setCreating(false); load() }}
        />
      )}
    </div>
  )
}

const st = {
  cellName: { fontSize: '0.875rem', fontWeight: 600, color: colors.onSurface },
  cellMid:  { fontSize: '0.875rem', fontWeight: 400, color: colors.onSurfaceVariant },
  cellMono: { fontSize: '0.8125rem', color: colors.onSurfaceVariant, fontFamily: 'monospace' },
  sectionLabel: {
    display: 'block', fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase',
    letterSpacing: '0.1em', color: colors.onSurfaceVariant, marginBottom: '0.5rem',
    fontFamily: fonts.label,
  },
  detailRow: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '0.375rem 0', borderBottom: `1px solid ${colors.outlineVariant}22`,
  },
  detailLabel: { fontSize: '0.8125rem', color: colors.onSurfaceVariant, fontWeight: 500 },
  detailValue: { fontSize: '0.8125rem', color: colors.onSurface, fontWeight: 600 },
  field: { display: 'flex', flexDirection: 'column', gap: '0.25rem' },
  fieldLabel: {
    fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase',
    letterSpacing: '0.08em', color: colors.onSurfaceVariant, fontFamily: fonts.label,
  },
  input: {
    padding: '0.5rem 0.75rem',
    border: `1px solid ${colors.outlineVariant}`,
    borderRadius: radius.DEFAULT,
    fontSize: '0.875rem', color: colors.onSurface,
    backgroundColor: colors.surfaceContainerLowest,
    fontFamily: fonts.body, outline: 'none', width: '100%', boxSizing: 'border-box',
  },
  checkRow: {
    display: 'flex', alignItems: 'center', gap: '0.5rem',
    fontSize: '0.875rem', color: colors.onSurface, cursor: 'pointer',
  },
}

const ms = {
  overlay: {
    position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.45)',
    zIndex: 400, display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  modal: {
    backgroundColor: colors.surface, borderRadius: radius.lg,
    padding: '1.5rem', width: '28rem', maxHeight: '85vh', overflowY: 'auto',
    boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
    display: 'flex', flexDirection: 'column', gap: '1rem', fontFamily: fonts.body,
  },
  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
  },
  title: {
    margin: 0, fontSize: '1.125rem', fontWeight: 700,
    color: colors.onSurface, fontFamily: fonts.headline,
  },
  subtitle: {
    margin: '0.25rem 0 0', fontSize: '0.75rem', color: colors.onSurfaceVariant,
  },
  closeBtn: {
    background: 'none', border: 'none', cursor: 'pointer',
    color: colors.onSurfaceVariant, padding: '0.25rem', display: 'flex',
  },
  body: { display: 'flex', flexDirection: 'column', gap: '1.25rem' },
  footer: { display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.25rem' },
  cancelBtn: {
    padding: '0.5rem 1rem', background: 'none',
    border: `1px solid ${colors.outlineVariant}`, borderRadius: radius.DEFAULT,
    fontSize: '0.875rem', fontWeight: 500, color: colors.onSurface,
    cursor: 'pointer', fontFamily: fonts.label,
  },
  okBtn: {
    padding: '0.5rem 1.5rem', backgroundColor: colors.primary, border: 'none',
    borderRadius: radius.DEFAULT, fontSize: '0.875rem', fontWeight: 600,
    color: colors.onPrimary, cursor: 'pointer', fontFamily: fonts.label,
  },
  deleteBtn: {
    display: 'flex', alignItems: 'center', gap: '0.375rem',
    padding: '0.5rem 1rem', backgroundColor: colors.error, border: 'none',
    borderRadius: radius.DEFAULT, fontSize: '0.875rem', fontWeight: 600,
    color: '#fff', cursor: 'pointer', fontFamily: fonts.label,
  },
}
