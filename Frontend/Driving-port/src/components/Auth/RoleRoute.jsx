import { Navigate, Outlet } from 'react-router-dom'
import { useSelector } from 'react-redux'

// Usage: <RoleRoute allowedRoles={['customer']} />
const RoleRoute = ({ allowedRoles }) => {
  const { isAuthenticated, user } = useSelector(state => state.login)

  // Not logged in → go to login
  if (!isAuthenticated) return <Navigate to="/login" replace />

  // Wrong role → go to their own home
  if (!allowedRoles.includes(user?.role)) {
    const roleHome = {
      customer:      '/customer/home',
      driver:        '/driver/dashboard',
      vehicle_owner: '/owner/dashboard',
    }
    return <Navigate to={roleHome[user?.role] || '/login'} replace />
  }

  return <Outlet />
}

export default RoleRoute
