import { useState } from 'react'
import { colors, radius } from '../styles'
import { useLang } from '../LangContext'

const GHOST = '1px solid rgba(194,200,194,0.2)'

const INITIAL = [
  {
    id: 1,
    icon: 'check_circle',
    iconColor: colors.tertiary,
    title: 'Confirm match on Friday',
    body: 'Team North vs Bay United · Apr 26 · 15:00 · Stadium Nord',
    time: '2h ago',
    read: false,
    type: 'action',
  },
  {
    id: 2,
    icon: 'today',
    iconColor: colors.primary,
    title: 'Match today — kick off at 20:45',
    body: 'Team North vs FC Riviera · Stadium Nord · Good luck!',
    time: '4h ago',
    read: false,
    type: 'info',
  },
  {
    id: 3,
    icon: 'rate_review',
    iconColor: colors.secondary,
    title: 'Evaluate referee form',
    body: 'Please submit your referee evaluation for the Apr 19 match vs Southern Stars.',
    time: '1d ago',
    read: false,
    type: 'action',
  },
  {
    id: 4,
    icon: 'emoji_events',
    iconColor: colors.tertiary,
    title: 'Match result recorded',
    body: 'Team North 3 – 1 Northern Hawks · WIN · APR 12',
    time: '2d ago',
    read: true,
    type: 'info',
  },
  {
    id: 5,
    icon: 'group_add',
    iconColor: colors.primary,
    title: 'New teammate joined',
    body: 'Marcus Silva has joined Team North.',
    time: '3d ago',
    read: true,
    type: 'info',
  },
  {
    id: 6,
    icon: 'calendar_today',
    iconColor: colors.onSurfaceVariant,
    title: 'Schedule updated',
    body: 'May 3 fixture vs City FC moved to 17:00. Check your calendar.',
    time: '4d ago',
    read: true,
    type: 'info',
  },
  {
    id: 7,
    icon: 'rate_review',
    iconColor: colors.secondary,
    title: 'Evaluate referee form',
    body: 'Reminder: evaluation pending for the Apr 8 match vs Coastal Elite.',
    time: '5d ago',
    read: true,
    type: 'action',
  },
  {
    id: 8,
    icon: 'sports_soccer',
    iconColor: colors.tertiary,
    title: 'Goal milestone reached',
    body: 'You have scored 40 career goals. Keep it up!',
    time: '1w ago',
    read: true,
    type: 'info',
  },
]

export default function Notifications() {
  const { t } = useLang()
  const [items, setItems] = useState(INITIAL)

  const unreadCount = items.filter(n => !n.read).length

  function markAllRead() {
    setItems(prev => prev.map(n => ({ ...n, read: true })))
  }

  function markRead(id) {
    setItems(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
  }

  const unread = items.filter(n => !n.read)
  const earlier = items.filter(n => n.read)

  return (
    <div style={{ minHeight: '100dvh', background: colors.background, fontFamily: "'Inter', sans-serif", color: colors.onSurface }}>
      {/* Header */}
      <header style={{ position: 'sticky', top: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 1rem', height: '3.5rem', background: `${colors.surface}e6`, backdropFilter: 'blur(12px)', borderBottom: GHOST, boxSizing: 'border-box' }}>
        <span style={{ fontSize: '0.875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: colors.primary }}>
          {t('notif_title')}
          {unreadCount > 0 && (
            <span style={{ marginLeft: '0.5rem', fontSize: '0.65rem', fontWeight: 700, background: colors.error, color: '#fff', borderRadius: '1rem', padding: '0.1rem 0.45rem', verticalAlign: 'middle' }}>
              {unreadCount}
            </span>
          )}
        </span>
        {unreadCount > 0 && (
          <button onClick={markAllRead} style={{ fontSize: '0.75rem', fontWeight: 600, color: colors.tertiary, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
            {t('notif_mark_all')}
          </button>
        )}
      </header>

      <main style={{ paddingTop: '3.5rem', paddingBottom: '5rem' }}>
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

        {items.length === 0 && (
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
      onClick={() => onRead(n.id)}
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
