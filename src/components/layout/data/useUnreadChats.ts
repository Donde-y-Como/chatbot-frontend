import { useEffect } from 'react'
import {
  InfiniteData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { socket } from '@/hooks/use-web-socket.ts'
import { chatService } from '@/features/chats/ChatService.ts'
import { Chat, ChatResponse } from '@/features/chats/ChatTypes.ts'

export function useUnreadChats() {
  const queryClient = useQueryClient()

  const getCount = useQuery({
    queryKey: ['unreadChats'],
    queryFn: async () => {
      const chats = await chatService.getChatsPaginated()
      return chats.conversations.filter(
        (chat) => chat.newClientMessagesCount > 0
      ).length
    },
  })

  // Escuchar eventos del socket y actualizar el recuento cuando cambie la caché de chats
  useEffect(() => {
    const updateUnreadCount = () => {
      const data = queryClient.getQueryData<InfiniteData<ChatResponse>>([
        'chats',
      ])
      if (data && data.pages) {
        const count = data.pages
          .flatMap((chatResponse) => chatResponse.conversations)
          .reduce((acc, chat) => acc + chat.newClientMessagesCount, 0)

        queryClient.setQueryData(['unreadChats'], count)
      }
    }

    const handleNewMessage = () => {
      setTimeout(() => {
        updateUnreadCount()
      }, 100) // Pequeño retraso para asegurar que la caché de chats se haya actualizado
    }

    socket.on('newClientMessage', handleNewMessage)

    const unsubscribe = queryClient.getQueryCache().subscribe((event) => {
      if (event.query.queryKey[0] === 'chats' && event.type === 'updated') {
        updateUnreadCount()
      }
    })

    return () => {
      socket.off('newClientMessage', handleNewMessage)
      unsubscribe()
    }
  }, [queryClient])

  const updateCount = useMutation({
    mutationFn: async () => {
      const data = queryClient.getQueryData<InfiniteData<ChatResponse>>(['chats'])
      if (data) {
        const count = data.pages
          .flatMap((chatResponse) => chatResponse.conversations)
          .reduce((acc, chat) => acc + chat.newClientMessagesCount, 0)

        return { count }
      }
      return { success: true }
    },
    onSuccess: async (data) => {
      if ('count' in data) {
        queryClient.setQueryData(['unreadChats'], data.count)
      } else {
        await queryClient.invalidateQueries({ queryKey: ['unreadChats'] })
      }
    },
  })

  const incrementCount = () => {
    updateCount.mutate()
  }

  const resetCount = () => {
    queryClient.setQueryData(['unreadChats'], 0)
  }

  return {
    count: getCount.data || 0,
    isLoading: getCount.isLoading,
    incrementCount,
    resetCount,
  }
}
