import { useState, useEffect } from 'react'
import { colors } from './styles'
import ModalField from './ModalField'

function initForm(referee) {
  const parts = referee.name.trim().split(' ')
  return {
    firstName: parts[0] ?? '',
    lastName:  parts.slice(1).join(' ') ?? '',
    phone:     referee.phone    ?? '',
    email:     referee.email    ?? '',
    comments:  referee.comments ?? '',
  }
}

export default function RefereeModalContent({ referee, editing }) {
  const [form, setForm] = useState(() => initForm(referee))

  useEffect(() => {
    if (!editing) setForm(initForm(referee))
  }, [editing])

  const set = field => value => setForm(f => ({ ...f, [field]: value }))

  return (
    <div style={st.body}>

      {/* Row 1 — Name */}
      <div style={st.grid2}>
        <ModalField label="ΟΝΟΜΑ"   value={form.firstName} editing={editing} onChange={set('firstName')} />
        <ModalField label="ΕΠΙΘΕΤΟ" value={form.lastName}  editing={editing} onChange={set('lastName')}  />
      </div>

      {/* Row 2 — Contact */}
      <div style={st.grid2}>
        <ModalField label="ΤΗΛΕΦΩΝΟ" value={form.phone} editing={editing} onChange={set('phone')} icon="call" type="tel"   />
        <ModalField label="Email"     value={form.email} editing={editing} onChange={set('email')} icon="mail" type="email" />
      </div>

      {/* Row 3 — Comments */}
      <ModalField
        label="ΣΧΟΛΙΑ"
        value={form.comments}
        editing={editing}
        onChange={set('comments')}
        multiline
        span2
        placeholder="Enter administrative notes, disciplinary history, or availability details..."
      />

      {/* Metadata strip */}
      <div style={st.meta} />

    </div>
  )
}

const st = {
  body:  { display: 'flex', flexDirection: 'column', gap: '1.5rem' },
  grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' },
  meta:  { borderTop: `1px solid ${colors.outlineVariant}1a`, paddingTop: '1rem' },
}
