import { useState, useEffect } from 'react'
import { colors, fonts, radius } from './styles'
import ModalField from './ModalField'
import { useLang } from './LangContext'
import { fetchAvailabilities, createAvailability, updateAvailability, deleteAvailability } from './api/stadium_availabilities'

const DAYS = ['Δευτέρα', 'Τρίτη', 'Τετάρτη', 'Πέμπτη', 'Παρασκευή', 'Σάββατο', 'Κυριακή']

// Generate all quarter-hour options for a day
const QUARTER_OPTS = []
for (let h = 0; h < 24; h++) {
  for (let m = 0; m < 60; m += 15) {
    QUARTER_OPTS.push(`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`)
  }
}

export function initStadiumForm(stadium = {}) {
  return {
    name:     stadium.name     ?? '',
    phone:    stadium.phone    ?? '',
    address:  stadium.address  ?? '',
    email:    stadium.email    ?? '',
    cost:     stadium.cost != null ? String(stadium.cost) : '',
    map_url:  stadium.map_url  ?? '',
    comments: stadium.comments ?? '',
  }
}

// ─── Add Slot Modal ───────────────────────────────────────────────────────────

function AddSlotModal({ day, stadiumId, onAdded, onClose }) {
  const [start,  setStart]  = useState('09:00')
  const [qty,    setQty]    = useState(1)
  const [saving, setSaving] = useState(false)
  const [error,  setError]  = useState('')

  async function handleOk() {
    setSaving(true)
    setError('')
    try {
      const av = await createAvailability(stadiumId, { day, start_time: start, quantity: qty })
      onAdded(av)
      onClose()
    } catch { setError('Σφάλμα αποθήκευσης.') }
    finally { setSaving(false) }
  }

  return (
    <div style={ms.overlay} onClick={onClose}>
      <div style={ms.modal} onClick={e => e.stopPropagation()}>
        <p style={ms.title}>{DAYS[day]} — Νέα διαθεσιμότητα</p>

        <div style={ms.row}>
          <div style={ms.field}>
            <label style={ms.label}>Ώρα έναρξης</label>
            <select style={ms.select} value={start} onChange={e => setStart(e.target.value)}>
              {QUARTER_OPTS.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div style={{ ...ms.field, flex: '0 0 7rem' }}>
            <label style={ms.label}>Ποσότητα</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <button style={ms.qtyBtn} onClick={() => setQty(q => Math.max(1, q - 1))}>−</button>
              <span style={ms.qtyValue}>{qty}</span>
              <button style={ms.qtyBtn} onClick={() => setQty(q => q + 1)}>+</button>
            </div>
          </div>
        </div>

        {error && <p style={ms.error}>{error}</p>}

        <div style={ms.footer}>
          <button style={ms.cancelBtn} onClick={onClose}>Ακύρωση</button>
          <button style={ms.okBtn} onClick={handleOk} disabled={saving}>
            {saving ? '...' : 'OK'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Edit Slot Modal ──────────────────────────────────────────────────────────

function EditSlotModal({ av, day, onUpdated, onClose }) {
  const [start,  setStart]  = useState(av.start_time.slice(0, 5))
  const [qty,    setQty]    = useState(av.quantity)
  const [saving, setSaving] = useState(false)
  const [error,  setError]  = useState('')

  async function handleOk() {
    setSaving(true)
    setError('')
    try {
      const updated = await updateAvailability(av.id, { day, start_time: start, quantity: qty })
      onUpdated(updated)
      onClose()
    } catch { setError('Σφάλμα αποθήκευσης.') }
    finally { setSaving(false) }
  }

  return (
    <div style={ms.overlay} onClick={onClose}>
      <div style={ms.modal} onClick={e => e.stopPropagation()}>
        <p style={ms.title}>{DAYS[day]} — Επεξεργασία διαθεσιμότητας</p>

        <div style={ms.row}>
          <div style={ms.field}>
            <label style={ms.label}>Ώρα έναρξης</label>
            <select style={ms.select} value={start} onChange={e => setStart(e.target.value)}>
              {QUARTER_OPTS.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div style={{ ...ms.field, flex: '0 0 7rem' }}>
            <label style={ms.label}>Ποσότητα</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <button style={ms.qtyBtn} onClick={() => setQty(q => Math.max(1, q - 1))}>−</button>
              <span style={ms.qtyValue}>{qty}</span>
              <button style={ms.qtyBtn} onClick={() => setQty(q => q + 1)}>+</button>
            </div>
          </div>
        </div>

        {error && <p style={ms.error}>{error}</p>}

        <div style={ms.footer}>
          <button style={ms.cancelBtn} onClick={onClose}>Ακύρωση</button>
          <button style={ms.okBtn} onClick={handleOk} disabled={saving}>
            {saving ? '...' : 'OK'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Day Column ───────────────────────────────────────────────────────────────

function DayColumn({ day, slots, editing, stadiumId, onAdded, onDeleted, onUpdated }) {
  const [adding,    setAdding]    = useState(false)
  const [editingAv, setEditingAv] = useState(null)

  return (
    <div style={st.dayCol}>
      <div style={st.dayHeader}>
        <span style={st.dayName}>{DAYS[day]}</span>
        {editing && (
          <button style={st.addDayBtn} onClick={() => setAdding(true)} title="Προσθήκη">
            <span className="material-symbols-outlined" style={{ fontSize: '0.875rem' }}>add</span>
          </button>
        )}
      </div>
      <div style={st.slotList}>
        {slots.length === 0 && !editing && <span style={st.emptyDay}>—</span>}
        {slots.map(av => (
          <div
            key={av.id}
            style={{ ...st.slotRow, cursor: editing ? 'pointer' : 'default' }}
            onClick={() => editing && setEditingAv(av)}
          >
            <span style={st.slotTime}>{av.start_time.slice(0,5)}</span>
            <span style={st.slotQty}>×{av.quantity}</span>
            {editing && (
              <button style={st.deleteSlotBtn} onClick={async e => {
                e.stopPropagation()
                await deleteAvailability(av.id)
                onDeleted(av.id)
              }}>
                <span className="material-symbols-outlined" style={{ fontSize: '0.75rem' }}>close</span>
              </button>
            )}
          </div>
        ))}
      </div>
      {adding && (
        <AddSlotModal
          day={day}
          stadiumId={stadiumId}
          onAdded={onAdded}
          onClose={() => setAdding(false)}
        />
      )}
      {editingAv && (
        <EditSlotModal
          av={editingAv}
          day={day}
          onUpdated={updated => { onUpdated(updated); setEditingAv(null) }}
          onClose={() => setEditingAv(null)}
        />
      )}
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function StadiumModalContent({ form, setForm, editing, stadiumId }) {
  const { t } = useLang()
  const set = field => value => setForm(f => ({ ...f, [field]: value }))
  const [availabilities, setAvailabilities] = useState([])

  useEffect(() => {
    if (!stadiumId) return
    fetchAvailabilities(stadiumId).then(setAvailabilities).catch(() => {})
  }, [stadiumId])

  function handleAdded(av) {
    setAvailabilities(prev =>
      [...prev, av].sort((a, b) => a.day - b.day || a.start_time.localeCompare(b.start_time))
    )
  }

  function handleDeleted(id) {
    setAvailabilities(prev => prev.filter(a => a.id !== id))
  }

  function handleUpdated(updated) {
    setAvailabilities(prev =>
      prev.map(a => a.id === updated.id ? updated : a)
          .sort((a, b) => a.day - b.day || a.start_time.localeCompare(b.start_time))
    )
  }

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
          {form.map_url
            ? <span style={st.mapText}>Map Linked: {form.address || '—'}</span>
            : <span style={{ ...st.mapText, color: colors.outline, fontStyle: 'italic' }}>{t('modal_no_map')}</span>
          }
        </div>
        <input
          style={{ ...st.mapInput, borderBottomColor: editing ? colors.primary : `${colors.outlineVariant}4d`, cursor: editing ? 'text' : 'default' }}
          type="text" value={form.map_url} readOnly={!editing}
          placeholder={editing ? 'https://maps.google.com/...' : ''}
          onChange={e => set('map_url')(e.target.value)}
          data-testid="input-map-url"
        />
      </div>

      <ModalField
        label={t('modal_comments_label')} value={form.comments} editing={editing}
        onChange={set('comments')} multiline rows={3}
        placeholder="Add logistics notes or maintenance history..."
        testId="input-comments"
      />

      {stadiumId && (
        <div>
          <label style={st.sectionLabel}>Διαθεσιμότητα</label>
          <div style={st.availGrid}>
            {[0,1,2,3,4,5,6].map(day => (
              <DayColumn
                key={day} day={day}
                slots={availabilities.filter(a => a.day === day)}
                editing={editing}
                stadiumId={stadiumId}
                onAdded={handleAdded}
                onDeleted={handleDeleted}
                onUpdated={handleUpdated}
              />
            ))}
          </div>
        </div>
      )}

    </div>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const st = {
  body:  { display: 'flex', flexDirection: 'column', gap: '1.5rem' },
  grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', columnGap: '2rem', rowGap: '1.5rem' },
  mapLabel: {
    display: 'block', fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase',
    letterSpacing: '0.1em', color: colors.onSurfaceVariant, marginBottom: '0.375rem', fontFamily: fonts.label,
  },
  mapPreview: {
    display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.625rem 0.75rem',
    backgroundColor: colors.surfaceContainer, border: `1px solid ${colors.outlineVariant}33`,
    borderRadius: radius.DEFAULT, marginBottom: '0.5rem',
  },
  mapText: { fontSize: '0.8125rem', fontWeight: 600, color: colors.onSurface },
  mapInput: {
    display: 'block', width: '100%', boxSizing: 'border-box',
    backgroundColor: colors.surfaceContainer, border: 'none', borderBottom: '2px solid',
    outline: 'none', padding: '0.375rem 0.75rem', fontSize: '0.75rem',
    color: colors.onSurfaceVariant, fontFamily: fonts.body, transition: 'border-color 0.15s ease',
  },
  sectionLabel: {
    display: 'block', fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase',
    letterSpacing: '0.1em', color: colors.onSurfaceVariant, marginBottom: '0.75rem', fontFamily: fonts.label,
  },
  availGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.5rem', overflowX: 'auto',
  },
  dayCol: { display: 'flex', flexDirection: 'column', gap: '0.375rem', minWidth: '7.5rem' },
  dayHeader: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    paddingBottom: '0.375rem', borderBottom: `2px solid ${colors.tertiary}33`,
  },
  dayName: {
    fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase',
    letterSpacing: '0.06em', color: colors.tertiary, fontFamily: fonts.label,
  },
  addDayBtn: {
    background: 'none', border: 'none', cursor: 'pointer', padding: '0',
    color: colors.tertiary, display: 'flex', alignItems: 'center',
    borderRadius: '50%',
  },
  slotList: { display: 'flex', flexDirection: 'column', gap: '0.25rem' },
  slotRow: {
    display: 'flex', alignItems: 'center', gap: '0.2rem',
    backgroundColor: colors.surfaceContainerLow,
    border: `1px solid ${colors.outlineVariant}33`,
    borderRadius: radius.DEFAULT, padding: '0.25rem 0.375rem',
  },
  slotTime: { fontFamily: 'monospace', fontSize: '0.6875rem', color: colors.onSurface, fontWeight: 600 },

  slotQty:  { fontSize: '0.625rem', fontWeight: 700, color: colors.primary, marginLeft: 'auto' },
  deleteSlotBtn: {
    background: 'none', border: 'none', cursor: 'pointer', padding: '0', marginLeft: '0.125rem',
    color: colors.error, display: 'flex', alignItems: 'center',
  },
  emptyDay: {
    fontSize: '0.75rem', color: colors.outline, textAlign: 'center', display: 'block', padding: '0.5rem 0',
  },
}

const ms = {
  overlay: {
    position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.45)',
    zIndex: 400, display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  modal: {
    backgroundColor: colors.surface, borderRadius: radius.lg,
    padding: '1.5rem', width: '22rem', boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
    display: 'flex', flexDirection: 'column', gap: '1rem', fontFamily: fonts.body,
  },
  title: {
    margin: 0, fontSize: '0.9375rem', fontWeight: 700,
    color: colors.onSurface, fontFamily: fonts.headline,
  },
  row: { display: 'flex', gap: '0.75rem', alignItems: 'flex-end' },
  field: { display: 'flex', flexDirection: 'column', gap: '0.25rem', flex: 1 },
  label: {
    fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase',
    letterSpacing: '0.08em', color: colors.onSurfaceVariant, fontFamily: fonts.label,
  },
  select: {
    padding: '0.375rem 0.5rem',
    border: `1px solid ${colors.outlineVariant}`,
    borderRadius: radius.DEFAULT,
    fontSize: '0.875rem', color: colors.onSurface,
    backgroundColor: colors.surfaceContainerLowest,
    fontFamily: 'monospace', outline: 'none', cursor: 'pointer', width: '100%',
  },
  qtyBtn: {
    width: '1.75rem', height: '1.75rem', border: `1px solid ${colors.outlineVariant}`,
    borderRadius: radius.DEFAULT, backgroundColor: colors.surfaceContainerLowest,
    color: colors.onSurface, cursor: 'pointer', fontWeight: 700, fontSize: '1rem',
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    fontFamily: fonts.body,
  },
  qtyValue: {
    minWidth: '1.5rem', textAlign: 'center', fontSize: '0.9375rem',
    fontWeight: 700, color: colors.onSurface, fontFamily: fonts.body,
  },
  error: { margin: 0, fontSize: '0.8125rem', color: colors.error },
  footer: { display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' },
  cancelBtn: {
    padding: '0.5rem 1rem', background: 'none',
    border: `1px solid ${colors.outlineVariant}`, borderRadius: radius.DEFAULT,
    fontSize: '0.875rem', fontWeight: 500, color: colors.onSurface,
    cursor: 'pointer', fontFamily: fonts.label,
  },
  okBtn: {
    padding: '0.5rem 1.5rem', backgroundColor: colors.primary, border: 'none',
    borderRadius: radius.DEFAULT, fontSize: '0.875rem', fontWeight: 600,
    color: colors.onPrimary, cursor: 'pointer', fontFamily: fonts.label,
  },
}
