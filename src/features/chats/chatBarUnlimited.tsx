import { Fragment, useCallback, useEffect, useRef, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { SearchChatParams } from '@/routes/_authenticated/chats'
import { Loader2 } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { useGetUser } from '@/components/layout/hooks/useGetUser.ts'
import { ChatBarHeader } from '@/features/chats/ChatBarHeader.tsx'
import { ChatListItem } from '@/features/chats/ChatListItem.tsx'
import { ChatListItemSkeleton } from '@/features/chats/ChatListItemSkeleton.tsx'
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
  const { data: user } = useGetUser()
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const loadingRef = useRef<HTMLDivElement>(null)

  const {
    chats,
    isChatsLoading,
    toggleAllIaMutation,
    hasNextPage,
    isFetchingNextPage,
    loadNextPage,
    refreshChats,
    isError,
  } = usePaginatedChats({
    initialPerPage: 50,
  })

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

  const handleRefresh = useCallback(() => {
    void refreshChats()
  }, [refreshChats])

  return (
    <div className='flex w-full flex-col gap-2 sm:w-[30rem]'>
      {user && (
        <ChatBarHeader
          value={search}
          AIEnabled={user.assistantConfig?.enabled}
          onInputChange={setSearch}
          onFilterChange={setActiveFilter}
          onToggleAllAI={onToggleAllAI}
          onRefresh={handleRefresh}
        />
      )}

      <MessagesFound
        search={search}
        onMessageClick={(chatId, messageId) =>
          handleSelectChat(chatId, messageId)
        }
      />

      <ScrollArea className='h-full pl-2 pr-3' ref={scrollAreaRef}>
        {isError ? (
          <div className='py-4 text-center text-sm text-red-500'>
            Error al cargar los chats. Intente refrescar.
          </div>
        ) : isChatsLoading ? (
          Array.from({ length: 7 }).map((_, index) => (
            <Fragment key={`loading-${index}`}>
              <ChatListItemSkeleton />
            </Fragment>
          ))
        ) : filteredChatList.length > 0 ? (
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
          <div className='py-4 text-center text-sm text-muted-foreground'>
            {search || activeFilter
              ? 'No se encontraron chats'
              : 'No hay chats disponibles'}
          </div>
        )}

        <div ref={loadingRef} className='pt-4 flex justify-center'>
          {isFetchingNextPage && (
            <div className='flex flex-col items-center gap-2'>
              <Loader2 className='h-6 w-6 animate-spin text-primary' />
              <span className='text-xs text-muted-foreground'>
                Cargando más chats...
              </span>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
