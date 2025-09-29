import { Navigate } from 'react-router-dom'
import { useAuth } from '@/features/auth/stores/auth-context'
import { routes } from './routes'

export function HomePage() {
  const { isAuthenticated, user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="border-primary border-b-2 rounded-full w-8 h-8 animate-spin"></div>
      </div>
    )
  }

  if (isAuthenticated && user) {
    const redirectPath = user.role === 'INSTRUCTOR' 
      ? routes.instructor.dashboard 
      : routes.student.dashboard
    return <Navigate to={redirectPath} replace />
  }

  return <Navigate to={routes.login} replace />
}
