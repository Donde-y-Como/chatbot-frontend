import { useState } from 'react'
import { AxiosError } from 'axios'
import { QueryCache, QueryClient } from '@tanstack/react-query'
import { createRouter } from '@tanstack/react-router'
import { routeTree } from '@/routeTree.gen.ts'
import { io } from 'socket.io-client'
import { useAuthStore } from '@/stores/authStore.ts'
import { handleServerError } from '@/utils/handle-server-error.ts'
import { toast } from '@/hooks/use-toast.ts'
import { Chat, ChatMessages, Message } from '@/features/chats/ChatTypes.ts'

export const socket = io(import.meta.env.VITE_WS_URL || 'http://localhost:3000')
const notification = new Audio('/notification.mp3')

function playNotification() {
  notification.currentTime = 0
  notification.play().catch(() => {})
}

socket.on(
  'newClientMessage',
  (data: { conversationId: string; message: Message }) => {
    if (data.message.role === 'user') {
      playNotification()
    }

    queryClient.setQueryData<Chat[]>(['chats'], (cachedChats) => {
      if (cachedChats === undefined) return cachedChats
      return [...cachedChats]
        .map((chat) => {
          if (chat.id === data.conversationId) {
            return {
              ...chat,
              newClientMessagesCount: chat.newClientMessagesCount + 1,
              lastMessage: data.message,
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
      refetchOnWindowFocus: import.meta.env.PROD,
      staleTime: 10 * 1000, // 10s
    },
    mutations: {
      onError: (error) => {
        handleServerError(error)

        if (error instanceof AxiosError) {
          if (error.response?.status === 304) {
            toast({
              variant: 'destructive',
              title: 'El contenido no se actualizó!',
            })
          }
        }
      },
    },
  },
  queryCache: new QueryCache({
    onError: (error) => {
      if (error instanceof AxiosError) {
        if (error.response?.status === 401) {
          useAuthStore.getState().auth.reset()
          void router.navigate({ to: '/iniciar-sesion' })
        }
        if (error.response?.status === 500) {
          toast({
            variant: 'destructive',
            title: 'El servidor tuvo un problema!',
          })
          void router.navigate({ to: '/500' })
        }
        if (error.response?.status === 403) {
          void router.navigate({ to: '/403' })
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
