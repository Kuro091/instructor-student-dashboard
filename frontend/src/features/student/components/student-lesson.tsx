import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  ArrowLeft, 
  CheckCircle, 
  Clock, 
  BookOpen, 
  MessageCircle, 
  Calendar,
  User
} from 'lucide-react'
import { useStudentLessons } from '../hooks/use-student-queries'
import { useMarkLessonDone } from '../hooks/use-student-queries'
import { routes } from '@/app/routes'
import { firestoreTimestampToDate } from '@/lib/utils'

export function StudentLesson() {
  const { id } = useParams<{ id: string }>()
  const [isCompleting, setIsCompleting] = useState(false)
  
  const { data: lessons = [], isLoading, error } = useStudentLessons()
  const markLessonDoneMutation = useMarkLessonDone()
  

  // Find the specific lesson from the lessons list
  const lesson = lessons.find(l => l.id === id)

  const handleCompleteLesson = async () => {
    if (!lesson || lesson.status === 'completed') return
    
    setIsCompleting(true)
    try {
      await markLessonDoneMutation.mutateAsync({
        lessonId: lesson.id
      })
    } catch (error) {
      console.error('Failed to complete lesson:', error)
    } finally {
      setIsCompleting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="bg-gray-200 rounded w-8 h-8" />
          <div className="bg-gray-200 rounded w-48 h-8" />
        </div>
        <Card>
          <CardHeader>
            <div className="bg-gray-200 mb-2 rounded w-64 h-6" />
            <div className="bg-gray-200 rounded w-32 h-4" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-gray-200 rounded w-full h-4" />
              <div className="bg-gray-200 rounded w-full h-4" />
              <div className="bg-gray-200 rounded w-3/4 h-4" />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error || !lesson) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link to="">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 w-4 h-4" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
        <Card>
          <CardContent className="py-8 text-center">
            <BookOpen className="mx-auto mb-4 w-12 h-12 text-gray-400" />
            <h3 className="mb-2 font-medium text-gray-900 text-lg">Lesson Not Found</h3>
            <p className="mb-4 text-gray-500">
              The lesson you're looking for doesn't exist or you don't have access to it.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const isCompleted = lesson.status === 'completed'
  const canComplete = !isCompleted && !isCompleting

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link to="">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 w-4 h-4" />
              Back to Dashboard
            </Button>
          </Link>
          <div>
            <h1 className="font-bold text-gray-900 text-2xl">{lesson.title}</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge
                variant={isCompleted ? 'default' : 'secondary'}
                className="text-xs"
              >
                {isCompleted ? (
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
                <span className="text-gray-500 text-sm">
                  Assigned {firestoreTimestampToDate(lesson.createdAt).toLocaleDateString()}
                </span>
            </div>
          </div>
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

      <div className="gap-6 grid grid-cols-1 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Lesson Content
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="max-w-none prose">
                <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {lesson.description || 'No detailed content available for this lesson.'}
                </div>
              </div>
            </CardContent>
          </Card>


          {canComplete && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  Complete Lesson
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-gray-600 text-sm">
                    Ready to mark this lesson as complete? This will update your progress and notify your instructor.
                  </p>
                  <Button
                    onClick={handleCompleteLesson}
                    disabled={isCompleting}
                    className="w-full cursor-pointer"
                  >
                    {isCompleting ? (
                      <>
                        <div className="mr-2 border border-white border-t-transparent rounded-full w-4 h-4 animate-spin" />
                        Completing Lesson...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="mr-2 w-4 h-4" />
                        Mark as Complete
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {isCompleted && (
            <Card>
              <CardContent className="py-8 text-center">
                <CheckCircle className="mx-auto mb-4 w-12 h-12 text-green-500" />
                <h3 className="mb-2 font-medium text-gray-900 text-lg">
                  Lesson Completed!
                </h3>
                <p className="mb-4 text-gray-500">
                  Great job! You've successfully completed this lesson.
                </p>
                {lesson.completedAt && (
                  <p className="text-gray-400 text-sm">
                    Completed on {new Date(lesson.completedAt).toLocaleDateString()}
                  </p>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Lesson Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">Assigned:</span>
                <span>{new Date(lesson.createdAt).toLocaleDateString()}</span>
              </div>
              {lesson.completedAt && (
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">Completed:</span>
                  <span>{new Date(lesson.completedAt).toLocaleDateString()}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm">
                <User className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">Instructor:</span>
                <span>{lesson.assignedBy || 'Unknown'}</span>
              </div>
            </CardContent>
          </Card>


          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link to={routes.chat.list} className="block">
                <Button variant="outline" size="sm" className="justify-start w-full cursor-pointer">
                  <MessageCircle className="mr-2 w-4 h-4" />
                  Ask Instructor
                </Button>
              </Link>
              <Link to="" className="block">
                <Button variant="outline" size="sm" className="justify-start w-full cursor-pointer">
                  <ArrowLeft className="mr-2 w-4 h-4" />
                  Back to Dashboard
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
