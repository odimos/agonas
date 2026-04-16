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
  color: colors.onBackground,
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
    </header>
  )
}
