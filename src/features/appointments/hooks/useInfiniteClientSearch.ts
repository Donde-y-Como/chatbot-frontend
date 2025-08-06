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
  const initializedRef = useRef<boolean>(false)
  const clientSearchService = useMemo(() => ClientSearchService.getInstance(), [])

  // Initialize with default clients when first loaded
  useEffect(() => {
    if (!clients || initializedRef.current) return

    initializedRef.current = true
    const searchQueryTrimmed = searchQuery.trim()
    currentSearchRef.current = searchQueryTrimmed
    
    const initialResult = clientSearchService.searchClients(clients, searchQueryTrimmed, {
      maxResults,
      defaultResults,
      excludeClientId: selectedClientId,
      offset: 0,
      limit: searchQueryTrimmed ? pageSize : defaultResults
    })

    setAllLoadedClients(initialResult.clients)
    setHasMore(initialResult.hasMore)
    setTotalCount(initialResult.totalCount)
    setIsDefaultList(initialResult.isDefaultList)
    setIsLoadingMore(false)
  }, [clients])

  // Reset when search query changes
  useEffect(() => {
    if (!clients || !initializedRef.current) return

    const searchQueryTrimmed = searchQuery.trim()
    
    // Only reset when search query actually changes
    if (currentSearchRef.current !== searchQueryTrimmed) {
      currentSearchRef.current = searchQueryTrimmed
      
      const initialResult = clientSearchService.searchClients(clients, searchQueryTrimmed, {
        maxResults,
        defaultResults,
        excludeClientId: selectedClientId,
        offset: 0,
        limit: searchQueryTrimmed ? pageSize : defaultResults
      })

      setAllLoadedClients(initialResult.clients)
      setHasMore(initialResult.hasMore)
      setTotalCount(initialResult.totalCount)
      setIsDefaultList(initialResult.isDefaultList)
      setIsLoadingMore(false)
    }
  }, [searchQuery, selectedClientId, clientSearchService, defaultResults, maxResults, pageSize])

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
    initializedRef.current = false
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