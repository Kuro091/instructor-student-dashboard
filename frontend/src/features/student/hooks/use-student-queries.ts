import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiRequest } from '@/lib/api'
import { useAuth } from '@/features/auth/stores/auth-context'
import type { User } from '@/features/auth/types'

export const studentKeys = {
  all: ['student'] as const,
  lessons: () => [...studentKeys.all, 'lessons'] as const,
  profile: () => [...studentKeys.all, 'profile'] as const,
}
export interface Lesson {
  id: string
  title: string
  description: string
  status: 'pending' | 'completed'
  createdAt: string
  completedAt?: string
  assignedBy: string
  notes?: string
}

export interface StudentProfile {
  id: string
  name: string
  email: string
  phone: string
  username: string
  role: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface UpdateProfileRequest {
  name?: string
  email?: string
  phone?: string
  currentPassword?: string
  newPassword?: string
}

export interface MarkLessonDoneRequest {
  lessonId: string
  notes?: string
}

const studentApi = {
  getLessons: async (): Promise<Lesson[]> => {
    const response = await apiRequest<{ data: Lesson[] }>('/api/student/myLessons', {
      method: 'GET',
    })
    return response.data
  },


  markLessonDone: async (data: MarkLessonDoneRequest): Promise<Lesson> => {
    const response = await apiRequest<{ data: Lesson }>('/api/student/markLessonDone', {
      method: 'POST',
      body: JSON.stringify(data),
    })
    return response.data
  },

  updateProfile: async (data: UpdateProfileRequest): Promise<StudentProfile> => {
    const response = await apiRequest<{ data: StudentProfile }>('/api/student/editProfile', {
      method: 'PUT',
      body: JSON.stringify(data),
    })
    return response.data
  },
}

export function useStudentLessons() {
  return useQuery({
    queryKey: studentKeys.lessons(),
    queryFn: studentApi.getLessons,
    staleTime: 5 * 60 * 1000, 
  })
}


export function useMarkLessonDone() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: studentApi.markLessonDone,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: studentKeys.lessons() })
    },
    onError: (error) => {
      console.error('Failed to mark lesson as done:', error)
    },
  })
}

export function useUpdateStudentProfile() {
  const queryClient = useQueryClient()
  const { updateUser } = useAuth()

  return useMutation({
    mutationFn: studentApi.updateProfile,
    onSuccess: (updatedProfile) => {
      queryClient.setQueryData(studentKeys.profile(), updatedProfile)
      
      updateUser(updatedProfile as User)
      
      queryClient.invalidateQueries({ queryKey: studentKeys.all })
    },
    onError: (error) => {
      console.error('Failed to update profile:', error)
    },
  })
}
