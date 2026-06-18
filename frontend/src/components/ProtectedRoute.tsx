import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import type { UserRole } from '../store/authStore'

interface Props {
  children: React.ReactNode
  allowedRoles?: UserRole[]
}

export default function ProtectedRoute({ children, allowedRoles }: Props) {
  const { isAuthenticated, user } = useAuthStore()

  if (!isAuthenticated) return <Navigate to="/login" replace />

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    // Redirect to the user's home page based on their role
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
