import { useMutation, useQueryClient } from '@tanstack/react-query'
import { InfiniteData } from '@tanstack/react-query'
import { sortByLastMessageTimestamp } from '@/lib/utils.ts'
import { chatService } from '../ChatService'
import { Chat, ChatMessages, ChatStatus, ChatResponse } from '../ChatTypes'

export function useChatMutations() {
  const queryClient = useQueryClient()

  const markAsUnreadMutation = useMutation({
    mutationKey: ['mark-as-unread'],
    mutationFn: async (data: { chatId: string }) => {
      await chatService.markAsUnread(data)
    },
    onError: () => {},
    onSettled: (_data, _error, variables) => {
      queryClient.setQueryData<ChatMessages>(
        ['chat', variables.chatId],
        (cachedConversation) => {
          if (cachedConversation === undefined) return cachedConversation
          return {
            ...cachedConversation,
            newClientMessagesCount: 1,
          }
        }
      )

      queryClient.setQueryData<Chat[]>(['chats'], (oldChats) => {
        if (oldChats === undefined) return []
        return [...oldChats]
          .map((cachedChat) => {
            if (cachedChat.id === variables.chatId) {
              return {
                ...cachedChat,
                newClientMessagesCount: 1,
              }
            }
            return cachedChat
          })
          .sort(sortByLastMessageTimestamp)
      })
    },
  })

  const updateStatusMutation = useMutation({
    mutationKey: ['update-chat-status'],
    mutationFn: async ({ chatId, status }: { chatId: string; status: string }) => {
      await chatService.updateConversation(chatId, { status })
    },
    onMutate: async ({ chatId, status }) => {
      // Optimistically update the cache
      queryClient.setQueryData<InfiniteData<ChatResponse>>(
        ['chats'],
        (cachedData) => {
          if (!cachedData) return cachedData

          const updatedPages = cachedData.pages.map((page) => ({
            ...page,
            conversations: page.conversations.map((conv) =>
              conv.id === chatId ? { ...conv, status } : conv
            ),
          }))

          return { ...cachedData, pages: updatedPages }
        }
      )
    },
    onError: (_error, { chatId, status }) => {
      // Revert optimistic update on error
      queryClient.invalidateQueries({ queryKey: ['chats'] })
    },
  })

  const markAsUnread = (chatId: string) => {
    markAsUnreadMutation.mutate({ chatId })
  }

  const updateChatStatus = (chatId: string, status: string) => {
    updateStatusMutation.mutate({ chatId, status })
  }

  return {
    markAsUnreadMutation,
    markAsUnread,
    updateStatusMutation,
    updateChatStatus
  }
}
