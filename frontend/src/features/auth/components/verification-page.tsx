import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { useAuth } from '../stores/auth-context'
import { authApi } from '../api'
import { routes } from '@/app/routes'

export function VerificationPage() {
  const [code, setCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [resendCooldown, setResendCooldown] = useState(0)
  
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  
  const { method, value } = location.state || { method: 'phone', value: '' }

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendCooldown])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (code.length !== 6) {
      setError('Please enter a 6-digit verification code')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const loginData = method === 'phone' 
        ? { phone: value, accessCode: code }
        : { email: value, accessCode: code }
      
      const response = await authApi.validateAccessCode(loginData)
      login(response.data.user)
      
      const redirectPath = response.data.user.role === 'INSTRUCTOR' 
        ? routes.instructor.dashboard 
        : routes.student.dashboard
      navigate(redirectPath, { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid verification code')
    } finally {
      setIsLoading(false)
    }
  }

  const handleResend = async () => {
    setIsLoading(true)
    setError('')

    try {
      if (method === 'phone') {
        await authApi.createAccessCode({ phone: value })
      } else {
        await authApi.loginEmail({ email: value })
      }
      setResendCooldown(60)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resend code')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex justify-center items-center bg-gray-50 px-4 sm:px-6 lg:px-8 py-12 min-h-screen">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="font-bold text-2xl text-center">
            Verify Your {method === 'phone' ? 'Phone' : 'Email'}
          </CardTitle>
          <CardDescription className="text-center">
            Enter the 6-digit code sent to {value}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="code">Verification Code</Label>
              <Input
                id="code"
                type="text"
                placeholder="123456"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                maxLength={6}
                className="text-2xl text-center tracking-widest"
                required
              />
            </div>

            {error && (
              <div className="bg-red-50 p-3 rounded-md text-red-600 text-sm">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || code.length !== 6}
            >
              {isLoading ? 'Verifying...' : 'Verify Code'}
            </Button>

            <div className="text-center">
              <Button
                type="button"
                variant="link"
                onClick={handleResend}
                disabled={isLoading || resendCooldown > 0}
                className="text-sm"
              >
                {resendCooldown > 0 
                  ? `Resend code in ${resendCooldown}s` 
                  : 'Resend verification code'
                }
              </Button>
            </div>
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
