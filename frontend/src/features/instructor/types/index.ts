export interface Student {
  id: string
  phone: string
  email: string
  name: string
  role: 'student'
  isActive: boolean
  createdAt: string
  updatedAt: string
  lessons?: Lesson[]
}

export interface Lesson {
  id: string
  title: string
  description: string
  studentPhone: string
  assignedBy: string
  status: 'pending' | 'completed'
  createdAt: string
  updatedAt: string
}

export interface AddStudentRequest {
  name: string
  phone: string
  email: string
}

export interface EditStudentRequest {
  name?: string
  email?: string
}

export interface AssignLessonRequest {
  title: string
  description: string
  studentPhones: string[]
}

export interface InstructorState {
  students: Student[]
  lessons: Lesson[]
  isLoading: boolean
  error: string | null
}
