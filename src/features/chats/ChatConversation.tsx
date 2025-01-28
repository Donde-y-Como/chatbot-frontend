import { Fragment, useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'
import { ChatMessage } from '@/features/chats/ChatMessage.tsx'
import { Message } from '@/features/chats/ChatTypes'
import { useMessageGroups } from './hooks/useMessageGroups'

interface ChatConversationProps {
  messages?: Message[]
  isLoading: boolean
  mobileSelectedChatId: string | null
}

export function ChatConversation({
  messages,
  isLoading,
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
          {isLoading
            ? Array.from({ length: 3 }).map((_, index) => (
                <Skeleton
                  key={index}
                  className={cn(
                    'h-12 w-48 rounded-lg',
                    index % 2 === 0 ? 'self-end' : 'self-start'
                  )}
                />
              ))
            : Object.entries(messageGroups).map(([date, groupMessages]) => {

              return (
                  <Fragment key={date}>
                    <div className='text-center text-xs'>{date}</div>
                    {groupMessages.map((message, index) => {
                      const prevMessage = index > 0 ? groupMessages[index - 1] : null
                      const nextMessage = index < groupMessages.length - 1 ? groupMessages[index + 1] : null

                      const isUser = message.role === "user"
                      const prevIsUser = prevMessage ? prevMessage.role === "user" : false
                      const nextIsUser = nextMessage ? nextMessage.role === "user" : false

                      const isFirstInGroup = !prevMessage || isUser !== prevIsUser
                      const isLastInGroup = !nextMessage || isUser !== nextIsUser

                      return (
                        <div
                          key={`${message.role}-${message.timestamp}-${index}`}
                          className={cn(
                            'flex flex-col',
                            !isLastInGroup ? 'mb-1' : 'mb-3'
                          )}
                        >
                          <ChatMessage
                            message={message}
                            isFirstInGroup={isFirstInGroup}
                            isLastInGroup={isLastInGroup}
                          />
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
