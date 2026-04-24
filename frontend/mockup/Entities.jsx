import { Outlet } from 'react-router-dom'
import SideMenu from './SideMenu'
import { colors, fonts } from './styles'

export default function Entities() {
  return (
    <div style={styles.wrapper}>
      <SideMenu />
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
