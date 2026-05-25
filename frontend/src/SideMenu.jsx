import { NavLink } from 'react-router-dom'
import { colors, fonts, radius } from './styles'
import { useLang } from './LangContext'
import { useSidebar } from './SidebarContext'

const MENU_LINKS = [
  { key: 'sm_teams',    icon: 'groups',           to: '/entities/teams'    },
  { key: 'sm_players',  icon: 'person',           to: '/entities/players'  },
  { key: 'sm_referees', icon: 'sports',           to: '/entities/referees' },
  { key: 'sm_stadiums', icon: 'stadium',          to: '/entities/stadiums' },
  { key: 'sm_users',    icon: 'account_circle',   to: '/entities/users'    },
  { key: 'sm_requests', icon: 'pending_actions',  to: '/entities/requests' },
]

const W_FULL = '16rem'
const W_MINI = '4rem'

export default function SideMenu() {
  const { t } = useLang()
  const { collapsed, toggle } = useSidebar()

  return (
    <aside style={{ ...styles.aside, width: collapsed ? W_MINI : W_FULL }}>

      {/* Toggle button */}
      <button style={{ ...styles.toggleBtn, justifyContent: collapsed ? 'center' : 'flex-end' }} onClick={toggle} title={collapsed ? 'Expand' : 'Collapse'}>
        <span className="material-symbols-outlined" style={{ fontSize: '1.2rem', color: colors.onSurfaceVariant }}>
          {collapsed ? 'menu' : 'menu_open'}
        </span>
      </button>

      {/* Heading — hidden when collapsed */}
      {!collapsed && (
        <div style={styles.heading}>
          <p style={styles.title}>{t('sm_title')}</p>
          <p style={styles.subtitle}>{t('sm_subtitle')}</p>
        </div>
      )}

      <nav style={{ ...styles.nav, padding: collapsed ? '0 0.5rem' : '0 0.75rem' }}>
        {MENU_LINKS.map(({ key, icon, to }) => (
          <NavLink
            key={to}
            to={to}
            title={collapsed ? t(key) : undefined}
            style={({ isActive }) => ({
              ...styles.link,
              ...(isActive ? styles.linkActive : {}),
              justifyContent: collapsed ? 'center' : 'flex-start',
              padding: collapsed ? '0.75rem' : '0.75rem 1rem',
            })}
          >
            <span className="material-symbols-outlined" style={styles.icon}>{icon}</span>
            {!collapsed && <span>{t(key)}</span>}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}

const styles = {
  aside: {
    paddingTop: '0.75rem',
    borderRight: `1px solid rgba(194, 200, 194, 0.3)`,
    backgroundColor: colors.surfaceContainerLow,
    position: 'fixed',
    top: '4rem',
    left: 0,
    height: 'calc(100vh - 4rem)',
    overflowY: 'auto',
    overflowX: 'hidden',
    zIndex: 40,
    fontFamily: fonts.body,
    transition: 'width 0.2s ease',
  },
  toggleBtn: {
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '0.375rem 0.75rem',
    marginBottom: '0.5rem',
  },
  heading: {
    padding: '0 1.5rem',
    marginBottom: '2rem',
  },
  title: {
    fontSize: '0.65rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    color: colors.onSurfaceVariant,
    margin: 0,
  },
  subtitle: {
    fontSize: '0.625rem',
    color: colors.onSurfaceVariant,
    fontStyle: 'italic',
    margin: '2px 0 0',
    opacity: 0.7,
  },
  nav: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
  },
  link: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    borderRadius: radius.lg,
    color: colors.onSurfaceVariant,
    textDecoration: 'none',
    fontSize: '0.875rem',
    fontWeight: 500,
    transition: 'background-color 0.2s ease',
    borderLeft: '4px solid transparent',
    whiteSpace: 'nowrap',
  },
  linkActive: {
    backgroundColor: colors.surfaceContainerLowest,
    color: colors.tertiary,
    borderLeft: `4px solid ${colors.tertiary}`,
  },
  icon: {
    fontSize: '1.2rem',
    flexShrink: 0,
  },
}
