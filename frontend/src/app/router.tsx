import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { Provider } from './provider'
import { routes } from './routes'
import { ProtectedRoute } from './protected-route'
import { HomePage } from './home-page'
import { LoginPage } from '@/features/auth/components/login-page'
import { VerificationPage } from '@/features/auth/components/verification-page'
import { StudentSetupPage } from '@/features/auth/components/student-setup-page'
import { InstructorDashboard } from '@/features/instructor/components/instructor-dashboard'
import { InstructorLayout } from '@/features/instructor/components/instructor-layout'
import { StudentManagement } from '@/features/instructor/components/student-management'
import { StudentProfile } from '@/features/instructor/components/student-profile'
import { LessonAssignment } from '@/features/instructor/components/lesson-assignment'


const StudentSetupPageComponent = () => <StudentSetupPage />
const StudentDashboard = () => <div>Student Dashboard</div>
const StudentLesson = () => <div>Student Lesson</div>
const ChatList = () => <div>Chat List</div>
const ChatConversation = () => <div>Chat Conversation</div>
const NotFoundPage = () => <div>404 Not Found</div>

const router = createBrowserRouter([
  {
    path: routes.home,
    element: <HomePage />,
  },
  
  // Public routes 
  {
    path: routes.login,
    element: (
      <ProtectedRoute requireAuth={false}>
        <LoginPage />
      </ProtectedRoute>
    ),
  },
  {
    path: routes.verify,
    element: (
      <ProtectedRoute requireAuth={false}>
        <VerificationPage />
      </ProtectedRoute>
    ),
  },
  {
    path: routes.studentSetup,
    element: (
      <ProtectedRoute requireAuth={false}>
        <StudentSetupPageComponent />
      </ProtectedRoute>
    ),
  },
  
  // Instructor routes 
  {
    path: '/instructor',
    element: (
      <ProtectedRoute allowedRoles={['INSTRUCTOR']}>
        <InstructorLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: '',
        element: <InstructorDashboard />,
      },
      {
        path: 'students',
        element: <StudentManagement />,
      },
      {
        path: 'student/:phone',
        element: <StudentProfile />,
      },
      {
        path: 'lessons',
        element: <LessonAssignment />,
      },
    ],
  },
  
  // Student routes 
  {
    path: routes.student.dashboard,
    element: (
      <ProtectedRoute allowedRoles={['STUDENT']}>
        <StudentDashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: routes.student.lesson,
    element: (
      <ProtectedRoute allowedRoles={['STUDENT']}>
        <StudentLesson />
      </ProtectedRoute>
    ),
  },
  {
    path: routes.student.profile,
    element: (
      <ProtectedRoute allowedRoles={['STUDENT']}>
        <StudentProfile />
      </ProtectedRoute>
    ),
  },
  
  // Chat routes
  {
    path: routes.chat.list,
    element: (
      <ProtectedRoute>
        <ChatList />
      </ProtectedRoute>
    ),
  },
  {
    path: routes.chat.conversation,
    element: (
      <ProtectedRoute>
        <ChatConversation />
      </ProtectedRoute>
    ),
  },
  
  // Error routes
  {
    path: routes.notFound,
    element: <NotFoundPage />,
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
])

export function AppRouter() {
  return (
    <Provider>
      <RouterProvider router={router} />
    </Provider>
  )
}
