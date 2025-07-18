import { useState } from 'react'
import { AxiosError } from 'axios'
import { QueryCache, QueryClient } from '@tanstack/react-query'
import { createRouter } from '@tanstack/react-router'
import { routeTree } from '@/routeTree.gen.ts'
import { io } from 'socket.io-client'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/authStore.ts'
import { playNotification } from '@/lib/audio.ts'
import { handleServerError } from '@/utils/handle-server-error.ts'
import { ChatMessages, Message } from '@/features/chats/ChatTypes.ts'
import { UserQueryKey } from '../components/layout/hooks/useGetUser'

export const socket = io(import.meta.env.VITE_WS_URL || 'http://localhost:3000')

socket.on(
  'newClientMessage',
  async (data: { conversationId: string; message: Message }) => {
    if (data.message.role === 'user') {
      playNotification()
    }

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

    await queryClient.invalidateQueries({
      queryKey: ['chats'],
    })
  }
)

socket.on('assistantFailed', (data: { conversationId: string }) => {
  toast.error('El asistente tuvo un problema al ejecutar una accion')
})

socket.on('newEventBooked', () => {
  toast.success('Un nuevo evento ha sido reservado.')
})

socket.on('newAppointmentCreated', () => {
  toast.success('Una nueva cita ha sido creada.')
})

socket.on('serverMessage', (data: {error:boolean, message:string}) => {
  console.log(data.message)
})

socket.on('creditsUpdated', async () => {
  await queryClient.refetchQueries({
    queryKey: UserQueryKey,
  })
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
