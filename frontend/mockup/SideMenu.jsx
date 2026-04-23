import { NavLink } from 'react-router-dom'
import { colors, fonts, radius } from './styles'
import { useLang } from './LangContext'

const MENU_LINKS = [
  { key: 'sm_teams',    icon: 'groups',           to: '/entities/teams'    },
  { key: 'sm_players',  icon: 'person',           to: '/entities/players'  },
  { key: 'sm_referees', icon: 'sports',           to: '/entities/referees' },
  { key: 'sm_stadiums', icon: 'stadium',          to: '/entities/stadiums' },
  { key: 'sm_requests', icon: 'pending_actions',  to: '/entities/requests' },
]

export default function SideMenu() {
  const { t } = useLang()
  return (
    <aside style={styles.aside}>
      <div style={styles.heading}>
        <p style={styles.title}>{t('sm_title')}</p>
        <p style={styles.subtitle}>{t('sm_subtitle')}</p>
      </div>
      <nav style={styles.nav}>
        {MENU_LINKS.map(({ key, icon, to }) => (
          <NavLink
            key={to}
            to={to}
            style={({ isActive }) => isActive ? { ...styles.link, ...styles.linkActive } : styles.link}
          >
            <span className="material-symbols-outlined" style={styles.icon}>{icon}</span>
            <span>{t(key)}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}

const styles = {
  aside: {
    width: '16rem',
    paddingTop: '2rem',
    borderRight: `1px solid rgba(194, 200, 194, 0.3)`,
    backgroundColor: colors.surfaceContainerLow,
    position: 'fixed',
    top: '4rem',
    left: 0,
    height: 'calc(100vh - 4rem)',
    overflowY: 'auto',
    zIndex: 40,
    fontFamily: fonts.body,
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
    padding: '0 0.75rem',
  },
  link: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.75rem 1rem',
    borderRadius: radius.lg,
    color: colors.onSurfaceVariant,
    textDecoration: 'none',
    fontSize: '0.875rem',
    fontWeight: 500,
    transition: 'background-color 0.2s ease',
    borderLeft: '4px solid transparent',
  },
  linkActive: {
    backgroundColor: colors.surfaceContainerLowest,
    color: colors.tertiary,
    borderLeft: `4px solid ${colors.tertiary}`,
  },
  icon: {
    fontSize: '1.2rem',
  },
}
