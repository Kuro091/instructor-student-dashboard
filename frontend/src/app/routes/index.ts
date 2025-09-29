export const routes = {
  home: '/',
  
  login: '/login',
  verify: '/verify',
  studentSetup: '/student-setup',
  
  instructor: {
    dashboard: '/instructor',
    students: 'students',
    studentProfile: 'student/:phone',
    lessons: 'lessons',
  },
  
  student: {
    dashboard: '/student',
    lesson: 'lesson/:id',
    lessons: 'lessons',
    profile: 'profile',
  },
  
  chat: {
    list: '/chat',
    conversation: ':participantId',
  },
  
  
  notFound: '/404',
} as const
