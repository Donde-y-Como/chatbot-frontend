import { useState } from 'react'
import { format } from 'date-fns'
import Markdown from 'react-markdown'
import { cn } from '@/lib/utils'
import { Message } from '@/features/chats/ChatTypes'
import { MediaPreview } from '@/features/chats/MediaPreview.tsx'
import { useHighlightedMessage } from './hooks/useHighlightedMessage'

interface ChatMessageProps {
  message: Message
}

export function ChatMessage({ message }: ChatMessageProps) {
  const [showTime, setShowTime] = useState(false)
  const isUser = message.role === 'user'
  const { messageRef, isHighlighted } = useHighlightedMessage(message.id)

  return (
    <div
      ref={messageRef}
      className={cn(
        'flex w-full px-4 py-1',
        isUser ? 'justify-start' : 'justify-end',
        isHighlighted && 'animate-pulse-once transition-all'
      )}
    >
      <div className={cn(
        'flex flex-col gap-1',
        'max-w-[85%] sm:max-w-[75%] lg:max-w-[65%]',
        isUser ? 'items-start' : 'items-end'
      )}>
        {message.content && (
          <div
            onClick={() => setShowTime(!showTime)}
            className={cn(
              'group relative px-4 py-3 cursor-pointer break-words overflow-wrap-anywhere hyphens-auto transition-all duration-200 hover:scale-[1.02]',
              'text-[15px] leading-relaxed font-normal',
              'shadow-sm hover:shadow-md',
              'rounded-2xl',
              isHighlighted && 'ring-2 ring-yellow-400/50 ring-offset-2',
              // Role-based colors 
              (message.role === 'assistant' || message.role === 'business') && 'bg-[#278EFF] hover:bg-[#1E7DE8] rounded-br-md',
              message.role === 'user' && 'bg-gray-100 text-gray-900 hover:bg-gray-200/80 rounded-bl-md'
            )}
          >
            <Markdown className={cn(
              "prose prose-sm max-w-none [&>p]:mb-0 [&>p:not(:last-child)]:mb-2 [&>*:first-child]:mt-0 [&>*:last-child]:mb-0",
              message.role === 'user' 
                ? "text-gray-900 [&>*]:text-gray-900" 
                : "text-white [&>*]:text-white"
            )}>
              {message.content}
            </Markdown>
          </div>
        )}

        {showTime && (
          <div className={cn(
            'text-xs text-gray-500 px-2 py-1 bg-black/5 rounded-full backdrop-blur-sm animate-in fade-in-0 zoom-in-95 duration-200',
            isUser ? 'ml-6' : 'mr-6 text-right'
          )}>
            {format(new Date(message.timestamp), 'p')}
          </div>
        )}

        {message.media && (
          <div className={cn(
            'mt-1',
            isUser ? 'ml-0' : 'mr-0'
          )}>
            <MediaPreview media={message.media} />
          </div>
        )}
      </div>
    </div>
  )
}
