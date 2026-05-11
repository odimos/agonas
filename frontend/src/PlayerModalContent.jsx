import { useEffect } from 'react'
import { colors, fonts } from './styles'
import ModalField from './ModalField'
import { useLang } from './LangContext'

// form shape: { firstName, lastName, nickname, phone, email, team_id, comments }
export function initPlayerForm(player = {}) {
  return {
    firstName: player.first_name ?? '',
    lastName:  player.last_name  ?? '',
    nickname:  player.nickname   ?? '',
    phone:     player.phone      ?? '',
    email:     player.email      ?? '',
    team_id:   player.team_id    ?? null,
    comments:  player.comments   ?? '',
  }
}

export default function PlayerModalContent({ form, setForm, editing, teams = [] }) {
  const { t } = useLang()

  useEffect(() => {
    // reset handled by parent when editing flips off
  }, [editing])

  const set = field => value => setForm(f => ({ ...f, [field]: value }))

  return (
    <div style={st.body}>

      {/* Name fields */}
      <div style={st.nameGrid}>
        <ModalField label={t('modal_first_name')} value={form.firstName} editing={editing} onChange={set('firstName')} testId="input-first-name" />
        <ModalField label={t('modal_last_name')}  value={form.lastName}  editing={editing} onChange={set('lastName')}  testId="input-last-name"  />
        <ModalField label={t('modal_nickname')}   value={form.nickname}  editing={editing} onChange={set('nickname')} span2 testId="input-nickname" />
      </div>

      {/* Contact + Team */}
      <div style={st.contactGrid}>
        <ModalField label={t('modal_phone')} value={form.phone} editing={editing} onChange={set('phone')} icon="call" type="tel"   testId="input-phone" />
        <ModalField label="Email"            value={form.email} editing={editing} onChange={set('email')} icon="mail" type="email" testId="input-email" />

        {/* Team — full-width select */}
        <div style={{ gridColumn: '1 / -1' }}>
          <label style={st.selectLabel}>{t('modal_team_field')}</label>
          <div style={{ position: 'relative' }}>
            <select
              style={{ ...st.select, borderBottomColor: editing ? colors.primary : `${colors.outlineVariant}4d`, cursor: editing ? 'pointer' : 'default', pointerEvents: editing ? 'auto' : 'none' }}
              value={form.team_id ?? ''}
              onChange={e => set('team_id')(e.target.value ? Number(e.target.value) : null)}
              data-testid="input-team"
            >
              <option value="">—</option>
              {teams.map(tm => <option key={tm.id} value={tm.id}>{tm.name}</option>)}
            </select>
            <span className="material-symbols-outlined" style={st.selectChevron}>expand_more</span>
          </div>
        </div>
      </div>

      {/* Comments */}
      <ModalField
        label={t('modal_comments_label')}
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
