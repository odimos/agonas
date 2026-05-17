import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { colors, radius } from '../styles'
import { useLang } from '../LangContext'
import { useUser } from '../UserContext'

const API = '/app/api'

const GHOST = '1px solid rgba(194,200,194,0.2)'

const LANGUAGES = [
  { code: 'en', label: 'EN', flag: 'https://flagcdn.com/w20/gb.png', name: 'English' },
  { code: 'gr', label: 'GR', flag: 'https://flagcdn.com/w20/gr.png', name: 'Ελληνικά' },
]

const field = {
  width: '100%', boxSizing: 'border-box',
  padding: '0.625rem 0.75rem',
  background: colors.surfaceContainerLowest,
  border: `1px solid ${colors.outlineVariant}`,
  borderRadius: radius.xl,
  fontSize: '0.875rem',
  color: colors.onSurface,
  fontFamily: "'Inter', sans-serif",
  outline: 'none',
}

const sectionTitle = {
  fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase',
  letterSpacing: '0.1em', color: colors.onSurfaceVariant,
  marginBottom: '0.5rem', marginTop: 0,
}

export default function Settings() {
  const navigate = useNavigate()
  const { lang, setLang, t } = useLang()
  const { user, logout } = useUser()
  const [editing, setEditing] = useState(false)
  const [visibility, setVisibility] = useState('public')
  const [form, setForm] = useState({
    username: '',
    name: '',
    surname: '',
    phone: '',
    email: '',
  })
  const [draft, setDraft] = useState({})

  useEffect(() => {
    if (!user) return
    setForm(f => ({ ...f, username: user.username }))
    if (user.is_player) {
      fetch(`${API}/player/me`).then(r => r.ok ? r.json() : null).then(p => {
        if (!p) return
        setForm(f => ({ ...f, name: p.first_name, surname: p.last_name, phone: p.phone, email: p.email }))
      })
    } else if (user.is_referee) {
      fetch(`${API}/referee/me`).then(r => r.ok ? r.json() : null).then(p => {
        if (!p) return
        setForm(f => ({ ...f, name: p.first_name, surname: p.last_name, phone: p.phone, email: p.email }))
      })
    }
  }, [user])

  function enterEdit() {
    setDraft({ form, visibility, lang })
    setEditing(true)
  }
  function save() { setEditing(false) }
  function cancel() {
    setForm(draft.form)
    setVisibility(draft.visibility)
    setLang(draft.lang)
    setEditing(false)
  }

  const FIELD_LABELS = [
    { label: t('settings_username'), key: 'username', type: 'text'  },
    { label: t('settings_name'),     key: 'name',     type: 'text'  },
    { label: t('settings_surname'),  key: 'surname',  type: 'text'  },
    { label: t('settings_phone'),    key: 'phone',    type: 'tel'   },
    { label: t('settings_email'),    key: 'email',    type: 'email' },
  ]

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }))

  return (
    <div style={{ minHeight: '100dvh', background: colors.background, fontFamily: "'Inter', sans-serif", color: colors.onSurface }}>
      {/* TopAppBar */}
      <header style={{ position: 'sticky', top: 0, zIndex: 50, boxSizing: 'border-box', display: 'flex', alignItems: 'center', padding: '0 1rem', height: '3.5rem', background: `${colors.surface}cc`, backdropFilter: 'blur(12px)', borderBottom: GHOST }}>
        <button
          onClick={() => navigate(-1)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: colors.primary, display: 'flex', alignItems: 'center', padding: '0.25rem', marginLeft: '-0.25rem' }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '1.25rem' }}>arrow_back</span>
        </button>
        <h1 style={{ fontSize: '0.875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: colors.primary, margin: '0 auto' }}>{t('settings_title')}</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {editing && (
            <button onClick={cancel} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.8rem', fontWeight: 600, color: colors.onSurfaceVariant }}>{t('btn_cancel')}</button>
          )}
          <button
            onClick={() => editing ? save() : enterEdit()}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.8rem', fontWeight: editing ? 700 : 600, color: editing ? colors.tertiary : colors.primary }}
          >
            {editing ? t('btn_save') : t('btn_edit')}
          </button>
        </div>
      </header>

      <main style={{ paddingTop: '3.5rem', paddingBottom: '5rem' }}>
        <div style={{ padding: '1.25rem 1rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

          {/* Account */}
          <section>
            <p style={sectionTitle}>{t('settings_account')}</p>
            <div style={{ background: colors.surfaceContainerLowest, border: GHOST, borderRadius: radius.xl, overflow: 'hidden' }}>
              {FIELD_LABELS.map(({ label, key, type }, i, arr) => (
                <div
                  key={key}
                  style={{ padding: '0.75rem 1rem', borderBottom: i < arr.length - 1 ? GHOST : 'none', display: 'flex', alignItems: 'center', gap: '0.75rem' }}
                >
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: colors.onSurfaceVariant, minWidth: '5rem' }}>{label}</span>
                  {editing ? (
                    <input
                      type={type}
                      value={form[key]}
                      onChange={set(key)}
                      style={{ ...field, border: 'none', borderBottom: `1px solid ${colors.outlineVariant}`, background: 'transparent', padding: '0 0 0.125rem', flex: 1, fontSize: '0.875rem' }}
                    />
                  ) : (
                    <span style={{ flex: 1, fontSize: '0.875rem', color: colors.onSurface }}>{form[key]}</span>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Privacy */}
          <section>
            <p style={sectionTitle}>{t('settings_privacy')}</p>
            <div style={{ background: colors.surfaceContainerLowest, border: GHOST, borderRadius: radius.xl, padding: '0.75rem 1rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: colors.onSurfaceVariant, display: 'block', marginBottom: '0.625rem' }}>{t('settings_visibility')}</span>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {[
                  { val: 'public',  label: t('settings_public')  },
                  { val: 'private', label: t('settings_private') },
                ].map(({ val, label }) => (
                  <button
                    key={val}
                    onClick={() => editing && setVisibility(val)}
                    style={{
                      flex: 1, padding: '0.5rem', border: `1.5px solid ${visibility === val ? colors.primary : colors.outlineVariant}`,
                      borderRadius: radius.xl, background: visibility === val ? `${colors.primaryContainer}40` : 'transparent',
                      color: visibility === val ? colors.primary : colors.onSurfaceVariant,
                      fontSize: '0.8rem', fontWeight: 600, cursor: editing ? 'pointer' : 'default', fontFamily: 'inherit',
                      opacity: !editing && visibility !== val ? 0.4 : 1,
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Language */}
          <section>
            <p style={sectionTitle}>{t('settings_language')}</p>
            <div style={{ background: colors.surfaceContainerLowest, border: GHOST, borderRadius: radius.xl, padding: '0.75rem 1rem' }}>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {LANGUAGES.map(({ code, label, flag, name }) => (
                  <button
                    key={code}
                    onClick={() => editing && setLang(code)}
                    style={{
                      flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                      padding: '0.5rem', border: `1.5px solid ${lang === code ? colors.primary : colors.outlineVariant}`,
                      borderRadius: radius.xl, background: lang === code ? `${colors.primaryContainer}40` : 'transparent',
                      color: lang === code ? colors.primary : colors.onSurfaceVariant,
                      fontSize: '0.8rem', fontWeight: 600, cursor: editing ? 'pointer' : 'default', fontFamily: 'inherit',
                      opacity: !editing && lang !== code ? 0.4 : 1,
                    }}
                  >
                    <img src={flag} width="20" height="14" alt={label} style={{ borderRadius: '2px', display: 'block' }} />
                    <span>{name}</span>
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Sign out */}
          <section>
            <button
              onClick={logout}
              style={{ width: '100%', padding: '0.875rem', background: 'transparent', color: colors.error, border: `1.5px solid ${colors.error}`, borderRadius: radius.xl, fontSize: '0.875rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', letterSpacing: '0.04em' }}
            >
              Sign Out
            </button>
          </section>

        </div>
      </main>

      
    </div>
  )
}
