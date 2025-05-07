import { useMutation, useQueryClient } from '@tanstack/react-query'
import { sortByLastMessageTimestamp } from '@/lib/utils.ts'
import { chatService } from '../ChatService'
import { Chat, ChatMessages } from '../ChatTypes'

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

  const markAsUnread = (chatId: string) => {
    markAsUnreadMutation.mutate({ chatId })
  }

  return { markAsUnreadMutation, markAsUnread }
}
