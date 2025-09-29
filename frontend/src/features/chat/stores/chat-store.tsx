import { createContext, useContext, useReducer, useEffect, type ReactNode } from 'react'
import type { ChatState, Message, Conversation } from '../types'
import { socketManager } from '@/lib/socket'
import { useAuth } from '@/features/auth/stores/auth-context'

type ChatAction =
  | { type: 'SET_CONVERSATIONS'; payload: Conversation[] }
  | { type: 'SET_CURRENT_CONVERSATION'; payload: Conversation | null }
  | { type: 'SET_MESSAGES'; payload: Message[] }
  | { type: 'ADD_MESSAGE'; payload: Message }
  | { type: 'UPDATE_MESSAGE'; payload: { messageId: string; updates: Partial<Message> } }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_CONNECTED'; payload: boolean }
  | { type: 'SET_TYPING_USERS'; payload: string[] }
  | { type: 'ADD_TYPING_USER'; payload: string }
  | { type: 'REMOVE_TYPING_USER'; payload: string }

const initialState: ChatState = {
  conversations: [],
  currentConversation: null,
  messages: [],
  isLoading: false,
  isConnected: false,
  typingUsers: [],
}

function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case 'SET_CONVERSATIONS':
      return { ...state, conversations: action.payload }
    
    case 'SET_CURRENT_CONVERSATION':
      return { ...state, currentConversation: action.payload }
    
    case 'SET_MESSAGES':
      return { ...state, messages: action.payload }
    
    case 'ADD_MESSAGE':
      return {
        ...state,
        messages: [...state.messages, action.payload],
        conversations: state.conversations.map(conv => 
          conv.participants.instructorId === action.payload.senderId || 
          conv.participants.studentId === action.payload.senderId ||
          conv.participants.instructorId === action.payload.receiverId ||
          conv.participants.studentId === action.payload.receiverId
            ? { ...conv, lastMessage: action.payload, lastMessageAt: action.payload.timestamp }
            : conv
        )
      }
    
    case 'UPDATE_MESSAGE':
      return {
        ...state,
        messages: state.messages.map(msg =>
          msg.id === action.payload.messageId
            ? { ...msg, ...action.payload.updates }
            : msg
        ),
        conversations: state.conversations.map(conv => 
          conv.lastMessage?.id === action.payload.messageId
            ? { ...conv, lastMessage: { ...conv.lastMessage, ...action.payload.updates } }
            : conv
        )
      }
    
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload }
    
    case 'SET_CONNECTED':
      return { ...state, isConnected: action.payload }
    
    case 'SET_TYPING_USERS':
      return { ...state, typingUsers: action.payload }
    
    case 'ADD_TYPING_USER':
      return {
        ...state,
        typingUsers: state.typingUsers.includes(action.payload)
          ? state.typingUsers
          : [...state.typingUsers, action.payload]
      }
    
    case 'REMOVE_TYPING_USER':
      return {
        ...state,
        typingUsers: state.typingUsers.filter(userId => userId !== action.payload)
      }
    
    
    default:
      return state
  }
}

interface ChatContextType {
  state: ChatState
  dispatch: React.Dispatch<ChatAction>
  sendMessage: (receiverId: string, content: string, type?: 'text' | 'image' | 'file') => void
  markMessageAsRead: (messageId: string) => void
  startTyping: (receiverId: string) => void
  stopTyping: (receiverId: string) => void
  checkUserStatus: (userId: string) => void
}

const ChatContext = createContext<ChatContextType | null>(null)

interface ChatProviderProps {
  children: ReactNode
}

export function ChatProvider({ children }: ChatProviderProps) {
  const [state, dispatch] = useReducer(chatReducer, initialState)
  const { user } = useAuth()

  useEffect(() => {
    if (user?.id) {
      const socket = socketManager.connect()
      socket.on('connect', () => {
        dispatch({ type: 'SET_CONNECTED', payload: true })
      })

      socket.on('disconnect', () => {
        dispatch({ type: 'SET_CONNECTED', payload: false })
      })

      socket.on('new_message', (message: Message) => {
        dispatch({ type: 'ADD_MESSAGE', payload: message })
      })

      socket.on('message_sent', (data: { messageId: string; timestamp: string }) => {
        dispatch({ 
          type: 'UPDATE_MESSAGE', 
          payload: { 
            messageId: data.messageId, 
            updates: { timestamp: data.timestamp } 
          } 
        })
      })

      socket.on('message_read', (data: { messageId: string; readAt: string }) => {
        dispatch({ 
          type: 'UPDATE_MESSAGE', 
          payload: { 
            messageId: data.messageId, 
            updates: { isRead: true } 
          } 
        })
      })

      socket.on('user_typing', (data: { userId: string; isTyping: boolean }) => {
        if (data.isTyping) {
          dispatch({ type: 'ADD_TYPING_USER', payload: data.userId })
        } else {
          dispatch({ type: 'REMOVE_TYPING_USER', payload: data.userId })
        }
      })


      return () => {
        socketManager.disconnect()
      }
    }
  }, [user?.id])

  const sendMessage = (receiverId: string, content: string) => {
    socketManager.emit('send_message', { receiverId, content })
  }

  const markMessageAsRead = (messageId: string) => {
    socketManager.emit('mark_message_read', { messageId })
  }

  const startTyping = (receiverId: string) => {
    socketManager.emit('typing_start', { receiverId })
  }

  const stopTyping = (receiverId: string) => {
    socketManager.emit('typing_stop', { receiverId })
  }

  const checkUserStatus = (userId: string) => {
    socketManager.emit('check_user_status', { userId })
  }

  const value: ChatContextType = {
    state,
    dispatch,
    sendMessage,
    markMessageAsRead,
    startTyping,
    stopTyping,
    checkUserStatus,
  }

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  )
}

export function useChat() {
  const context = useContext(ChatContext)
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider')
  }
  return context
}
