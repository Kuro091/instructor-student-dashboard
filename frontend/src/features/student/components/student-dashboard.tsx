import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Calendar, BookOpen, MessageCircle, CheckCircle, Clock, User } from 'lucide-react'
import { useAuth } from '@/features/auth/stores/auth-context'
import { useStudentLessons } from '../hooks/use-student-queries'
import { routes } from '@/app/routes'
import { firestoreTimestampToDate } from '@/lib/utils'

export function StudentDashboard() {
  const { user } = useAuth()
  const { data: lessons = [], isLoading, error } = useStudentLessons()
  

  const completedLessons = lessons.filter(lesson => lesson.status === 'completed')
  const pendingLessons = lessons.filter(lesson => lesson.status === 'pending')
  const progressPercentage = lessons.length > 0 ? (completedLessons.length / lessons.length) * 100 : 0

  const upcomingLessons = lessons
    .filter(lesson => lesson.status === 'pending')
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    .slice(0, 3)

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <div className="bg-gray-200 mb-2 rounded w-48 h-8" />
            <div className="bg-gray-200 rounded w-32 h-4" />
          </div>
        </div>
        <div className="gap-6 grid grid-cols-1 md:grid-cols-3">
          {[1, 2, 3].map(i => (
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
          <h1 className="font-bold text-gray-900 text-3xl">
            Welcome back, {user?.name || 'Student'}!
          </h1>
          <p className="mt-1 text-gray-600">
            Here's your learning progress and upcoming lessons.
          </p>
        </div>
        <div className="flex gap-2">
          <Link to={routes.chat.list}>
            <Button variant="outline" size="sm" className="cursor-pointer">
              <MessageCircle className="mr-2 w-4 h-4" />
              Contact Instructor
            </Button>
          </Link>
        </div>
      </div>

      <div className="gap-6 grid grid-cols-1 md:grid-cols-3">
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
            <CardTitle className="font-medium text-sm">Progress</CardTitle>
            <CheckCircle className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">{Math.round(progressPercentage)}%</div>
            <Progress value={progressPercentage} className="mt-2" />
            <p className="mt-1 text-muted-foreground text-xs">
              {completedLessons.length} of {lessons.length} lessons completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row justify-between items-center space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">Upcoming</CardTitle>
            <Clock className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">{pendingLessons.length}</div>
            <p className="text-muted-foreground text-xs">
              {upcomingLessons.length > 0 ? 'Next: ' + upcomingLessons[0].title : 'No upcoming lessons'}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="gap-6 grid grid-cols-1 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Assigned Lessons
            </CardTitle>
          </CardHeader>
          <CardContent>
            {lessons.length === 0 ? (
              <div className="py-8 text-center">
                <BookOpen className="mx-auto mb-4 w-12 h-12 text-gray-400" />
                <p className="mb-4 text-gray-500">No lessons assigned yet</p>
                <p className="text-gray-400 text-sm">
                  Your instructor will assign lessons to you soon.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {lessons.slice(0, 5).map((lesson) => (
                  <div
                    key={lesson.id}
                    className="flex justify-between items-center hover:bg-gray-50 p-3 border rounded-lg transition-colors"
                  >
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{lesson.title}</h4>
                      <p className="mt-1 text-gray-500 text-xs line-clamp-2">
                        {lesson.description}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
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
                        <span className="text-gray-400 text-xs">
                          {firestoreTimestampToDate(lesson.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-1 ml-3">
                      <Link to={`/student/lesson/${lesson.id}`}>
                        <Button size="sm" variant="outline" className="cursor-pointer">
                          View
                        </Button>
                      </Link>
                      {lesson.status === 'pending' && (
                        <Link to={`/student/lesson/${lesson.id}`}>
                          <Button size="sm" className="cursor-pointer">
                            Complete
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
                {lessons.length > 5 && (
                  <div className="pt-3 text-center">
                    <Link to="lessons">
                      <Button variant="outline" size="sm" className="cursor-pointer">
                        View All Lessons ({lessons.length})
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Upcoming Lessons
            </CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingLessons.length === 0 ? (
              <div className="py-8 text-center">
                <Calendar className="mx-auto mb-4 w-12 h-12 text-gray-400" />
                <p className="mb-4 text-gray-500">No upcoming lessons</p>
                <p className="text-gray-400 text-sm">
                  Check back later for new assignments.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingLessons.map((lesson) => (
                  <div
                    key={lesson.id}
                    className="flex items-center gap-3 p-3 border rounded-lg"
                  >
                    <div className="flex-shrink-0">
                      <div className="flex justify-center items-center bg-blue-100 rounded-full w-10 h-10">
                        <Calendar className="w-5 h-5 text-blue-600" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm truncate">{lesson.title}</h4>
                      <p className="mt-1 text-gray-500 text-xs">
                        Assigned {firestoreTimestampToDate(lesson.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                        <Link to={`/student/lesson/${lesson.id}`}>
                      <Button size="sm" variant="outline" className="cursor-pointer">
                        Start
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="gap-4 grid grid-cols-1 md:grid-cols-3">
            <Link to="profile">
              <Button variant="outline" className="justify-start w-full cursor-pointer">
                <User className="mr-2 w-4 h-4" />
                Edit Profile
              </Button>
            </Link>
            <Link to={routes.chat.list}>
              <Button variant="outline" className="justify-start w-full cursor-pointer">
                <MessageCircle className="mr-2 w-4 h-4" />
                Contact Instructor
              </Button>
            </Link>
            <Button
              variant="outline"
              className="justify-start w-full cursor-pointer"
              onClick={() => window.location.reload()}
            >
              <CheckCircle className="mr-2 w-4 h-4" />
              Refresh Progress
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
