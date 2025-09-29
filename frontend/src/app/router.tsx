import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { Provider } from './provider'
import { routes } from './routes'

const LoginPage = () => <div>Login Page</div>
const VerifyPage = () => <div>Verify Page</div>
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
    path: routes.login,
    element: <LoginPage />,
  },
  {
    path: routes.verify,
    element: <VerifyPage />,
  },
  {
    path: routes.studentSetup,
    element: <StudentSetupPage />,
  },
  {
    path: routes.instructor.dashboard,
    element: <InstructorDashboard />,
  },
  {
    path: routes.instructor.students,
    element: <InstructorStudents />,
  },
  {
    path: routes.instructor.studentProfile,
    element: <InstructorStudentProfile />,
  },
  {
    path: routes.instructor.lessons,
    element: <InstructorLessons />,
  },
  {
    path: routes.student.dashboard,
    element: <StudentDashboard />,
  },
  {
    path: routes.student.lesson,
    element: <StudentLesson />,
  },
  {
    path: routes.student.profile,
    element: <StudentProfile />,
  },
  {
    path: routes.chat.list,
    element: <ChatList />,
  },
  {
    path: routes.chat.conversation,
    element: <ChatConversation />,
  },
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
