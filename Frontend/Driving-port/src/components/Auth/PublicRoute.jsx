import { Navigate, Outlet } from 'react-router-dom'
import { useSelector } from 'react-redux'

/**
 * PublicRoute – wraps pages like /login and /register.
 * If the user is already authenticated, redirect them to their role-home
 * so they can never reach the login page while logged in.
 */
const PublicRoute = () => {
  const { isAuthenticated, user } = useSelector(state => state.login)

  if (isAuthenticated) {
    const roleHome = {
      customer:      '/customer/home',
      driver:        '/driver/dashboard',
      vehicle_owner: '/owner/dashboard',
    }
    return <Navigate to={roleHome[user?.role] || '/customer/home'} replace />
  }

  return <Outlet />
}

export default PublicRoute
