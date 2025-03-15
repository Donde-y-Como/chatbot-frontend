import { Fragment, useEffect, useRef } from 'react'
import { cn } from '@/lib/utils.ts'
import { Skeleton } from '@/components/ui/skeleton.tsx'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ChatMessage } from '@/features/chats/ChatMessage.tsx'
import { Message } from '@/features/chats/ChatTypes'
import { useMessageGroups } from './hooks/useMessageGroups'

interface ChatConversationProps {
  messages?: Message[]
  mobileSelectedChatId: string | null
}

export function ChatConversation({
  messages,
  mobileSelectedChatId,
}: ChatConversationProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messageGroups = useMessageGroups(messages)

  useEffect(() => {
    if (!mobileSelectedChatId) return
    const scroll = () => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'auto', block: 'end' })
    }
    requestAnimationFrame(() => requestAnimationFrame(scroll))
  }, [messages, mobileSelectedChatId])

  return (
    <div className='flex size-full flex-1'>
      <div className='chat-text-container relative -mr-4 flex flex-1 flex-col'>
        <ScrollArea
          key={mobileSelectedChatId}
          className='chat-flex flex h-40 w-full flex-grow flex-col py-2 pb-4 pr-4'
        >
          <div className='flex flex-col space-y-1'>
          {Object.entries(messageGroups).map(([date, groupMessages]) => {
            return (
              <Fragment key={date}>
                <div className='text-center text-xs flex items-center justify-center'>
                  <span className="bg-muted/50 rounded-full p-2">{date}</span>
                </div>
                {groupMessages.map((message, index) => {
                  return (
                    <div
                      key={`${message.role}-${message.timestamp}-${index}`}
                      className='flex flex-col'
                    >
                      <ChatMessage message={message} />
                    </div>
                  )
                })}
              </Fragment>
            )
          })}
          <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}

export function ChatConversationSkeleton() {
  return (
    <div className='flex size-full flex-1'>
      <div className='chat-text-container relative -mr-4 flex flex-1 flex-col'>
        <ScrollArea className='chat-flex flex h-40 w-full flex-grow flex-col py-2 pb-4 pr-4'>
          <div className='flex flex-col space-y-6'>
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton
              key={index}
              className={cn(
                'h-12 w-48 rounded-lg',
                index % 2 === 0 ? 'self-end' : 'self-start'
              )}
            />
          ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}
