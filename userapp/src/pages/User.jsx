import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import BottomNav from '../components/BottomNav'
import { colors, radius } from '../styles'

const GHOST = '1px solid rgba(194,200,194,0.2)'

const PHOTO_URL = 'https://lh3.googleusercontent.com/aida-public/AB6AXuCBkCHnAwmADB4NVNQl029WFv6xEjDW2ujhKW1D5szW1EdUo9ag9ORUcUCLaUe9DMvbJiY8BPok1c2xCeHmNuaV5_wjrimUUTomUrObt4xbRwxFj2DFuw1lSNEZt0_G-70h4qXyNPS2zW_PnJEuAtK7mcSeHqltTrFcmOBbajPqTHtgMb5243h_kGpJAkBl_F5A7vyL2RhSR7HN4UcOQwwVi44NnCMAdi_qEEvwuYu2_sxcXoxptbfBmZPuC-HxYcsMX2BCqiHLVKw'

const TEAMS = ['Team North', 'Coastal Elite', 'Metro United', 'Western Rovers']

const RECENT_MATCHES = [
  { opponent: 'Coastal Elite',  date: '12 OCT 2023', score: '3 – 1', result: 'win'  },
  { opponent: 'Metro United',   date: '05 OCT 2023', score: '2 – 2', result: 'draw' },
  { opponent: 'Western Rovers', date: '28 SEP 2023', score: '0 – 1', result: 'loss' },
]

const RESULT_CFG = {
  win:  { border: colors.tertiary,        color: colors.tertiary,        label: 'Win'  },
  draw: { border: colors.outline,         color: colors.onSurfaceVariant, label: 'Draw' },
  loss: { border: colors.error,           color: colors.error,           label: 'Loss' },
}

const AWARDS = [
  { icon: 'workspace_premium', label: 'Titles', value: '04' },
  { icon: 'stars',             label: 'MVP',    value: '12' },
  { icon: 'military_tech',     label: 'Medal',  value: '01' },
]

export default function User() {
  const navigate = useNavigate()
  const [editing,  setEditing]  = useState(false)
  const [username, setUsername] = useState('JORDAN VANCE')
  const [bio,      setBio]      = useState('Lead forward for Northern Districts. Focused on precision striking and tactical positioning. 3-year league veteran.')
  const [team,     setTeam]     = useState('Team North')
  const [photo,    setPhoto]    = useState(PHOTO_URL)
  const [draft,    setDraft]    = useState({})
  const fileRef = useRef(null)

  function enterEdit() {
    setDraft({ username, bio, team, photo })
    setEditing(true)
  }
  function cancelEdit() {
    setUsername(draft.username)
    setBio(draft.bio)
    setTeam(draft.team)
    setPhoto(draft.photo)
    setEditing(false)
  }
  function saveEdit() { setEditing(false) }

  function onPhotoChange(e) {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => setPhoto(ev.target.result)
    reader.readAsDataURL(file)
  }

  return (
    <div style={{ minHeight: '100dvh', background: colors.background, fontFamily: "'Inter', sans-serif", color: colors.onSurface }}>
      {/* TopAppBar */}
      <header style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 1rem', height: '3.5rem', background: `${colors.surface}cc`, backdropFilter: 'blur(12px)', borderBottom: GHOST, boxSizing: 'border-box' }}>
        {editing ? (
          <>
            <button onClick={cancelEdit} style={{ fontSize: '0.8rem', fontWeight: 600, color: colors.onSurfaceVariant, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>Cancel</button>
            <button onClick={saveEdit}   style={{ fontSize: '0.8rem', fontWeight: 700, color: colors.tertiary,        background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>Save</button>
          </>
        ) : (
          <>
            <button onClick={enterEdit} style={{ fontSize: '0.8rem', fontWeight: 600, color: colors.primary, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>Edit</button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <button onClick={() => navigate('/referee-form')} style={{ color: colors.primary, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', padding: '0.25rem' }}>
                <span className="material-symbols-outlined">assignment</span>
              </button>
              <button style={{ color: colors.primary, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', padding: '0.25rem' }}>
                <span className="material-symbols-outlined">settings</span>
              </button>
            </div>
          </>
        )}
      </header>

      <main style={{ paddingTop: '3.5rem', paddingBottom: '5rem' }}>
        {/* Hero banner + avatar */}
        <div style={{ position: 'relative' }}>
          <div style={{ height: '8rem', background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary}, ${colors.tertiary})` }} />
          <div style={{ position: 'absolute', left: '50%', transform: 'translate(-50%, 50%)', bottom: 0 }}>
            <div
              onClick={editing ? () => fileRef.current.click() : undefined}
              style={{ position: 'relative', width: '6rem', height: '6rem', borderRadius: '50%', overflow: 'hidden', border: `4px solid ${colors.surface}`, boxShadow: '0 4px 12px rgba(0,0,0,0.15)', cursor: editing ? 'pointer' : 'default' }}
            >
              <img src={photo} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              {editing && (
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span className="material-symbols-outlined" style={{ color: '#fff', fontSize: '1.75rem' }}>photo_camera</span>
                </div>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={onPhotoChange} />
          </div>
        </div>

        {/* Identity */}
        <section style={{ marginTop: '4rem', padding: '0 1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '0.5rem' }}>
          {editing ? (
            <input
              value={username}
              onChange={e => setUsername(e.target.value)}
              style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.025em', color: colors.onSurface, textAlign: 'center', background: colors.surfaceContainer, borderRadius: radius.xl, padding: '0.25rem 0.75rem', width: '100%', maxWidth: '20rem', outline: 'none', border: `1px solid rgba(114,121,115,0.3)`, textTransform: 'uppercase', fontFamily: 'inherit' }}
            />
          ) : (
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.025em', color: colors.onSurface, margin: 0, textTransform: 'uppercase' }}>{username}</h2>
          )}

          {editing ? (
            <textarea
              value={bio}
              onChange={e => setBio(e.target.value)}
              rows={3}
              style={{ fontSize: '0.875rem', color: colors.onSurfaceVariant, lineHeight: 1.5, width: '100%', maxWidth: '20rem', textAlign: 'center', background: colors.surfaceContainer, borderRadius: radius.xl, padding: '0.5rem 0.75rem', resize: 'none', outline: 'none', border: `1px solid rgba(114,121,115,0.3)`, fontFamily: 'inherit' }}
            />
          ) : (
            <p style={{ fontSize: '0.875rem', color: colors.onSurfaceVariant, lineHeight: 1.5, maxWidth: '20rem', margin: 0 }}>{bio}</p>
          )}

          {editing ? (
            <select
              value={team}
              onChange={e => setTeam(e.target.value)}
              style={{ fontSize: '0.75rem', fontWeight: 700, color: colors.onSurface, background: colors.surfaceContainer, border: `1px solid rgba(114,121,115,0.3)`, borderRadius: radius.xl, padding: '0.5rem 0.75rem', outline: 'none', width: '100%', maxWidth: '20rem', textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: 'inherit' }}
            >
              {TEAMS.map(t => <option key={t}>{t}</option>)}
            </select>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.25rem 0.75rem', background: colors.secondaryContainer, borderRadius: radius.full, marginTop: '0.25rem' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '1rem', color: colors.onSecondaryContainer, fontVariationSettings: "'FILL' 1" }}>shield</span>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: colors.onSecondaryContainer, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{team}</span>
            </div>
          )}
        </section>

        {/* Stats */}
        <section style={{ padding: '1.5rem 1rem 0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          {/* Goals */}
          <div style={{ background: colors.surfaceContainerLowest, border: GHOST, borderRadius: radius.xl, padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginBottom: '0.25rem' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '1.1rem', color: colors.tertiary, fontVariationSettings: "'FILL' 1" }}>sports_soccer</span>
              <span style={{ fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: colors.onSurfaceVariant }}>Goals</span>
            </div>
            <span style={{ fontSize: '3rem', fontWeight: 900, color: colors.onSurface, lineHeight: 1 }}>42</span>
            <span style={{ fontSize: '0.625rem', fontWeight: 700, color: colors.tertiary, textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '0.25rem' }}>Level 08</span>
          </div>

          {/* Awards */}
          <div style={{ background: colors.surfaceContainerLowest, border: GHOST, borderRadius: radius.xl, padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginBottom: '0.25rem' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '1.1rem', color: colors.tertiary, fontVariationSettings: "'FILL' 1" }}>emoji_events</span>
              <span style={{ fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: colors.onSurfaceVariant }}>Awards</span>
            </div>
            {AWARDS.map(({ icon, label, value }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '1rem', color: colors.tertiary, fontVariationSettings: "'FILL' 1" }}>{icon}</span>
                  <span style={{ fontSize: '0.75rem', color: colors.onSurfaceVariant }}>{label}</span>
                </div>
                <span style={{ fontSize: '0.875rem', fontWeight: 700, color: colors.onSurface }}>{value}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Recent Matches */}
        <section style={{ padding: '1rem 1rem 0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: colors.onSurface }}>Recent Matches</span>
            <span style={{ fontSize: '0.625rem', fontWeight: 500, color: colors.onSurfaceVariant }}>SEASON 24/25</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {RECENT_MATCHES.map((m, i) => {
              const { border, color, label } = RESULT_CFG[m.result]
              return (
                <div key={i} style={{ background: colors.surfaceContainerLowest, borderRadius: radius.xl, overflow: 'hidden', display: 'flex', border: GHOST, borderLeft: `4px solid ${border}` }}>
                  <div style={{ flex: 1, padding: '0.75rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.125rem' }}>
                    <span style={{ fontSize: '0.875rem', fontWeight: 700, color: colors.onSurface }}>{m.opponent}</span>
                    <span style={{ fontSize: '0.625rem', color: colors.onSurfaceVariant }}>{m.date}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0 1rem' }}>
                    <span style={{ fontFamily: 'monospace', fontSize: '0.875rem', fontWeight: 700, color: colors.onSurface }}>{m.score}</span>
                    <span style={{ fontSize: '0.625rem', fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      </main>

      <BottomNav />
    </div>
  )
}
