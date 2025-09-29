import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { 
  User as UserIcon, 
  Mail, 
  Phone, 
  Lock, 
  Save, 
  Eye,
  EyeOff
} from 'lucide-react'
import { useAuth } from '@/features/auth/stores/auth-context'
import { useUpdateStudentProfile } from '../hooks/use-student-queries'
import type { User } from '@/features/auth/types'

type StudentUser = User & { username?: string }

interface ProfileFormData {
  name: string
  email: string
  phone: string
  bio: string
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export function StudentProfile() {
  const { user } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  
  const updateProfileMutation = useUpdateStudentProfile()

  const { register, handleSubmit, watch, reset, formState: { isSubmitting } } = useForm<ProfileFormData>({
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      bio: '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
  })

  const onSubmit = async (data: ProfileFormData) => {
    try {
      await updateProfileMutation.mutateAsync({
        name: data.name,
        email: data.email,
        phone: data.phone,
        ...(data.newPassword && {
          currentPassword: data.currentPassword,
          newPassword: data.newPassword
        })
      })
      setIsEditing(false)
    } catch (error) {
      console.error('Failed to update profile:', error)
    }
  }

  const handleCancel = () => {
    reset()
    setIsEditing(false)
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-bold text-gray-900 text-3xl">Profile Settings</h1>
          <p className="mt-1 text-gray-600">
            Manage your personal information and preferences.
          </p>
        </div>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button onClick={handleSubmit(onSubmit)} disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <div className="mr-2 border border-white border-t-transparent rounded-full w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 w-4 h-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </>
          ) : (
            <Button onClick={() => setIsEditing(true)}>
              Edit Profile
            </Button>
          )}
        </div>
      </div>

      <div className="gap-6 grid grid-cols-1 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserIcon className="w-5 h-5" />
              Profile Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col items-center space-y-4">
              <Avatar className="w-20 h-20">
                <AvatarImage src={`/api/avatar/${user?.id}`} />
                <AvatarFallback className="text-lg">
                  {getInitials(user?.name || 'Student')}
                </AvatarFallback>
              </Avatar>
              <div className="text-center">
                <h3 className="font-medium text-lg">{user?.name || 'Student'}</h3>
                <p className="text-gray-500 text-sm">@{(user as StudentUser)?.username || 'username'}</p>
                <Badge variant="secondary" className="mt-2">
                  {user?.role || 'Student'}
                </Badge>
              </div>
            </div>
            
            <Separator />
            
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">Email:</span>
                <span>{user?.email || 'Not provided'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">Phone:</span>
                <span>{user?.phone || 'Not provided'}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserIcon className="w-5 h-5" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="gap-4 grid grid-cols-1 md:grid-cols-2">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    {...register('name')}
                    disabled={!isEditing}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={(user as StudentUser)?.username || 'username'}
                    disabled
                    className="mt-1"
                  />
                  <p className="mt-1 text-gray-500 text-xs">
                    Username cannot be changed
                  </p>
                </div>
              </div>
              
              <div className="gap-4 grid grid-cols-1 md:grid-cols-2">
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    {...register('email')}
                    disabled={!isEditing}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    {...register('phone')}
                    disabled={!isEditing}
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  {...register('bio')}
                  disabled={!isEditing}
                  placeholder="Tell us a bit about yourself..."
                  className="mt-1"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="w-5 h-5" />
                Change Password
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="currentPassword">Current Password</Label>
                <div className="relative mt-1">
                  <Input
                    id="currentPassword"
                    type={showPassword ? 'text' : 'password'}
                    {...register('currentPassword')}
                    disabled={!isEditing}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="top-0 right-0 absolute hover:bg-transparent px-3 py-2 h-full"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={!isEditing}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
              
              <div className="gap-4 grid grid-cols-1 md:grid-cols-2">
                <div>
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    {...register('newPassword')}
                    disabled={!isEditing}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    {...register('confirmPassword')}
                    disabled={!isEditing}
                    className="mt-1"
                  />
                </div>
              </div>
              
              {watch('newPassword') && watch('newPassword') !== watch('confirmPassword') && (
                <p className="text-red-500 text-sm">
                  Passwords do not match
                </p>
              )}
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  )
}
