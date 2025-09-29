import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { 
  Student, 
  StudentWithLessons,
  Lesson, 
  AddStudentRequest, 
  AssignLessonRequest,
  EditStudentRequest,
  ApiResponse 
} from '../types'
import { apiRequest } from '@/lib/api'

export const instructorKeys = {
  students: () => ['instructor', 'students'] as const,
  student: (phone: string) => ['instructor', 'student', phone] as const,
  stats: () => ['instructor', 'stats'] as const,
  lessons: () => ['instructor', 'lessons'] as const,
}

export function useStudents() {
  return useQuery({
    queryKey: instructorKeys.students(),
    queryFn: () => apiRequest<ApiResponse<Student[]>>('/api/instructor/students'),
    select: (data) => data.data,
  })
}

export function useStudent(phone: string) {
  return useQuery({
    queryKey: instructorKeys.student(phone),
    queryFn: () => apiRequest<ApiResponse<StudentWithLessons>>(`/api/instructor/student/${phone}`),
    select: (data) => data.data,
    enabled: !!phone,
  })
}

export function useAddStudent() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: AddStudentRequest) => 
      apiRequest<ApiResponse<Student>>('/api/instructor/addStudent', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: instructorKeys.students() })
      queryClient.invalidateQueries({ queryKey: instructorKeys.stats() })
    },
  })
}

export function useEditStudent() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ phone, data }: { phone: string; data: EditStudentRequest }) =>
      apiRequest<ApiResponse<Student>>(`/api/instructor/editStudent/${phone}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    onSuccess: (_, { phone }) => {
      queryClient.invalidateQueries({ queryKey: instructorKeys.students() })
      queryClient.invalidateQueries({ queryKey: instructorKeys.student(phone) })
    },
  })
}

export function useDeleteStudent() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (phone: string) =>
      apiRequest<ApiResponse<void>>(`/api/instructor/student/${phone}`, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: instructorKeys.students() })
      queryClient.invalidateQueries({ queryKey: instructorKeys.stats() })
    },
  })
}

export function useLessons() {
  return useQuery({
    queryKey: instructorKeys.lessons(),
    queryFn: () => apiRequest<ApiResponse<Lesson[]>>('/api/instructor/lessons'),
    select: (data) => data.data,
  })
}

export function useAssignLesson() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: AssignLessonRequest) =>
      apiRequest<ApiResponse<Lesson>>('/api/instructor/assignLesson', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: instructorKeys.students() })
      queryClient.invalidateQueries({ queryKey: instructorKeys.stats() })
      queryClient.invalidateQueries({ queryKey: instructorKeys.lessons() })
    },
  })
}
