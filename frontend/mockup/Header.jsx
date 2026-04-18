import { NavLink } from 'react-router-dom'
import { s, colors, fonts } from './styles'

const NAV_LINKS = [
  { label: 'Dashboard',   to: '/dashboard' },
  { label: 'Tournaments', to: '/tournaments' },
  { label: 'Info',        to: '/info' },
  { label: 'Stats',       to: '/stats' },
]

const logo = {
  fontSize: '1.2rem',
  fontWeight: 700,
  letterSpacing: '-0.02em',
  color: colors.primary,
  textDecoration: 'none',
  whiteSpace: 'nowrap',
  fontFamily: fonts.headline,
}

const nav = {
  display: 'flex',
  gap: '1.5rem',
  alignItems: 'center',
}

const left = {
  display: 'flex',
  alignItems: 'center',
  gap: '2rem',
}

const right = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.25rem',
}

const iconBtn = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '2.25rem',
  height: '2.25rem',
  background: 'none',
  border: 'none',
  borderRadius: '0.25rem',
  cursor: 'pointer',
}

const iconSt = {
  fontSize: '1.25rem',
  color: colors.onSurfaceVariant,
}

const avatar = {
  width: '2.25rem',
  height: '2.25rem',
  borderRadius: '50%',
  backgroundColor: colors.surfaceContainerHigh,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  marginLeft: '0.25rem',
}

export default function Header() {
  return (
    <header style={s.header}>
      <div style={left}>
        <NavLink to="/home" style={logo}>
          Agonas
        </NavLink>
        <nav style={nav}>
          {NAV_LINKS.map(({ label, to }) => (
            <NavLink
              key={to}
              to={to}
              style={({ isActive }) =>
                isActive
                  ? { ...s.navLink, ...s.navLinkActive }
                  : s.navLink
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>
      </div>

      <div style={right}>
        <button style={iconBtn}>
          <span className="material-symbols-outlined" style={iconSt}>notifications</span>
        </button>
        <button style={iconBtn}>
          <span className="material-symbols-outlined" style={iconSt}>settings</span>
        </button>
        <div style={avatar}>
          <span className="material-symbols-outlined" style={{ fontSize: '1.25rem', color: colors.onSurfaceVariant }}>person</span>
        </div>
      </div>
    </header>
  )
}
