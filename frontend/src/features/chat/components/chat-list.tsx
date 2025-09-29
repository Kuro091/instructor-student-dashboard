import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, MessageCircle, Users, Plus } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useConversations } from '../hooks/use-chat-queries'
import { useChat } from '../stores/chat-store'
import { useAuth } from '@/features/auth/stores/auth-context'
import { cn, firestoreTimestampToDate, type FirestoreTimestamp } from '@/lib/utils'
import { Button } from '@/components/ui/button'

export function ChatList() {
  const [searchTerm, setSearchTerm] = useState('')
  const { data: conversations = [], isLoading } = useConversations()
  const { state } = useChat()
  const { user } = useAuth()
  const navigate = useNavigate()

  const filteredConversations = conversations.filter(conv => {
    const instructorName = conv.participants.instructorName.toLowerCase()
    const studentName = conv.participants.studentName.toLowerCase()
    return instructorName.includes(searchTerm.toLowerCase()) || 
           studentName.includes(searchTerm.toLowerCase())
  })

  const formatLastMessageTime = (timestamp: string | FirestoreTimestamp) => {
    const date = firestoreTimestampToDate(timestamp)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 1) {
      return 'Just now'
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`
    } else {
      return date.toLocaleDateString()
    }
  }

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            Conversations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3 animate-pulse">
                <div className="bg-gray-200 rounded-full w-10 h-10" />
                <div className="flex-1 space-y-2">
                  <div className="bg-gray-200 rounded w-3/4 h-4" />
                  <div className="bg-gray-200 rounded w-1/2 h-3" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            Conversations
            <Badge variant="secondary">
              {conversations.length}
            </Badge>
          </CardTitle>
          <Button 
            size="sm" 
            onClick={() => navigate('/instructor/students')}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Chat
          </Button>
        </div>
        <div className="relative">
          <Search className="top-1/2 left-3 absolute w-4 h-4 text-gray-400 -translate-y-1/2 transform" />
          <Input
            placeholder="Search conversations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {filteredConversations.length === 0 ? (
          <div className="flex flex-col justify-center items-center py-12 text-gray-500">
            <Users className="mb-4 w-12 h-12" />
            <p className="font-medium text-lg">No conversations yet</p>
            <p className="text-sm">Start a conversation with a student or instructor</p>
          </div>
        ) : (
          <div className="space-y-1">
            {filteredConversations.map((conversation) => {
              const isUserInstructor = user?.role === 'INSTRUCTOR'
              const participantId = isUserInstructor ? conversation.participants.studentId : conversation.participants.instructorId
              const participantName = isUserInstructor ? conversation.participants.studentName : conversation.participants.instructorName
              
              return (
                <Link
                  key={conversation.id}
                  to={`/chat/${participantId}`}
                  className={cn(
                    "flex items-center space-x-3 hover:bg-gray-50 p-4 transition-colors",
                    state.currentConversation?.id === conversation.id && "bg-blue-50 border-r-2 border-blue-500"
                  )}
                >
                <div className="relative">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={`/api/avatar/${participantId}`} />
                    <AvatarFallback>
                      {participantName.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <p className="font-medium text-gray-900 text-sm truncate">
                      {participantName}
                    </p>
                    <p className="text-gray-500 text-xs">
                      {conversation.lastMessageAt ? formatLastMessageTime(conversation.lastMessageAt) : 'No messages'}
                    </p>
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <p className="text-gray-500 text-xs truncate">
                      {conversation.lastMessage?.content || 'Start conversation...'}
                    </p>
                  </div>
                </div>
              </Link>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
