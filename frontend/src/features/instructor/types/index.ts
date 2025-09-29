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

export interface StudentWithLessons extends Student {
  lessons: Lesson[]
}

export interface Lesson {
  id: string
  title: string
  description: string
  assignedTo: string[] // student phones
  assignedBy: string // instructor phone
  createdAt: string
  status: 'pending' | 'completed'
}

export interface InstructorStats {
  totalStudents: number
  activeStudents: number
  pendingSetup: number
  recentAdditions: number
}

export interface AddStudentRequest {
  name: string
  phone: string
  email: string
}

export interface AssignLessonRequest {
  studentPhones: string[]
  title: string
  description: string
}

export interface EditStudentRequest {
  name?: string
  email?: string
}

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface ApiErrorResponse {
  response?: {
    data?: ApiResponse
  }
  message?: string
}