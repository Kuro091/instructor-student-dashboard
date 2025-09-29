import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2 } from 'lucide-react'
import type { AddStudentRequest, ApiErrorResponse } from '../types'

const studentSchema = z.object({
  name: z.string().min(1, 'Name is required').min(2, 'Name must be at least 2 characters'),
  phone: z.string().min(10, 'Phone number must be at least 10 characters').max(15, 'Phone number must be at most 15 characters'),
  email: z.string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .refine((email) => {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
      return emailRegex.test(email)
    }, 'Please enter a valid email address'),
})

type StudentFormData = z.infer<typeof studentSchema>

interface StudentFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: AddStudentRequest) => Promise<void>
  initialData?: Partial<AddStudentRequest>
  title: string
  description: string
  submitText: string
}

export function StudentForm({ 
  isOpen, 
  onClose, 
  onSubmit, 
  initialData, 
  title, 
  description, 
  submitText 
}: StudentFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setError,
    clearErrors
  } = useForm<StudentFormData>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      name: '',
      phone: '',
      email: ''
    }
  })

  useEffect(() => {
    if (initialData) {
      reset(initialData)
    } else {
      reset({ name: '', phone: '', email: '' })
    }
  }, [initialData, reset])

  const handleFormSubmit = async (data: StudentFormData) => {
    try {
      clearErrors()
      await onSubmit(data)
      reset()
      onClose()
    } catch (error: unknown) {
      const apiError = error as ApiErrorResponse
      const errorMessage = apiError?.response?.data?.error || apiError?.message || 'An error occurred'
      
      if (errorMessage.includes('phone number already exists')) {
        setError('phone', { 
          type: 'manual', 
          message: 'A student with this phone number already exists' 
        })
      } else if (errorMessage.includes('email')) {
        setError('email', { 
          type: 'manual', 
          message: 'A student with this email already exists' 
        })
      } else {
        setError('root', { 
          type: 'manual', 
          message: errorMessage 
        })
      }
    }
  }

  const handleClose = () => {
    reset()
    clearErrors()
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          {errors.root && (
            <Alert variant="destructive">
              <AlertDescription>{errors.root.message}</AlertDescription>
            </Alert>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              {...register('name')}
              placeholder="Enter student's full name"
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && (
              <p className="text-red-500 text-sm">{errors.name.message}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              {...register('phone')}
              placeholder="+1234567890"
              className={errors.phone ? 'border-red-500' : ''}
            />
            {errors.phone && (
              <p className="text-red-500 text-sm">{errors.phone.message}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              {...register('email')}
              placeholder="student@example.com"
              className={errors.email ? 'border-red-500' : ''}
            />
            {errors.email && (
              <p className="text-red-500 text-sm">{errors.email.message}</p>
            )}
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                  Processing...
                </>
              ) : (
                submitText
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
