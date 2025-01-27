import { format } from 'date-fns'
import Markdown from 'react-markdown'
import { cn } from '@/lib/utils'
import { Message } from '@/features/chats/ChatTypes'

interface ChatMessageProps {
  message: Message
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isBusinessOrAssistant = message.role === 'business' || message.role === 'assistant'

  return (
    <div
      className={cn(
        'chat-box max-w-72 break-words px-3 py-2 shadow-lg',
        isBusinessOrAssistant
          ? 'self-end rounded-[16px_16px_0_16px] bg-primary/85 text-primary-foreground/75'
          : 'self-start rounded-[16px_16px_16px_0] bg-secondary'
      )}
    >
      <Markdown>{message.content}</Markdown>
      <span
        className={cn(
          'mt-1 block text-xs font-light italic text-muted-foreground',
          isBusinessOrAssistant && 'text-right'
        )}
      >
        {format(new Date(message.timestamp), 'h:mm a')}
      </span>
    </div>
  )
}