import { Outlet } from 'react-router-dom'
import BottomNav from './BottomNav'
import { colors } from '../styles'

export default function Layout() {
  return (
    <div style={{
      height: '100dvh',
      backgroundColor: '#c8cec9',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'flex-start',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '430px',
        height: '100dvh',
        backgroundColor: colors.background,
        boxShadow: '0 0 48px rgba(0,0,0,0.22)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}>
        <div id="app-scroll" style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
          <style>{`#app-scroll > * { min-height: 0 !important; }`}</style>
          <Outlet />
        </div>
        <BottomNav />
      </div>
    </div>
  )
}
