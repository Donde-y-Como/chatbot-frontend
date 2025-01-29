import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useWebSocket } from '@/hooks/use-web-socket.ts'
import { chatService } from '@/features/chats/ChatService.ts'
import { Chat, ChatMessages } from '@/features/chats/ChatTypes.ts'

export function useChats() {
  const queryClient = useQueryClient()
  const { emit } = useWebSocket()

  const { data: chats, isLoading: isChatsLoading } = useQuery({
    queryKey: ['chats'],
    queryFn: () => chatService.getChats(),
    staleTime: Infinity,
  })

  const toggleAllIaMutation = useMutation({
    mutationKey: ['all-ia-toggle'],
    async mutationFn(data: { enabled: boolean; userId: string }) {
      emit(
        data.enabled ? 'enableAllAssistants' : 'disableAllAssistants',
        data.userId
      )
    },
    onSuccess: async (_data, { enabled }) => {
      const previousChats = queryClient.getQueryData<Chat[]>(['chats'])

      if (!previousChats) return

      previousChats.forEach((chat) => {
        queryClient.setQueryData(['chat', chat.id], (oldChat: ChatMessages) =>
          oldChat
            ? { ...oldChat, thread: { ...oldChat.thread, enabled } }
            : oldChat
        )
      })

    },
  })

  return {
    chats,
    isChatsLoading,
    toggleAllIaMutation,
  }
}
