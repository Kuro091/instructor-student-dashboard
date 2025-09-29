import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { routes } from '@/app/routes'

export function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col justify-center items-center bg-background px-4 min-h-screen text-center">
      <div className="space-y-6 max-w-md">
        <h1 className="font-bold text-primary text-9xl">404</h1>
        <h2 className="font-bold text-foreground text-3xl tracking-tight">
          Page not found
        </h2>
        <p className="text-muted-foreground">
          The page you're looking for doesn't exist.
        </p>
        <div className="flex sm:flex-row flex-col justify-center gap-2">
          <Button onClick={() => navigate(-1)} variant="outline">
            Go Back
          </Button>
          <Link to={routes.home}>
            <Button>Go Home</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}