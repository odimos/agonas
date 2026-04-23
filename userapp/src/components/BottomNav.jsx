import { useNavigate, useLocation } from 'react-router-dom'
import { colors } from '../styles'

const ITEMS = [
  { icon: 'home',           path: '/'             },
  { icon: 'person',         path: '/user'         },
  { icon: 'calendar_today', path: '/calendar'     },
  { icon: 'groups',         path: '/team'         },
  { icon: 'notifications',  path: '/notifications'},
]

export default function BottomNav() {
  const navigate = useNavigate()
  const { pathname } = useLocation()

  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: 0, width: '100%', zIndex: 50,
      display: 'flex', justifyContent: 'space-around', alignItems: 'center',
      height: '4rem', backgroundColor: colors.surface,
      borderTop: '1px solid rgba(194,200,194,0.2)',
    }}>
      {ITEMS.map(item => {
        const active = item.path === '/'
          ? pathname === '/'
          : pathname.startsWith(item.path)
        return (
          <button
            key={item.icon}
            onClick={() => navigate(item.path)}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              height: '100%', flex: 1, border: 'none', background: 'none',
              cursor: 'pointer',
              color: active ? colors.tertiary : colors.onSurfaceVariant,
              borderTop: active ? `2px solid ${colors.tertiary}` : '2px solid transparent',
            }}
          >
            <span
              className="material-symbols-outlined"
              style={{ fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0" }}
            >
              {item.icon}
            </span>
          </button>
        )
      })}
    </nav>
  )
}
