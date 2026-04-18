import { useState, useEffect } from 'react'
import { colors, fonts } from './styles'
import ModalField from './ModalField'

const TEAMS = ['OPA FC', 'Emerald Giants', 'Sage United', 'Coastal Rangers']

function initForm(player) {
  const parts = player.name.trim().split(' ')
  return {
    firstName: parts[0] ?? '',
    lastName:  parts.slice(1).join(' ') ?? '',
    phone:     player.phone    ?? '',
    email:     player.email    ?? '',
    nickname:  player.nickname ?? '',
    team:      player.team     ?? '',
    comments:  player.comments ?? '',
  }
}

export default function PlayerModalContent({ player, editing }) {
  const [form, setForm] = useState(() => initForm(player))

  useEffect(() => {
    if (!editing) setForm(initForm(player))
  }, [editing])

  const set = field => value => setForm(f => ({ ...f, [field]: value }))

  return (
    <div style={st.body}>

      {/* Name fields */}
      <div style={st.nameGrid}>
        <ModalField label="ΟΝΟΜΑ"     value={form.firstName} editing={editing} onChange={set('firstName')} />
        <ModalField label="ΕΠΙΘΕΤΟ"   value={form.lastName}  editing={editing} onChange={set('lastName')}  />
        <ModalField label="ΨΕΥΔΩΝΥΜΟ" value={form.nickname}  editing={editing} onChange={set('nickname')} span2 />
      </div>

      {/* Contact + Team */}
      <div style={st.contactGrid}>
        <ModalField label="ΤΗΛΕΦΩΝΟ" value={form.phone} editing={editing} onChange={set('phone')} icon="call" type="tel"   />
        <ModalField label="Email"     value={form.email} editing={editing} onChange={set('email')} icon="mail" type="email" />

        {/* ΟΜΑΔΑ — full-width select */}
        <div style={{ gridColumn: '1 / -1' }}>
          <label style={st.selectLabel}>ΟΜΑΔΑ</label>
          <div style={{ position: 'relative' }}>
            <select
              style={{ ...st.select, borderBottomColor: editing ? colors.primary : `${colors.outlineVariant}4d`, cursor: editing ? 'pointer' : 'default', pointerEvents: editing ? 'auto' : 'none' }}
              value={form.team}
              onChange={e => set('team')(e.target.value)}
            >
              <option value="">— </option>
              {TEAMS.map(t => <option key={t}>{t}</option>)}
            </select>
            <span className="material-symbols-outlined" style={st.selectChevron}>expand_more</span>
          </div>
        </div>
      </div>

      {/* Comments */}
      <ModalField
        label="ΣΧΟΛΙΑ"
        value={form.comments}
        editing={editing}
        onChange={set('comments')}
        multiline
        rows={3}
        placeholder="Enter administrative notes, injury history, or contract details..."
      />

    </div>
  )
}

const st = {
  body:        { display: 'flex', flexDirection: 'column', gap: '1.5rem' },
  nameGrid:    { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' },
  contactGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', columnGap: '2rem', rowGap: '1.5rem' },
  selectLabel: {
    display: 'block',
    fontSize: '0.625rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    color: colors.onSurfaceVariant,
    marginBottom: '0.375rem',
    fontFamily: fonts.label,
  },
  select: {
    width: '100%',
    backgroundColor: colors.surfaceContainer,
    border: 'none',
    borderBottom: '2px solid',
    outline: 'none',
    padding: '0.5rem 1.75rem 0.5rem 0.75rem',
    fontSize: '0.875rem',
    fontWeight: 600,
    color: colors.onSurface,
    fontFamily: fonts.body,
    appearance: 'none',
    WebkitAppearance: 'none',
    transition: 'border-color 0.15s ease',
    boxSizing: 'border-box',
    display: 'block',
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
}
