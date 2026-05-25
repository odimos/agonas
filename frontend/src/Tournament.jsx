import { Outlet } from 'react-router-dom'
import TournamentSideMenu from './TournamentSideMenu'
import { useSidebar } from './SidebarContext'
import { colors, fonts } from './styles'

export default function Tournament() {
  const { collapsed } = useSidebar()
  return (
    <div style={styles.wrapper}>
      <TournamentSideMenu />
      <div
        className={collapsed ? 'entities-content entities-content--collapsed' : 'entities-content'}
        style={styles.content}
      >
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
    flex: 1,
    backgroundColor: colors.surface,
    minWidth: 0,
  },
}
