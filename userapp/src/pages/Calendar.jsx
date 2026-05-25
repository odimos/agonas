import { useState, useEffect } from 'react'
import { colors, radius } from '../styles'
import { useLang } from '../LangContext'
import { useUser } from '../UserContext'
import TopBar from '../components/TopBar'

const API = '/app/api'
const TODAY = new Date()
TODAY.setHours(0, 0, 0, 0)

const GHOST = '1px solid rgba(194,200,194,0.2)'

function sameDay(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}
const isPast  = d => d < TODAY && !sameDay(d, TODAY)
const isToday = d => sameDay(d, TODAY)

function DayCell({ day, match, date }) {
  const today    = isToday(date)
  const past     = !!match && match.status === 'finished'
  const upcoming = !!match && match.status === 'expected'

  if (today && match) {
    return (
      <div style={{ position: 'relative', width: '2.1rem', height: '2.1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: colors.error }} />
        <span style={{ position: 'relative', zIndex: 1, width: '1.35rem', height: '1.35rem', borderRadius: '50%', background: colors.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 800, color: '#fff' }}>{day}</span>
      </div>
    )
  }

  let bg = 'transparent', color = colors.onSurface
  if (today)    { bg = colors.primary;         color = '#fff' }
  if (upcoming) { bg = colors.error;           color = '#fff' }
  if (past)     { bg = 'rgba(186,26,26,0.22)'; color = colors.error }

  return (
    <span style={{ width: '1.75rem', height: '1.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.875rem', fontWeight: 600, borderRadius: '50%', lineHeight: 1, background: bg, color }}>
      {day}
    </span>
  )
}

function MatchModal({ match, open, onClose, t }) {
  const [rendered, setRendered] = useState(false)
  const [visible,  setVisible]  = useState(false)

  useEffect(() => {
    if (open) { setRendered(true); requestAnimationFrame(() => setVisible(true)) }
    else { setVisible(false); const timer = setTimeout(() => setRendered(false), 320); return () => clearTimeout(timer) }
  }, [open])

  if (!rendered || !match) return null

  const WEEKDAYS     = t('cal_weekdays').split(',')
  const SHORT_MONTHS = t('cal_months_short').split(',')
  const past       = match.status === 'finished'
  const todayMatch = isToday(match.date)
  const dateStr    = `${WEEKDAYS[match.date.getDay()]}, ${SHORT_MONTHS[match.date.getMonth()]} ${match.date.getDate()}, ${match.date.getFullYear()}`

  function daysUntil(d) {
    const diff = Math.round((d - TODAY) / 86400000)
    if (diff === 0) return t('cal_today')
    if (diff === 1) return t('cal_tomorrow')
    if (diff <= 7)  return t('cal_in_days').replace('{n}', diff)
    return `${SHORT_MONTHS[d.getMonth()]} ${d.getDate()}`
  }

  let badgeLabel, badgeColor, badgeBg, middle
  if (past) {
    const cfg = {
      win:  { bg: colors.secondaryContainer, color: colors.tertiary,         label: t('result_win')  },
      loss: { bg: colors.errorContainer,     color: colors.error,            label: t('result_loss') },
      draw: { bg: colors.surfaceContainer,   color: colors.onSurfaceVariant, label: t('result_draw') },
    }[match.result] || { bg: colors.surfaceContainer, color: colors.onSurfaceVariant, label: '' }
    badgeLabel = cfg.label; badgeColor = cfg.color; badgeBg = cfg.bg
    middle = (
      <>
        <span style={{ fontSize: '2.25rem', fontWeight: 900, color: colors.onSurface }}>{match.team_score}</span>
        <span style={{ fontSize: '1.25rem', fontWeight: 700, color: colors.onSurfaceVariant, margin: '0 0.25rem' }}>–</span>
        <span style={{ fontSize: '2.25rem', fontWeight: 900, color: colors.onSurface }}>{match.opp_score}</span>
      </>
    )
  } else {
    badgeLabel = todayMatch ? t('cal_today') : daysUntil(match.date)
    badgeColor = colors.tertiary; badgeBg = colors.secondaryContainer
    middle = <span style={{ fontSize: '1.25rem', fontWeight: 700, color: colors.onSurfaceVariant }}>vs</span>
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, pointerEvents: visible ? 'auto' : 'none' }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: visible ? 'rgba(0,0,0,0.4)' : 'transparent', transition: 'background 0.32s ease' }} />
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: colors.surface, borderRadius: '1rem 1rem 0 0', boxShadow: '0 -4px 24px rgba(0,0,0,0.12)', transform: visible ? 'translateY(0)' : 'translateY(100%)', transition: 'transform 0.32s cubic-bezier(0.32,0.72,0,1)' }}>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '0.75rem 0 0.25rem' }}>
          <div style={{ width: '2.5rem', height: '0.25rem', borderRadius: '1rem', background: colors.outlineVariant }} />
        </div>
        <div style={{ padding: '0.75rem 1.25rem 6rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', padding: '0.25rem 0.75rem', borderRadius: radius.full, background: badgeBg, color: badgeColor }}>{badgeLabel}</span>
            {match.time && <span style={{ fontSize: '0.7rem', color: colors.onSurfaceVariant }}>{match.time}</span>}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', width: '100%', padding: '0 0.5rem' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 700, color: colors.onSurface, flex: 1, textAlign: 'right', lineHeight: 1.3 }}>{match.home_team_name}</span>
            <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>{middle}</div>
            <span style={{ fontSize: '0.875rem', fontWeight: 700, color: colors.onSurface, flex: 1, textAlign: 'left', lineHeight: 1.3 }}>{match.away_team_name}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.7rem', color: colors.onSurfaceVariant, flexWrap: 'wrap', justifyContent: 'center' }}>
            {match.venue && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>location_on</span>
                {match.venue}
              </span>
            )}
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>{match.is_home ? 'home' : 'flight_takeoff'}</span>
              {match.is_home ? t('cal_home') : t('cal_away')}
            </span>
          </div>
          <p style={{ fontSize: '0.65rem', color: colors.onSurfaceVariant, margin: 0 }}>{dateStr}</p>
        </div>
      </div>
    </div>
  )
}

export default function Calendar() {
  const { t } = useLang()
  const { user } = useUser()
  const [matches, setMatches] = useState([])
  const [viewYear,  setViewYear]  = useState(TODAY.getFullYear())
  const [viewMonth, setViewMonth] = useState(TODAY.getMonth())
  const [selectedMatch, setSelectedMatch] = useState(null)
  const [modalOpen,     setModalOpen]     = useState(false)

  useEffect(() => {
    if (!user?.team_id) return
    fetch(`${API}/team/${user.team_id}/matches`).then(r => r.ok ? r.json() : []).then(data => {
      setMatches(data.map(m => ({ ...m, date: new Date(m.scheduled_at) })))
    })
  }, [user])

  const MONTHS       = t('cal_months').split(',')
  const SHORT_MONTHS = t('cal_months_short').split(',')
  const DAY_LABELS   = t('cal_day_labels').split(',')

  function daysUntil(d) {
    const diff = Math.round((d - TODAY) / 86400000)
    if (diff === 0) return t('cal_today')
    if (diff === 1) return t('cal_tomorrow')
    if (diff <= 7)  return t('cal_in_days').replace('{n}', diff)
    return `${SHORT_MONTHS[d.getMonth()]} ${d.getDate()}`
  }

  const RESULT_CFG = {
    win:  { border: colors.tertiary,        label: t('result_win'),  color: colors.tertiary        },
    loss: { border: colors.error,           label: t('result_loss'), color: colors.error           },
    draw: { border: colors.outline,         label: t('result_draw'), color: colors.onSurfaceVariant },
  }

  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1) }
    else setViewMonth(m => m - 1)
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1) }
    else setViewMonth(m => m + 1)
  }

  const startOffset = (new Date(viewYear, viewMonth, 1).getDay() + 6) % 7
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()

  const dayMap = {}
  matches.forEach(m => {
    if (m.date.getFullYear() === viewYear && m.date.getMonth() === viewMonth)
      dayMap[m.date.getDate()] = m
  })

  const upcoming = matches.filter(m => m.status === 'expected').sort((a, b) => a.date - b.date)
  const past     = matches.filter(m => m.status === 'finished').sort((a, b) => b.date - a.date)

  return (
    <div style={{ minHeight: '100dvh', background: colors.background, fontFamily: "'Inter', sans-serif", color: colors.onSurface }}>
      <TopBar />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 1rem', borderBottom: GHOST, background: colors.surface }}>
        <button onClick={prevMonth} style={{ color: colors.primary, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', padding: '0.25rem' }}>
          <span className="material-symbols-outlined">chevron_left</span>
        </button>
        <span style={{ fontSize: '0.875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: colors.primary }}>
          {MONTHS[viewMonth]} {viewYear}
        </span>
        <button onClick={nextMonth} style={{ color: colors.primary, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', padding: '0.25rem' }}>
          <span className="material-symbols-outlined">chevron_right</span>
        </button>
      </div>

      <main style={{ paddingBottom: '5rem' }}>
        <section style={{ padding: '0.75rem 0.75rem 0.5rem', background: colors.surfaceContainerLowest, borderBottom: GHOST }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: '0.25rem' }}>
            {DAY_LABELS.map(d => (
              <span key={d} style={{ textAlign: 'center', fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: colors.onSurfaceVariant, padding: '0.25rem 0' }}>{d}</span>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.25rem 0' }}>
            {Array.from({ length: startOffset }, (_, i) => <div key={`e${i}`} style={{ height: '2.5rem' }} />)}
            {Array.from({ length: daysInMonth }, (_, i) => {
              const day   = i + 1
              const match = dayMap[day]
              const date  = new Date(viewYear, viewMonth, day)
              return (
                <div key={day} onClick={match ? () => { setSelectedMatch(match); setModalOpen(true) } : undefined}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', height: '2.5rem', cursor: match ? 'pointer' : 'default', userSelect: 'none' }}>
                  <DayCell day={day} match={match} date={date} />
                </div>
              )
            })}
          </div>
        </section>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.5rem 1rem', borderBottom: GHOST }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            <div style={{ width: '0.5rem', height: '0.5rem', borderRadius: '50%', background: colors.tertiary }} />
            <span style={{ fontSize: '0.625rem', color: colors.onSurfaceVariant, fontWeight: 500 }}>{t('cal_legend_upcoming')}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            <div style={{ width: '0.5rem', height: '0.5rem', borderRadius: '50%', background: colors.outline }} />
            <span style={{ fontSize: '0.625rem', color: colors.onSurfaceVariant, fontWeight: 500 }}>{t('cal_legend_past')}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            <div style={{ width: '1rem', height: '1rem', borderRadius: '50%', background: colors.primary, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '0.5rem', fontWeight: 700, color: '#fff', lineHeight: 1 }}>{TODAY.getDate()}</span>
            </div>
            <span style={{ fontSize: '0.625rem', color: colors.onSurfaceVariant, fontWeight: 500 }}>{t('cal_legend_today')}</span>
          </div>
        </div>

        <section style={{ padding: '1.25rem 1rem 0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '1.1rem', color: colors.tertiary, fontVariationSettings: "'FILL' 1" }}>upcoming</span>
            <h2 style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: colors.onSurface, margin: 0 }}>{t('cal_upcoming')}</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {upcoming.length === 0
              ? <p style={{ fontSize: '0.875rem', color: colors.onSurfaceVariant, textAlign: 'center', padding: '1rem 0', margin: 0 }}>{t('cal_no_upcoming')}</p>
              : upcoming.map(m => {
                  const ds = `${SHORT_MONTHS[m.date.getMonth()]} ${m.date.getDate()}`
                  const time = m.date.toTimeString().slice(0, 5)
                  return (
                    <div key={m.id} onClick={() => { setSelectedMatch(m); setModalOpen(true) }}
                      style={{ background: colors.surfaceContainerLowest, border: GHOST, borderRadius: radius.xl, overflow: 'hidden', cursor: 'pointer' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem 0.25rem' }}>
                        <span style={{ fontSize: '0.625rem', fontWeight: 700, color: colors.tertiary, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{daysUntil(m.date)}</span>
                        <span style={{ fontSize: '0.625rem', color: colors.onSurfaceVariant }}>{ds} · {time}</span>
                      </div>
                      <div style={{ padding: '0 1rem 0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                        <span style={{ fontSize: '0.875rem', fontWeight: 700, color: colors.onSurface, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.home_team_name}</span>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: colors.onSurfaceVariant }}>vs</span>
                        <span style={{ fontSize: '0.875rem', fontWeight: 700, color: colors.onSurface, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: 'right' }}>{m.away_team_name}</span>
                      </div>
                    </div>
                  )
                })
            }
          </div>
        </section>

        <div style={{ margin: '0.5rem 1rem', borderTop: '1px solid rgba(194,200,194,0.3)' }} />

        <section style={{ padding: '0.75rem 1rem 1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '1.1rem', color: colors.onSurfaceVariant, fontVariationSettings: "'FILL' 1" }}>history</span>
            <h2 style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: colors.onSurface, margin: 0 }}>{t('cal_results')}</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {past.length === 0
              ? <p style={{ fontSize: '0.875rem', color: colors.onSurfaceVariant, textAlign: 'center', padding: '1rem 0', margin: 0 }}>{t('cal_no_past')}</p>
              : past.map(m => {
                  const cfg = RESULT_CFG[m.result] || { border: colors.outline, label: '', color: colors.onSurfaceVariant }
                  const ds = `${SHORT_MONTHS[m.date.getMonth()]} ${m.date.getDate()}`
                  return (
                    <div key={m.id} onClick={() => { setSelectedMatch(m); setModalOpen(true) }}
                      style={{ background: colors.surfaceContainerLowest, border: GHOST, borderRadius: radius.xl, overflow: 'hidden', display: 'flex', borderLeft: `4px solid ${cfg.border}`, cursor: 'pointer' }}>
                      <div style={{ flex: 1, padding: '0.6rem 0.75rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.1rem' }}>
                          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: colors.onSurface, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.home_team_name}</span>
                          <span style={{ fontFamily: 'monospace', fontSize: '0.9rem', fontWeight: 900, color: colors.onSurface, flexShrink: 0 }}>{m.home_team_name === m.away_team_name ? '' : `${m.team_score} – ${m.opp_score}`}</span>
                          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: colors.onSurface, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: 'right' }}>{m.away_team_name}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.3rem' }}>
                          <span style={{ fontSize: '0.6rem', color: colors.onSurfaceVariant }}>{m.venue} · {m.is_home ? t('cal_home') : t('cal_away')}</span>
                          <span style={{ fontSize: '0.6rem', fontWeight: 700, color: cfg.color, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{cfg.label} · {ds}</span>
                        </div>
                      </div>
                    </div>
                  )
                })
            }
          </div>
        </section>
      </main>

      <MatchModal match={selectedMatch} open={modalOpen} onClose={() => setModalOpen(false)} t={t} />
      
    </div>
  )
}
