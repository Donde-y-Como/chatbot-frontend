import { ChatMessages, Message } from '@/features/chats/ChatTypes.ts'
import { playNotification } from '@/lib/audio.ts'
import { routeTree } from '@/routeTree.gen.ts'
import { useAuthStore } from '@/stores/authStore.ts'
import { handleServerError } from '@/utils/handle-server-error.ts'
import { QueryCache, QueryClient } from '@tanstack/react-query'
import { createRouter } from '@tanstack/react-router'
import { AxiosError } from 'axios'
import { useState, useEffect } from 'react'
import { io } from 'socket.io-client'
import { toast } from 'sonner'
import { UserQueryKey } from '../components/layout/hooks/useGetUser'
import { UseGetAppointmentsQueryKey } from '../features/appointments/hooks/useGetAppointments'
import { AppointmentCreated } from '../features/appointments/types'

export const socket = io(import.meta.env.VITE_WS_URL || 'http://localhost:3000', {
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  timeout: 20000,
})

/**
 * Normalizes message data from backend to match frontend Message type
 * Ensures media field is always present (null if not provided)
 */
const normalizeMessage = (message: any): Message => {
  return {
    id: message.id,
    content: message.content,
    role: message.role,
    timestamp: message.timestamp,
    media: message.media ?? null, // Convert undefined to null
  }
}

socket.on(
  'newClientMessage',
  async (data: { conversationId: string; message: any }) => {
    const normalizedMessage = normalizeMessage(data.message)

    console.log('[WebSocket] Received new message:', {
      conversationId: data.conversationId,
      messageId: normalizedMessage.id,
      role: normalizedMessage.role,
      hasMedia: !!normalizedMessage.media,
    })

    if (normalizedMessage.role === 'user') {
      playNotification()
    }

    queryClient.setQueryData<ChatMessages>(
      ['chat', data.conversationId],
      (cachedChat) => {
        if (cachedChat === undefined) {
          console.warn('[WebSocket] No cached chat found for conversation:', data.conversationId)
          return cachedChat
        }
        return {
          ...cachedChat,
          messages: [...cachedChat.messages, normalizedMessage],
        }
      }
    )

    await queryClient.invalidateQueries({
      queryKey: ['chats'],
    })
  }
)

socket.on('messageUpdated', async (data: { conversationId: string; message: any }) => {
  const normalizedMessage = normalizeMessage(data.message)

  console.log('[WebSocket] Message updated:', {
    conversationId: data.conversationId,
    messageId: normalizedMessage.id,
  })

  queryClient.setQueryData<ChatMessages>(
    ['chat', data.conversationId],
    (cachedChat) => {
      if (cachedChat === undefined) {
        console.warn('[WebSocket] No cached chat found for conversation:', data.conversationId)
        return cachedChat
      }
      return {
        ...cachedChat,
        messages: cachedChat.messages.map((msg) =>
          msg.id === normalizedMessage.id ? normalizedMessage : msg
        ),
      }
    }
  )

  await queryClient.invalidateQueries({
    queryKey: ['chats'],
  })
})

socket.on('assistantStatusChange', (data: { conversationId: string; enabled: boolean }) => {
  console.log('[WebSocket] Assistant status changed:', data)

  queryClient.setQueryData<ChatMessages>(
    ['chat', data.conversationId],
    (cachedChat) => {
      if (cachedChat === undefined) return cachedChat
      return {
        ...cachedChat,
        assistantEnabled: data.enabled,
      }
    }
  )
})

socket.on('assistantFailed', (data: { conversationId: string }) => {
  toast.error('El asistente tuvo un problema al ejecutar una accion')
})

socket.on('newEventBooked', () => {
  toast.success('Un nuevo evento ha sido reservado.')
})

// Appointment Created
socket.on('appointmentCreated', async ({ appointment }: { appointment: AppointmentCreated }) => {
  console.log('[WebSocket] Appointment created:', appointment)
  toast.success('Una nueva cita ha sido creada.')
  await queryClient.invalidateQueries({
    queryKey: [UseGetAppointmentsQueryKey, appointment.date, appointment.date],
  })
  await queryClient.invalidateQueries({
    queryKey: [UseGetAppointmentsQueryKey],
  })
})

// Appointment Updated
socket.on('appointmentUpdated', async ({ appointment }: { appointment: AppointmentCreated }) => {
  console.log('[WebSocket] Appointment updated:', appointment)
  toast.info('Una cita ha sido actualizada.')
  await queryClient.invalidateQueries({
    queryKey: [UseGetAppointmentsQueryKey, appointment.date, appointment.date],
  })
  await queryClient.invalidateQueries({
    queryKey: [UseGetAppointmentsQueryKey],
  })
})

// Appointment Canceled
socket.on('appointmentCanceled', async ({ appointment }: { appointment: AppointmentCreated }) => {
  console.log('[WebSocket] Appointment canceled:', appointment)
  toast.warning('Una cita ha sido cancelada.')
  await queryClient.invalidateQueries({
    queryKey: [UseGetAppointmentsQueryKey, appointment.date, appointment.date],
  })
  await queryClient.invalidateQueries({
    queryKey: [UseGetAppointmentsQueryKey],
  })
})

socket.on('serverMessage', (data: { error: boolean, message: string }) => {
  console.log(data.message)
})

socket.on('creditsUpdated', async () => {
  await queryClient.refetchQueries({
    queryKey: UserQueryKey,
  })
})

socket.on('productStockUpdated', () => {
})

// Connection status handlers
socket.on('connect', () => {
  console.log('[WebSocket] Connected successfully')
})

socket.on('disconnect', (reason) => {
  console.log('[WebSocket] Disconnected:', reason)
  if (reason === 'io server disconnect') {
    // Server forcefully disconnected, manually reconnect
    socket.connect()
  }
})

socket.on('connect_error', (error) => {
  console.error('[WebSocket] Connection error:', error)
})

socket.on('reconnect', (attemptNumber) => {
  console.log('[WebSocket] Reconnected after', attemptNumber, 'attempts')
  // Re-join business room after reconnection
  const auth = useAuthStore.getState().auth
  if (auth.user?.businessId) {
    socket.emit('joinBusinessRoom', auth.user.businessId)
  }
})

socket.on('reconnect_failed', () => {
  console.error('[WebSocket] Failed to reconnect after all attempts')
  toast.error('No se pudo establecer conexión con el servidor en tiempo real')
})

export const useWebSocket = () => {
  const [isConnected, setIsConnected] = useState(socket.connected)
  const [reconnecting, setReconnecting] = useState(false)

  useEffect(() => {
    const handleConnect = () => {
      setIsConnected(true)
      setReconnecting(false)
    }

    const handleDisconnect = () => {
      setIsConnected(false)
    }

    const handleReconnecting = () => {
      setReconnecting(true)
    }

    const handleReconnectFailed = () => {
      setReconnecting(false)
    }

    // Attach local handlers
    socket.on('connect', handleConnect)
    socket.on('disconnect', handleDisconnect)
    socket.on('reconnect_attempt', handleReconnecting)
    socket.on('reconnect_failed', handleReconnectFailed)

    // Set initial state
    setIsConnected(socket.connected)

    // Cleanup on unmount
    return () => {
      socket.off('connect', handleConnect)
      socket.off('disconnect', handleDisconnect)
      socket.off('reconnect_attempt', handleReconnecting)
      socket.off('reconnect_failed', handleReconnectFailed)
    }
  }, [])

  const sendMessage = (data: { conversationId: string; message: Message }) => {
    if (!socket.connected) {
      toast.error('No hay conexión con el servidor')
      return
    }
    socket.emit('newBusinessMessage', data)
  }

  const emit = (event: string, data: unknown) => {
    if (!socket.connected) {
      console.warn('[WebSocket] Cannot emit, socket not connected')
      return
    }
    socket.emit(event, data)
  }

  return { socket, isConnected, reconnecting, setIsConnected, sendMessage, emit }
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
