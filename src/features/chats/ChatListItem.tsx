import { formatDistanceToNowStrict } from 'date-fns'
import { es } from 'date-fns/locale/es'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { Chat } from '@/features/chats/ChatTypes'

interface ChatListItemProps {
  chat: Chat
  isSelected: boolean
  onClick: () => void
}

export function ChatListItem({ chat, isSelected, onClick }: ChatListItemProps) {
  const lastMsg = chat.lastMessage.role === 'business'
    ? `Tu: ${chat.lastMessage.content}`
    : chat.lastMessage.role === 'assistant'
      ? `Asistente: ${chat.lastMessage.content}`
      : chat.lastMessage.content

  return (
    <button
      type='button'
      className={cn(
        `-mx-1 flex w-full rounded-md px-2 py-2 text-left text-sm hover:bg-secondary/75`,
        isSelected && 'sm:bg-muted'
      )}
      onClick={onClick}
    >
      <div className='flex gap-2 w-full'>
        <Avatar>
          <AvatarFallback>
            {chat.client.profileName[0] || ''}
          </AvatarFallback>
        </Avatar>
        <div className='w-full flex flex-col'>
          <span className='font-medium w-full flex items-center justify-between'>
            <span>{chat.client.profileName || 'Desconocido'}</span>
            <span className='text-xs text-right font-normal text-muted-foreground'>
              {formatDistanceToNowStrict(new Date(chat.lastMessage.timestamp),
                { addSuffix: true, locale: es }
              )}
            </span>
          </span>
          <span className='text-ellipsis flex items-center text-muted-foreground'>
            <span className='flex-1'>{lastMsg}</span>
            {chat.newClientMessagesCount > 0 && (
              <span className='px-1 rounded-full text-center bg-blue-500 text-white text-xs'>
                {chat.newClientMessagesCount}
              </span>
            )}
          </span>
        </div>
      </div>
    </button>
  )
}