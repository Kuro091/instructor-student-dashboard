import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/features/auth/stores/auth-context'
import { routes } from '@/app/routes'

interface ProtectedRouteProps {
  children: React.ReactNode
  requireAuth?: boolean
  allowedRoles?: ('INSTRUCTOR' | 'STUDENT')[]
}

export function ProtectedRoute({ 
  children, 
  requireAuth = true, 
  allowedRoles 
}: ProtectedRouteProps) {
  const { isAuthenticated, user, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="border-primary border-b-2 rounded-full w-8 h-8 animate-spin"></div>
      </div>
    )
  }

  if (requireAuth && !isAuthenticated) {
    return <Navigate to={routes.login} state={{ from: location }} replace />
  }

  if (!requireAuth && isAuthenticated) {
    const redirectPath = user?.role === 'INSTRUCTOR' 
      ? routes.instructor.dashboard 
      : routes.student.dashboard
    return <Navigate to={redirectPath} replace />
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    const redirectPath = user.role === 'INSTRUCTOR' 
      ? routes.instructor.dashboard 
      : routes.student.dashboard
    return <Navigate to={redirectPath} replace />
  }

  return <>{children}</>
}
