import { useState, useRef, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { colors, radius } from '../styles'
import { useLang } from '../LangContext'
import { useUser } from '../UserContext'

const GHOST = '1px solid rgba(194,200,194,0.2)'
const API = '/app/api'

const PHOTO_URL = 'https://lh3.googleusercontent.com/aida-public/AB6AXuCBkCHnAwmADB4NVNQl029WFv6xEjDW2ujhKW1D5szW1EdUo9ag9ORUcUCLaUe9DMvbJiY8BPok1c2xCeHmNuaV5_wjrimUUTomUrObt4xbRwxFj2DFuw1lSNEZt0_G-70h4qXyNPS2zW_PnJEuAtK7mcSeHqltTrFcmOBbajPqTHtgMb5243h_kGpJAkBl_F5A7vyL2RhSR7HN4UcOQwwVi44NnCMAdi_qEEvwuYu2_sxcXoxptbfBmZPuC-HxYcsMX2BCqiHLVKw'

const SHORT_MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

function fmtDate(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  return `${d.getDate()} ${SHORT_MONTHS[d.getMonth()].toUpperCase()} ${d.getFullYear()}`
}

export default function User() {
  const navigate = useNavigate()
  const { t } = useLang()
  const { user } = useUser()

  const [goals, setGoals] = useState(null)
  const [recentMatches, setRecentMatches] = useState([])
  const [editing, setEditing] = useState(false)
  const [bio, setBio] = useState('')
  const [draft, setDraft] = useState({})
  const fileRef = useRef(null)

  useEffect(() => {
    if (!user) return
    setBio(user.bio || '')
    if (user.is_player && user.team_id) {
      fetch(`${API}/player/goals`).then(r => r.ok ? r.json() : {goals: 0}).then(d => setGoals(d.goals))
      fetch(`${API}/team/${user.team_id}/matches`).then(r => r.ok ? r.json() : []).then(matches => {
        const finished = matches.filter(m => m.status === 'finished').sort((a, b) => new Date(b.scheduled_at) - new Date(a.scheduled_at)).slice(0, 3)
        setRecentMatches(finished)
      })
    }
  }, [user])

  const RESULT_CFG = {
    win:  { border: colors.tertiary,        color: colors.tertiary,        label: t('result_win')  },
    draw: { border: colors.outline,         color: colors.onSurfaceVariant, label: t('result_draw') },
    loss: { border: colors.error,           color: colors.error,           label: t('result_loss') },
  }

  function enterEdit() {
    setDraft({ bio })
    setEditing(true)
  }
  function cancelEdit() {
    setBio(draft.bio)
    setEditing(false)
  }
  async function saveEdit() {
    await fetch(`${API}/auth/bio`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bio }),
    })
    setEditing(false)
  }

  return (
    <div style={{ minHeight: '100dvh', background: colors.background, fontFamily: "'Inter', sans-serif", color: colors.onSurface }}>
      <header style={{ position: 'sticky', top: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 1rem', height: '3.5rem', background: `${colors.surface}cc`, backdropFilter: 'blur(12px)', borderBottom: GHOST, boxSizing: 'border-box' }}>
        {editing ? (
          <>
            <button onClick={cancelEdit} style={{ fontSize: '0.8rem', fontWeight: 600, color: colors.onSurfaceVariant, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>{t('btn_cancel')}</button>
            <button onClick={saveEdit} style={{ fontSize: '0.8rem', fontWeight: 700, color: colors.tertiary, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>{t('btn_save')}</button>
          </>
        ) : (
          <>
            <button onClick={enterEdit} style={{ fontSize: '0.8rem', fontWeight: 600, color: colors.primary, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>{t('btn_edit')}</button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              {user?.is_referee && (
                <button onClick={() => navigate('/forms')} style={{ color: colors.primary, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', padding: '0.25rem' }}>
                  <span className="material-symbols-outlined">assignment</span>
                </button>
              )}
              <button onClick={() => navigate('/settings')} style={{ color: colors.primary, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', padding: '0.25rem' }}>
                <span className="material-symbols-outlined">settings</span>
              </button>
            </div>
          </>
        )}
      </header>

      <main style={{ paddingTop: '3.5rem', paddingBottom: '5rem' }}>
        {/* Hero */}
        <div style={{ position: 'relative' }}>
          <div style={{ height: '8rem', background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary}, ${colors.tertiary})` }} />
          <div style={{ position: 'absolute', left: '50%', transform: 'translate(-50%, 50%)', bottom: 0 }}>
            <div
              onClick={editing ? () => fileRef.current.click() : undefined}
              style={{ position: 'relative', width: '6rem', height: '6rem', borderRadius: '50%', overflow: 'hidden', border: `4px solid ${colors.surface}`, boxShadow: '0 4px 12px rgba(0,0,0,0.15)', cursor: editing ? 'pointer' : 'default' }}
            >
              <img src={PHOTO_URL} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              {editing && (
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span className="material-symbols-outlined" style={{ color: '#fff', fontSize: '1.75rem' }}>photo_camera</span>
                </div>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} />
          </div>
        </div>

        {/* Identity */}
        <section style={{ marginTop: '4rem', padding: '0 1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '0.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.025em', color: colors.onSurface, margin: 0, textTransform: 'uppercase' }}>{user?.username}</h2>

          {editing ? (
            <textarea
              value={bio}
              onChange={e => setBio(e.target.value)}
              rows={3}
              style={{ fontSize: '0.875rem', color: colors.onSurfaceVariant, lineHeight: 1.5, width: '100%', maxWidth: '20rem', textAlign: 'center', background: colors.surfaceContainer, borderRadius: radius.xl, padding: '0.5rem 0.75rem', resize: 'none', outline: 'none', border: `1px solid rgba(114,121,115,0.3)`, fontFamily: 'inherit' }}
            />
          ) : (
            bio && <p style={{ fontSize: '0.875rem', color: colors.onSurfaceVariant, lineHeight: 1.5, maxWidth: '20rem', margin: 0 }}>{bio}</p>
          )}

          {user?.is_referee && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.25rem 0.75rem', background: colors.surfaceContainerLow, borderRadius: radius.full, marginTop: '0.25rem' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '1rem', color: colors.tertiary, fontVariationSettings: "'FILL' 1" }}>sports</span>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: colors.tertiary, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Referee</span>
            </div>
          )}
          {user?.is_player && user?.team_name && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.25rem 0.75rem', background: colors.secondaryContainer, borderRadius: radius.full, marginTop: '0.25rem' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '1rem', color: colors.onSecondaryContainer, fontVariationSettings: "'FILL' 1" }}>shield</span>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: colors.onSecondaryContainer, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{user.team_name}</span>
            </div>
          )}
        </section>

        {/* Stats */}
        {user?.is_player && (
          <section style={{ padding: '1.5rem 1rem 0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div style={{ background: colors.surfaceContainerLowest, border: GHOST, borderRadius: radius.xl, padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginBottom: '0.25rem' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '1.1rem', color: colors.tertiary, fontVariationSettings: "'FILL' 1" }}>sports_soccer</span>
                <span style={{ fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: colors.onSurfaceVariant }}>{t('user_goals')}</span>
              </div>
              <span style={{ fontSize: '3rem', fontWeight: 900, color: colors.onSurface, lineHeight: 1 }}>{goals ?? '–'}</span>
            </div>
            <div style={{ background: colors.surfaceContainerLowest, border: GHOST, borderRadius: radius.xl, padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginBottom: '0.25rem' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '1.1rem', color: colors.tertiary, fontVariationSettings: "'FILL' 1" }}>emoji_events</span>
                <span style={{ fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: colors.onSurfaceVariant }}>{t('user_awards')}</span>
              </div>
              <span style={{ fontSize: '0.8rem', color: colors.onSurfaceVariant, fontStyle: 'italic' }}>—</span>
            </div>
          </section>
        )}

        {/* Recent Matches — only for players */}
        {user?.is_player && recentMatches.length > 0 && (
          <section style={{ padding: '1rem 1rem 0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: colors.onSurface }}>{t('user_recent_matches')}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {recentMatches.map((m) => {
                const { border, color, label } = RESULT_CFG[m.result] || {}
                return (
                  <div key={m.id} style={{ background: colors.surfaceContainerLowest, borderRadius: radius.xl, overflow: 'hidden', display: 'flex', border: GHOST, borderLeft: `4px solid ${border}` }}>
                    <div style={{ flex: 1, padding: '0.75rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.125rem' }}>
                      <Link to={`/team/${m.is_home ? m.away_team_id : m.home_team_id}`} style={{ fontSize: '0.875rem', fontWeight: 700, color: colors.onSurface, textDecoration: 'none' }}>{m.opponent}</Link>
                      <span style={{ fontSize: '0.625rem', color: colors.onSurfaceVariant }}>{fmtDate(m.scheduled_at)}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0 1rem' }}>
                      <span style={{ fontFamily: 'monospace', fontSize: '0.875rem', fontWeight: 700, color: colors.onSurface }}>{m.team_score} – {m.opp_score}</span>
                      <span style={{ fontSize: '0.625rem', fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        )}
      </main>

      
    </div>
  )
}
