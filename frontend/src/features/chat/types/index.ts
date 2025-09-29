export interface Message {
  id: string
  sender: string
  receiver: string
  content: string
  timestamp: string
  isRead: boolean
  type: 'text' | 'image' | 'file'
}

export interface Conversation {
  id: string
  participantId: string
  participantName: string
  participantPhone: string
  lastMessage?: Message
  unreadCount: number
  isOnline: boolean
  lastSeen?: string
}

export interface SendMessageRequest {
  receiver: string
  content: string
  type?: 'text' | 'image' | 'file'
}

export interface ChatState {
  conversations: Conversation[]
  currentConversation: Conversation | null
  messages: Message[]
  isLoading: boolean
  isConnected: boolean
  typingUsers: string[]
}

export interface SocketEvents {
  // Outgoing events
  send_message: { receiver: string; content: string; type?: string }
  mark_message_read: { messageId: string }
  typing_start: { receiver: string }
  typing_stop: { receiver: string }
  check_user_status: { userId: string }
  
  // Incoming events
  new_message: Message
  message_sent: { messageId: string; timestamp: string }
  message_read: { messageId: string; readAt: string }
  user_typing: { userId: string; isTyping: boolean }
  user_status: { userId: string; isOnline: boolean; lastSeen?: string }
  connected: { userId: string }
}
