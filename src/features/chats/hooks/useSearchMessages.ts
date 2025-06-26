import { useCallback, useMemo } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'
import { api } from '@/api/axiosInstance'
import { Media } from '@/features/chats/ChatTypes.ts'

interface MessageResponse {
  conversationId: string
  message: {
    id: string
    content: string
    role: 'user' | 'assistant' | 'business'
    timestamp: number
    media?: Media
  }
  clientName?: string
  clientPhoto?: string
  clientId?: string
  platformName?: string
}

interface SearchMessagesResponse {
  messages: MessageResponse[]
  totalCount: number
  hasMore: boolean
  limit: number
  offset: number
}

interface UseSearchMessagesParams {
  query: string
  enabled?: boolean
  limit?: number
}

export function useSearchMessages({
  query,
  enabled = true,
  limit = 20,
}: UseSearchMessagesParams) {
  const queryKey = ['search-messages', query] as const

  const {
    data: infiniteData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isPending,
    isError,
    error,
    refetch,
  } = useInfiniteQuery({
    queryKey,
    queryFn: async ({ pageParam = 0 }) => {
      const params = new URLSearchParams({
        query,
        limit: limit.toString(),
        offset: pageParam.toString(),
      })

      const response = await api.get<SearchMessagesResponse>(
        `/chats-search?${params}`
      )
      return response.data
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage.hasMore) return undefined
      return allPages.reduce((acc, page) => acc + page.messages.length, 0)
    },
    enabled: enabled && query.trim().length >= 2,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  })

  const messages = useMemo(() => {
    if (!infiniteData?.pages) return []

    // Flatten all pages and remove duplicates by message ID
    const uniqueMessagesMap = new Map()

    infiniteData.pages.forEach((page) => {
      page.messages.forEach((messageItem) => {
        const key = `${messageItem.conversationId}-${messageItem.message.id}`
        uniqueMessagesMap.set(key, messageItem)
      })
    })

    return Array.from(uniqueMessagesMap.values())
  }, [infiniteData])

  const totalCount = useMemo(() => {
    if (!infiniteData?.pages.length) return 0
    return infiniteData.pages[0].totalCount
  }, [infiniteData])

  const loadMore = useCallback(async () => {
    if (!hasNextPage || isFetchingNextPage) return
    await fetchNextPage()
  }, [fetchNextPage, hasNextPage, isFetchingNextPage])

  const refresh = useCallback(async () => {
    await refetch()
  }, [refetch])

  return {
    messages,
    totalCount,
    isLoading: isPending,
    isError,
    error,
    hasNextPage,
    isFetchingNextPage,
    loadMore,
    refresh,
    isEmpty: !isPending && messages.length === 0,
  }
}