import { api } from '@/api/axiosInstance'
import {
  Chat,
  ChatMessages,
  ChatResponse,
  ChatParams,
} from '@/features/chats/ChatTypes.ts'

export const chatService = {
  getChatsPaginated: async (params?: ChatParams): Promise<ChatResponse> => {
    const newParams = { ...params, perPage: 5 }
    const response = await api.get<ChatResponse>('/chats', {
      params: newParams,
    })
    return response.data
  },

  getChats: async () => {
    const response = await api.get<{ conversations: Chat[] }>('/chats')
    return response.data.conversations
  },

  getChatById: async (id: string) => {
    const response = await api.get<ChatMessages>(`/chats/${id}`)
    return response.data
  },

  markAsUnread: async (data: { chatId: string }) => {
    await api.post(`/chats/${data.chatId}/mark-as-unread`)
  },
}
