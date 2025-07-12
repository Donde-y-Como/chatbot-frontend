import { Fragment, useCallback, useEffect, useRef, useState } from 'react'
import { SearchChatParams } from '@/routes/_authenticated/chats'
import { Loader2 } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { useGetUser } from '@/components/layout/hooks/useGetUser.ts'
import { ChatBarHeader } from '@/features/chats/ChatBarHeader.tsx'
import { ChatListItem } from '@/features/chats/ChatListItem.tsx'
import { ChatListItemSkeleton } from '@/features/chats/ChatListItemSkeleton.tsx'
import { useFilteredChats } from '@/features/chats/hooks/useFilteredChats.ts'
import { useToggleAllAIMutation } from '@/features/chats/hooks/useToggleAllAIMutation.ts'
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
  const { data: user } = useGetUser()
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const loadingRef = useRef<HTMLDivElement>(null)
  const toggleAllIaMutation = useToggleAllAIMutation()

  const {
    chats,
    isChatsLoading,
    hasNextPage,
    isFetchingNextPage,
    loadNextPage,
    refreshChats,
    isError,
  } = usePaginatedChats()

  const { data: tags } = useGetTags()
  const filteredChatList = useFilteredChats(chats, search, activeFilter, tags)

  const handleIntersection = useCallback(
    async (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries
      if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
        await loadNextPage()
      }
    },
    [hasNextPage, isFetchingNextPage, loadNextPage]
  )

  useEffect(() => {
    if (!loadingRef.current) return

    const observer = new IntersectionObserver(handleIntersection, {
      rootMargin: '200px', // Load earlier when scrolling
      threshold: 0.1,
    })

    observer.observe(loadingRef.current)

    return () => observer.disconnect()
  }, [handleIntersection])

  const handleSelectChat = (chatId: string, messageId?: string) => {
    setSelectedChatId(chatId)
    setMobileSelectedChatId(chatId)

    navigate({
      search: (prev: SearchChatParams) => ({
        ...prev,
        chatId,
        highlightMessageId: messageId || undefined,
      }),
      replace: true,
    })
  }

  const onToggleAllAI = useCallback(
    (enabled: boolean) => {
      if (user) toggleAllIaMutation.mutate({ enabled, userId: user.id })
    },
    [user, toggleAllIaMutation]
  )

  const handleRefresh = useCallback(async () => {
    await refreshChats()
  }, [refreshChats])

  return (
    <div className='flex w-full flex-col h-full sm:w-[30rem]'>
      {/* Header - Fixed at top */}
      {user && (
        <div className='flex-shrink-0 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
          <ChatBarHeader
            value={search}
            AIEnabled={user.assistantConfig?.enabled}
            onInputChange={setSearch}
            onFilterChange={setActiveFilter}
            onToggleAllAI={onToggleAllAI}
            onRefresh={handleRefresh}
          />
        </div>
      )}

      {/* Main Content Area - Flexible */}
      <div className='flex flex-col flex-1 min-h-0 overflow-hidden'>
        {/* Chats List - Takes remaining space */}
        <div className='flex-1 overflow-hidden'>
          <ScrollArea className='h-full pl-2 pr-3' ref={scrollAreaRef}>
            <div className='py-2'>
              {isError ? (
                <div className='py-4 text-center text-sm text-red-500'>
                  Error al cargar los chats. Intente refrescar.
                </div>
              ) : isChatsLoading ? (
                <div className='space-y-1'>
                  {Array.from({ length: 7 }).map((_, index) => (
                    <ChatListItemSkeleton key={`loading-${index}`} />
                  ))}
                </div>
              ) : filteredChatList.length > 0 ? (
                <div className='space-y-1'>
                  {filteredChatList.map((chat) => (
                    <Fragment key={chat.id}>
                      <ChatListItem
                        chat={chat}
                        isSelected={selectedChatId === chat.id}
                        onClick={() => handleSelectChat(chat.id)}
                      />
                      <Separator className='mx-3' />
                    </Fragment>
                  ))}
                </div>
              ) : (
                <div className='py-8 text-center text-sm text-muted-foreground'>
                  <div className='space-y-2'>
                    <div className='text-4xl opacity-20'>💬</div>
                    <div className='font-medium'>
                      {search || activeFilter
                        ? 'No se encontraron chats'
                        : 'No hay chats disponibles'}
                    </div>
                    {search && (
                      <div className='text-xs text-muted-foreground/80'>
                        Intenta con otros términos de búsqueda
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Infinite scroll loading indicator */}
              <div ref={loadingRef} className='pt-4 flex justify-center'>
                {isFetchingNextPage && (
                  <div className='flex flex-col items-center gap-2 py-4'>
                    <Loader2 className='h-5 w-5 animate-spin text-primary' />
                    <span className='text-xs text-muted-foreground'>
                      Cargando más chats...
                    </span>
                  </div>
                )}
              </div>
            </div>
          </ScrollArea>
        </div>

        {/* Messages Found - Fixed at bottom when searching */}
        {search && search.length >= 2 && (
          <div className='flex-shrink-0 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
            <MessagesFound
              search={search}
              onMessageClick={(chatId, messageId) =>
                handleSelectChat(chatId, messageId)
              }
            />
          </div>
        )}
      </div>
    </div>
  )
}
