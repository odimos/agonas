import { useState, useEffect } from 'react'
import { colors, fonts, radius } from './styles'
import ModalField from './ModalField'

function initForm(stadium) {
  return {
    name:        stadium.name        ?? '',
    phone:       stadium.phone       ?? '',
    address:     stadium.address     ?? '',
    email:       stadium.email       ?? '',
    costPerHour: String(stadium.costPerHour ?? ''),
    mapUrl:      stadium.mapUrl      ?? '',
    comments:    stadium.comments    ?? '',
  }
}

export default function StadiumModalContent({ stadium, editing }) {
  const [form, setForm] = useState(() => initForm(stadium))

  useEffect(() => {
    if (!editing) setForm(initForm(stadium))
  }, [editing])

  const set = field => value => setForm(f => ({ ...f, [field]: value }))

  return (
    <div style={st.body}>

      {/* Row 1 — Name + Phone */}
      <div style={st.grid2}>
        <ModalField label="ΟΝΟΜΑ ΓΗΠΕΔΟΥ" value={form.name}  editing={editing} onChange={set('name')}  />
        <ModalField label="ΤΗΛΕΦΩΝΟ"      value={form.phone} editing={editing} onChange={set('phone')} icon="call" type="tel" />
      </div>

      {/* Row 2 — Address full width */}
      <ModalField label="ΔΙΕΥΘΥΝΣΗ" value={form.address} editing={editing} onChange={set('address')} icon="location_on" />

      {/* Row 3 — Email + Cost */}
      <div style={st.grid2}>
        <ModalField label="EMAIL"         value={form.email}       editing={editing} onChange={set('email')}       icon="mail" type="email" />
        <ModalField label="ΚΟΣΤΟΣ/ΩΡΑ (€)" value={form.costPerHour} editing={editing} onChange={set('costPerHour')} type="number" />
      </div>

      {/* Row 4 — Location mapping */}
      <div>
        <label style={st.mapLabel}>ΧΑΡΤΗΣ</label>
        <div style={st.mapPreview}>
          <span className="material-symbols-outlined" style={{ fontSize: '1.25rem', color: colors.tertiary }}>location_on</span>
          {form.mapUrl ? (
            <span style={st.mapText}>Map Linked: {form.address || '—'}</span>
          ) : (
            <span style={{ ...st.mapText, color: colors.outline, fontStyle: 'italic' }}>Δεν έχει οριστεί χάρτης</span>
          )}
        </div>
        <input
          style={{
            ...st.mapInput,
            borderBottomColor: editing ? colors.primary : `${colors.outlineVariant}4d`,
            cursor: editing ? 'text' : 'default',
          }}
          type="text"
          value={form.mapUrl}
          readOnly={!editing}
          placeholder={editing ? 'https://maps.google.com/...' : ''}
          onChange={e => set('mapUrl')(e.target.value)}
        />
      </div>

      {/* Row 5 — Comments */}
      <ModalField
        label="ΣΧΟΛΙΑ"
        value={form.comments}
        editing={editing}
        onChange={set('comments')}
        multiline
        rows={3}
        placeholder="Add logistics notes or maintenance history..."
      />

    </div>
  )
}

const st = {
  body:  { display: 'flex', flexDirection: 'column', gap: '1.5rem' },
  grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', columnGap: '2rem', rowGap: '1.5rem' },

  mapLabel: {
    display: 'block',
    fontSize: '0.625rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    color: colors.onSurfaceVariant,
    marginBottom: '0.375rem',
    fontFamily: fonts.label,
  },
  mapPreview: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.625rem 0.75rem',
    backgroundColor: colors.surfaceContainer,
    border: `1px solid ${colors.outlineVariant}33`,
    borderRadius: radius.DEFAULT,
    marginBottom: '0.5rem',
  },
  mapText: {
    fontSize: '0.8125rem',
    fontWeight: 600,
    color: colors.onSurface,
  },
  mapInput: {
    display: 'block',
    width: '100%',
    boxSizing: 'border-box',
    backgroundColor: colors.surfaceContainer,
    border: 'none',
    borderBottom: '2px solid',
    outline: 'none',
    padding: '0.375rem 0.75rem',
    fontSize: '0.75rem',
    color: colors.onSurfaceVariant,
    fontFamily: fonts.body,
    transition: 'border-color 0.15s ease',
  },
}
