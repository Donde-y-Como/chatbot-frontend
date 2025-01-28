import {
  IconBrandFacebook,
  IconBrandInstagram,
  IconBrandWhatsapp,
} from '@tabler/icons-react'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Chat } from '@/features/chats/ChatTypes'
import { format } from 'date-fns'
import { Check } from 'lucide-react'

interface ChatListItemProps {
  chat: Chat
  isSelected: boolean
  onClick: () => void
}

export function ChatListItem({ chat, isSelected, onClick }: ChatListItemProps) {
  const lastMsg =
    chat.lastMessage.role === 'business'
      ? `Tú: ${chat.lastMessage.content}`
      : chat.lastMessage.role === 'assistant'
        ? `Asistente: ${chat.lastMessage.content}`
        : chat.lastMessage.content

  const isSent = chat.lastMessage.role === 'business' || chat.lastMessage.role === 'assistant';

  const PlatformIcon = {
    whatsapp: IconBrandWhatsapp,
    facebook: IconBrandFacebook,
    instagram: IconBrandInstagram,
  }[chat.platformName.toLowerCase()]

  return (
    <button
      type='button'
      className={cn(
        ` flex w-full rounded-md px-2 py-2 text-left text-sm hover:bg-secondary/75`,
        isSelected && 'sm:bg-muted'
      )}
      onClick={onClick}
    >
      <div className='flex gap-2 w-full'>
        <div className='relative flex-shrink-0'>
          <Avatar>
            <AvatarFallback>{chat.client.profileName[0] || ''}</AvatarFallback>
          </Avatar>
          {PlatformIcon && (
            <div className='absolute -bottom-0.5 -right-0.5 rounded-full bg-white p-0.5 shadow-md'>
              <PlatformIcon
                size={14}
                className={cn(
                  chat.platformName.toLowerCase() === 'whatsapp' &&
                    'text-green-500',
                  chat.platformName.toLowerCase() === 'facebook' &&
                    'text-blue-500',
                  chat.platformName.toLowerCase() === 'instagram' &&
                    'text-pink-500'
                )}
              />
            </div>
          )}
        </div>
        <div className='font-medium w-full grid grid-cols-5 gap-y-0.5'>
          <span className='col-span-4'>
            {chat.client.profileName || 'Desconocido'}
          </span>

          <span className='col-span-1 text-xs text-right font-normal text-muted-foreground'>
            {format(new Date(chat.lastMessage.timestamp), 'HH:mm')}
          </span>

          <span className='col-span-4 text-sm text-muted-foreground truncate'>
            {lastMsg}
          </span>

          <span className='col-span-1 flex justify-end'>
            {chat.newClientMessagesCount > 0 ? (
              <span className='min-w-5 h-5 flex items-center justify-center rounded-full bg-blue-500 text-white text-xs'>
                {chat.newClientMessagesCount}
              </span>
            ) : isSent && (
              <Check className='h-4 w-4 opacity-80' />
            )}
          </span>
        </div>
      </div>
    </button>
  )
}
