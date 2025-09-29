import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PhoneInputComponent } from '@/components/ui/phone-input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { authApi } from '../api'
import { routes } from '@/app/routes'

export function LoginPage() {
  const [loginMethod, setLoginMethod] = useState<'phone' | 'email'>('phone')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      if (loginMethod === 'phone') {
        await authApi.createAccessCode({ phone })
      } else {
        await authApi.loginEmail({ email })
      }
      
      // Navigate to verification page with the input value
      const value = loginMethod === 'phone' ? phone : email
      navigate(routes.verify, { state: { method: loginMethod, value } })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send verification code')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex justify-center items-center bg-gray-50 px-4 sm:px-6 lg:px-8 py-12 min-h-screen">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="font-bold text-2xl text-center">
            Welcome Back
          </CardTitle>
          <CardDescription className="text-center">
            Sign in to your classroom management account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Login Method Toggle */}
            <div className="flex space-x-2">
              <Button
                type="button"
                variant={loginMethod === 'phone' ? 'default' : 'outline'}
                onClick={() => setLoginMethod('phone')}
                className="flex-1"
              >
                Phone
              </Button>
              <Button
                type="button"
                variant={loginMethod === 'email' ? 'default' : 'outline'}
                onClick={() => setLoginMethod('email')}
                className="flex-1"
              >
                Email
              </Button>
            </div>

            {/* Input Field */}
            <div className="space-y-2">
              <Label htmlFor={loginMethod}>
                {loginMethod === 'phone' ? 'Phone Number' : 'Email Address'}
              </Label>
              {loginMethod === 'phone' ? (
                <PhoneInputComponent
                  value={phone}
                  onChange={(value) => setPhone(value || '')}
                  placeholder="Enter phone number"
                />
              ) : (
                <Input
                  id="email"
                  type="email"
                  placeholder="student@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 p-3 rounded-md text-red-600 text-sm">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Sending...' : 'Send Verification Code'}
            </Button>
          </form>

          {/* Additional Info */}
          <div className="mt-6 text-gray-600 text-sm text-center">
            <p>
              We'll send a verification code to your {loginMethod === 'phone' ? 'phone' : 'email'}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
