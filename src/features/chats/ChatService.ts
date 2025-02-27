import { api } from '@/api/axiosInstance'
import { Chat, ChatMessages } from '@/features/chats/ChatTypes.ts'

export const chatService = {
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
