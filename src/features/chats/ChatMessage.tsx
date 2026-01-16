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
  const hasText = Boolean(message.content?.trim())
  const isOutgoing = message.role === 'user'
  const isIncoming = !isOutgoing
  const bubbleVariant = isIncoming ? 'incoming' : 'outgoing'

  const normalizedMedia =
    message.media && (message.media.type || '').toLowerCase() === 'imagemessage'
      ? { ...message.media, type: 'image' }
      : message.media

  return (
    <div
      ref={messageRef}
      className={cn(
        'flex w-full px-2 sm:px-4 py-1',
        isUser ? 'justify-start' : 'justify-end',
        isHighlighted && 'animate-pulse-once transition-all'
      )}
    >
      <div className={cn(
        'group flex flex-col gap-1.5',
        'max-w-[92%] sm:max-w-[78%] lg:max-w-[66%]',
        isUser ? 'items-start' : 'items-end'
      )}>
        {hasText && (
          <div
            onClick={() => setShowTime(!showTime)}
            className={cn(
              'relative cursor-pointer break-words overflow-wrap-anywhere hyphens-auto',
              'px-4 py-3 text-[15px] leading-relaxed font-normal',
              'rounded-2xl border shadow-sm transition hover:shadow-md',
              isHighlighted && 'ring-2 ring-yellow-400/50 ring-offset-2',
              // Keep original blue bubble styling for non-user messages
              bubbleVariant === 'incoming' &&
                'bg-[#278EFF] hover:bg-[#1E7DE8] text-white border-transparent rounded-br-md',
              bubbleVariant === 'outgoing' &&
                'bg-muted text-foreground border-border/60 rounded-bl-md'
            )}
          >
            <Markdown className={cn(
              'prose prose-sm max-w-none',
              '[&>p]:mb-0 [&>p:not(:last-child)]:mb-2 [&>*:first-child]:mt-0 [&>*:last-child]:mb-0',
              bubbleVariant === 'incoming' && 'prose-invert'
            )}>
              {message.content}
            </Markdown>
          </div>
        )}

        <div
          className={cn(
            'px-2 text-[11px] text-muted-foreground transition-opacity',
            showTime ? 'opacity-100' : 'opacity-0 group-hover:opacity-100',
            isUser ? 'ml-1' : 'mr-1'
          )}
        >
          {format(new Date(message.timestamp), 'p')}
        </div>

        {normalizedMedia && (
          <div className={cn(
            'mt-1',
            isUser ? 'ml-0' : 'mr-0'
          )}>
            <MediaPreview
              media={normalizedMedia}
              triggerClassName={cn(
                isUser ? '' : '',
                'max-w-[260px] sm:max-w-[300px]'
              )}
            />
          </div>
        )}
      </div>
    </div>
  )
}
