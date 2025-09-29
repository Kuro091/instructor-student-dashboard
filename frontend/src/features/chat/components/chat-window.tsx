import { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Send, Smile } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { MessageBubble } from './message-bubble'
import { TypingIndicator } from './typing-indicator'
import { useConversation, useSendMessage, useTypingIndicator, useMarkMessageAsRead } from '../hooks/use-chat-queries'
import { useAuth } from '@/features/auth/stores/auth-context'
import { useChat } from '../stores/chat-store'
import EmojiPicker, { type EmojiClickData } from 'emoji-picker-react'

export function ChatWindow() {
  const { participantId: urlParticipantId } = useParams<{ participantId: string }>()
  const [message, setMessage] = useState('')
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const markedAsReadRef = useRef<Set<string>>(new Set())
  
  const { data: conversationData, isLoading } = useConversation(urlParticipantId!)
  const sendMessageMutation = useSendMessage()
  const markAsReadMutation = useMarkMessageAsRead()
  const { handleTypingStart, handleTypingStop, isTyping } = useTypingIndicator(urlParticipantId!)
  const { user } = useAuth()

  const conversation = conversationData?.conversation
  const { state } = useChat()
  
  const isUserInstructor = user?.role === 'INSTRUCTOR'
  const participantId = isUserInstructor ? conversation?.participants.studentId : conversation?.participants.instructorId
  const participantName = isUserInstructor ? conversation?.participants.studentName : conversation?.participants.instructorName
  
  const messages = useMemo(() => {
    const apiMessages = conversationData?.messages || []
    const socketMessages = state.messages.filter(msg => 
      (msg.senderId === participantId && msg.receiverId === user?.id) ||
      (msg.senderId === user?.id && msg.receiverId === participantId)
    )
    
    const allMessages = [...apiMessages, ...socketMessages]
    const uniqueMessages = allMessages.filter((msg, index, self) => 
      index === self.findIndex(m => m.id === msg.id)
    )
    
    return uniqueMessages.sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    )
  }, [conversationData?.messages, state.messages, participantId, user?.id])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const markMessagesAsRead = useCallback(() => {
    if (conversation && messages.length > 0) {
      const unreadMessages = messages.filter(msg => 
        !msg.isRead && 
        msg.senderId !== user?.id && 
        !markedAsReadRef.current.has(msg.id)
      )
      
      unreadMessages.forEach(msg => {
        markedAsReadRef.current.add(msg.id)
        markAsReadMutation.mutate(msg.id)
      })
    }
  }, [conversation, messages, markAsReadMutation, user?.id])

  useEffect(() => {
    markMessagesAsRead()
  }, [markMessagesAsRead])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim() || !participantId) return

    try {
      await sendMessageMutation.mutateAsync({
        receiverId: participantId,
        content: message.trim()
      })
      setMessage('')
      handleTypingStop()
    } catch (error) {
      console.error('Failed to send message:', error)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setMessage(value)
    
    if (value.trim()) {
      handleTypingStart()
    } else {
      handleTypingStop()
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage(e)
    }
  }

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    setMessage(prev => prev + emojiData.emoji)
    setShowEmojiPicker(false)
  }

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showEmojiPicker && !(event.target as Element).closest('.emoji-picker-container')) {
        setShowEmojiPicker(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showEmojiPicker])

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <div className="flex items-center gap-3 animate-pulse">
            <div className="bg-gray-200 rounded-full w-10 h-10" />
            <div className="space-y-2">
              <div className="bg-gray-200 rounded w-32 h-4" />
              <div className="bg-gray-200 rounded w-24 h-3" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex gap-2 animate-pulse">
                <div className="bg-gray-200 rounded-full w-8 h-8" />
                <div className="space-y-2">
                  <div className="bg-gray-200 rounded w-48 h-4" />
                  <div className="bg-gray-200 rounded w-16 h-3" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!conversation) {
    return (
      <Card className="flex justify-center items-center h-full">
        <CardContent className="text-center">
          <h3 className="mb-2 font-medium text-gray-900 text-lg">Conversation not found</h3>
          <p className="mb-4 text-gray-500">The conversation you're looking for doesn't exist.</p>
          <Link to="/chat">
            <Button variant="outline">Back to Conversations</Button>
          </Link>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <Card className="flex flex-col h-full">
        <CardHeader className="flex-shrink-0 border-b">
          <div className="flex items-center gap-3">
            <Link to="/chat">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div className="relative">
              <Avatar className="w-10 h-10">
                <AvatarImage src={`/api/avatar/${participantId}`} />
                <AvatarFallback>
                  {participantName?.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
            <div className="flex-1">
              <CardTitle className="text-lg">{participantName}</CardTitle>
              <div className="flex items-center gap-2">
                <span className="text-gray-500 text-sm">{isUserInstructor ? 'Student' : 'Instructor'}</span>
              </div>
            </div>
          </div>
        </CardHeader>

        <div className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 space-y-4 p-4 overflow-y-auto">
            {messages.length === 0 ? (
              <div className="flex justify-center items-center h-full text-gray-500">
                <div className="text-center">
                  <p className="mb-2 font-medium text-lg">No messages yet</p>
                  <p className="text-sm">Start the conversation by sending a message</p>
                </div>
              </div>
            ) : (
              <>
                {messages.map((msg, index) => {
                  const isOwn = msg.senderId === user?.id
                  const prevMessage = messages[index - 1]
                  const showAvatar = !prevMessage || prevMessage.senderId !== msg.senderId
                  const showTimestamp = !prevMessage || 
                    new Date(msg.timestamp).getTime() - new Date(prevMessage.timestamp).getTime() > 300000 // 5 minutes

                  return (
                    <MessageBubble
                      key={msg.id}
                      message={msg}
                      isOwn={isOwn}
                      showAvatar={showAvatar}
                      showTimestamp={showTimestamp}
                    />
                  )
                })}
                
                <TypingIndicator isTyping={isTyping} userName={participantName} />
                
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          <div className="flex-shrink-0 p-4 border-t">
            <div className="relative">
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <Input
                  value={message}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  placeholder="Type a message..."
                  className="flex-1"
                  disabled={sendMessageMutation.isPending}
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                >
                  <Smile className="w-4 h-4" />
                </Button>
                <Button 
                  type="submit" 
                  size="sm"
                  disabled={!message.trim() || sendMessageMutation.isPending}
                >
                  <Send className="w-4 h-4" />
                </Button>
              </form>
              
              {showEmojiPicker && (
                <div className="right-0 bottom-full z-10 absolute mb-2 emoji-picker-container">
                  <EmojiPicker 
                    onEmojiClick={handleEmojiClick}
                    width={350}
                    height={400}
                    previewConfig={{
                      showPreview: false
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
