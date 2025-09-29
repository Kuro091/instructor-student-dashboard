import type { Message, Conversation, SendMessageRequest } from '../types'
import { apiRequest } from '@/lib/api'

export const chatApi = {
  sendMessage: async (data: SendMessageRequest) => {
    return apiRequest<{ success: boolean; data: Message; message: string }>('/api/chat/send', {
      method: 'POST',
      body: JSON.stringify({
        receiverId: data.receiverId,
        content: data.content
      }),
    })
  },

  getConversation: async (participantId: string) => {
    return apiRequest<{ 
      success: boolean; 
      data: { 
        conversation: Conversation; 
        messages: Message[] 
      } 
    }>(`/api/chat/conversation/${participantId}`)
  },

  getConversations: async () => {
    return apiRequest<{ 
      success: boolean; 
      data: Conversation[] 
    }>('/api/chat/conversations')
  },

  markMessageAsRead: async (messageId: string) => {
    return apiRequest<{ success: boolean; message: string }>('/api/chat/mark-read', {
      method: 'POST',
      body: JSON.stringify({ messageId }),
    })
  },
}
