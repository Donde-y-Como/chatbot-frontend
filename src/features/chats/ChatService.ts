import { api } from '@/api/axiosInstance'
import { Chat, ChatMessages, ChatResponse, ChatParams } from '@/features/chats/ChatTypes.ts'

export const chatService = {
  getChatsPaginated: async (params?: ChatParams): Promise<ChatResponse> => {
    const response = await api.get<ChatResponse>('/chats', { params });
    return response.data
  },

  getChats: async () => {
    const response = await api.get<{ messages: Chat[] }>('/chats')
    return response.data.messages
  },

  getChatById: async (id: string) => {
    const response = await api.get<ChatMessages>(`/chats/${id}`)
    return response.data
  },

  markAsUnread: async (data: { chatId: string }) => {
    await api.post(`/chats/${data.chatId}/mark-as-unread`)
  }
}