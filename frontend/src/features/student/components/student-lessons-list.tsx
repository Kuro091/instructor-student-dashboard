import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  BookOpen, 
  CheckCircle, 
  Clock, 
  ArrowLeft,
  Calendar,
} from 'lucide-react'
import { useStudentLessons } from '../hooks/use-student-queries'
import { firestoreTimestampToDate } from '@/lib/utils'

export function StudentLessonsList() {
  const { data: lessons = [], isLoading, error } = useStudentLessons()

  const completedLessons = lessons.filter(lesson => lesson.status === 'completed')
  const pendingLessons = lessons.filter(lesson => lesson.status === 'pending')

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="bg-gray-200 rounded w-32 h-8" />
        </div>
        <div className="gap-4 grid md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Card key={i}>
              <CardHeader>
                <div className="bg-gray-200 rounded w-24 h-6" />
              </CardHeader>
              <CardContent>
                <div className="bg-gray-200 mb-2 rounded w-full h-4" />
                <div className="bg-gray-200 rounded w-16 h-4" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="mb-4 text-red-500">Failed to load lessons</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-bold text-gray-900 text-3xl">My Lessons</h1>
          <p className="mt-1 text-gray-600">
            All your assigned lessons and progress.
          </p>
        </div>
        <Link to="">
          <Button variant="outline" size="sm" className="cursor-pointer">
            <ArrowLeft className="mr-2 w-4 h-4" />
            Back to Dashboard
          </Button>
        </Link>
      </div>

      <div className="gap-4 grid grid-cols-1 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row justify-between items-center space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">Total Lessons</CardTitle>
            <BookOpen className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">{lessons.length}</div>
            <p className="text-muted-foreground text-xs">
              {pendingLessons.length} pending, {completedLessons.length} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row justify-between items-center space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">Completed</CardTitle>
            <CheckCircle className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">{completedLessons.length}</div>
            <p className="text-muted-foreground text-xs">
              {lessons.length > 0 ? Math.round((completedLessons.length / lessons.length) * 100) : 0}% completion rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row justify-between items-center space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">Pending</CardTitle>
            <Clock className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">{pendingLessons.length}</div>
            <p className="text-muted-foreground text-xs">
              {pendingLessons.length > 0 ? 'Ready to start' : 'All caught up!'}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            All Lessons
          </CardTitle>
        </CardHeader>
        <CardContent>
          {lessons.length === 0 ? (
            <div className="py-8 text-center">
              <BookOpen className="mx-auto mb-4 w-12 h-12 text-gray-400" />
              <h3 className="mb-2 font-medium text-gray-900 text-lg">No lessons assigned</h3>
              <p className="mb-4 text-gray-500">
                Your instructor will assign lessons to you soon.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {lessons.map((lesson) => (
                <div
                  key={lesson.id}
                  className="flex justify-between items-center hover:bg-gray-50 p-4 border rounded-lg transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-medium text-lg">{lesson.title}</h4>
                      <Badge
                        variant={lesson.status === 'completed' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
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
                    </div>
                    <p className="mb-2 text-gray-600 text-sm">
                      {lesson.description}
                    </p>
                    <div className="flex items-center gap-4 text-gray-500 text-xs">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>Assigned {firestoreTimestampToDate(lesson.createdAt).toLocaleDateString()}</span>
                      </div>
                      {lesson.status === 'completed' && lesson.completedAt && (
                        <div className="flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          <span>Completed {firestoreTimestampToDate(lesson.completedAt).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                     <Link to={`/student/lesson/${lesson.id}`}>
                       <Button size="sm" variant="outline" className="cursor-pointer">
                         View Details
                       </Button>
                     </Link>
                     {lesson.status === 'pending' && (
                       <Link to={`/student/lesson/${lesson.id}`}>
                         <Button size="sm" className="cursor-pointer">
                           Start Lesson
                         </Button>
                       </Link>
                     )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
