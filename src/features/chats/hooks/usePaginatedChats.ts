import { useCallback, useEffect, useMemo } from 'react'
import {
  useMutation,
  useQueryClient,
  useInfiniteQuery,
} from '@tanstack/react-query'
import { useWebSocket } from '@/hooks/use-web-socket.ts'
import { chatService } from '@/features/chats/ChatService.ts'
import { Chat, ChatMessages, ChatParams } from '@/features/chats/ChatTypes.ts'

interface UseChatsOptions extends ChatParams {
  initialPerPage?: number
}

export function usePaginatedChats(options: UseChatsOptions = {}) {
  const { initialPerPage = 10, platformName, clientName } = options

  const queryClient = useQueryClient()
  const { emit } = useWebSocket()

  // Use a single query key for the infinite query
  const queryKey = ['chats', { platformName, clientName }]

  const {
    data: infiniteData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    refetch,
    isError,
    error,
  } = useInfiniteQuery({
    queryKey,
    queryFn: async ({ pageParam = 1 }) => {
      return await chatService.getChatsPaginated({
        pageNumber: pageParam,
        perPage: initialPerPage,
        platformName,
        clientName,
      })
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      return lastPage.meta.hasNextPage ? lastPage.meta.nextPage : undefined
    },
    // Cache for 5 minutes
    gcTime: 5 * 60 * 1000,
    // Stale after 60 seconds
    staleTime: 60 * 1000,
  })

  // Flatten the pages into a single array of chats
  const chats = useMemo(() => {
    if (!infiniteData?.pages) return []
    return infiniteData.pages.flatMap((page) => page.messages)
  }, [infiniteData])

  // Get metadata from the latest page
  const meta = useMemo(() => {
    if (!infiniteData?.pages.length) return null
    return infiniteData.pages[infiniteData.pages.length - 1].meta
  }, [infiniteData])

  // Load next page of data with debounce protection
  const loadNextPage = useCallback(async () => {
    if (!hasNextPage || isFetchingNextPage) {
      return
    }
    await fetchNextPage()
  }, [fetchNextPage, hasNextPage, isFetchingNextPage])

  // Refresh chats from the beginning
  const refreshChats = useCallback(async () => {
    await refetch()
  }, [refetch])

  // Toggle AI assistants for all chats
  const toggleAllIaMutation = useMutation({
    mutationKey: ['all-ia-toggle'],
    async mutationFn(data: { enabled: boolean; userId: string }) {
      emit(
        data.enabled ? 'enableAllAssistants' : 'disableAllAssistants',
        data.userId
      )

      return { success: true, enabled: data.enabled }
    },
    onSuccess: async (_data, { enabled }) => {
      // Update the chat data in cache
      queryClient.setQueriesData(
        { queryKey: ['chat'] },
        (oldData: ChatMessages | undefined) => {
          if (!oldData) return oldData
          return {
            ...oldData,
            thread: { ...oldData.thread, enabled },
          }
        }
      )
    },
  })

  return {
    // Core data
    chats,
    isChatsLoading: isLoading,
    isError,
    error,
    toggleAllIaMutation,

    // Pagination controls
    hasNextPage,
    isFetchingNextPage,
    loadNextPage,
    refreshChats,
    meta,

    // Raw data access if needed
    infiniteData,
  }
}
