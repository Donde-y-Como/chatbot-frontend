import { Fragment, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { SearchChatParams } from '@/routes/_authenticated/chats'
import { useAuth } from '@/stores/authStore.ts'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { ChatBarHeader } from '@/features/chats/ChatBarHeader.tsx'
import { ChatListItem } from '@/features/chats/ChatListItem.tsx'
import { Chat } from '@/features/chats/ChatTypes'
import { useChats } from '@/features/chats/hooks/useChats.ts'
import { useFilteredChats } from '@/features/chats/hooks/useFilteredChats.ts'
import { useGetTags } from '../clients/hooks/useGetTags'

interface ChatBarProps {
  selectedChatId: string | null
  setSelectedChatId: (id: string) => void
  setMobileSelectedChatId: (id: string) => void
  navigate: (params: {
    search: (prev: SearchChatParams) => SearchChatParams
    replace: boolean
  }) => void
}

export function ChatBar({
  selectedChatId,
  setSelectedChatId,
  setMobileSelectedChatId,
  navigate,
}: ChatBarProps) {
  const [search, setSearch] = useState('')
  const [activeFilter, setActiveFilter] = useState<string | null>(null)
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const { chats, isChatsLoading, toggleAllIaMutation } = useChats()
  const { data: tags } = useGetTags()
  const filteredChatList = useFilteredChats(chats, search, activeFilter, tags)

  const handleSelectChat = (chatId: string) => {
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

    // emit a message to the server to mark the chat as read

    navigate({
      search: (prev: SearchChatParams) => ({ ...prev, chatId }),
      replace: true,
    })
  }

  const onToggleAllAI = (enabled: boolean) => {
    if (user) toggleAllIaMutation.mutate({ enabled, userId: user.id })
  }

  return (
    <div className='flex w-full flex-col gap-2 sm:w-[30rem]'>
      <ChatBarHeader
        value={search}
        onInputChange={setSearch}
        onFilterChange={setActiveFilter}
        onToggleAllAI={onToggleAllAI}
      />

      <ScrollArea className='h-full pl-2 pr-3'>
        {isChatsLoading
          ? Array.from({ length: 5 }).map((_, index) => (
            <Fragment key={index}>
              <Skeleton className='h-16 w-full rounded-md' />
              <Separator className='my-1' />
            </Fragment>
          ))
          : filteredChatList.map((chat) => (
            <Fragment key={chat.id}>
              <ChatListItem
                chat={chat}
                isSelected={selectedChatId === chat.id}
                onClick={() => handleSelectChat(chat.id)}
              />
              <Separator className='my-1' />
            </Fragment>
          ))}
      </ScrollArea>
    </div>
  )
}
