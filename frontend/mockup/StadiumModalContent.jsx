import { useState, useEffect } from 'react'
import ModalField from './ModalField'

function initForm(stadium) {
  return {
    name:        stadium.name        ?? '',
    address:     stadium.address     ?? '',
    zone:        stadium.zone        ?? '',
    capacity:    String(stadium.capacity    ?? ''),
    costPerHour: String(stadium.costPerHour ?? ''),
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
      <div style={st.grid2}>
        <ModalField label="ΟΝΟΜΑ ΓΗΠΕΔΟΥ" value={form.name}     editing={editing} onChange={set('name')}     span2 />
        <ModalField label="ΔΙΕΥΘΥΝΣΗ"     value={form.address}  editing={editing} onChange={set('address')}  span2 />
        <ModalField label="ΖΩΝΗ"          value={form.zone}     editing={editing} onChange={set('zone')}          />
        <ModalField label="ΧΩΡΗΤΙΚΟΤΗΤΑ"  value={form.capacity} editing={editing} onChange={set('capacity')}      />
        <ModalField label="ΚΟΣΤΟΣ/ΩΡΑ (€)" value={form.costPerHour} editing={editing} onChange={set('costPerHour')} type="number" />
      </div>
    </div>
  )
}

const st = {
  body:  { display: 'flex', flexDirection: 'column', gap: '1.5rem' },
  grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' },
}
