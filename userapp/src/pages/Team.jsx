import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { colors, radius } from '../styles'
import { useLang } from '../LangContext'
import { useUser } from '../UserContext'

const GHOST = '1px solid rgba(194,200,194,0.2)'
const API = '/app/api'

const SHORT_MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

function fmtDate(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  return `${SHORT_MONTHS[d.getMonth()]} ${d.getDate()}`
}

const RESULT_BORDER = { win: colors.tertiary, draw: colors.outline, loss: colors.error }
const RESULT_COLOR  = { win: colors.tertiary, draw: colors.onSurfaceVariant, loss: colors.error }

export default function Team() {
  const navigate = useNavigate()
  const { t } = useLang()
  const { user } = useUser()

  const [teamData, setTeamData] = useState(null)
  const [matches, setMatches] = useState([])
  const [squadOpen, setSquadOpen] = useState(false)
  const [editing, setEditing] = useState(false)
  const [logo, setLogo] = useState(null)
  const [uploadBusy, setUploadBusy] = useState(false)
  const logoRef = useRef(null)

  useEffect(() => {
    if (!user?.team_id) return
    fetch(`${API}/team/${user.team_id}/info`).then(r => r.ok ? r.json() : null).then(data => {
      setTeamData(data)
    })
    fetch(`${API}/team/${user.team_id}/matches`).then(r => r.ok ? r.json() : []).then(data => {
      const finished = data.filter(m => m.status === 'finished').sort((a, b) => new Date(b.scheduled_at) - new Date(a.scheduled_at))
      setMatches(finished)
    })
    fetch(`${API}/team/${user.team_id}/photo`).then(r => r.ok ? r.json() : null).then(data => {
      if (data?.photo_url) setLogo(data.photo_url)
    }).catch(() => {})
  }, [user])

  function enterEdit() { setEditing(true) }
  function cancelEdit() { setEditing(false) }
  function saveEdit() { setEditing(false) }

  async function onLogoChange(e) {
    const file = e.target.files[0]
    if (!file) return
    setUploadBusy(true)
    try {
      const form = new FormData()
      form.append('photo', file)
      const res = await fetch(`${API}/team/photo`, { method: 'POST', body: form })
      if (res.ok) {
        const data = await res.json()
        setLogo(data.photo_url)
      }
    } finally {
      setUploadBusy(false)
      e.target.value = ''
    }
  }

  const teamName = teamData?.name || '…'
  const wins = teamData?.wins ?? 0
  const draws = teamData?.draws ?? 0
  const losses = teamData?.losses ?? 0
  const players = teamData?.players || []
  const tournaments = teamData?.tournaments || []

  return (
    <div style={{ minHeight: '100dvh', background: colors.background, fontFamily: "'Inter', sans-serif", color: colors.onSurface }}>
      <header style={{ position: 'sticky', top: 0, zIndex: 50, boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 1rem', height: '3.5rem', background: `${colors.surface}cc`, backdropFilter: 'blur(12px)', borderBottom: GHOST }}>
        {editing ? (
          <>
            <button onClick={cancelEdit} style={{ fontSize: '0.8rem', fontWeight: 600, color: colors.onSurfaceVariant, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>{t('btn_cancel')}</button>
            <button onClick={saveEdit} style={{ fontSize: '0.8rem', fontWeight: 700, color: colors.tertiary, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>{t('btn_save')}</button>
          </>
        ) : (
          <>
            <div style={{ width: '2rem' }} />
            <h1 style={{ fontSize: '0.875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: colors.primary, margin: 0 }}>{t('team_title')}</h1>
            {user?.is_captain && <button onClick={enterEdit} style={{ fontSize: '0.8rem', fontWeight: 600, color: colors.primary, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>{t('btn_edit')}</button>}
            {!user?.is_captain && <div style={{ width: '2rem' }} />}
          </>
        )}
      </header>

      <main style={{ paddingTop: '3.5rem', paddingBottom: '5rem' }}>
        {/* Hero */}
        <div style={{ position: 'relative' }}>
          <div style={{ height: '7rem', background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary}, ${colors.tertiary})` }} />
          <div style={{ position: 'absolute', left: '50%', transform: 'translate(-50%, 50%)', bottom: 0 }}>
            <div
              onClick={editing ? () => logoRef.current.click() : undefined}
              style={{ position: 'relative', width: '6rem', height: '6rem', borderRadius: '1rem', border: `4px solid ${colors.surface}`, boxShadow: '0 4px 12px rgba(0,0,0,0.15)', background: '#1a3329', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.125rem', cursor: editing ? 'pointer' : 'default', overflow: 'hidden' }}
            >
              {logo
                ? <img src={logo} alt="Team logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <>
                    <span className="material-symbols-outlined" style={{ fontSize: '2rem', color: colors.secondaryContainer, fontVariationSettings: "'FILL' 1" }}>shield</span>
                  </>
              }
              {editing && <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span className="material-symbols-outlined" style={{ color: '#fff', fontSize: '1.75rem' }}>{uploadBusy ? 'hourglass_empty' : 'photo_camera'}</span>
              </div>}
            </div>
            <input ref={logoRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={onLogoChange} disabled={uploadBusy} />
          </div>
        </div>

        {/* Team identity */}
        <section style={{ marginTop: '4rem', padding: '0 1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '0.25rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.025em', color: colors.onSurface, margin: 0 }}>{teamName}</h2>
        </section>

        {/* Season stats */}
        <section style={{ padding: '1.25rem 1rem 0' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
            {[
              { value: wins,   label: t('team_won'),   color: colors.tertiary        },
              { value: draws,  label: t('team_drawn'), color: colors.onSurfaceVariant },
              { value: losses, label: t('team_lost'),  color: colors.error            },
            ].map(({ value, label, color }) => (
              <div key={label} style={{ background: colors.surfaceContainerLowest, border: GHOST, borderRadius: radius.xl, padding: '0.75rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.125rem' }}>
                <span style={{ fontSize: '1.875rem', fontWeight: 900, color }}>{value}</span>
                <span style={{ fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: colors.onSurfaceVariant }}>{label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Squad */}
        <section style={{ marginTop: '1.25rem', padding: '0 1rem' }}>
          <button
            onClick={() => setSquadOpen(o => !o)}
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: colors.surfaceContainerLowest, border: GHOST, borderRadius: squadOpen ? `${radius.xl} ${radius.xl} 0 0` : radius.xl, padding: '0.75rem 1rem', cursor: 'pointer' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '1.1rem', color: colors.tertiary, fontVariationSettings: "'FILL' 1" }}>person</span>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: colors.onSurface }}>Players ({players.length})</span>
            </div>
            <span className="material-symbols-outlined" style={{ fontSize: '1.1rem', color: colors.onSurfaceVariant, transition: 'transform 0.2s', transform: squadOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>expand_more</span>
          </button>
          {squadOpen && (
            <div style={{ background: colors.surfaceContainerLowest, border: GHOST, borderTop: 'none', borderRadius: `0 0 ${radius.xl} ${radius.xl}`, overflow: 'hidden' }}>
              {players.map((p, i) => (
                <div
                  key={p.id}
                  onClick={() => navigate(`/player/${p.id}`)}
                  style={{ padding: '0.625rem 1rem', borderTop: i === 0 ? 'none' : GHOST, fontSize: '0.875rem', fontWeight: 500, color: colors.onSurface, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                >
                  <span>{p.first_name} {p.last_name}{p.nickname ? ` · ${p.nickname}` : ''}</span>
                  <span className="material-symbols-outlined" style={{ fontSize: '1rem', color: colors.onSurfaceVariant }}>chevron_right</span>
                </div>
              ))}
              {players.length === 0 && <div style={{ padding: '0.75rem 1rem', fontSize: '0.875rem', color: colors.onSurfaceVariant }}>No players</div>}
            </div>
          )}
        </section>

        {/* Tournaments */}
        {tournaments.length > 0 && (
          <section style={{ padding: '1.25rem 1rem 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '1.1rem', color: colors.tertiary, fontVariationSettings: "'FILL' 1" }}>emoji_events</span>
              <h2 style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: colors.onSurface, margin: 0 }}>{t('team_tournaments')}</h2>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {tournaments.map(tour => {
                const isKnockout = tour.type === 'knockout'
                const openPhase = tour.phases.find(p => p.is_open)
                const lastPhase = tour.phases[tour.phases.length - 1]
                const displayPhase = openPhase || lastPhase
                const eliminated = !openPhase && lastPhase
                return (
                  <div key={tour.id} style={{ background: colors.surfaceContainerLowest, border: GHOST, borderRadius: radius.xl, overflow: 'hidden', opacity: eliminated && !openPhase ? 0.65 : 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', borderBottom: GHOST, background: `${colors.surfaceContainerLow}99` }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '1.1rem', color: isKnockout ? colors.onSurfaceVariant : colors.tertiary, fontVariationSettings: "'FILL' 1" }}>
                          {isKnockout ? 'workspace_premium' : 'social_leaderboard'}
                        </span>
                        <span style={{ fontSize: '0.875rem', fontWeight: 700, color: colors.onSurface }}>{tour.name}</span>
                      </div>
                      <span style={{ fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: colors.onSurfaceVariant }}>{isKnockout ? 'Knockout' : 'League'}</span>
                    </div>
                    <div style={{ padding: '0.75rem 1rem' }}>
                      {isKnockout ? (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div>
                            <span style={{ fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: colors.onSurfaceVariant, display: 'block', marginBottom: '0.25rem' }}>
                              {openPhase ? 'Current Phase' : 'Eliminated at'}
                            </span>
                            <span style={{ fontSize: '0.875rem', fontWeight: 700, color: colors.onSurface }}>Phase {displayPhase?.order}</span>
                          </div>
                          {!openPhase && (
                            <span style={{ fontSize: '0.625rem', fontWeight: 700, color: colors.error, background: `${colors.errorContainer}80`, padding: '0.25rem 0.5rem', borderRadius: radius.full, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Eliminated</span>
                          )}
                        </div>
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <div>
                            <span style={{ fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: colors.onSurfaceVariant, display: 'block', marginBottom: '0.25rem' }}>Phase</span>
                            <span style={{ fontSize: '0.875rem', fontWeight: 700, color: colors.onSurface }}>Phase {displayPhase?.order}</span>
                          </div>
                          {!openPhase && (
                            <span style={{ fontSize: '0.625rem', fontWeight: 700, color: colors.onSurfaceVariant, background: colors.surfaceContainer, padding: '0.25rem 0.5rem', borderRadius: radius.full, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Completed</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* Match History */}
        {matches.length > 0 && (
          <section style={{ padding: '1.25rem 1rem 1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '1.1rem', color: colors.onSurfaceVariant, fontVariationSettings: "'FILL' 1" }}>history</span>
              <h2 style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: colors.onSurface, margin: 0 }}>{t('team_history')}</h2>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {matches.map(m => (
                <div key={m.id} style={{ background: colors.surfaceContainerLowest, border: GHOST, borderRadius: radius.xl, overflow: 'hidden', display: 'flex', borderLeft: `4px solid ${RESULT_BORDER[m.result] || colors.outline}` }}>
                  <div style={{ flex: 1, padding: '0.75rem 1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                      <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        <span onClick={() => navigate(`/team/${m.home_team_id}`)} style={{ fontSize: '0.875rem', fontWeight: 700, color: colors.onSurface, cursor: 'pointer' }}>{m.home_team_name}</span>
                      </span>
                      <span style={{ fontFamily: 'monospace', fontSize: '1rem', fontWeight: 900, color: colors.onSurface, flexShrink: 0 }}>{m.team_score} – {m.opp_score}</span>
                      <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: 'right' }}>
                        <span onClick={() => navigate(`/team/${m.away_team_id}`)} style={{ fontSize: '0.875rem', fontWeight: 700, color: colors.onSurface, cursor: 'pointer' }}>{m.away_team_name}</span>
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.25rem' }}>
                      <span style={{ fontSize: '0.625rem', color: colors.onSurfaceVariant }}>{m.venue} · {m.is_home ? t('cal_home') : t('cal_away')}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '0.625rem', color: colors.onSurfaceVariant }}>{fmtDate(m.scheduled_at)}</span>
                        <span style={{ fontSize: '0.625rem', fontWeight: 700, color: RESULT_COLOR[m.result] || colors.onSurfaceVariant, textTransform: 'uppercase' }}>{t(`team_${m.result}`) || m.result}</span>
                        {m.tournament_name && <span style={{ fontSize: '0.55rem', color: colors.onSurfaceVariant, background: colors.surfaceContainer, padding: '0.125rem 0.375rem', borderRadius: radius.lg }}>{m.tournament_name}</span>}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      
    </div>
  )
}
