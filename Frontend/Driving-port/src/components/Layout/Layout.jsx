import { Outlet } from 'react-router-dom'
import Navbar from '../Navbar/Navbar.jsx'


const Layout = () => {
  return (
    <div className="layout-wrapper">
      <Navbar />
      <main className="layout-main">
        <Outlet />
      </main>
    </div>
  )
}

export default Layout
