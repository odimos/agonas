import { colors } from './styles'
import ModalField from './ModalField'
import { useLang } from './LangContext'

export function initRefereeForm(referee = {}) {
  return {
    firstName: referee.first_name ?? '',
    lastName:  referee.last_name  ?? '',
    phone:     referee.phone      ?? '',
    email:     referee.email      ?? '',
    comments:  referee.comments   ?? '',
  }
}

export default function RefereeModalContent({ form, setForm, editing }) {
  const { t } = useLang()
  const set = field => value => setForm(f => ({ ...f, [field]: value }))

  return (
    <div style={st.body}>

      <div style={st.grid2}>
        <ModalField label={t('modal_first_name')} value={form.firstName} editing={editing} onChange={set('firstName')} testId="input-first-name" />
        <ModalField label={t('modal_last_name')}  value={form.lastName}  editing={editing} onChange={set('lastName')}  testId="input-last-name"  />
      </div>

      <div style={st.grid2}>
        <ModalField label={t('modal_phone')} value={form.phone} editing={editing} onChange={set('phone')} icon="call" type="tel"   testId="input-phone" />
        <ModalField label="Email"            value={form.email} editing={editing} onChange={set('email')} icon="mail" type="email" testId="input-email" />
      </div>

      <ModalField
        label={t('modal_comments_label')}
        value={form.comments}
        editing={editing}
        onChange={set('comments')}
        multiline
        span2
        placeholder="Enter administrative notes, disciplinary history, or availability details..."
        testId="input-comments"
      />

      <div style={st.meta} />

    </div>
  )
}

const st = {
  body:  { display: 'flex', flexDirection: 'column', gap: '1.5rem' },
  grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' },
  meta:  { borderTop: `1px solid ${colors.outlineVariant}1a`, paddingTop: '1rem' },
}
