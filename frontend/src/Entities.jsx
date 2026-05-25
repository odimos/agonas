import { Outlet } from 'react-router-dom'
import SideMenu from './SideMenu'
import { useSidebar } from './SidebarContext'
import { colors, fonts } from './styles'

const W_FULL = '16rem'
const W_MINI = '4rem'

export default function Entities() {
  const { collapsed } = useSidebar()
  return (
    <div style={styles.wrapper}>
      <SideMenu />
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
