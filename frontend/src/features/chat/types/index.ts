export interface Message {
  id: string
  senderId: string
  senderName: string
  senderRole: string
  receiverId: string
  receiverName: string
  receiverRole: string
  content: string
  timestamp: string
  isRead: boolean
}

export interface Conversation {
  id: string
  participants: {
    instructorId: string
    instructorName: string
    studentId: string
    studentName: string
  }
  lastMessage?: Message
  lastMessageAt?: string
  createdAt: string
  updatedAt: string
}

export interface SendMessageRequest {
  receiverId: string
  content: string
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
  send_message: { receiverId: string; content: string }
  mark_message_read: { messageId: string }
  typing_start: { receiverId: string }
  typing_stop: { receiverId: string }
  check_user_status: { userId: string }
  
  // Incoming events
  new_message: Message
  message_sent: Message
  message_read: { messageId: string }
  user_typing: { userId: string; isTyping: boolean }
  user_status: { userId: string; isOnline: boolean }
  connected: { message: string; userId: string }
  error: { message: string }
}
