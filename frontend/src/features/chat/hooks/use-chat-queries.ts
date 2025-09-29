import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { chatApi } from '../api'
import { useChat } from '../stores/chat-store'
import { useAuth } from '@/features/auth/stores/auth-context'
import type { SendMessageRequest } from '../types'

export const chatKeys = {
  all: ['chat'] as const,
  conversations: () => [...chatKeys.all, 'conversations'] as const,
  conversation: (participantId: string) => [...chatKeys.all, 'conversation', participantId] as const,
}
export function useConversations() {
  return useQuery({
    queryKey: chatKeys.conversations(),
    queryFn: async () => {
      const response = await chatApi.getConversations()
      return response.data
    },
    staleTime: 30000,
    refetchInterval: 60000,
  })
}

export function useConversation(participantId: string) {
  return useQuery({
    queryKey: chatKeys.conversation(participantId),
    queryFn: async () => {
      const response = await chatApi.getConversation(participantId)
      return response.data
    },
    enabled: !!participantId,
    staleTime: 10000,
  })
}

export function useSendMessage() {
  const queryClient = useQueryClient()
  const { sendMessage } = useChat()
  const { user } = useAuth()

  return useMutation({
    mutationFn: async (data: SendMessageRequest) => {
      sendMessage(data.receiverId, data.content)
      
      return {
        id: `temp-${Date.now()}`,
        senderId: user?.id || '',
        senderName: user?.name || '',
        senderRole: user?.role || '',
        receiverId: data.receiverId,
        receiverName: '',
        receiverRole: '', 
        content: data.content,
        timestamp: new Date().toISOString(),
        isRead: false,
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: chatKeys.conversations() })
    },
    onError: (error) => {
      console.error('Failed to send message:', error)
    },
  })
}

export function useMarkMessageAsRead() {
  const { markMessageAsRead } = useChat()

  return useMutation({
    mutationFn: async (messageId: string) => {
      const response = await chatApi.markMessageAsRead(messageId)
      return response
    },
    onSuccess: (_, messageId) => {
      markMessageAsRead(messageId)
    },
  })
}

export function useTypingIndicator(receiverId: string) {
  const { startTyping, stopTyping, state } = useChat()
  
  let typingTimeout: ReturnType<typeof setTimeout> | null = null

  const handleTypingStart = () => {
    startTyping(receiverId)
    
    if (typingTimeout) {
      clearTimeout(typingTimeout)
    }
    typingTimeout = setTimeout(() => {
      stopTyping(receiverId)
    }, 3000)
  }

  const handleTypingStop = () => {
    if (typingTimeout) {
      clearTimeout(typingTimeout)
      typingTimeout = null
    }
    stopTyping(receiverId)
  }

  return {
    handleTypingStart,
    handleTypingStop,
    isTyping: state.typingUsers.includes(receiverId),
  }
}

export function useUserStatus(userId: string) {
  const { checkUserStatus, state } = useChat()
  
  const conversation = state.conversations.find(conv => 
    conv.participants.instructorId === userId || conv.participants.studentId === userId
  )
  
  return {
    lastSeen: conversation?.lastMessageAt,
    checkStatus: () => checkUserStatus(userId),
  }
}
