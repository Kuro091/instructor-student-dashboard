import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useAuth } from '../stores/auth-context'
import { useValidateToken, useStudentSetup } from '../hooks/use-auth-queries'
import { routes } from '@/app/routes'
import { Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react'

const studentSetupSchema = z.object({
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must be less than 20 characters'),
  password: z.string()
    .min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

type StudentSetupFormData = z.infer<typeof studentSetupSchema>

export function StudentSetupPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  
  const [searchParams] = useSearchParams()
  const rawToken = searchParams.get('token') || undefined
  
  let token = rawToken
  if (rawToken?.includes('http')) {
    const tokenMatch = rawToken.match(/token=([^&]+)/)
    token = tokenMatch ? tokenMatch[1] : rawToken
  }
  const { login } = useAuth()
  const navigate = useNavigate()

  const {
    data: tokenData,
    isLoading: isValidatingToken,
    error: tokenError
  } = useValidateToken(token)

  const setupMutation = useStudentSetup()

  const form = useForm<StudentSetupFormData>({
    resolver: zodResolver(studentSetupSchema),
    defaultValues: {
      username: '',
      password: '',
      confirmPassword: ''
    }
  })

  const onSubmit = (data: StudentSetupFormData) => {
    setupMutation.mutate({
      setupToken: token!,
      username: data.username,
      password: data.password
    }, {
      onSuccess: (response) => {
        if (response.success) {
          login(response.data.user)
          navigate(routes.student.dashboard, { replace: true })
        }
      },
    })
  }

  const getPasswordStrength = (password: string) => {
    let strength = 0
    if (password.length >= 6) strength++
    if (/[A-Z]/.test(password)) strength++
    if (/[a-z]/.test(password)) strength++
    if (/[0-9]/.test(password)) strength++
    if (/[^A-Za-z0-9]/.test(password)) strength++
    return strength
  }

  const watchedPassword = form.watch('password')
  const watchedConfirmPassword = form.watch('confirmPassword')
  const passwordStrength = getPasswordStrength(watchedPassword)
  const strengthColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500']
  const strengthLabels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong']

  if (isValidatingToken) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="border-primary border-b-2 rounded-full w-8 h-8 animate-spin"></div>
      </div>
    )
  }

  if (tokenError || !tokenData?.success || !tokenData?.data?.isValid) {
    return (
      <div className="flex justify-center items-center bg-gray-50 px-4 sm:px-6 lg:px-8 py-12 min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <AlertCircle className="mx-auto mb-4 w-12 h-12 text-red-500" />
            <CardTitle className="text-red-600 text-xl">Invalid Setup Link</CardTitle>
            <CardDescription>
              This setup link is invalid or has expired. Please contact your instructor for a new link.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => navigate(routes.login)} 
              className="w-full"
            >
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex justify-center items-center bg-gray-50 px-4 sm:px-6 lg:px-8 py-12 min-h-screen">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="font-bold text-2xl text-center">
            Complete Your Account Setup
          </CardTitle>
          <CardDescription className="text-center">
            Set up your student account for {tokenData?.data?.email}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="Choose a username"
                {...form.register('username')}
              />
              {form.formState.errors.username && (
                <p className="text-red-500 text-sm">{form.formState.errors.username.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create a password"
                  {...form.register('password')}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="top-0 right-0 absolute hover:bg-transparent px-3 py-2 h-full"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </Button>
              </div>
              {form.formState.errors.password && (
                <p className="text-red-500 text-sm">{form.formState.errors.password.message}</p>
              )}
              
              {watchedPassword && (
                <div className="space-y-2">
                  <div className="flex space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded ${
                          i < passwordStrength ? strengthColors[passwordStrength - 1] : 'bg-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-gray-600 text-xs">
                    Password strength: {strengthLabels[passwordStrength - 1] || 'Very Weak'}
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm your password"
                  {...form.register('confirmPassword')}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="top-0 right-0 absolute hover:bg-transparent px-3 py-2 h-full"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </Button>
              </div>
              {form.formState.errors.confirmPassword && (
                <p className="text-red-500 text-sm">{form.formState.errors.confirmPassword.message}</p>
              )}
              
              {watchedConfirmPassword && (
                <div className="flex items-center space-x-2">
                  {watchedPassword === watchedConfirmPassword ? (
                    <>
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-green-600 text-xs">Passwords match</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-4 h-4 text-red-500" />
                      <span className="text-red-600 text-xs">Passwords do not match</span>
                    </>
                  )}
                </div>
              )}
            </div>


            {setupMutation.error && (
              <Alert variant="destructive">
                <AlertCircle className="w-4 h-4" />
                <AlertDescription>
                  {setupMutation.error.message}
                </AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={setupMutation.isPending}
            >
              {setupMutation.isPending ? 'Setting up account...' : 'Complete Setup'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(routes.login)}
              className="text-sm"
            >
              Back to Login
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
