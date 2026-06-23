import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

interface Props {
  children: React.ReactNode
  allowedRoles?: string[]
}

export default function ProtectedRoute({ children, allowedRoles }: Props) {
  const { user, token } = useAuthStore()
  const isAuthenticated = !!token

  if (!isAuthenticated) return <Navigate to="/login" replace />

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    const homeMap: Record<string, string> = {
      client: '/',
      designer: '/designer/tasks',
      admin: '/admin',
      sales: '/sales',
    }
    return <Navigate to={homeMap[user.role] || '/'} replace />
  }

  return <>{children}</>
}
