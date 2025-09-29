interface TypingIndicatorProps {
  isTyping: boolean
  userName?: string
}

export function TypingIndicator({ isTyping, userName }: TypingIndicatorProps) {
  if (!isTyping) return null

  return (
    <div className="flex items-center gap-2 px-3 py-2">
      <div className="flex gap-1">
        <div className="bg-gray-400 rounded-full w-2 h-2 animate-bounce" style={{ animationDelay: '0ms' }} />
        <div className="bg-gray-400 rounded-full w-2 h-2 animate-bounce" style={{ animationDelay: '150ms' }} />
        <div className="bg-gray-400 rounded-full w-2 h-2 animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
      <span className="text-gray-500 text-sm">
        {userName ? `${userName} is typing...` : 'Typing...'}
      </span>
    </div>
  )
}
