import { createFileRoute } from '@tanstack/react-router'
import Chats from '@/features/chats'

export type SearchChatParams = {
  chatId?: string
  highlightMessageId?: string
}

export const Route = createFileRoute('/_authenticated/chats/')({  
  validateSearch: (search: Record<string, unknown>): SearchChatParams => ({
    chatId: search.chatId ? String(search.chatId) : undefined,
    highlightMessageId: search.highlightMessageId ? String(search.highlightMessageId) : undefined,
  }),
  component: Chats,
})
