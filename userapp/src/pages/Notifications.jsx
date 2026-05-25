import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { colors, radius } from '../styles'
import { useLang } from '../LangContext'
import { useUser } from '../UserContext'
import TopBar from '../components/TopBar'

const GHOST = '1px solid rgba(194,200,194,0.2)'
const API = '/app/api'
const SHORT_MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

function fmtMatchDate(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  const time = `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`
  return `${SHORT_MONTHS[d.getMonth()]} ${d.getDate()} · ${time}`
}

function relativeTime(iso) {
  if (!iso) return ''
  const diffMs = new Date(iso) - Date.now()
  const abs = Math.abs(diffMs)
  const mins = Math.round(abs / 60000)
  const hours = Math.round(abs / 3600000)
  const days = Math.round(abs / 86400000)
  const inFuture = diffMs > 0
  if (days >= 1)  return inFuture ? `in ${days}d`  : `${days}d ago`
  if (hours >= 1) return inFuture ? `in ${hours}h` : `${hours}h ago`
  return inFuture ? `in ${mins}m` : `${mins}m ago`
}

export default function Notifications() {
  const { t } = useLang()
  const { user } = useUser()
  const navigate = useNavigate()
  const [items, setItems] = useState([])
  const [readIds, setReadIds] = useState(new Set())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    const tasks = []

    // Referee: open forms to submit
    if (user.is_referee) {
      tasks.push(
        fetch(`${API}/referee/matches/open`).then(r => r.ok ? r.json() : []).then(matches =>
          matches.map(m => ({
            id: `form-${m.id}`,
            icon: 'rate_review',
            iconColor: colors.secondary,
            title: 'Φόρμα διαιτητή προς υποβολή',
            body: `${m.home_team_name ?? '?'} vs ${m.away_team_name ?? '?'} · ${m.stadium_name ?? '—'} · ${fmtMatchDate(m.scheduled_at)}`,
            sortAt: m.scheduled_at,
            time: relativeTime(m.scheduled_at),
            type: 'action',
            onClick: () => navigate(`/referee-form/${m.id}`),
          }))
        )
      )
    }

    // Player: upcoming team matches (expected, future)
    if (user.is_player && user.team_id) {
      tasks.push(
        fetch(`${API}/team/${user.team_id}/matches`).then(r => r.ok ? r.json() : []).then(matches =>
          matches
            .filter(m => m.status === 'expected' && m.scheduled_at && new Date(m.scheduled_at) > Date.now())
            .map(m => ({
              id: `match-${m.id}`,
              icon: 'today',
              iconColor: colors.primary,
              title: `Επερχόμενος αγώνας: ${m.is_home ? 'vs' : '@'} ${m.opponent}`,
              body: `${m.venue ?? '—'} · ${fmtMatchDate(m.scheduled_at)}${m.tournament_name ? ` · ${m.tournament_name}` : ''}`,
              sortAt: m.scheduled_at,
              time: relativeTime(m.scheduled_at),
              type: 'info',
            }))
        )
      )
    }

    Promise.all(tasks).then(results => {
      const all = results.flat().sort((a, b) => new Date(a.sortAt) - new Date(b.sortAt))
      setItems(all)
    }).finally(() => setLoading(false))
  }, [user, navigate])

  const decorated = items.map(n => ({ ...n, read: readIds.has(n.id) }))
  const unread = decorated.filter(n => !n.read)
  const earlier = decorated.filter(n => n.read)
  const unreadCount = unread.length

  function markAllRead() {
    setReadIds(new Set(items.map(n => n.id)))
  }
  function markRead(id) {
    setReadIds(prev => new Set([...prev, id]))
  }

  return (
    <div style={{ minHeight: '100dvh', background: colors.background, fontFamily: "'Inter', sans-serif", color: colors.onSurface }}>
      <TopBar
        left={
          <span style={{ fontSize: '0.875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: colors.primary }}>
            {t('notif_title')}
            {unreadCount > 0 && (
              <span style={{ marginLeft: '0.5rem', fontSize: '0.65rem', fontWeight: 700, background: colors.error, color: '#fff', borderRadius: '1rem', padding: '0.1rem 0.45rem', verticalAlign: 'middle' }}>
                {unreadCount}
              </span>
            )}
          </span>
        }
        right={unreadCount > 0 && (
          <button onClick={markAllRead} style={{ fontSize: '0.75rem', fontWeight: 600, color: colors.tertiary, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', padding: '0.25rem 0.5rem' }}>
            {t('notif_mark_all')}
          </button>
        )}
      />

      <main style={{ paddingBottom: '5rem' }}>
        {unread.length > 0 && (
          <section style={{ padding: '1rem 1rem 0.5rem' }}>
            <span style={{ fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: colors.onSurfaceVariant }}>{t('notif_new')}</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
              {unread.map(n => (
                <NotifRow key={n.id} n={n} onRead={markRead} t={t} />
              ))}
            </div>
          </section>
        )}

        {earlier.length > 0 && (
          <section style={{ padding: '1rem 1rem 0.5rem' }}>
            <span style={{ fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: colors.onSurfaceVariant }}>{t('notif_earlier')}</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
              {earlier.map(n => (
                <NotifRow key={n.id} n={n} onRead={markRead} t={t} />
              ))}
            </div>
          </section>
        )}

        {!loading && items.length === 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem 2rem', gap: '0.75rem' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '3rem', color: colors.outlineVariant }}>notifications_off</span>
            <p style={{ fontSize: '0.875rem', color: colors.onSurfaceVariant, margin: 0 }}>{t('notif_none')}</p>
          </div>
        )}
      </main>


    </div>
  )
}

function NotifRow({ n, onRead, t }) {
  return (
    <div
      onClick={() => { onRead(n.id); n.onClick?.() }}
      style={{
        display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
        background: n.read ? colors.surfaceContainerLowest : colors.surfaceContainerLow,
        border: GHOST,
        borderLeft: n.read ? `3px solid transparent` : `3px solid ${n.iconColor}`,
        borderRadius: radius.xl,
        padding: '0.75rem',
        cursor: 'pointer',
        transition: 'opacity 0.15s',
      }}
    >
      <div style={{ flexShrink: 0, width: '2rem', height: '2rem', borderRadius: '50%', background: `${n.iconColor}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span className="material-symbols-outlined" style={{ fontSize: '1.1rem', color: n.iconColor, fontVariationSettings: "'FILL' 1" }}>{n.icon}</span>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.2rem' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: n.read ? 600 : 700, color: colors.onSurface, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{n.title}</span>
          <span style={{ fontSize: '0.6rem', color: colors.onSurfaceVariant, flexShrink: 0 }}>{n.time}</span>
        </div>
        <p style={{ fontSize: '0.7rem', color: colors.onSurfaceVariant, margin: 0, lineHeight: 1.4 }}>{n.body}</p>
        {!n.read && n.type === 'action' && (
          <span style={{ display: 'inline-block', marginTop: '0.4rem', fontSize: '0.6rem', fontWeight: 700, color: n.iconColor, textTransform: 'uppercase', letterSpacing: '0.08em', background: `${n.iconColor}18`, borderRadius: radius.full, padding: '0.15rem 0.5rem' }}>
            {t('notif_action_req')}
          </span>
        )}
      </div>
      {!n.read && (
        <div style={{ flexShrink: 0, width: '0.45rem', height: '0.45rem', borderRadius: '50%', background: n.iconColor, marginTop: '0.35rem' }} />
      )}
    </div>
  )
}
