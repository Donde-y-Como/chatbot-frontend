import { api } from '@/api/axiosInstance'
import {
  Chat,
  ChatMessages,
  ChatResponse,
  ChatParams,
  ConversationStatusPrimitives,
} from '@/features/chats/ChatTypes.ts'

export const chatService = {
  getChatsPaginated: async (params?: ChatParams): Promise<ChatResponse> => {
    const newParams = { ...params, perPage: 20 }
    const response = await api.get<ChatResponse>('/chats', {
      params: newParams,
    })
    return response.data
  },

  getChats: async () => {
    const response = await api.get<{ conversations: Chat[] }>('/chats')
    return response.data.conversations
  },

  getChatsByClientId: async (clientId: string, platformName?: string) => {
    const params: any = {};
    if (platformName) {
      params.platformName = platformName;
    }
    
    const response = await api.get<{ conversations: Chat[] }>(`/clients/${clientId}/chats`, {
      params
    });
    return response.data.conversations;
  },

  getChatById: async (id: string) => {
    const response = await api.get<ChatMessages>(`/chats/${id}`)
    return response.data
  },

  markAsUnread: async (data: { chatId: string }) => {
    await api.post(`/chats/${data.chatId}/mark-as-unread`)
  },

  updateConversation: async (chatId: string, updateData: {
    clientId?: string
    platformName?: string
    currentIntention?: string
    assistantEnabled?: boolean
    newClientMessagesCount?: number
    status?: ConversationStatusPrimitives
  }) => {
    const response = await api.put(`/chats/${chatId}`, updateData)
    return response.data
  },
}
