import { Fragment, useState, useEffect, useRef, useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { SearchChatParams } from '@/routes/_authenticated/chats'
import { useAuth } from '@/stores/authStore.ts'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { ChatBarHeader } from '@/features/chats/ChatBarHeader.tsx'
import { ChatListItem } from '@/features/chats/ChatListItem.tsx'
import { Chat } from '@/features/chats/ChatTypes'
import { useFilteredChats } from '@/features/chats/hooks/useFilteredChats.ts'
import { useGetTags } from '../clients/hooks/useGetTags'
import { MessagesFound } from './MessagesFound'
import { usePaginatedChats } from './hooks/usePaginatedChats'

interface ChatBarProps {
  selectedChatId: string | null
  setSelectedChatId: (id: string) => void
  setMobileSelectedChatId: (id: string) => void
  navigate: (params: {
    search: (prev: SearchChatParams) => SearchChatParams
    replace: boolean
  }) => void
}

export function ChatBarUnlimited({
  selectedChatId,
  setSelectedChatId,
  setMobileSelectedChatId,
  navigate,
}: ChatBarProps) {
  const [search, setSearch] = useState('')
  const [activeFilter, setActiveFilter] = useState<string | null>(null)
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const [reachedEnd, setReachedEnd] = useState(false)
  const observerRef = useRef<IntersectionObserver | null>(null)
  const loadingRef = useRef<HTMLDivElement>(null)
  
  // Use the paginated chats hook with reasonable initial page size
  const { 
    chats, 
    isChatsLoading, 
    toggleAllIaMutation, 
    hasNextPage, 
    isFetchingNextPage, 
    loadNextPage, 
    refreshChats 
  } = usePaginatedChats({
    initialPerPage: 1 // Load a reasonable number of chats initially
  })

  const { data: tags } = useGetTags()
  const filteredChatList = useFilteredChats(chats, search, activeFilter, tags)

  // Load more chats when approaching the bottom of the list
  const handleIntersection = useCallback((entries: IntersectionObserverEntry[]) => {
    const [entry] = entries
    if (entry.isIntersecting && hasNextPage && !isFetchingNextPage && !reachedEnd) {
      loadNextPage()
    }
  }, [hasNextPage, isFetchingNextPage, loadNextPage, reachedEnd])

  // Set up intersection observer for infinite scroll
  useEffect(() => {
    if (!loadingRef.current) return
    
    // Disconnect any existing observer
    if (observerRef.current) {
      observerRef.current.disconnect()
    }
    
    // Create new observer with 100px rootMargin to start loading before user reaches bottom
    observerRef.current = new IntersectionObserver(handleIntersection, {
      rootMargin: '100px',
    })
    
    observerRef.current.observe(loadingRef.current)
    
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [handleIntersection, filteredChatList.length])
  
  // Handle manual scroll events as a fallback for older browsers
  useEffect(() => {
    const scrollArea = scrollAreaRef.current
    if (!scrollArea) return

    const handleScroll = (e: Event) => {
      const target = e.target as HTMLDivElement
      const scrollContainer = target.querySelector('[data-radix-scroll-area-viewport]')
      
      if (!scrollContainer) return
      
      // Calculate when we're near the bottom (within 150px)
      const isNearBottom = 
        scrollContainer.scrollHeight - scrollContainer.scrollTop - scrollContainer.clientHeight < 150
      
      if (isNearBottom && hasNextPage && !isFetchingNextPage && !reachedEnd) {
        loadNextPage()
      }
      
      // Set a flag when we've reached the end to avoid multiple requests
      if (!hasNextPage && !reachedEnd) {
        setReachedEnd(true)
      }
    }

    scrollArea.addEventListener('scroll', handleScroll, { capture: true, passive: true })
    
    return () => {
      scrollArea.removeEventListener('scroll', handleScroll, { capture: true })
    }
  }, [hasNextPage, isFetchingNextPage, loadNextPage, reachedEnd])
  
  // Reset the reachedEnd flag when filters change to allow loading more results
  useEffect(() => {
    setReachedEnd(false)
  }, [search, activeFilter])

  // Callback for selecting a chat
  const handleSelectChat = useCallback((chatId: string, messageId?: string) => {
    setSelectedChatId(chatId)
    setMobileSelectedChatId(chatId)

    queryClient.setQueryData<Chat[]>(['chats'], (cachedChats) => {
      if (!cachedChats) return cachedChats
      return cachedChats.map((chat) => ({
        ...chat,
        newClientMessagesCount:
          chat.id === chatId ? 0 : chat.newClientMessagesCount,
      }))
    })

    navigate({
      search: (prev: SearchChatParams) => ({ 
        ...prev, 
        chatId,
        highlightMessageId: messageId || undefined
      }),
      replace: true,
    })
  }, [setSelectedChatId, setMobileSelectedChatId, queryClient, navigate])

  // Callback for toggling AI for all chats
  const onToggleAllAI = useCallback((enabled: boolean) => {
    if (user) toggleAllIaMutation.mutate({ enabled, userId: user.id })
  }, [user, toggleAllIaMutation])

  // Function to handle manual refresh
  const handleRefresh = useCallback(() => {
    refreshChats()
    setReachedEnd(false)
  }, [refreshChats])

  return (
    <div className='flex w-full flex-col gap-2 sm:w-[30rem]'>
      <ChatBarHeader
        value={search}
        onInputChange={setSearch}
        onFilterChange={setActiveFilter}
        onToggleAllAI={onToggleAllAI}
        onRefresh={handleRefresh}
      />

      <MessagesFound 
        search={search} 
        onMessageClick={(chatId, messageId) => handleSelectChat(chatId, messageId)} 
      />

      <ScrollArea className='h-full pl-2 pr-3' ref={scrollAreaRef}>
        {isChatsLoading ? (
          // Loading skeletons
          Array.from({ length: 5 }).map((_, index) => (
            <Fragment key={`loading-${index}`}>
              <Skeleton className='h-16 w-full rounded-md' />
              <Separator className='my-1' />
            </Fragment>
          ))
        ) : filteredChatList.length > 0 ? (
          // Chat list
          <>
            {filteredChatList.map((chat) => (
              <Fragment key={chat.id}>
                <ChatListItem
                  chat={chat}
                  isSelected={selectedChatId === chat.id}
                  onClick={() => handleSelectChat(chat.id)}
                />
                <Separator className='my-1' />
              </Fragment>
            ))}
          </>
        ) : (
          // No results message
          <div className="py-4 text-center text-sm text-muted-foreground">
            {search || activeFilter ? 'No se encontraron chats' : 'No hay chats disponibles'}
          </div>
        )}
        
        {/* Loading indicator at the bottom - this acts as our intersection target */}
        <div ref={loadingRef}>
          {isFetchingNextPage && (
            <div className="py-2">
              <Skeleton className='h-16 w-full rounded-md' />
              <Separator className='my-1' />
              <Skeleton className='h-16 w-full rounded-md' />
            </div>
          )}
        </div>
        
        {/* End of results message */}
        {!hasNextPage && chats.length > 0 && !isChatsLoading && (
          <div className="py-4 text-center text-sm text-muted-foreground">
            No hay más chats para cargar
          </div>
        )}
      </ScrollArea>
    </div>
  )
}