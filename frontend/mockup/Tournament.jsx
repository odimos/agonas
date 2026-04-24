import { Outlet } from 'react-router-dom'
import TournamentSideMenu from './TournamentSideMenu'
import { colors, fonts } from './styles'

export default function Tournament() {
  return (
    <div style={styles.wrapper}>
      <TournamentSideMenu />
      <div style={styles.content}>
        <Outlet />
      </div>
    </div>
  )
}

const styles = {
  wrapper: {
    display: 'flex',
    flex: 1,
    minHeight: 'calc(100vh - 4rem)',
    fontFamily: fonts.body,
  },
  content: {
    marginLeft: '16rem',
    flex: 1,
    width: 'calc(100vw - 16rem)',
    backgroundColor: colors.surface,
  },
}
