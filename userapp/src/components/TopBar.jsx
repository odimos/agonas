import { useNavigate } from 'react-router-dom'
import { colors } from '../styles'
import { useUser } from '../UserContext'

const GHOST = '1px solid rgba(194,200,194,0.2)'

export default function TopBar({ left, right }) {
  const navigate = useNavigate()
  const { user } = useUser()

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 50,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 1rem', height: '3.5rem',
      background: `${colors.surface}cc`, backdropFilter: 'blur(12px)',
      borderBottom: GHOST, boxSizing: 'border-box',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', minWidth: 0 }}>
        {left}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
        {right}
        {user?.is_referee && (
          <button onClick={() => navigate('/forms')} style={iconBtn}>
            <span className="material-symbols-outlined">assignment</span>
          </button>
        )}
        <button onClick={() => navigate('/settings')} style={iconBtn}>
          <span className="material-symbols-outlined">settings</span>
        </button>
      </div>
    </header>
  )
}

const iconBtn = {
  color: colors.primary, background: 'none', border: 'none',
  cursor: 'pointer', display: 'flex', padding: '0.25rem',
}
