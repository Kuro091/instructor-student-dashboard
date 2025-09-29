import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { useAuth } from '../stores/auth-context'
import { useValidateAccessCode, useCreateAccessCode, useLoginEmail } from '../hooks/use-auth-queries'
import { routes } from '@/app/routes'

const verificationSchema = z.object({
  code: z.string()
    .length(6, 'Please enter a 6-digit verification code')
    .regex(/^\d{6}$/, 'Code must contain only numbers')
})

type VerificationFormData = z.infer<typeof verificationSchema>

export function VerificationPage() {
  const [resendCooldown, setResendCooldown] = useState(0)
  
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  
  const validateAccessCodeMutation = useValidateAccessCode()
  const createAccessCodeMutation = useCreateAccessCode()
  const loginEmailMutation = useLoginEmail()
  
  const { method, value } = location.state || { method: 'phone', value: '' }

  const form = useForm<VerificationFormData>({
    resolver: zodResolver(verificationSchema),
    defaultValues: {
      code: ''
    }
  })

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendCooldown])

  const onSubmit = async (data: VerificationFormData) => {
      const loginData = method === 'phone' 
        ? { phone: value, accessCode: data.code }
        : { email: value, accessCode: data.code }
      
      const response = await validateAccessCodeMutation.mutateAsync(loginData)
      login(response.data.user)
      
      const redirectPath = response.data.user.role === 'INSTRUCTOR' 
        ? routes.instructor.dashboard 
        : routes.student.dashboard
      navigate(redirectPath, { replace: true })
  }

  const handleResend = async () => {
      if (method === 'phone') {
        await createAccessCodeMutation.mutateAsync({ phone: value })
      } else {
        await loginEmailMutation.mutateAsync({ email: value })
      }
      setResendCooldown(60)
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
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="code">Verification Code</Label>
              <Input
                id="code"
                type="text"
                placeholder="123456"
                {...form.register('code', {
                  onChange: (e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 6)
                    form.setValue('code', value)
                  }
                })}
                maxLength={6}
                className="text-2xl text-center tracking-widest"
              />
              {form.formState.errors.code && (
                <p className="text-red-500 text-sm">{form.formState.errors.code.message}</p>
              )}
            </div>

            {validateAccessCodeMutation.error && (
              <div className="bg-red-50 p-3 rounded-md text-red-600 text-sm">
                {validateAccessCodeMutation.error.message || 'Invalid verification code'}
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={validateAccessCodeMutation.isPending || form.watch('code').length !== 6}
            >
              {validateAccessCodeMutation.isPending ? 'Verifying...' : 'Verify Code'}
            </Button>

            {(createAccessCodeMutation.error || loginEmailMutation.error) && (
              <div className="bg-red-50 p-3 rounded-md text-red-600 text-sm">
                {createAccessCodeMutation.error?.message || loginEmailMutation.error?.message || 'Failed to resend code'}
              </div>
            )}

            <div className="text-center">
              <Button
                type="button"
                variant="link"
                onClick={handleResend}
                disabled={createAccessCodeMutation.isPending || loginEmailMutation.isPending || resendCooldown > 0}
                className="text-sm"
              >
                {resendCooldown > 0 
                  ? `Resend code in ${resendCooldown}s` 
                  : (createAccessCodeMutation.isPending || loginEmailMutation.isPending) 
                    ? 'Resending...' 
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
