import { useMemo, useState } from 'react'
import { Fragment } from 'react/jsx-runtime'
import { formatDistanceToNowStrict } from 'date-fns'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { IconEdit, IconMessages, IconSearch } from '@tabler/icons-react'
import { SearchChatParams } from '@/routes/_authenticated/chats'
import { es } from 'date-fns/locale/es'
import { cn } from '@/lib/utils.ts'
import { Avatar, AvatarFallback } from '@/components/ui/avatar.tsx'
import { Button } from '@/components/ui/button.tsx'
import { ScrollArea } from '@/components/ui/scroll-area.tsx'
import { Separator } from '@/components/ui/separator.tsx'
import { Skeleton } from '@/components/ui/skeleton.tsx'
import { chatService } from '@/features/chats/ChatService.ts'
import { Chat } from '@/features/chats/ChatTypes.ts'

export default function ChatBar({
  selectedChatId,
  setSelectedChatId,
  setMobileSelectedChatId,
  navigate,
}) {
  const [search, setSearch] = useState('')
  const { data: chats, isLoading: isChatsLoading } = useQuery({
    queryKey: ['chats'],
    queryFn: () => chatService.getChats(),
    staleTime: Infinity,
  })
  const queryClient = useQueryClient();

  const filteredChatList = useMemo(
    () =>
      chats?.filter((chat) =>
        chat.client.profileName
          .toLowerCase()
          .includes(search.trim().toLowerCase())
      ) || [],
    [chats, search]
  )

  const handleSelectChat = (chatId: string) => {
    setSelectedChatId(chatId)
    setMobileSelectedChatId(chatId)
    queryClient.setQueryData<Chat[]>(['chats'], (cachedChats) => {
      if (cachedChats === undefined) return cachedChats
      return [...cachedChats]
        .map((chat) => {
          if (chat.id === chatId) {
            return {
              ...chat,
              newClientMessagesCount: 0,
            }
          }
          return chat
        })
    })

    // TODO: NOTIFY THE SERVER TO RESTORE THE NEW CLIENT MESSAGES COUNT IN CHATID
    navigate({
      search: (prev: SearchChatParams) => ({ ...prev, chatId }),
      replace: true,
    })
  }

  return (
    <div className='flex w-full flex-col gap-2 sm:w-56 lg:w-72 2xl:w-80'>
      <div className='sticky top-0 z-10 -mx-4 bg-background px-4 pb-3 shadow-md sm:static sm:z-auto sm:mx-0 sm:p-0 sm:shadow-none'>
        <div className='flex items-center justify-between py-2'>
          <div className='flex gap-2'>
            <h1 className='text-2xl font-bold'>Chats</h1>
            <IconMessages size={20} />
          </div>
          <Button size='icon' variant='ghost' className='rounded-lg'>
            <IconEdit size={24} className='stroke-muted-foreground' />
          </Button>
        </div>

        <label className='flex h-12 w-full items-center space-x-0 rounded-md border border-input pl-2 focus-within:outline-none focus-within:ring-1 focus-within:ring-ring'>
          <IconSearch size={15} className='mr-2 stroke-slate-500' />
          <input
            type='search'
            className='w-full flex-1 bg-inherit text-sm focus-visible:outline-none'
            placeholder='Buscar conversación...'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>
      </div>

      <ScrollArea className='-ml-3 h-full p-3'>
        {isChatsLoading
          ? Array.from({ length: 5 }).map((_, index) => (
              <Fragment key={index}>
                <Skeleton className='h-16 w-full rounded-md' />
                <Separator className='my-1' />
              </Fragment>
            ))
          : filteredChatList.map((chat) => {
              const lastMsg =
                chat.lastMessage.role === 'business'
                  ? `Tu: ${chat.lastMessage.content}`
                  : chat.lastMessage.role === 'assistant'
                    ? `Asistente: ${chat.lastMessage.content}`
                    : chat.lastMessage.content

              return (
                <Fragment key={chat.id}>
                  <button
                    type='button'
                    className={cn(
                      `-mx-1 flex w-full rounded-md px-2 py-2 text-left text-sm hover:bg-secondary/75`,
                      selectedChatId === chat.id && 'sm:bg-muted'
                    )}
                    onClick={() => handleSelectChat(chat.id)}
                  >
                    <div className='flex gap-2 w-full'>
                      <Avatar>
                        <AvatarFallback>
                          {chat.client.profileName[0] || ''}
                        </AvatarFallback>
                      </Avatar>
                      <div className='w-full flex flex-col'>
                        <span className='font-medium w-full flex items-center justify-between'>
                          <span className=''>
                            {chat.client.profileName || 'Desconocido'}
                          </span>
                          <span className='text-xs text-right font-normal text-muted-foreground'>
                            {formatDistanceToNowStrict(
                              new Date(chat.lastMessage.timestamp),
                              { addSuffix: true, locale: es }
                            )}
                          </span>
                        </span>
                        <span className='text-ellipsis flex items-center text-muted-foreground '>
                          <span className='flex-1'>{lastMsg}</span>
                          {chat.newClientMessagesCount > 0 && (
                            <span className='px-1 rounded-full text-center  bg-blue-500 text-white text-xs'>
                              {chat.newClientMessagesCount}
                            </span>
                          )}
                        </span>
                      </div>
                    </div>
                  </button>
                  <Separator className='my-1' />
                </Fragment>
              )
            })}
      </ScrollArea>
    </div>
  )
}
