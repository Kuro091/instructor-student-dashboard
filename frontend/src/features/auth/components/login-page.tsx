import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PhoneInputComponent } from '@/components/ui/phone-input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { useCreateAccessCode, useLoginEmail } from '../hooks/use-auth-queries'
import { routes } from '@/app/routes'

type LoginFormData = {
  phone?: string
  email?: string
}

export function LoginPage() {
  const [loginMethod, setLoginMethod] = useState<'phone' | 'email'>('phone')
  
  const navigate = useNavigate()
  const createAccessCodeMutation = useCreateAccessCode()
  const loginEmailMutation = useLoginEmail()

  const form = useForm<LoginFormData>({
    defaultValues: {
      phone: '',
      email: ''
    }
  })

  useEffect(() => {
    form.clearErrors()
  }, [loginMethod, form])

  const onSubmit = async (data: LoginFormData) => {
      if (loginMethod === 'phone') {
        if (!data.phone || data.phone.trim() === '') {
          form.setError('phone', { message: 'Phone number is required' })
          return
        }
        await createAccessCodeMutation.mutateAsync({ phone: data.phone })
      } else {
        if (!data.email || data.email.trim() === '') {
          form.setError('email', { message: 'Email is required' })
          return
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(data.email)) {
          form.setError('email', { message: 'Please enter a valid email address' })
          return
        }
        await loginEmailMutation.mutateAsync({ email: data.email })
      }
      
      const value = loginMethod === 'phone' ? data.phone! : data.email!
      navigate(routes.verify, { state: { method: loginMethod, value } })
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
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="flex space-x-2">
              <Button
                type="button"
                variant={loginMethod === 'phone' ? 'default' : 'outline'}
                onClick={() => {
                  setLoginMethod('phone')
                  form.clearErrors()
                }}
                className="flex-1"
              >
                Phone
              </Button>
              <Button
                type="button"
                variant={loginMethod === 'email' ? 'default' : 'outline'}
                onClick={() => {
                  setLoginMethod('email')
                  form.clearErrors()
                }}
                className="flex-1"
              >
                Email
              </Button>
            </div>

            <div className="space-y-2">
              <Label htmlFor={loginMethod}>
                {loginMethod === 'phone' ? 'Phone Number' : 'Email Address'}
              </Label>
              {loginMethod === 'phone' ? (
                <PhoneInputComponent
                  value={form.watch('phone')}
                  onChange={(value) => form.setValue('phone', value || '')}
                  placeholder="Enter phone number"
                />
              ) : (
                <Input
                  id="email"
                  type="email"
                  placeholder="student@example.com"
                  {...form.register('email')}
                />
              )}
              {form.formState.errors.phone && (
                <p className="text-red-500 text-sm">{form.formState.errors.phone.message}</p>
              )}
              {form.formState.errors.email && (
                <p className="text-red-500 text-sm">{form.formState.errors.email.message}</p>
              )}
            </div>

            {(createAccessCodeMutation.error || loginEmailMutation.error) && (
              <div className="bg-red-50 p-3 rounded-md text-red-600 text-sm">
                {createAccessCodeMutation.error?.message || loginEmailMutation.error?.message || 'Failed to send verification code'}
              </div>
            )}

                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={createAccessCodeMutation.isPending || loginEmailMutation.isPending}
                >
                  {(createAccessCodeMutation.isPending || loginEmailMutation.isPending) ? 'Sending...' : 'Send Verification Code'}
            </Button>
          </form>

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
