import { colors, fonts, radius } from './styles'
import ModalField from './ModalField'
import { useLang } from './LangContext'

export function initStadiumForm(stadium = {}) {
  return {
    name:    stadium.name    ?? '',
    phone:   stadium.phone   ?? '',
    address: stadium.address ?? '',
    email:   stadium.email   ?? '',
    cost:    stadium.cost != null ? String(stadium.cost) : '',
    map_url: stadium.map_url ?? '',
    comments: stadium.comments ?? '',
  }
}

export default function StadiumModalContent({ form, setForm, editing }) {
  const { t } = useLang()
  const set = field => value => setForm(f => ({ ...f, [field]: value }))

  return (
    <div style={st.body}>

      <div style={st.grid2}>
        <ModalField label={t('modal_stadium_name')} value={form.name}  editing={editing} onChange={set('name')}  testId="input-name" />
        <ModalField label={t('modal_phone')}         value={form.phone} editing={editing} onChange={set('phone')} icon="call" type="tel" testId="input-phone" />
      </div>

      <ModalField label={t('modal_address')} value={form.address} editing={editing} onChange={set('address')} icon="location_on" testId="input-address" />

      <div style={st.grid2}>
        <ModalField label="Email"                value={form.email} editing={editing} onChange={set('email')} icon="mail" type="email" testId="input-email" />
        <ModalField label={t('modal_cost_hour')} value={form.cost}  editing={editing} onChange={set('cost')}  type="number"           testId="input-cost"  />
      </div>

      <div>
        <label style={st.mapLabel}>{t('modal_map')}</label>
        <div style={st.mapPreview}>
          <span className="material-symbols-outlined" style={{ fontSize: '1.25rem', color: colors.tertiary }}>location_on</span>
          {form.map_url ? (
            <span style={st.mapText}>Map Linked: {form.address || '—'}</span>
          ) : (
            <span style={{ ...st.mapText, color: colors.outline, fontStyle: 'italic' }}>{t('modal_no_map')}</span>
          )}
        </div>
        <input
          style={{ ...st.mapInput, borderBottomColor: editing ? colors.primary : `${colors.outlineVariant}4d`, cursor: editing ? 'text' : 'default' }}
          type="text"
          value={form.map_url}
          readOnly={!editing}
          placeholder={editing ? 'https://maps.google.com/...' : ''}
          onChange={e => set('map_url')(e.target.value)}
          data-testid="input-map-url"
        />
      </div>

      <ModalField
        label={t('modal_comments_label')}
        value={form.comments}
        editing={editing}
        onChange={set('comments')}
        multiline
        rows={3}
        placeholder="Add logistics notes or maintenance history..."
        testId="input-comments"
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
  mapText: { fontSize: '0.8125rem', fontWeight: 600, color: colors.onSurface },
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
