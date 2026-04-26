// frontend/src/components/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth()

  if (loading) return null

  if (!user) return <Navigate to="/login" replace />

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirigir al dashboard correspondiente
    const redirects = {
      SUPER_ADMIN: '/admin',
      TRAINER: '/trainer',
      MEMBER: '/member',
    }
    return <Navigate to={redirects[user.role] || '/login'} replace />
  }

  return children
}

export default ProtectedRoute
