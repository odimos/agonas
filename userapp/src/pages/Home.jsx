import { colors } from '../styles'
import TopBar from '../components/TopBar'

export default function Home() {
  return (
    <div style={{ minHeight: '100dvh', background: colors.background, fontFamily: "'Inter', sans-serif" }}>
      <TopBar />
      <main style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4rem 1rem' }}>
        <span style={{ fontSize: '1.5rem', fontWeight: 700, color: colors.primary, letterSpacing: '0.05em' }}>Home</span>
      </main>
    </div>
  )
}
