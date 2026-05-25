import { NavLink } from 'react-router-dom'
import { s, colors, fonts } from './styles'
import { useLang } from './LangContext'

export default function Header() {
  const { lang, setLang, t } = useLang()

  const NAV_LINKS = [
    { key: 'nav_dashboard',   to: '/dashboard' },
    { key: 'nav_tournaments', to: '/tournaments' },
    { key: 'nav_entities',    to: '/entities' },
  ]

  return (
    <header style={s.header}>
      <div style={left}>
        <NavLink to="/home" style={logo}>
          Agonas
        </NavLink>
        <nav style={nav}>
          {NAV_LINKS.map(({ key, to }) => (
            <NavLink
              key={to}
              to={to}
              style={({ isActive }) =>
                isActive ? { ...s.navLink, ...s.navLinkActive } : s.navLink
              }
            >
              {t(key)}
            </NavLink>
          ))}
        </nav>
      </div>

      <div style={right}>
        <button
          onClick={() => setLang(l => l === 'gr' ? 'en' : 'gr')}
          style={langBtn}
          title="Switch language"
        >
          <img
            src={lang === 'gr'
              ? 'https://flagcdn.com/w20/gr.png'
              : 'https://flagcdn.com/w20/gb.png'}
            width="20"
            height="14"
            alt={lang === 'gr' ? 'GR' : 'EN'}
            style={{ borderRadius: '2px', display: 'block' }}
          />
          <span>{lang === 'gr' ? 'GR' : 'EN'}</span>
        </button>
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

const langBtn = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.375rem',
  height: '2rem',
  padding: '0 0.625rem',
  background: 'none',
  border: `1px solid ${colors.outlineVariant}`,
  borderRadius: '0.25rem',
  cursor: 'pointer',
  fontSize: '0.75rem',
  fontWeight: 700,
  letterSpacing: '0.04em',
  color: colors.onSurfaceVariant,
  fontFamily: fonts.label,
  marginRight: '0.25rem',
}
