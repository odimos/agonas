import BottomNav from '../components/BottomNav'
import { colors } from '../styles'

export default function Home() {
  return (
    <div style={{ minHeight: '100dvh', background: '#e8f5e9', fontFamily: "'Inter', sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ fontSize: '1.5rem', fontWeight: 700, color: colors.primary, letterSpacing: '0.05em' }}>Home</span>
      <BottomNav />
    </div>
  )
}
