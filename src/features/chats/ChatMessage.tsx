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
        'flex w-full',
        isUser ? 'justify-start' : 'justify-end',
        isHighlighted && 'animate-pulse-once transition-all'
      )}
    >
      <div className='flex flex-col gap-1 max-w-[70%] md:max-w-[50%]'>
        {message.content && (
          <div
            onClick={() => setShowTime(!showTime)}
            className={cn(
              'my-1 px-4 py-2 rounded-2xl cursor-pointer break-words overflow-wrap-anywhere hyphens-auto max-w-[25vw] overflow-hidden',
              isHighlighted && 'ring-2 ring-yellow-400',
              isUser ? 'bg-gray-200 text-gray-900' : 'bg-blue-500 text-white'
            )}
          >
            <Markdown>{message.content}</Markdown>
          </div>
        )}

        {showTime && (
          <span
            className={cn(
              'text-xs text-gray-500 ml-2',
              !isUser && 'text-right ml-0 mr-2'
            )}
          >
            {format(new Date(message.timestamp), 'p')}
          </span>
        )}

        {message.media && <MediaPreview media={message.media} />}
      </div>
    </div>
  )
}
