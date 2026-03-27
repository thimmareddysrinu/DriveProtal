import { useSelector } from 'react-redux'

export const useAuth = () => {
  const { user, token, isAuthenticated, loading, error } = useSelector(state => state.login)
  return { user, token, isAuthenticated, loading, error }
}
