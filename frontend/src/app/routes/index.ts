export const routes = {
  // Public routes
  login: '/login',
  verify: '/verify',
  studentSetup: '/student-setup/:token',
  
  // Instructor routes
  instructor: {
    dashboard: '/instructor',
    students: '/instructor/students',
    studentProfile: '/instructor/student/:phone',
    lessons: '/instructor/lessons',
  },
  
  // Student routes
  student: {
    dashboard: '/student',
    lesson: '/student/lesson/:id',
    profile: '/student/profile',
  },
  
  // Chat routes
  chat: {
    list: '/chat',
    conversation: '/chat/:participantId',
  },
  
  // Error routes
  notFound: '/404',
} as const
