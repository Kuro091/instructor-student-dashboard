import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { Provider } from './provider'
import { routes } from './routes'
import { ProtectedRoute } from './protected-route'
import { HomePage } from './home-page'
import { LoginPage } from '@/features/auth/components/login-page'
import { VerificationPage } from '@/features/auth/components/verification-page'
import { StudentSetupPage } from '@/features/auth/components/student-setup-page'
import { InstructorDashboard } from '@/features/instructor/components/instructor-dashboard'
import { StudentManagement } from '@/features/instructor/components/student-management'
import { StudentProfile } from '@/features/instructor/components/student-profile'
import { LessonAssignment } from '@/features/instructor/components/lesson-assignment'
import { ChatListPage } from '@/features/chat/pages/chat-list-page'
import { ChatConversationPage } from '@/features/chat/pages/chat-conversation-page'
import { SidebarLayout } from '@/features/chat/components/sidebar-layout'


const StudentSetupPageComponent = () => <StudentSetupPage />
const StudentDashboard = () => <div>Student Dashboard</div>
const StudentLesson = () => <div>Student Lesson</div>
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
        <SidebarLayout />
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
    path: '/student',
    element: (
      <ProtectedRoute allowedRoles={['STUDENT']}>
        <SidebarLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: '',
        element: <StudentDashboard />,
      },
      {
        path: 'lesson/:id',
        element: <StudentLesson />,
      },
      {
        path: 'profile',
        element: <StudentProfile />,
      },
    ],
  },
  
  // Chat routes (shared between instructors and students)
  {
    path: routes.chat.list,
    element: (
      <ProtectedRoute>
        <SidebarLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: '',
        element: <ChatListPage />,
      },
      {
        path: ':participantId',
        element: <ChatConversationPage />,
      },
    ],
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
