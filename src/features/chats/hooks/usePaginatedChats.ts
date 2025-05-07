import { useCallback, useMemo } from 'react'
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'
import { useWebSocket } from '@/hooks/use-web-socket.ts'
import { UserQueryKey } from '@/components/layout/hooks/useGetUser.ts'
import { UserData } from '@/features/auth/types.ts'
import { chatService } from '@/features/chats/ChatService.ts'
import { ChatParams } from '@/features/chats/ChatTypes.ts'

interface UseChatsOptions extends ChatParams {
  initialPerPage?: number
}

export function usePaginatedChats(options: UseChatsOptions = {}) {
  const { initialPerPage } = options
  const queryClient = useQueryClient()
  const { emit } = useWebSocket()
  const queryKey = ['chats', initialPerPage]

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
      })
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      return lastPage?.meta.hasNextPage ? lastPage?.meta.nextPage : undefined
    },
    staleTime: Infinity,
  })

  const chats = useMemo(() => {
    if (!infiniteData?.pages) return []
    return infiniteData.pages.flatMap((page) => page.conversations)
  }, [infiniteData])

  const meta = useMemo(() => {
    if (!infiniteData?.pages.length) return null
    return infiniteData.pages[infiniteData.pages.length - 1].meta
  }, [infiniteData])

  const loadNextPage = useCallback(async () => {
    if (!hasNextPage || isFetchingNextPage) {
      return
    }
    await fetchNextPage()
  }, [fetchNextPage, hasNextPage, isFetchingNextPage])

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

      return { success: true, enabled: data.enabled }
    },
    onSuccess: async (_data, { enabled }) => {
      queryClient.setQueriesData(
        { queryKey: UserQueryKey },
        (cachedUser: UserData | undefined) => {
          if (!cachedUser) return cachedUser
          return {
            ...cachedUser,
            assistantConfig: { ...cachedUser.assistantConfig, enabled },
          }
        }
      )
    },
  })

  return {
    chats,
    isChatsLoading: isLoading,
    isError,
    error,
    toggleAllIaMutation,
    hasNextPage,
    isFetchingNextPage,
    loadNextPage,
    refreshChats,
    meta,
    infiniteData,
  }
}
