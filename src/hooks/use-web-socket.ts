import { useState } from 'react'
import { AxiosError } from 'axios'
import { QueryCache, QueryClient } from '@tanstack/react-query'
import { createRouter } from '@tanstack/react-router'
import { routeTree } from '@/routeTree.gen.ts'
import { io } from 'socket.io-client'
import { useAuthStore } from '@/stores/authStore.ts'
import { handleServerError } from '@/utils/handle-server-error.ts'
import { toast } from 'sonner'
import { Chat, ChatMessages, Message } from '@/features/chats/ChatTypes.ts'
import { makeLastMessageContent } from '@/features/chats/hooks/makeLastMessageContent.ts'
import { playNotification } from '@/lib/audio.ts'

export const socket = io(import.meta.env.VITE_WS_URL || 'http://localhost:3000')

socket.on(
  'newClientMessage',
  async (data: { conversationId: string; message: Message }) => {
    if (data.message.role === 'user') {
      playNotification()
    }

    const chats = queryClient.getQueryData(['chats']) as Chat[] | undefined
    const chat = chats?.find((chat) => chat.id === data.conversationId)

    if (chat === undefined) {
      setTimeout(async () => {
        await queryClient.invalidateQueries({
          queryKey: ['chats'],
        })
      }, 1000)
      return
    }

    queryClient.setQueryData<Chat[]>(['chats'], (cachedChats) => {
      if (cachedChats === undefined) return cachedChats
      return [...cachedChats]
        .map((chat) => {
          if (chat.id === data.conversationId) {
            return {
              ...chat,
              newClientMessagesCount: chat.newClientMessagesCount + 1,
              lastMessage: makeLastMessageContent(data.message),
            }
          }
          return chat
        })
        .sort((a, b) => b.lastMessage.timestamp - a.lastMessage.timestamp)
    })

    queryClient.setQueryData<ChatMessages>(
      ['chat', data.conversationId],
      (cachedChat) => {
        if (cachedChat === undefined) return cachedChat
        return {
          ...cachedChat,
          messages: [...cachedChat.messages, data.message],
        }
      }
    )
  }
)

socket.on("assistantFailed", (data: { conversationId: string }) => {
  toast.error('El asistente tuvo un problema al ejecutar una accion')
})

export const useWebSocket = () => {
  const [isConnected, setIsConnected] = useState(false)

  const sendMessage = (data: { conversationId: string; message: Message }) => {
    socket.emit('newBusinessMessage', data)
  }

  const emit = (event: string, data: unknown) => {
    socket.emit(event, data)
  }

  return { socket, isConnected, setIsConnected, sendMessage, emit }
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        if (import.meta.env.DEV) console.log({ failureCount, error })

        if (failureCount >= 0 && import.meta.env.DEV) return false
        if (failureCount > 3 && import.meta.env.PROD) return false

        return !(
          error instanceof AxiosError &&
          [401, 403].includes(error.response?.status ?? 0)
        )
      },
      staleTime: 10 * 1000, // 10s
    },
    mutations: {
      onError: (error) => {
        handleServerError(error)

        if (error instanceof AxiosError) {
          if (error.response?.status === 304) {
            toast.error('El contenido no se actualizó!')
          }
        }
      },
    },
  },
  queryCache: new QueryCache({
    onError: (error) => {
      if (error instanceof AxiosError) {
        if (error.response?.status === 401 || error.response?.status === 403) {
          useAuthStore.getState().auth.reset()
          void router.navigate({ to: '/iniciar-sesion' })
        }
        if (error.response?.status === 500) {
          toast.error('El contenido no se actualizó!')
          void router.navigate({ to: '/500' })
        }
      }
    },
  }),
})

export const router = createRouter({
  routeTree,
  context: { queryClient },
  defaultPreload: 'intent',
  defaultPreloadStaleTime: 0,
})
