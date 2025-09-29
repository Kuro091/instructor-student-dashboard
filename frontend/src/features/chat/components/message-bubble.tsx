import { format } from 'date-fns'
import { Check, CheckCheck } from 'lucide-react'
import { cn, timestampToDate, type FirestoreTimestamp } from '@/lib/utils'
import type { Message } from '../types'

interface MessageBubbleProps {
  message: Message
  isOwn: boolean
  showAvatar?: boolean
  showTimestamp?: boolean
  isMarkingAsRead?: boolean
  isLastReadMessage?: boolean
}

export function MessageBubble({ 
  message, 
  isOwn, 
  showAvatar = false, 
  showTimestamp = true,
  isMarkingAsRead = false,
  isLastReadMessage = false
}: MessageBubbleProps) {
  const formatTime = (timestamp: string | FirestoreTimestamp) => {
    const date = timestampToDate(timestamp)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    
    if (diffInHours < 24) {
      return format(date, 'HH:mm')
    } else {
      return format(date, 'MMM dd')
    }
  }


  return (
    <div className={cn(
      "flex gap-2 max-w-[80%]",
      isOwn ? "ml-auto flex-row-reverse" : "mr-auto"
    )}>
      {showAvatar && !isOwn && (
        <div className="flex justify-center items-center bg-gray-200 rounded-full w-8 h-8 font-medium text-xs">
          {message.senderName.split(' ').map(n => n[0]).join('').toUpperCase()}
        </div>
      )}
      
      <div className={cn(
        "flex flex-col gap-1",
        isOwn ? "items-end" : "items-start"
      )}>
        <div className={cn(
          "px-3 py-2 rounded-2xl text-sm",
          isOwn 
            ? "text-white bg-blue-500 rounded-br-md" 
            : "text-gray-900 bg-gray-100 rounded-bl-md"
        )}>
          <p className="whitespace-pre-wrap">{message.content}</p>
        </div>
        
        {isOwn && (
          <div className={cn(
            "flex items-center gap-1 text-gray-500 text-xs",
            "flex-row-reverse"
          )}>
            {showTimestamp && <span>{formatTime(message.timestamp)}</span>}
            {isLastReadMessage && (
              <div className="flex items-center">
                {message.isRead ? (
                  <CheckCheck className="w-3 h-3 text-blue-500" />
                ) : isMarkingAsRead ? (
                  <div className="border border-gray-400 border-t-transparent rounded-full w-3 h-3 animate-spin" />
                ) : (
                  <Check className="w-3 h-3 text-gray-400" />
                )}
              </div>
            )}
          </div>
        )}
        
        {!isOwn && showTimestamp && (
          <div className="flex items-center gap-1 text-gray-500 text-xs">
            <span>{formatTime(message.timestamp)}</span>
          </div>
        )}
      </div>
      
      {showAvatar && isOwn && (
        <div className="flex justify-center items-center bg-blue-500 rounded-full w-8 h-8 font-medium text-white text-xs">
          You
        </div>
      )}
    </div>
  )
}
