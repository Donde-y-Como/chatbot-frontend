import { Fragment, useEffect, useRef } from 'react'
import { cn } from '@/lib/utils.ts'
import { Skeleton } from '@/components/ui/skeleton.tsx'
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
      <div className='chat-text-container relative -mr-4 flex flex-1 flex-col overflow-y-hidden'>
        <div
          key={mobileSelectedChatId}
          className='chat-flex flex h-40 w-full flex-grow flex-col justify-start gap-4 overflow-y-auto py-2 pb-4 pr-4'
        >
          {Object.entries(messageGroups).map(([date, groupMessages]) => {
            return (
              <Fragment key={date}>
                <div className='text-center text-xs'>{date}</div>
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
      </div>
    </div>
  )
}

export function ChatConversationSkeleton() {
  return (
    <div className='flex size-full flex-1'>
      <div className='chat-text-container relative -mr-4 flex flex-1 flex-col overflow-y-hidden'>
        <div className='chat-flex flex h-40 w-full flex-grow flex-col justify-start gap-4 overflow-y-auto py-2 pb-4 pr-4'>
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
      </div>
    </div>
  )
}
