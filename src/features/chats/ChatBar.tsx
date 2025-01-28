import { Fragment, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { SearchChatParams } from '@/routes/_authenticated/chats'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { ChatBarHeader } from '@/features/chats/ChatBarHeader.tsx'
import { ChatListItem } from '@/features/chats/ChatListItem.tsx'
import { chatService } from '@/features/chats/ChatService'
import { Chat } from '@/features/chats/ChatTypes'
import { useFilteredChats } from '@/features/chats/hooks/useFilteredChats.ts'

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
  const queryClient = useQueryClient()

  const { data: chats, isLoading: isChatsLoading } = useQuery({
    queryKey: ['chats'],
    queryFn: () => chatService.getChats(),
    staleTime: Infinity,
  })

  const filteredChatList = useFilteredChats(chats, search)

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

    navigate({
      search: (prev: SearchChatParams) => ({ ...prev, chatId }),
      replace: true,
    })
  }

  return (
    <div className='flex w-full flex-col gap-2 sm:w-[30rem]'>
      <ChatBarHeader value={search} onChange={setSearch} />

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
