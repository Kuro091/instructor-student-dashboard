import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { 
  ArrowLeft, 
  Edit, 
  MessageSquare, 
  BookOpen, 
  Plus,
  CheckCircle,
  Clock,
  Mail as MailIcon,
  Phone as PhoneIcon,
  Calendar as CalendarIcon
} from 'lucide-react'
import { routes } from '@/app/routes'
import { useStudent, useAssignLesson } from '../hooks/use-instructor-queries'
import type { AssignLessonRequest } from '../types'

export function StudentProfile() {
  const { phone } = useParams<{ phone: string }>()
  const navigate = useNavigate()
  const [isAssignLessonOpen, setIsAssignLessonOpen] = useState(false)
  const [lessonForm, setLessonForm] = useState<AssignLessonRequest>({
    studentPhones: [],
    title: '',
    description: ''
  })

  const { data: student, isLoading, error } = useStudent(phone || '')
  const assignLessonMutation = useAssignLesson()

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  const handleAssignLesson = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!phone) return

    try {
      await assignLessonMutation.mutateAsync({
        ...lessonForm,
        studentPhones: [phone]
      })
      setIsAssignLessonOpen(false)
      setLessonForm({ studentPhones: [], title: '', description: '' })
    } catch (error) {
      console.error('Failed to assign lesson:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="border-primary border-b-2 rounded-full w-8 h-8 animate-spin"></div>
      </div>
    )
  }

  if (error || !student) {
    return (
      <div className="space-y-6">
        <div className="bg-red-100 p-4 border border-red-300 rounded">
          <h2 className="font-bold text-red-800">Error loading student</h2>
          <p className="text-red-600">{error?.message || 'Student not found'}</p>
        </div>
        <Button onClick={() => navigate(routes.instructor.students)}>
          <ArrowLeft className="mr-2 w-4 h-4" />
          Back to Students
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button variant="outline" onClick={() => navigate(routes.instructor.students)}>
          <ArrowLeft className="mr-2 w-4 h-4" />
          Back to Students
        </Button>
        <div className="flex items-center space-x-4">
          <Avatar className="w-16 h-16">
            <AvatarImage src="" alt={student.name} />
            <AvatarFallback className="text-lg">{getInitials(student.name)}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="font-bold text-gray-900 text-3xl">{student.name}</h1>
            <div className="flex items-center space-x-4 mt-2">
              <Badge variant={student.isActive ? "default" : "secondary"}>
                {student.isActive ? "Active" : "Pending Setup"}
              </Badge>
              <span className="text-gray-500">Student</span>
            </div>
          </div>
        </div>
      </div>

      <div className="gap-6 grid grid-cols-1 lg:grid-cols-3">
        {/* Student Information */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Student Information</CardTitle>
              <CardDescription>
                Personal details and contact information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <MailIcon className="w-4 h-4 text-gray-500" />
                  <div>
                    <div className="font-medium text-sm">Email</div>
                    <div className="text-gray-600 text-sm">{student.email}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <PhoneIcon className="w-4 h-4 text-gray-500" />
                  <div>
                    <div className="font-medium text-sm">Phone</div>
                    <div className="text-gray-600 text-sm">{student.phone}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <CalendarIcon className="w-4 h-4 text-gray-500" />
                  <div>
                    <div className="font-medium text-sm">Joined</div>
                    <div className="text-gray-600 text-sm">
                      {new Date(student.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="pt-4 border-t">
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => navigate(routes.chat.list)}
                    className="flex-1"
                  >
                    <MessageSquare className="mr-2 w-4 h-4" />
                    Message
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => navigate(`${routes.instructor.students}/${student.phone}`)}
                    className="flex-1"
                  >
                    <Edit className="mr-2 w-4 h-4" />
                    Edit
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Progress Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 text-sm">Total Lessons</span>
                <span className="font-medium">{student.lessons.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 text-sm">Completed</span>
                <span className="font-medium text-green-600">
                  {student.lessons.filter(l => l.status === 'completed').length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 text-sm">Pending</span>
                <span className="font-medium text-orange-600">
                  {student.lessons.filter(l => l.status === 'pending').length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 text-sm">Completion Rate</span>
                <span className="font-medium">
                  {student.lessons.length > 0 
                    ? Math.round((student.lessons.filter(l => l.status === 'completed').length / student.lessons.length) * 100)
                    : 0}%
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lessons and Activities */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row justify-between items-center">
              <div>
                <CardTitle>Assigned Lessons</CardTitle>
                <CardDescription>
                  Lessons assigned to this student
                </CardDescription>
              </div>
              <Button onClick={() => setIsAssignLessonOpen(true)}>
                <Plus className="mr-2 w-4 h-4" />
                Assign Lesson
              </Button>
            </CardHeader>
            <CardContent>
              {student.lessons.length === 0 ? (
                <div className="py-8 text-center">
                  <BookOpen className="mx-auto mb-4 w-12 h-12 text-gray-400" />
                  <h3 className="mb-2 font-medium text-gray-900 text-lg">No lessons assigned</h3>
                  <p className="mb-4 text-gray-500">
                    This student doesn't have any lessons assigned yet.
                  </p>
                  <Button onClick={() => setIsAssignLessonOpen(true)}>
                    <Plus className="mr-2 w-4 h-4" />
                    Assign First Lesson
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Lesson</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Assigned</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {student.lessons.map((lesson) => (
                      <TableRow key={lesson.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{lesson.title}</div>
                            <div className="text-gray-500 text-sm">{lesson.description}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={lesson.status === 'completed' ? 'default' : 'secondary'}>
                            {lesson.status === 'completed' ? (
                              <>
                                <CheckCircle className="mr-1 w-3 h-3" />
                                Completed
                              </>
                            ) : (
                              <>
                                <Clock className="mr-1 w-3 h-3" />
                                Pending
                              </>
                            )}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-gray-600 text-sm">
                            {new Date(lesson.createdAt).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm">
                            View Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Latest updates and progress
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {student.lessons.length === 0 ? (
                  <div className="py-4 text-gray-500 text-center">
                    No recent activity
                  </div>
                ) : (
                  student.lessons.slice(0, 5).map((lesson) => (
                    <div key={lesson.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                      <div className="flex-shrink-0">
                        {lesson.status === 'completed' ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : (
                          <Clock className="w-5 h-5 text-orange-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-sm">{lesson.title}</div>
                        <div className="text-gray-500 text-xs">
                          {lesson.status === 'completed' ? 'Completed' : 'Assigned'} on{' '}
                          {new Date(lesson.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Assign Lesson Dialog */}
      <Dialog open={isAssignLessonOpen} onOpenChange={setIsAssignLessonOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign New Lesson</DialogTitle>
            <DialogDescription>
              Create and assign a new lesson to {student.name}.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAssignLesson} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="lesson-title">Lesson Title</Label>
              <Input
                id="lesson-title"
                value={lessonForm.title}
                onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
                placeholder="Enter lesson title"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lesson-description">Description</Label>
              <Textarea
                id="lesson-description"
                value={lessonForm.description}
                onChange={(e) => setLessonForm({ ...lessonForm, description: e.target.value })}
                placeholder="Enter lesson description and instructions"
                rows={4}
                required
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setIsAssignLessonOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={assignLessonMutation.isPending}>
                {assignLessonMutation.isPending ? 'Assigning...' : 'Assign Lesson'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
