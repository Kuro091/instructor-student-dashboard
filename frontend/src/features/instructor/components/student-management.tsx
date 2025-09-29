import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { 
  Plus, 
  Search, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Eye, 
  MessageSquare,
  Mail,
  Phone,
  Calendar,
  UserPlus
} from 'lucide-react'
import { routes } from '@/app/routes'
import { useStudents, useAddStudent, useEditStudent, useDeleteStudent } from '../hooks/use-instructor-queries'
import { StudentForm } from './student-form'
import type { Student, AddStudentRequest } from '../types'

export function StudentManagement() {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const { data: students = [], isLoading, error } = useStudents()
  const addStudentMutation = useAddStudent()
  const editStudentMutation = useEditStudent()
  const deleteStudentMutation = useDeleteStudent()

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.phone.includes(searchTerm)
  )

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  const handleAddStudent = async (data: AddStudentRequest) => {
    await addStudentMutation.mutateAsync(data)
  }

  const handleEditStudent = async (data: AddStudentRequest) => {
    if (!selectedStudent) return
    await editStudentMutation.mutateAsync({
      phone: selectedStudent.phone,
      data
    })
  }

  const handleDeleteStudent = async () => {
    if (!selectedStudent) return
    await deleteStudentMutation.mutateAsync(selectedStudent.phone)
    setIsDeleteDialogOpen(false)
    setSelectedStudent(null)
  }

  const openEditDialog = (student: Student) => {
    setSelectedStudent(student)
    setIsEditDialogOpen(true)
  }

  const openDeleteDialog = (student: Student) => {
    setSelectedStudent(student)
    setIsDeleteDialogOpen(true)
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-red-100 p-4 border border-red-300 rounded">
          <h2 className="font-bold text-red-800">Error loading students</h2>
          <p className="text-red-600">{error.message}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-bold text-gray-900 text-3xl">Student Management</h1>
          <p className="mt-1 text-gray-600">
            Manage your students, view their progress, and communicate with them.
          </p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="mr-2 w-4 h-4" />
          Add Student
        </Button>
      </div>

      <div className="gap-4 grid grid-cols-1 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row justify-between items-center space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">Total Students</CardTitle>
            <UserPlus className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">{students.length}</div>
            <p className="text-muted-foreground text-xs">
              All students in your class
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row justify-between items-center space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">Active Students</CardTitle>
            <UserPlus className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">
              {students.filter(s => s.isActive).length}
            </div>
            <p className="text-muted-foreground text-xs">
              Completed account setup
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row justify-between items-center space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">Pending Setup</CardTitle>
            <UserPlus className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">
              {students.filter(s => !s.isActive).length}
            </div>
            <p className="text-muted-foreground text-xs">
              Awaiting account setup
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row justify-between items-center space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">This Week</CardTitle>
            <UserPlus className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">
              {students.filter(s => {
                const created = new Date(s.createdAt)
                const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                return created > weekAgo
              }).length}
            </div>
            <p className="text-muted-foreground text-xs">
              New students added
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Students</CardTitle>
              <CardDescription>
                Manage and view all your students
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

          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="border-primary border-b-2 rounded-full w-8 h-8 animate-spin"></div>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="py-8 text-center">
              <UserPlus className="mx-auto mb-4 w-12 h-12 text-gray-400" />
              <h3 className="mb-2 font-medium text-gray-900 text-lg">No students found</h3>
              <p className="mb-4 text-gray-500">
                {searchTerm ? 'No students match your search criteria.' : 'Get started by adding your first student.'}
              </p>
              {!searchTerm && (
                <Button onClick={() => setIsAddDialogOpen(true)}>
                  <Plus className="mr-2 w-4 h-4" />
                  Add Student
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src="" alt={student.name} />
                          <AvatarFallback>{getInitials(student.name)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{student.name}</div>
                          <div className="text-gray-500 text-sm">Student</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2 text-sm">
                          <Mail className="w-3 h-3 text-gray-400" />
                          <span>{student.email}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm">
                          <Phone className="w-3 h-3 text-gray-400" />
                          <span>{student.phone}</span>
                        </div>
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
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => navigate(`${routes.instructor.students}/${student.phone}`)}>
                            <Eye className="mr-2 w-4 h-4" />
                            View Profile
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openEditDialog(student)}>
                            <Edit className="mr-2 w-4 h-4" />
                            Edit Student
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => navigate(routes.chat.list)}>
                            <MessageSquare className="mr-2 w-4 h-4" />
                            Send Message
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => openDeleteDialog(student)}
                            className="text-red-600"
                          >
                            <Trash2 className="mr-2 w-4 h-4" />
                            Delete Student
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Forms */}
      <StudentForm
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onSubmit={handleAddStudent}
        title="Add New Student"
        description="Add a new student to your classroom. They will receive an email to complete their account setup."
        submitText="Add Student"
      />

      <StudentForm
        isOpen={isEditDialogOpen}
        onClose={() => {
          setIsEditDialogOpen(false)
          setSelectedStudent(null)
        }}
        onSubmit={handleEditStudent}
        initialData={selectedStudent ? {
          name: selectedStudent.name,
          phone: selectedStudent.phone,
          email: selectedStudent.email
        } : undefined}
        title="Edit Student"
        description="Update student information. Changes will be reflected immediately."
        submitText="Update Student"
      />

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Student</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedStudent?.name}? This action cannot be undone.
              All their lessons and messages will also be removed.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteStudent}
              disabled={deleteStudentMutation.isPending}
            >
              {deleteStudentMutation.isPending ? 'Deleting...' : 'Delete Student'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
