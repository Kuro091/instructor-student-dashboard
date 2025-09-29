export interface Student {
  id: string
  phone: string
  email: string
  name: string
  role: 'STUDENT'
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface Lesson {
  lessonId: string
  title: string
  description: string
  studentPhone: string
  assignedBy: string // instructor phone
  createdAt: string
  status: 'pending' | 'completed'
}

export interface InstructorStats {
  totalStudents: number
  activeLessons: number
  completedLessons: number
  pendingLessons: number
}

export interface AddStudentRequest {
  name: string
  phone: string
  email: string
}

export interface AssignLessonRequest {
  title: string
  description: string
  studentPhone: string
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  message: string
}

export interface ApiError {
  success: false
  error: string
}