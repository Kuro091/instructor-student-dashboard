import { useState } from 'react'
import { useAuth } from '@/features/auth/stores/auth-context'
import { useStudents } from '../hooks/use-instructor-queries'
import { routes } from '@/app/routes'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { 
  Users, 
  BookOpen, 
  CheckCircle, 
  Clock, 
  Plus, 
  MessageSquare,
  UserPlus,
  BookOpenCheck,
  Mail,
  Phone,
  Calendar
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import type { Student } from '../types'

export function InstructorDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  
  const { data: students = [], isLoading: studentsLoading, error: studentsError } = useStudents()

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  const recentStudents = students.slice(0, 5) // Show only 5 most recent

  if (studentsError) {
    return (
      <div className="space-y-6">
        <div className="bg-red-100 p-4 border border-red-300 rounded">
          <h2 className="font-bold text-red-800">Error loading dashboard</h2>
          <p className="text-red-600">{studentsError.message}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 rounded-lg text-white">
        <h1 className="mb-2 font-bold text-2xl">
          Welcome back, {user?.name}!
        </h1>
        <p className="text-blue-100">
          Manage your students and track their progress from your dashboard.
        </p>
      </div>

      <div className="gap-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row justify-between items-center space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">Total Students</CardTitle>
            <Users className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">
              {studentsLoading ? '...' : students.length}
            </div>
            <p className="text-muted-foreground text-xs">
              Students in your class
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row justify-between items-center space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">Active Students</CardTitle>
            <CheckCircle className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">
              {studentsLoading ? '...' : students.filter(s => s.isActive !== false).length}
            </div>
            <p className="text-muted-foreground text-xs">
              Students who completed setup
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row justify-between items-center space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">Pending Setup</CardTitle>
            <Clock className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">
              {studentsLoading ? '...' : students.filter(s => s.isActive === false).length}
            </div>
            <p className="text-muted-foreground text-xs">
              Students awaiting account setup
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row justify-between items-center space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">Recent Additions</CardTitle>
            <BookOpen className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">
              {studentsLoading ? '...' : students.filter(s => {
                const created = new Date(s.createdAt)
                const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                return created > weekAgo
              }).length}
            </div>
            <p className="text-muted-foreground text-xs">
              Students added this week
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common tasks you can perform from here
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="gap-4 grid grid-cols-1 md:grid-cols-3">
            <Button 
              onClick={() => navigate(routes.instructor.students)}
              className="flex flex-col justify-center items-center space-y-2 h-20"
              variant="outline"
            >
              <UserPlus className="w-6 h-6" />
              <span>Add Student</span>
            </Button>
            
            <Button 
              onClick={() => navigate(routes.instructor.lessons)}
              className="flex flex-col justify-center items-center space-y-2 h-20"
              variant="outline"
            >
              <BookOpenCheck className="w-6 h-6" />
              <span>Assign Lesson</span>
            </Button>
            
            <Button 
              onClick={() => navigate(routes.chat.list)}
              className="flex flex-col justify-center items-center space-y-2 h-20"
              variant="outline"
            >
              <MessageSquare className="w-6 h-6" />
              <span>View Messages</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row justify-between items-center">
          <div>
            <CardTitle>Recent Students</CardTitle>
            <CardDescription>
              Your most recently added students
            </CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate(routes.instructor.students)}
          >
            View All
          </Button>
        </CardHeader>
        <CardContent>
          {studentsLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="border-primary border-b-2 rounded-full w-8 h-8 animate-spin"></div>
            </div>
          ) : recentStudents.length === 0 ? (
            <div className="py-8 text-center">
              <Users className="mx-auto mb-4 w-12 h-12 text-gray-400" />
              <h3 className="mb-2 font-medium text-gray-900 text-lg">No students yet</h3>
              <p className="mb-4 text-gray-500">
                Get started by adding your first student to the class.
              </p>
              <Button onClick={() => navigate(routes.instructor.students)}>
                <Plus className="mr-2 w-4 h-4" />
                Add Student
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {recentStudents.map((student) => (
                <div 
                  key={student.id}
                  className="flex justify-between items-center hover:bg-gray-50 p-4 border rounded-lg cursor-pointer"
                  onClick={() => setSelectedStudent(student)}
                >
                  <div className="flex items-center space-x-4">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src="" alt={student.name} />
                      <AvatarFallback>{getInitials(student.name)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-medium text-gray-900">{student.name}</h4>
                      <p className="text-gray-500 text-sm">{student.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary">Student</Badge>
                    <span className="text-gray-400 text-sm">
                      {new Date(student.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selectedStudent} onOpenChange={() => setSelectedStudent(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <Avatar className="w-12 h-12">
                <AvatarImage src="" alt={selectedStudent?.name} />
                <AvatarFallback>{selectedStudent && getInitials(selectedStudent.name)}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-bold text-lg">{selectedStudent?.name}</h3>
                <Badge variant={selectedStudent?.isActive ? "default" : "secondary"}>
                  {selectedStudent?.isActive ? "Active" : "Pending Setup"}
                </Badge>
              </div>
            </DialogTitle>
            <DialogDescription>
              Student details and information
            </DialogDescription>
          </DialogHeader>
          
          {selectedStudent && (
            <div className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">{selectedStudent.email}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">{selectedStudent.phone}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">
                    Joined {new Date(selectedStudent.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigate(`${routes.instructor.students}/${selectedStudent.phone}`)}
                  className="flex-1"
                >
                  View Full Profile
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigate(routes.chat.list)}
                  className="flex-1"
                >
                  Send Message
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
