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

export interface StudentStats {
  totalLessons: number
  completedLessons: number
  pendingLessons: number
  progressPercentage: number
}

export interface NotificationPreferences {
  email: boolean
  sms: boolean
  lessons: boolean
  messages: boolean
}
