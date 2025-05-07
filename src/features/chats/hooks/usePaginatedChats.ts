import { useCallback, useMemo } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'
import { chatService } from '@/features/chats/ChatService.ts'

export function usePaginatedChats() {
  const queryKey = ['chats']

  const {
    data: infiniteData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isPending,
    refetch,
    isError,
    error,
  } = useInfiniteQuery({
    queryKey,
    queryFn: async ({ pageParam = 1 }) => {
      return await chatService.getChatsPaginated({
        pageNumber: pageParam,
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

  return {
    chats,
    isChatsLoading: isPending,
    isError,
    error,
    hasNextPage,
    isFetchingNextPage,
    loadNextPage,
    refreshChats,
    meta,
    infiniteData,
  }
}
