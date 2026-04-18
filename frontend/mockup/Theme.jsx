import { Routes, Route, Navigate } from 'react-router-dom'
import Header     from './Header'
import { colors, fonts } from './styles'
import Dashboard          from './Dashboard'
import Tournament         from './Tournament'
import TournamentOverview from './TournamentOverview'
import Phase             from './Phase'
import Info               from './Info'
import Stats              from './Stats'
import Teams              from './Teams'
import Players            from './Players'
import Referees           from './Referees'
import Stadiums           from './Stadiums'

const styles = {
  // Break out of #root's 1126px centered constraint without transform
  // (transform creates a stacking context that breaks position:fixed children)
  wrapper: {
    width: '100vw',
    marginLeft: 'calc(-50vw + 50%)',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: colors.background,
    fontFamily: fonts.body,
    textAlign: 'left',
  },
  content: {
    paddingTop: '4rem',
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
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
          <Route path="/tournaments" element={<Tournament />}>
            <Route index             element={<Navigate to="/tournaments/1" replace />} />
            <Route path=":id"                    element={<TournamentOverview />} />
            <Route path=":id/phases/:phaseId"   element={<Phase />} />
          </Route>
          <Route path="/info"        element={<Info />}>
            <Route index             element={<Navigate to="/info/teams" replace />} />
            <Route path="teams"      element={<Teams />} />
            <Route path="players"    element={<Players />} />
            <Route path="referees"   element={<Referees />} />
            <Route path="stadiums"   element={<Stadiums />} />
          </Route>
          <Route path="/stats"       element={<Stats />} />
        </Routes>
      </main>
    </div>
  )
}
