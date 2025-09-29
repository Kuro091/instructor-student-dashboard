import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { Provider } from './provider'
import { routes } from './routes'
import { ProtectedRoute } from './protected-route'
import { HomePage } from './home-page'
import { LoginPage } from '@/features/auth/components/login-page'
import { VerificationPage } from '@/features/auth/components/verification-page'


const StudentSetupPage = () => <div>Student Setup Page</div>
const InstructorDashboard = () => <div>Instructor Dashboard</div>
const InstructorStudents = () => <div>Instructor Students</div>
const InstructorStudentProfile = () => <div>Instructor Student Profile</div>
const InstructorLessons = () => <div>Instructor Lessons</div>
const StudentDashboard = () => <div>Student Dashboard</div>
const StudentLesson = () => <div>Student Lesson</div>
const StudentProfile = () => <div>Student Profile</div>
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
        <StudentSetupPage />
      </ProtectedRoute>
    ),
  },
  
  // Instructor routes 
  {
    path: routes.instructor.dashboard,
    element: (
      <ProtectedRoute allowedRoles={['INSTRUCTOR']}>
        <InstructorDashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: routes.instructor.students,
    element: (
      <ProtectedRoute allowedRoles={['INSTRUCTOR']}>
        <InstructorStudents />
      </ProtectedRoute>
    ),
  },
  {
    path: routes.instructor.studentProfile,
    element: (
      <ProtectedRoute allowedRoles={['INSTRUCTOR']}>
        <InstructorStudentProfile />
      </ProtectedRoute>
    ),
  },
  {
    path: routes.instructor.lessons,
    element: (
      <ProtectedRoute allowedRoles={['INSTRUCTOR']}>
        <InstructorLessons />
      </ProtectedRoute>
    ),
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
