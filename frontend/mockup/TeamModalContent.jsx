import { useState, useEffect } from 'react'
import { colors, radius, fonts } from './styles'
import ModalField from './ModalField'

function initForm(team) {
  return {
    captainName:  team.captain       ?? '',
    captainEmail: team.contact       ?? '',
    captainPhone: team.captainPhone  ?? '',
    viceName:     team.viceCaptain   ?? '',
    viceEmail:    team.viceEmail     ?? '',
    vicePhone:    team.vicePhone     ?? '',
    comments:     team.comments      ?? '',
  }
}

function OfficerCard({ circleColor, icon, label, name, email, phone, editing, onName, onEmail, onPhone }) {
  return (
    <div style={{ ...st.card, borderLeftColor: circleColor }}>
      <div style={st.cardHeader}>
        <span className="material-symbols-outlined" style={{ fontSize: '1rem', color: circleColor }}>{icon}</span>
        <span style={st.cardLabel}>{label}</span>
      </div>
      {editing ? (
        <div style={st.cardFields}>
          <ModalField label="ΟΝΟΜΑ"        value={name}  editing onChange={onName}  />
          <ModalField label="Email"         value={email} editing onChange={onEmail} icon="mail" type="email" />
          <ModalField label="ΤΗΛΕΦΩΝΟ"     value={phone} editing onChange={onPhone} icon="call" type="tel"   />
        </div>
      ) : (
        <div style={st.cardText}>
          <p style={st.cardName}>{name || '—'}</p>
          {email && <p style={st.cardMeta}>{email}</p>}
          {phone && <p style={st.cardMeta}>{phone}</p>}
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

  return (
    <div style={st.body}>

      {/* Captain + Vice-captain */}
      <div style={st.officerGrid}>
        <OfficerCard
          circleColor={colors.tertiary}
          icon="stars"
          label="ΑΡΧΗΓΟΣ"
          name={form.captainName}
          email={form.captainEmail}
          phone={form.captainPhone}
          editing={editing}
          onName={set('captainName')}
          onEmail={set('captainEmail')}
          onPhone={set('captainPhone')}
        />
        <OfficerCard
          circleColor={colors.primaryContainer}
          icon="star_half"
          label="ΥΠΑΡΧΗΓΟΣ"
          name={form.viceName}
          email={form.viceEmail}
          phone={form.vicePhone}
          editing={editing}
          onName={set('viceName')}
          onEmail={set('viceEmail')}
          onPhone={set('vicePhone')}
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
  cardFields: { display: 'flex', flexDirection: 'column', gap: '0.75rem' },
  cardText:   { display: 'flex', flexDirection: 'column', gap: 0 },
  cardName:   { fontSize: '0.875rem', fontWeight: 600, color: colors.onSurface, margin: 0, lineHeight: 1.4, marginBottom: '0.125rem' },
  cardMeta:   { fontSize: '0.75rem', color: colors.onSurfaceVariant, margin: 0, lineHeight: 1.3 },

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
