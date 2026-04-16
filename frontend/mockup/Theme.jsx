import { Routes, Route, Navigate } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'
import { colors, fonts } from './styles'
import Dashboard   from './Dashboard'
import Tournaments from './Tournaments'
import Info        from './Info'
import Stats       from './Stats'

const styles = {
  wrapper: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: colors.background,
    fontFamily: fonts.body,
  },
  content: {
    paddingTop: '4rem',
    flex: 1,
  },
}

export default function Theme() {
  return (
    <div style={styles.wrapper}>
      <Header />
      <main style={styles.content}>
        <Routes>
          <Route path="/"            element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard"   element={<Dashboard />} />
          <Route path="/tournaments" element={<Tournaments />} />
          <Route path="/info"        element={<Info />} />
          <Route path="/stats"       element={<Stats />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}
