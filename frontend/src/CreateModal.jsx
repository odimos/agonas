import { useState } from 'react'
import { colors, fonts, radius } from './styles'
import { useLang } from './LangContext'
import PlayerModalContent, { initPlayerForm } from './PlayerModalContent'
import RefereeModalContent, { initRefereeForm } from './RefereeModalContent'
import StadiumModalContent, { initStadiumForm } from './StadiumModalContent'
import TeamModalContent, { initTeamForm } from './TeamModalContent'
import { createPlayer  } from './api/players'
import { createTeam    } from './api/teams'
import { createReferee } from './api/referees'
import { createStadium } from './api/stadiums'

const META = {
  player:  { title: 'Νέος Παίκτης' },
  referee: { title: 'Νέος Διαιτητής' },
  stadium: { title: 'Νέο Γήπεδο' },
  team:    { title: 'Νέα Ομάδα' },
}

export default function CreateModal({ type, teams = [], onClose, onCreated }) {
  const { t } = useLang()
  const [form, setForm] = useState(() => {
    if (type === 'player')  return initPlayerForm()
    if (type === 'team')    return initTeamForm()
    if (type === 'referee') return initRefereeForm()
    if (type === 'stadium') return initStadiumForm()
    return {}
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  async function handleSubmit() {
    setError(null)
    setSaving(true)
    try {
      if (type === 'player') {
        await createPlayer({
          first_name: form.firstName.trim(),
          last_name:  form.lastName.trim(),
          nickname:   form.nickname  || '',
          phone:      form.phone     || '',
          email:      form.email     || '',
          team_id:    form.team_id   ?? null,
          comments:   form.comments  || null,
        })
      } else if (type === 'team') {
        await createTeam({
          name:            form.name.trim(),
          is_active:       form.is_active,
          captain_id:      form.captain_id      ?? null,
          vice_captain_id: form.vice_captain_id ?? null,
          comments:        form.comments        || null,
        })
      } else if (type === 'referee') {
        await createReferee({
          first_name: form.firstName.trim(),
          last_name:  form.lastName.trim(),
          phone:      form.phone.trim(),
          email:      form.email  || '',
          comments:   form.comments || null,
        })
      } else if (type === 'stadium') {
        await createStadium({
          name:     form.name.trim(),
          phone:    form.phone.trim(),
          address:  form.address.trim(),
          email:    form.email    || '',
          cost:     form.cost     || null,
          map_url:  form.map_url  || '',
          comments: form.comments || null,
        })
      }
      onCreated?.()
    } catch (err) {
      const msg = err?.detail?.[0]?.msg ?? err?.detail ?? 'Failed to create'
      setError(typeof msg === 'string' ? msg : JSON.stringify(msg))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={st.overlay} onClick={onClose}>
      <div style={st.modal} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={st.header}>
          <h2 style={st.title}>{META[type]?.title ?? t(`create_${type}`)}</h2>
          <button style={st.closeBtn} onClick={onClose} data-testid="modal-close">
            <span className="material-symbols-outlined" style={{ fontSize: '1.25rem', color: colors.onSurfaceVariant }}>close</span>
          </button>
        </div>

        {/* Content */}
        <div style={st.content}>
          {type === 'player'  && <PlayerModalContent  form={form} setForm={setForm} editing teams={teams} />}
          {type === 'team'    && <TeamModalContent    form={form} setForm={setForm} editing players={[]} />}
          {type === 'referee' && <RefereeModalContent form={form} setForm={setForm} editing />}
          {type === 'stadium' && <StadiumModalContent form={form} setForm={setForm} editing />}
          {error && <p style={{ color: colors.error, marginTop: '0.75rem', fontSize: '0.875rem' }}>{error}</p>}
        </div>

        {/* Footer */}
        <div style={st.footer}>
          <div />
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <button style={st.cancelBtn} onClick={onClose} disabled={saving}>{t('create_cancel')}</button>
            <button style={st.createBtn} onClick={handleSubmit} disabled={saving} data-testid="btn-save">
              <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>add</span>
              {saving ? '…' : t('create_submit')}
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}

const st = {
  overlay: {
    position: 'fixed',
    inset: 0,
    zIndex: 100,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: `${colors.onSurface}66`,
    backdropFilter: 'blur(4px)',
    WebkitBackdropFilter: 'blur(4px)',
  },
  modal: {
    backgroundColor: colors.surfaceContainerLowest,
    width: '100%',
    maxWidth: '672px',
    maxHeight: '90vh',
    display: 'flex',
    flexDirection: 'column',
    borderRadius: radius.DEFAULT,
    border: `1px solid ${colors.outlineVariant}4d`,
    boxShadow: '0 12px 32px rgba(25,28,28,0.12)',
    overflow: 'hidden',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem 2rem',
    backgroundColor: colors.surfaceContainerHigh,
    borderBottom: `1px solid ${colors.outlineVariant}80`,
    flexShrink: 0,
  },
  title: {
    fontSize: '1.25rem',
    fontWeight: 700,
    letterSpacing: '-0.02em',
    color: colors.onSurface,
    margin: 0,
    fontFamily: fonts.headline,
  },
  closeBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '0.25rem',
    borderRadius: radius.DEFAULT,
  },
  content: {
    flex: 1,
    overflowY: 'auto',
    padding: '2rem',
  },
  footer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1.5rem 2rem',
    backgroundColor: colors.surfaceContainerLow,
    borderTop: `1px solid ${colors.outlineVariant}4d`,
    flexShrink: 0,
  },
  cancelBtn: {
    padding: '0.5rem 1.25rem',
    backgroundColor: 'transparent',
    color: colors.onSurfaceVariant,
    border: `1px solid ${colors.outlineVariant}`,
    borderRadius: radius.DEFAULT,
    fontSize: '0.875rem',
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: fonts.label,
  },
  createBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.375rem',
    padding: '0.5rem 1.5rem',
    backgroundColor: colors.primary,
    color: colors.onPrimary,
    border: 'none',
    borderRadius: radius.DEFAULT,
    fontSize: '0.875rem',
    fontWeight: 700,
    cursor: 'pointer',
    fontFamily: fonts.label,
  },
}
