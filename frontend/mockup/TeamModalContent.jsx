import { useState, useEffect } from 'react'
import { colors, radius, fonts } from './styles'
import ModalField from './ModalField'

function initForm(team) {
  return {
    teamName:  team.name      ?? '',
    teamLogo:  team.logo      ?? '',
    captainId: team.captainId ?? '',
    viceId:    team.viceId    ?? '',
    comments:  team.comments  ?? '',
  }
}

function OfficerCard({ circleColor, icon, label, playerId, players, editing, onChange }) {
  const selected = players.find(p => p.id === playerId)

  return (
    <div style={{ ...st.card, borderLeftColor: circleColor }}>
      <div style={st.cardHeader}>
        <span className="material-symbols-outlined" style={{ fontSize: '1rem', color: circleColor }}>{icon}</span>
        <span style={st.cardLabel}>{label}</span>
      </div>
      {editing ? (
        players.length === 0 ? (
          <p style={st.cardEmpty}>Δεν υπάρχουν παίκτες</p>
        ) : (
          <div style={{ position: 'relative' }}>
            <select
              style={{ ...st.playerSelect, borderBottomColor: circleColor }}
              value={playerId}
              onChange={e => onChange(e.target.value)}
            >
              <option value="">— Επιλογή παίκτη —</option>
              {players.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            <span className="material-symbols-outlined" style={st.selectChevron}>expand_more</span>
          </div>
        )
      ) : (
        <div style={st.cardText}>
          <p style={st.cardName}>{selected?.name || '—'}</p>
          {selected?.email && <p style={st.cardMeta}>{selected.email}</p>}
          {selected?.phone && <p style={st.cardMeta}>{selected.phone}</p>}
        </div>
      )}
    </div>
  )
}

export default function TeamModalContent({ team, editing }) {
  const [form, setForm] = useState(() => initForm(team))

  useEffect(() => {
    if (!editing) setForm(initForm(team))
  }, [editing])

  const set = field => value => setForm(f => ({ ...f, [field]: value }))

  const players = team.players ?? []

  function handleLogoChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    setForm(f => ({ ...f, teamLogo: url }))
  }

  return (
    <div style={st.body}>

      {/* Team identity row */}
      <div style={st.identityRow}>
        <div style={st.logoWrap}>
          {form.teamLogo
            ? <img src={form.teamLogo} alt="logo" style={st.logoImg} />
            : <span className="material-symbols-outlined" style={{ fontSize: '2rem', color: colors.onSurfaceVariant }}>shield</span>
          }
          {editing && (
            <label style={st.logoOverlay}>
              <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>photo_camera</span>
              <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleLogoChange} />
            </label>
          )}
        </div>
        {editing ? (
          <input
            style={st.nameInput}
            value={form.teamName}
            onChange={e => setForm(f => ({ ...f, teamName: e.target.value }))}
          />
        ) : (
          <h3 style={st.teamName}>{form.teamName}</h3>
        )}
      </div>

      {/* Captain + Vice-captain */}
      <div style={st.officerGrid}>
        <OfficerCard
          circleColor={colors.tertiary}
          icon="stars"
          label="ΑΡΧΗΓΟΣ"
          playerId={form.captainId}
          players={players}
          editing={editing}
          onChange={set('captainId')}
        />
        <OfficerCard
          circleColor={colors.primaryContainer}
          icon="star_half"
          label="ΥΠΑΡΧΗΓΟΣ"
          playerId={form.viceId}
          players={players}
          editing={editing}
          onChange={set('viceId')}
        />
      </div>

      {/* Comments */}
      <div>
        <label style={st.sectionLabel}>ΣΧΟΛΙΑ</label>
        {editing ? (
          <ModalField value={form.comments} editing onChange={set('comments')} multiline rows={3}
            placeholder="Enter administrative notes, sportsmanship records, or scheduling details..." />
        ) : (
          <div style={st.commentView}>
            {form.comments ? `"${form.comments}"` : <span style={{ fontStyle: 'normal', color: colors.outline }}>—</span>}
          </div>
        )}
      </div>

      {/* Players */}
      <div>
        {players.length > 0 ? (
          <div style={st.playerList}>
            <div style={st.playerListHeader}>
              <span style={st.sectionLabel}>ΠΑΙΚΤΕΣ ({players.length})</span>
              <button style={st.addBtn}>
                <span className="material-symbols-outlined" style={{ fontSize: '0.875rem' }}>person_add</span>
                ΠΡΟΣΘΗΚΗ ΠΑΙΚΤΗ
              </button>
            </div>
            {players.map(p => (
              <div key={p.id} style={st.playerRow}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1 }}>
                  <p style={st.playerName}>{p.name}</p>
                  <span style={st.playerId}>ID: {p.id}</span>
                </div>
                <div style={{ display: 'flex', gap: '0.125rem' }}>
                  <button style={st.iconBtn}><span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>visibility</span></button>
                  <button style={{ ...st.iconBtn, color: colors.error }}><span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>delete</span></button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={st.playerList}>
            <div style={st.playerListHeader}>
              <span style={st.sectionLabel}>ΠΑΙΚΤΕΣ (0)</span>
              <button style={st.addBtn}>
                <span className="material-symbols-outlined" style={{ fontSize: '0.875rem' }}>person_add</span>
                ΠΡΟΣΘΗΚΗ ΠΑΙΚΤΗ
              </button>
            </div>
            <div style={st.emptyPlayers}>
              <span className="material-symbols-outlined" style={{ fontSize: '1.5rem', color: colors.onSurfaceVariant }}>group</span>
              <p style={st.emptyText}>Δεν υπάρχουν εγγεγραμμένοι παίκτες</p>
            </div>
          </div>
        )}
      </div>

    </div>
  )
}

const st = {
  body:       { display: 'flex', flexDirection: 'column', gap: '1.5rem' },

  identityRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.25rem',
    padding: '1rem 1.25rem',
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: radius.DEFAULT,
  },
  logoWrap: {
    position: 'relative',
    width: '4rem',
    height: '4rem',
    borderRadius: radius.DEFAULT,
    backgroundColor: colors.surfaceContainerHigh,
    border: `1px solid ${colors.outlineVariant}4d`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    flexShrink: 0,
  },
  logoImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  logoOverlay: {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.45)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    cursor: 'pointer',
  },
  teamName: {
    fontSize: '1.25rem',
    fontWeight: 700,
    letterSpacing: '-0.02em',
    color: colors.onSurface,
    margin: 0,
    fontFamily: fonts.headline,
  },
  nameInput: {
    fontSize: '1.25rem',
    fontWeight: 700,
    letterSpacing: '-0.02em',
    color: colors.onSurface,
    fontFamily: fonts.headline,
    border: 'none',
    borderBottom: `2px solid ${colors.tertiary}`,
    background: 'transparent',
    outline: 'none',
    flex: 1,
    padding: '0.125rem 0',
  },

  officerGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' },

  card: {
    padding: '1rem 1.25rem',
    borderLeft: '4px solid',
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: `0 ${radius.DEFAULT} ${radius.DEFAULT} 0`,
  },
  cardHeader: { display: 'flex', alignItems: 'center', gap: '0.375rem', marginBottom: '0.625rem' },
  cardLabel: {
    fontSize: '0.625rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.12em',
    color: colors.onSurfaceVariant,
    fontFamily: fonts.label,
  },
  cardText:  { display: 'flex', flexDirection: 'column', gap: 0 },
  cardName:  { fontSize: '0.875rem', fontWeight: 600, color: colors.onSurface, margin: 0, lineHeight: 1.4, marginBottom: '0.125rem' },
  cardMeta:  { fontSize: '0.75rem', color: colors.onSurfaceVariant, margin: 0, lineHeight: 1.3 },
  cardEmpty: { fontSize: '0.75rem', color: colors.outline, fontStyle: 'italic', margin: 0, fontFamily: fonts.body },
  playerSelect: {
    width: '100%',
    backgroundColor: colors.surfaceContainer,
    border: 'none',
    borderBottom: '2px solid',
    outline: 'none',
    padding: '0.5rem 1.75rem 0.5rem 0.5rem',
    fontSize: '0.875rem',
    fontWeight: 600,
    color: colors.onSurface,
    fontFamily: fonts.body,
    appearance: 'none',
    WebkitAppearance: 'none',
    boxSizing: 'border-box',
    display: 'block',
    cursor: 'pointer',
  },
  selectChevron: {
    position: 'absolute',
    right: '0.375rem',
    top: '50%',
    transform: 'translateY(-50%)',
    fontSize: '1.25rem',
    color: colors.onSurfaceVariant,
    pointerEvents: 'none',
  },

  sectionLabel: {
    display: 'block',
    fontSize: '0.625rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.12em',
    color: colors.onSurfaceVariant,
    marginBottom: '0.5rem',
    fontFamily: fonts.label,
  },
  commentView: {
    padding: '0.875rem 1rem',
    backgroundColor: `${colors.surfaceVariant}4d`,
    borderLeft: `2px solid ${colors.outlineVariant}4d`,
    fontSize: '0.875rem',
    color: colors.onSurface,
    fontStyle: 'italic',
    lineHeight: 1.6,
  },

  addBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.375rem',
    padding: '0.25rem 0.75rem',
    backgroundColor: colors.tertiary,
    color: colors.onTertiary,
    border: 'none',
    borderRadius: radius.DEFAULT,
    fontSize: '0.625rem',
    fontWeight: 700,
    letterSpacing: '0.04em',
    cursor: 'pointer',
    fontFamily: fonts.label,
  },

  playerList: { border: `1px solid ${colors.outlineVariant}33`, overflow: 'hidden', borderRadius: radius.DEFAULT },
  playerListHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.5rem 1rem',
    backgroundColor: colors.surfaceContainerHigh,
    borderBottom: `1px solid ${colors.outlineVariant}1a`,
  },
  playerRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0.3rem 1rem',
    borderTop: `1px solid ${colors.outlineVariant}1a`,
  },
  playerName: { fontSize: '0.8125rem', fontWeight: 500, color: colors.onSurface, margin: 0 },
  playerId:   { fontSize: '0.6875rem', color: colors.onSurfaceVariant, fontFamily: 'monospace' },
  iconBtn:    { background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem', color: colors.onSurfaceVariant, display: 'flex' },

  emptyPlayers: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '2rem',
    border: `1px solid ${colors.outlineVariant}22`,
    borderRadius: radius.DEFAULT,
    backgroundColor: colors.surfaceContainerLow,
  },
  emptyText: { fontSize: '0.75rem', color: colors.onSurfaceVariant, margin: 0 },
}
