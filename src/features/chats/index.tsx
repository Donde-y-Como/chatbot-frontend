import { useEffect, useRef, useState } from 'react'
import { Fragment } from 'react/jsx-runtime'
import { format } from 'date-fns'
import { useQuery } from '@tanstack/react-query'
import { getRouteApi } from '@tanstack/react-router'
import {
  IconArrowLeft,
  IconDotsVertical,
  IconPhone,
  IconVideo,
} from '@tabler/icons-react'
import { SearchChatParams } from '@/routes/_authenticated/chats'
import { es } from 'date-fns/locale/es'
import Markdown from 'react-markdown'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton.tsx'
import { Main } from '@/components/layout/main'
import ChatBar from '@/features/chats/ChatBar.tsx'
import ChatFooter from '@/features/chats/ChatFooter.tsx'
import { chatService } from '@/features/chats/ChatService.ts'
import { Message } from '@/features/chats/ChatTypes.ts'

const route = getRouteApi('/_authenticated/chats/')

export default function Chats() {
  const searchParams = route.useSearch()
  const navigate = route.useNavigate()
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [mobileSelectedChatId, setMobileSelectedChatId] = useState<
    string | null
  >(null)
  const { data: chats, isLoading: isChatsLoading } = useQuery({
    queryKey: ['chats'],
    queryFn: () => chatService.getChats(),
  })

  const { data: chatMessages, isLoading: isMessagesLoading } = useQuery({
    queryKey: ['chat', selectedChatId],
    queryFn: () => {
      return chatService.getChatById(selectedChatId as string)
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

    requestAnimationFrame(() => {
      requestAnimationFrame(scroll)
    })
  }, [chatMessages, mobileSelectedChatId])

  return (
    <Main fixed>
      <section className='flex h-full gap-6'>
        {/* Left Side */}
        <ChatBar
          navigate={navigate}
          selectedChatId={selectedChatId}
          setSelectedChatId={setSelectedChatId}
          setMobileSelectedChatId={setMobileSelectedChatId}
        />

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
                  void navigate({
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
                              <Markdown>{msg.content}</Markdown>
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

            <ChatFooter selectedChatId={selectedChatId} />
          </div>
        </div>
      </section>
    </Main>
  )
}
