import { useEffect, useRef, useState } from 'react'
import { Fragment } from 'react/jsx-runtime'
import { format, formatDistanceToNow } from 'date-fns'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { getRouteApi } from '@tanstack/react-router'
import {
  IconArrowLeft,
  IconDotsVertical,
  IconEdit,
  IconMessages,
  IconPaperclip,
  IconPhone,
  IconPhotoPlus,
  IconPlus,
  IconSearch,
  IconSend,
  IconVideo,
} from '@tabler/icons-react'
import { SearchChatParams } from '@/routes/_authenticated/chats'
import { es } from 'date-fns/locale/es'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton.tsx'
import { Main } from '@/components/layout/main'
import { chatService } from '@/features/chats/ChatService.ts'
import { ChatMessages, Message } from '@/features/chats/ChatTypes.ts'

const route = getRouteApi('/_authenticated/chats/')

export default function Chats() {
  const queryClient = useQueryClient()
  const searchParams = route.useSearch()
  const navigate = route.useNavigate()
  const [search, setSearch] = useState('')
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [mobileSelectedChatId, setMobileSelectedChatId] = useState<
    string | null
  >(null)
  const [newMessage, setNewMessage] = useState('')
  const {
    data: chats,
    isLoading: isChatsLoading,
    isError: isChatsError,
  } = useQuery({
    queryKey: ['chats'],
    queryFn: () => chatService.getChats(),
  })

  const {
    data: chatMessages,
    isLoading: isMessagesLoading,
    isError: isMessagesError,
  } = useQuery({
    queryKey: ['chat', selectedChatId],
    queryFn: () => {
      if (!selectedChatId) throw new Error('No chat selected')
      return chatService.getChatById(selectedChatId)
    },
    enabled: !!selectedChatId,
  })

  useEffect(() => {
    if (chats && chats.length > 0) {
      const urlChatId = searchParams.chatId
      const isValidChat = urlChatId && chats.some((c) => c.id === urlChatId)
      const initialChatId = isValidChat ? urlChatId : chats[0].id

      setSelectedChatId(initialChatId)
      setMobileSelectedChatId(isValidChat ? initialChatId : null)
    }
  }, [chats, searchParams.chatId])

  useEffect(() => {
    const urlChatId = searchParams.chatId
    const isMobile = window.innerWidth < 640

    if (isMobile) {
      setMobileSelectedChatId(urlChatId ? urlChatId : null)
    }
  }, [searchParams.chatId])

  const handleSelectChat = (chatId: string) => {
    setSelectedChatId(chatId)
    setMobileSelectedChatId(chatId)
    navigate({
      search: (prev: SearchChatParams) => ({ ...prev, chatId }),
      replace: true,
    })
  }

  const filteredChatList =
    chats?.filter((chat) =>
      chat.client.profileName
        .toLowerCase()
        .includes(search.trim().toLowerCase())
    ) || []

  const currentMessage = chatMessages?.messages.slice().reduce(
    (acc, msg) => {
      const date = new Date(msg.timestamp)
      // Use local date with format
      const key = format(date, 'd MMM yyyy', { locale: es })

      if (!acc[key]) acc[key] = []
      acc[key].push(msg)
      return acc
    },
    {} as Record<string, Message[]>
  )

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !chatMessages) return

    const newMsg: Message = {
      id: Date.now().toString(),
      content: newMessage.trim(),
      role: 'business',
      timestamp: Date.now(),
      media: null,
    }

    const updatedChatMessages: ChatMessages = {
      ...chatMessages,
      messages: [newMsg, ...chatMessages.messages],
    }

    queryClient.setQueryData(['chat', selectedChatId], updatedChatMessages)
    setNewMessage('')
    // TODO: Implement API call to send message
  }

  useEffect(() => {
    if (!mobileSelectedChatId) return

    const scroll = () => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({
          behavior: 'auto',
          block: 'end',
        })
      }
    }

    // Double requestAnimationFrame for mobile initial render
    requestAnimationFrame(() => {
      requestAnimationFrame(scroll)
    })
  }, [chatMessages, mobileSelectedChatId])

  return (
    <Main fixed>
      <section className='flex h-full gap-6'>
        {/* Left Side */}
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
                type='text'
                className='w-full flex-1 bg-inherit text-sm focus-visible:outline-none'
                placeholder='Search chat...'
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </label>
          </div>

          <ScrollArea className='-mx-3 h-full p-3'>
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
                              {chat.client.profileName[0] || 'D'}
                            </AvatarFallback>
                          </Avatar>
                          <div className='w-full'>
                            <span className='col-start-2 row-span-2 font-medium  w-full flex items-center'>
                              <span className='flex-1'>
                                {chat.client.profileName || 'Desconocido'}
                              </span>
                              <span className='ml-2 text-xs font-normal text-muted-foreground'>
                                {formatDistanceToNow(
                                  new Date(chat.lastMessage.timestamp),
                                  { addSuffix: true, locale: es }
                                )}
                              </span>
                            </span>
                            <span className='col-start-2 row-span-2 row-start-2 line-clamp-2 text-ellipsis text-muted-foreground'>
                              {lastMsg}
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

        {/* Right Side */}
        <div
          className={cn(
            'absolute inset-0 hidden left-full z-50 w-full flex-1 flex-col rounded-md border bg-primary-foreground shadow-sm transition-all duration-200 sm:static sm:z-auto sm:flex',
            (mobileSelectedChatId || searchParams.chatId) && 'left-0 flex'
          )}
        >
          {/* Top Part */}
          <div className='mb-1 flex flex-none justify-between rounded-t-md bg-secondary p-4 shadow-lg'>
            <div className='flex gap-3'>
              <Button
                size='icon'
                variant='ghost'
                className='-ml-2 h-full sm:hidden'
                onClick={() => {
                  setMobileSelectedChatId(null)
                  navigate({
                    search: () => ({ chatId: undefined }),
                    replace: true,
                  })
                }}
              >
                <IconArrowLeft />
              </Button>
              <div className='flex items-center gap-2 lg:gap-4'>
                {isMessagesLoading ? (
                  <Skeleton className='size-9 rounded-full lg:size-11' />
                ) : (
                  <Avatar className='size-9 lg:size-11'>
                    <AvatarFallback>
                      {chatMessages?.client.profileName[0] || 'D'}
                    </AvatarFallback>
                  </Avatar>
                )}
                <div>
                  {isMessagesLoading ? (
                    <>
                      <Skeleton className='h-4 w-32 mb-1' />
                      <Skeleton className='h-3 w-24' />
                    </>
                  ) : (
                    <>
                      <span className='text-sm font-medium lg:text-base'>
                        {chatMessages?.client.profileName || 'Desconocido'}
                      </span>
                      <span className='block text-xs text-muted-foreground lg:text-sm'>
                        {chatMessages?.platformName}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className='-mr-1 flex items-center gap-1 lg:gap-2'>
              <Button
                size='icon'
                variant='ghost'
                className='hidden size-8 rounded-full sm:inline-flex lg:size-10'
              >
                <IconVideo size={22} className='stroke-muted-foreground' />
              </Button>
              <Button
                size='icon'
                variant='ghost'
                className='hidden size-8 rounded-full sm:inline-flex lg:size-10'
              >
                <IconPhone size={22} className='stroke-muted-foreground' />
              </Button>
              <Button
                size='icon'
                variant='ghost'
                className='h-10 rounded-md sm:h-8 sm:w-4 lg:h-10 lg:w-6'
              >
                <IconDotsVertical className='stroke-muted-foreground sm:size-5' />
              </Button>
            </div>
          </div>

          {/* Conversation */}
          <div className='flex flex-1 flex-col gap-2 rounded-md px-4 pb-4 pt-0'>
            <div className='flex size-full flex-1'>
              <div className='chat-text-container relative -mr-4 flex flex-1 flex-col overflow-y-hidden'>
                <div
                  key={mobileSelectedChatId}
                  className='chat-flex flex h-40 w-full flex-grow flex-col justify-start gap-4 overflow-y-auto py-2 pb-4 pr-4'
                >
                  {isMessagesLoading
                    ? Array.from({ length: 3 }).map((_, index) => (
                        <Skeleton
                          key={index}
                          className={cn(
                            'h-12 w-48 rounded-lg',
                            index % 2 === 0 ? 'self-end' : 'self-start'
                          )}
                        />
                      ))
                    : currentMessage &&
                      Object.keys(currentMessage).map((key) => (
                        <Fragment key={key}>
                          <div className='text-center text-xs'>{key}</div>
                          {currentMessage[key].map((msg, index) => (
                            <div
                              key={`${msg.role}-${msg.timestamp}-${index}`}
                              className={cn(
                                'chat-box max-w-72 break-words px-3 py-2 shadow-lg',
                                msg.role === 'business' ||
                                  msg.role === 'assistant'
                                  ? 'self-end rounded-[16px_16px_0_16px] bg-primary/85 text-primary-foreground/75'
                                  : 'self-start rounded-[16px_16px_16px_0] bg-secondary'
                              )}
                            >
                              {msg.content}
                              <span
                                className={cn(
                                  'mt-1 block text-xs font-light italic text-muted-foreground',
                                  (msg.role === 'business' ||
                                    msg.role === 'assistant') &&
                                    'text-right'
                                )}
                              >
                                {format(new Date(msg.timestamp), 'h:mm a')}
                              </span>
                            </div>
                          ))}
                        </Fragment>
                      ))}
                  <div ref={messagesEndRef} />
                </div>
              </div>
            </div>

            <form
              onSubmit={handleSendMessage}
              className='flex w-full flex-none gap-2'
            >
              <div className='flex flex-1 items-center gap-2 rounded-md border border-input px-2 py-1 focus-within:outline-none focus-within:ring-1 focus-within:ring-ring lg:gap-4'>
                <div className='space-x-1'>
                  <Button
                    size='icon'
                    type='button'
                    variant='ghost'
                    className='h-8 rounded-md'
                  >
                    <IconPlus size={20} className='stroke-muted-foreground' />
                  </Button>
                  <Button
                    size='icon'
                    type='button'
                    variant='ghost'
                    className='hidden h-8 rounded-md lg:inline-flex'
                  >
                    <IconPhotoPlus
                      size={20}
                      className='stroke-muted-foreground'
                    />
                  </Button>
                  <Button
                    size='icon'
                    type='button'
                    variant='ghost'
                    className='hidden h-8 rounded-md lg:inline-flex'
                  >
                    <IconPaperclip
                      size={20}
                      className='stroke-muted-foreground'
                    />
                  </Button>
                </div>
                <input
                  type='text'
                  placeholder='Type your messages...'
                  className='h-8 w-full bg-inherit focus-visible:outline-none'
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                />
                <Button
                  variant='ghost'
                  size='icon'
                  className='hidden sm:inline-flex'
                  type='submit'
                >
                  <IconSend size={20} />
                </Button>
              </div>
              <Button className='h-full sm:hidden' type='submit'>
                <IconSend size={18} /> Send
              </Button>
            </form>
          </div>
        </div>
      </section>
    </Main>
  )
}
