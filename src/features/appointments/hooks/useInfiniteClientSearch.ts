import { useState, useCallback, useMemo, useRef, useEffect } from 'react'
import { type Client } from '@/features/clients/types'
import { ClientSearchService } from '../services/ClientSearchService'

interface UseInfiniteClientSearchOptions {
  clients: Client[] | undefined
  searchQuery: string
  selectedClientId?: string
  defaultResults: number
  maxResults: number
  pageSize: number
}

export function useInfiniteClientSearch({
  clients,
  searchQuery,
  selectedClientId,
  defaultResults,
  maxResults,
  pageSize
}: UseInfiniteClientSearchOptions) {
  const [allLoadedClients, setAllLoadedClients] = useState<Client[]>([])
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [totalCount, setTotalCount] = useState(0)
  const [isDefaultList, setIsDefaultList] = useState(false)
  
  const currentSearchRef = useRef<string>('')
  const clientSearchService = useMemo(() => ClientSearchService.getInstance(), [])

  // Reset when search query or clients change
  useEffect(() => {
    if (!clients) return

    const searchQueryTrimmed = searchQuery.trim()
    
    // Always load initial results when clients change or search query changes
    if (currentSearchRef.current !== searchQueryTrimmed || allLoadedClients.length === 0) {
      currentSearchRef.current = searchQueryTrimmed
      
      const initialResult = clientSearchService.searchClients(clients, searchQueryTrimmed, {
        maxResults,
        defaultResults,
        excludeClientId: selectedClientId,
        offset: 0,
        limit: searchQueryTrimmed ? pageSize : defaultResults // Use defaultResults for initial load when no search
      })

      setAllLoadedClients(initialResult.clients)
      setHasMore(initialResult.hasMore)
      setTotalCount(initialResult.totalCount)
      setIsDefaultList(initialResult.isDefaultList)
      setIsLoadingMore(false)
    }
  }, [clients, searchQuery, selectedClientId, clientSearchService, defaultResults, maxResults, pageSize, allLoadedClients.length])

  const loadMore = useCallback(async () => {
    if (!clients || isLoadingMore || !hasMore) return

    setIsLoadingMore(true)

    // Simulate small delay for better UX
    await new Promise(resolve => setTimeout(resolve, 200))

    try {
      const currentOffset = allLoadedClients.length
      const result = clientSearchService.searchClients(clients, currentSearchRef.current, {
        maxResults,
        defaultResults,
        excludeClientId: selectedClientId,
        offset: currentOffset,
        limit: pageSize
      })

      setAllLoadedClients(prev => [...prev, ...result.clients])
      setHasMore(result.hasMore)
    } catch (error) {
      console.error('Error loading more clients:', error)
    } finally {
      setIsLoadingMore(false)
    }
  }, [clients, allLoadedClients.length, isLoadingMore, hasMore, selectedClientId, clientSearchService, maxResults, defaultResults, pageSize])

  // Reset function for external use
  const reset = useCallback(() => {
    currentSearchRef.current = ''
    setAllLoadedClients([])
    setIsLoadingMore(false)
    setHasMore(true)
    setTotalCount(0)
    setIsDefaultList(false)
  }, [])

  return {
    clients: allLoadedClients,
    loadMore,
    isLoadingMore,
    hasMore,
    totalCount,
    isDefaultList,
    reset
  }
}