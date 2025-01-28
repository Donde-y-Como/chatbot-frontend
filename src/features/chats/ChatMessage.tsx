import { Message } from '@/features/chats/ChatTypes'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import Markdown from 'react-markdown'
import { format } from 'date-fns'

interface ChatMessageProps {
  message: Message
}

export function ChatMessage({ message }: ChatMessageProps) {
  const [showTime, setShowTime] = useState(false)
  const isUser = message.role === "user"

  return (
    <div className={cn(
      "flex w-full px-4",
      isUser ? "justify-start" : "justify-end"
    )}>
      <div className="flex flex-col gap-1 max-w-[70%]">
        <div
          onClick={() => setShowTime(!showTime)}
          className={cn(
            "px-4 py-2 rounded-2xl break-words cursor-pointer",
            isUser
              ? "bg-gray-200 text-gray-900"
              : "bg-blue-500 text-white"
          )}
        >
          <Markdown>{message.content}</Markdown>
        </div>

        {showTime && (
          <span className="text-xs text-right text-gray-500">
            {format(new Date(message.timestamp), 'p')}
          </span>
        )}

        {message.media && (
          <span className="text-xs text-gray-500">
            Media attachment (not displayed)
          </span>
        )}
      </div>
    </div>
  )
}