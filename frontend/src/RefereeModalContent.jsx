import { useState, useEffect } from 'react'
import { colors, fonts, radius } from './styles'
import ModalField from './ModalField'
import { useLang } from './LangContext'
import { fetchAllAvailabilities } from './api/stadium_availabilities'
import { fetchRefereePreferences, upsertRefereePreference } from './api/referee_preferences'

export function initRefereeForm(referee = {}) {
  return {
    firstName: referee.first_name ?? '',
    lastName:  referee.last_name  ?? '',
    phone:     referee.phone      ?? '',
    email:     referee.email      ?? '',
    comments:  referee.comments   ?? '',
  }
}

const SCORE_COLORS = ['#e53935', '#ffc107', '#ff9800', '#4caf50']
const DAYS_SHORT   = ['Δευτ', 'Τρίτ', 'Τετ', 'Πέμπ', 'Παρ', 'Σαββ', 'Κυρ']

function ScoreChip({ score, avId, editing, refereeId, onChange }) {
  const [busy, setBusy] = useState(false)

  async function handleClick() {
    if (!editing || busy) return
    const next = (score + 1) % 4
    setBusy(true)
    try { await upsertRefereePreference(refereeId, avId, next); onChange(avId, next) }
    finally { setBusy(false) }
  }

  return (
    <div
      onClick={handleClick}
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem',
        padding: '0.5rem 0.625rem', borderRadius: radius.DEFAULT,
        backgroundColor: colors.surfaceContainerLow,
        border: `2px solid ${SCORE_COLORS[score]}`,
        cursor: editing ? 'pointer' : 'default', minWidth: '5rem', transition: 'border-color 0.15s',
      }}
    >
      <div style={{ display: 'flex', gap: '0.2rem' }}>
        {[1,2,3].map(i => (
          <span key={i} style={{ width: '0.5rem', height: '0.5rem', borderRadius: '50%', backgroundColor: i <= score ? SCORE_COLORS[score] : SCORE_COLORS[score] + '33' }} />
        ))}
      </div>
      <span style={{ fontSize: '0.625rem', fontWeight: 700, color: SCORE_COLORS[score], fontFamily: fonts.label }}>
        {score === 0 ? 'Όχι' : score === 1 ? 'Χαμηλή' : score === 2 ? 'Μέση' : 'Υψηλή'}
      </span>
    </div>
  )
}

function StadiumAccordion({ stadium, slots, prefs, editing, refereeId, onPrefChange }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ border: `1px solid ${colors.outlineVariant}33`, borderRadius: radius.DEFAULT, overflow: 'hidden' }}>
      <button
        onClick={() => setOpen(v => !v)}
        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.625rem 0.875rem', background: colors.surfaceContainerLowest, border: 'none', cursor: 'pointer', fontFamily: fonts.body }}
      >
        <span style={{ fontSize: '0.875rem', fontWeight: 600, color: colors.onSurface }}>{stadium.name}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.6875rem', color: colors.outline }}>{slots.length} slot{slots.length !== 1 ? 's' : ''}</span>
          <span className="material-symbols-outlined" style={{ fontSize: '1rem', color: colors.onSurfaceVariant, transform: open ? 'rotate(0)' : 'rotate(-90deg)', transition: 'transform 0.15s' }}>expand_more</span>
        </div>
      </button>
      {open && (
        <div style={{ padding: '0.75rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem', backgroundColor: colors.surface }}>
          {slots.map(av => {
            const pref  = prefs.find(p => p.availability_id === av.id)
            const score = pref ? pref.score : 0
            return (
              <div key={av.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
                <span style={{ fontSize: '0.5625rem', fontWeight: 700, color: colors.onSurfaceVariant, fontFamily: fonts.label, textTransform: 'uppercase' }}>
                  {DAYS_SHORT[av.day]} {av.start_time.slice(0,5)}
                </span>
                <ScoreChip score={score} avId={av.id} editing={editing} refereeId={refereeId} onChange={onPrefChange} />
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function RefereeModalContent({ form, setForm, editing, refereeId }) {
  const { t } = useLang()
  const set = field => value => setForm(f => ({ ...f, [field]: value }))

  const [availabilities, setAvailabilities] = useState([])
  const [stadiums,       setStadiums]       = useState([])
  const [prefs,          setPrefs]          = useState([])

  useEffect(() => {
    fetchAllAvailabilities().then(avs => {
      setAvailabilities(avs)
      const map = {}
      avs.forEach(av => { if (!map[av.stadium_id]) map[av.stadium_id] = { id: av.stadium_id, name: av.stadium_name } })
      setStadiums(Object.values(map))
    }).catch(() => {})
    if (refereeId) fetchRefereePreferences(refereeId).then(setPrefs).catch(() => {})
  }, [refereeId])

  function handlePrefChange(avId, score) {
    setPrefs(prev => {
      const existing = prev.find(p => p.availability_id === avId)
      if (existing) return prev.map(p => p.availability_id === avId ? { ...p, score } : p)
      return [...prev, { availability_id: avId, score, referee_id: refereeId }]
    })
  }

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

      {stadiums.length > 0 && (
        <div>
          <label style={st.sectionLabel}>Προτιμήσεις Γηπέδων</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {stadiums.map(stadium => (
              <StadiumAccordion
                key={stadium.id}
                stadium={stadium}
                slots={availabilities.filter(av => av.stadium_id === stadium.id)}
                prefs={prefs}
                editing={editing}
                refereeId={refereeId}
                onPrefChange={handlePrefChange}
              />
            ))}
          </div>
        </div>
      )}

    </div>
  )
}

const st = {
  body:  { display: 'flex', flexDirection: 'column', gap: '1.5rem' },
  grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' },
  sectionLabel: {
    display: 'block', fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase',
    letterSpacing: '0.1em', color: colors.onSurfaceVariant, marginBottom: '0.75rem', fontFamily: fonts.label,
  },
}
