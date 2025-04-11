import { useMutation, useQuery, useQueryClient, useInfiniteQuery } from '@tanstack/react-query'
import { useWebSocket } from '@/hooks/use-web-socket.ts'
import { chatService } from '@/features/chats/ChatService.ts'
import { Chat, ChatMessages, ChatParams } from '@/features/chats/ChatTypes.ts'
import { useCallback, useMemo } from 'react'

interface UseChatsOptions extends ChatParams {
  initialPerPage?: number;
}

export function usePaginatedChats(options: UseChatsOptions = {}) {
  const {
    initialPerPage = 10,
    platformName,
    clientName
  } = options

  const queryClient = useQueryClient()
  const { emit } = useWebSocket()

  // Para mantener compatibilidad con código existente - sigue usando la misma queryKey
  const {
    data: infiniteData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    refetch
  } = useInfiniteQuery({
    queryKey: ['chats', { platformName, clientName, perPage: initialPerPage }],
    queryFn: async ({ pageParam = 1 }) => {
      return await chatService.getChatsPaginated({
        pageNumber: pageParam,
        perPage: initialPerPage,
        platformName,
        clientName
      })
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      return lastPage.meta.hasNextPage ? lastPage.meta.nextPage : undefined
    },
    // Mantener en caché por 5 minutos
    gcTime: 5 * 60 * 1000,
    // Considerar frescos los datos por 30 segundos
    staleTime: 30 * 1000
  })

  // Para compatibilidad con el código existente
  const chats = useMemo(() => {
    if (!infiniteData?.pages) return []
    return infiniteData.pages.flatMap(page => page.messages)
  }, [infiniteData])

  // La metadata de la última página para saber el total, etc.
  const meta = useMemo(() => {
    if (!infiniteData?.pages.length) return null
    return infiniteData.pages[infiniteData.pages.length - 1].meta
  }, [infiniteData])

  // Para mantener compatibilidad con el código existente
  const { data: originalChatsData } = useQuery({
    queryKey: ['chats'],
    queryFn: () => chatService.getChatsPaginated({}),
    staleTime: Infinity,
    // No ejecutamos esta consulta realmente, solo mantenemos la estructura
    enabled: false,
  })

  // Registramos los datos paginados bajo la misma clave para compatibilidad
  useMemo(() => {
    if (chats.length > 0) {
      queryClient.setQueryData(['chats'], chats)
    }
  }, [chats, queryClient])

  // Función para cargar la siguiente página
  const loadNextPage = useCallback(async () => {
    if (!hasNextPage || isFetchingNextPage) {
      return
    }
    await fetchNextPage()
  }, [fetchNextPage, hasNextPage, isFetchingNextPage])

  // Función para refrescar los chats
  const refreshChats = useCallback(async () => {
    await refetch()
  }, [refetch])

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
    // Valores originales para compatibilidad
    chats,
    isChatsLoading: isLoading,
    toggleAllIaMutation,

    // Nuevos valores para paginación
    hasNextPage,
    isFetchingNextPage,
    loadNextPage,
    refreshChats,
    meta,

    // Los datos completos por si se necesitan
    infiniteData
  }
}