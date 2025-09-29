import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
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
  Plus, 
  Users, 
  CheckCircle, 
  Clock,
  Search,
  Calendar,
  User
} from 'lucide-react'
import { useStudents, useLessons, useAssignLesson } from '../hooks/use-instructor-queries'
import type { AssignLessonRequest, ApiErrorResponse } from '../types'

export function LessonAssignment() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStudents, setSelectedStudents] = useState<string[]>([])
  const [isCreateLessonOpen, setIsCreateLessonOpen] = useState(false)
  const [lessonForm, setLessonForm] = useState<AssignLessonRequest>({
    studentPhones: [],
    title: '',
    description: ''
  })

  const { data: students = [], isLoading: studentsLoading, error: studentsError } = useStudents()
  const { data: lessons = [], isLoading: lessonsLoading, error: lessonsError } = useLessons()
  const assignLessonMutation = useAssignLesson()

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.phone.includes(searchTerm)
  )


  const handleStudentSelect = (studentPhone: string, checked: boolean) => {
    if (checked) {
      setSelectedStudents([...selectedStudents, studentPhone])
    } else {
      setSelectedStudents(selectedStudents.filter(phone => phone !== studentPhone))
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedStudents(filteredStudents.map(s => s.phone))
    } else {
      setSelectedStudents([])
    }
  }

  const handleCreateLesson = async (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedStudents.length === 0) {
      alert('Please select at least one student')
      return
    }

    try {
      await assignLessonMutation.mutateAsync({
        ...lessonForm,
        studentPhones: selectedStudents
      })
      setIsCreateLessonOpen(false)
      setLessonForm({ studentPhones: [], title: '', description: '' })
      setSelectedStudents([])
    } catch (error: unknown) {
      console.error('Failed to assign lesson:', error)
      const apiError = error as ApiErrorResponse
      alert(apiError?.response?.data?.error || apiError?.message || 'Failed to assign lesson')
    }
  }

  const openCreateLesson = () => {
    if (selectedStudents.length === 0) {
      alert('Please select students first')
      return
    }
    setIsCreateLessonOpen(true)
  }

  if (studentsError || lessonsError) {
    return (
      <div className="space-y-6">
        <div className="bg-red-100 p-4 border border-red-300 rounded">
          <h2 className="font-bold text-red-800">Error loading data</h2>
          <p className="text-red-600">{studentsError?.message || lessonsError?.message}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-bold text-gray-900 text-3xl">Lesson Assignment</h1>
          <p className="mt-1 text-gray-600">
            Create and assign lessons to your students. Select multiple students for bulk assignment.
          </p>
        </div>
        <div className="flex space-x-2">
          <Button 
            onClick={openCreateLesson}
            disabled={selectedStudents.length === 0}
          >
            <Plus className="mr-2 w-4 h-4" />
            Assign Lesson ({selectedStudents.length})
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="gap-4 grid grid-cols-1 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row justify-between items-center space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">Total Students</CardTitle>
            <Users className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">{students.length}</div>
            <p className="text-muted-foreground text-xs">
              Available for assignment
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
              {students.filter(s => s.isActive).length}
            </div>
            <p className="text-muted-foreground text-xs">
              Can receive lessons
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row justify-between items-center space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">Selected</CardTitle>
            <User className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">{selectedStudents.length}</div>
            <p className="text-muted-foreground text-xs">
              Ready for assignment
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
              {students.filter(s => !s.isActive).length}
            </div>
            <p className="text-muted-foreground text-xs">
              Need account setup
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Existing Lessons */}
      <Card>
        <CardHeader>
          <CardTitle>Existing Lessons</CardTitle>
          <CardDescription>
            View all lessons organized by students
          </CardDescription>
        </CardHeader>
        <CardContent>
          {lessonsLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="border-primary border-b-2 rounded-full w-8 h-8 animate-spin"></div>
            </div>
          ) : lessons.length === 0 ? (
            <div className="py-8 text-center">
              <Clock className="mx-auto mb-4 w-12 h-12 text-gray-400" />
              <h3 className="mb-2 font-medium text-gray-900 text-lg">No lessons created yet</h3>
              <p className="text-gray-500">
                Create your first lesson by selecting students below.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {lessons.map((lesson) => {
                const assignedStudents = students.filter(student => 
                  lesson.assignedTo.includes(student.phone)
                )
                
                return (
                  <div key={lesson.id} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="mb-1 font-medium text-gray-900 text-lg">{lesson.title}</h3>
                        <p className="mb-2 text-gray-600 text-sm">{lesson.description}</p>
                        <div className="flex items-center space-x-4 text-gray-500 text-xs">
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-3 h-3" />
                            <span>Created {new Date(lesson.createdAt).toLocaleDateString()}</span>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {assignedStudents.length} student{assignedStudents.length !== 1 ? 's' : ''}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="gap-3 grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                      {assignedStudents.map((student) => (
                        <div key={student.phone} className="bg-gray-50 p-3 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="flex justify-center items-center bg-blue-100 rounded-full w-8 h-8">
                              <User className="w-4 h-4 text-blue-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-gray-900 text-sm truncate">
                                {student.name}
                              </h4>
                              <p className="text-gray-500 text-xs truncate">
                                {student.email}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Select Students</CardTitle>
              <CardDescription>
                Choose students to assign the lesson to. You can select multiple students for bulk assignment.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <div className="relative flex-1">
              <Search className="top-1/2 left-3 absolute w-4 h-4 text-gray-400 -translate-y-1/2 transform" />
              <Input
                placeholder="Search students by name, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {studentsLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="border-primary border-b-2 rounded-full w-8 h-8 animate-spin"></div>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="py-8 text-center">
              <Users className="mx-auto mb-4 w-12 h-12 text-gray-400" />
              <h3 className="mb-2 font-medium text-gray-900 text-lg">No students found</h3>
              <p className="text-gray-500">
                {searchTerm ? 'No students match your search criteria.' : 'No students available for assignment.'}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedStudents.length === filteredStudents.length && filteredStudents.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedStudents.includes(student.phone)}
                        onCheckedChange={(checked) => handleStudentSelect(student.phone, checked as boolean)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div>
                          <div className="font-medium">{student.name}</div>
                          <div className="text-gray-500 text-sm">Student</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="text-sm">{student.email}</div>
                        <div className="text-gray-500 text-sm">{student.phone}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={student.isActive ? "default" : "secondary"}>
                        {student.isActive ? "Active" : "Pending Setup"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2 text-sm">
                        <Calendar className="w-3 h-3 text-gray-400" />
                        <span>{new Date(student.createdAt).toLocaleDateString()}</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {selectedStudents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Selected Students ({selectedStudents.length})</CardTitle>
            <CardDescription>
              Students who will receive the new lesson assignment
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {selectedStudents.map((phone) => {
                const student = students.find(s => s.phone === phone)
                return student ? (
                  <Badge key={phone} variant="outline" className="flex items-center space-x-2">
                    <span>{student.name}</span>
                    <button
                      onClick={() => handleStudentSelect(phone, false)}
                      className="hover:bg-gray-200 ml-1 p-0.5 rounded-full"
                    >
                      ×
                    </button>
                  </Badge>
                ) : null
              })}
            </div>
            <div className="flex justify-end mt-4">
              <Button onClick={openCreateLesson}>
                <Plus className="mr-2 w-4 h-4" />
                Create Lesson for Selected Students
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Dialog open={isCreateLessonOpen} onOpenChange={setIsCreateLessonOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Lesson</DialogTitle>
            <DialogDescription>
              Create a new lesson and assign it to {selectedStudents.length} selected student{selectedStudents.length !== 1 ? 's' : ''}.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateLesson} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="lesson-title">Lesson Title</Label>
              <Input
                id="lesson-title"
                value={lessonForm.title}
                onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
                placeholder="e.g., Introduction to JavaScript"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lesson-description">Description & Instructions</Label>
              <Textarea
                id="lesson-description"
                value={lessonForm.description}
                onChange={(e) => setLessonForm({ ...lessonForm, description: e.target.value })}
                placeholder="Provide detailed instructions, learning objectives, and any additional information for this lesson..."
                rows={6}
                required
              />
            </div>
            
            {/* Selected Students Preview */}
            <div className="space-y-2">
              <Label>Assigned To ({selectedStudents.length} students)</Label>
              <div className="bg-gray-50 p-3 rounded-lg max-h-32 overflow-y-auto">
                <div className="space-y-1">
                  {selectedStudents.map((phone) => {
                    const student = students.find(s => s.phone === phone)
                    return student ? (
                      <div key={phone} className="flex items-center space-x-2 text-sm">
                        <User className="w-3 h-3 text-gray-400" />
                        <span>{student.name}</span>
                        <span className="text-gray-500">({student.email})</span>
                      </div>
                    ) : null
                  })}
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setIsCreateLessonOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={assignLessonMutation.isPending}>
                {assignLessonMutation.isPending ? 'Creating...' : 'Create & Assign Lesson'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
