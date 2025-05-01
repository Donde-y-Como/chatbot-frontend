import { Message } from '@/features/chats/ChatTypes'
import { MediaPreview } from '@/features/chats/MediaPreview.tsx'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { useState } from 'react'
import Markdown from 'react-markdown'
import { useHighlightedMessage } from './hooks/useHighlightedMessage'
import { IconAlertCircle } from '@tabler/icons-react'

interface ChatMessageProps {
  message: Message
}

export function ChatMessage({ message }: ChatMessageProps) {
  const [showTime, setShowTime] = useState(false)
  const isUser = message.role === "user"
  const isSystem = message.role === "system"
  const isExpiredMessage = message.isExpiredNotice
  const { messageRef, isHighlighted } = useHighlightedMessage(message.id)

  return (
    <div 
      ref={messageRef}
      className={cn(
        "flex w-full",
        isUser ? "justify-start" : isSystem ? "justify-center" : "justify-end",
        isHighlighted && "animate-pulse-once transition-all",
        isExpiredMessage && "my-4"
      )}
    >
      <div className={cn(
        "flex flex-col gap-1", 
        isExpiredMessage
          ? "max-w-[90%] md:max-w-[70%]"
          : "max-w-[70%] md:max-w-[50%]"
      )}>
        {message.content && (
          <div
            onClick={() => setShowTime(!showTime)}
            className={cn(
              "my-1 px-4 py-2 rounded-2xl cursor-pointer break-words overflow-wrap-anywhere hyphens-auto max-w-full overflow-hidden",
              isHighlighted && "ring-2 ring-yellow-400",
              isExpiredMessage
                ? "bg-amber-50 text-amber-900 border border-amber-200 flex items-center gap-2"
                : isUser
                  ? "bg-gray-200 text-gray-900"
                  : isSystem
                    ? "bg-gray-100 text-gray-800 border border-gray-200"
                    : "bg-blue-500 text-white"
            )}
          >
            {isExpiredMessage && (
              <IconAlertCircle size={20} className="text-amber-500 flex-shrink-0" />
            )}
            <Markdown>{message.content}</Markdown>
          </div>
        )}

        {showTime && (
          <span className={cn('text-xs text-gray-500 ml-2', !isUser && 'text-right ml-0 mr-2')}>
            {format(new Date(message.timestamp), 'p')}
          </span>
        )}

        {message.media && <MediaPreview media={message.media} />}
      </div>
    </div>
  )
}