export const routes = {
  home: '/',
  
  login: '/login',
  verify: '/verify',
  studentSetup: '/student-setup/:token',
  
  instructor: {
    dashboard: '/instructor',
    students: '/instructor/students',
    studentProfile: '/instructor/student/:phone',
    lessons: '/instructor/lessons',
  },
  
  student: {
    dashboard: '/student',
    lesson: '/student/lesson/:id',
    profile: '/student/profile',
  },
  
  chat: {
    list: '/chat',
    conversation: '/chat/:participantId',
  },
  
  notFound: '/404',
} as const
