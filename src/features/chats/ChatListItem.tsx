import React from 'react'
import { format } from 'date-fns'
import {
  IconBrandFacebook,
  IconBrandInstagram,
  IconBrandWhatsapp,
} from '@tabler/icons-react'
import { Check, MoreVertical } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Chat } from '@/features/chats/ChatTypes'

interface ChatListItemProps {
  chat: Chat
  isSelected: boolean
  onClick: () => void
}

export function ChatListItem({ chat, isSelected, onClick }: ChatListItemProps) {
  const lastMsg =
    chat.lastMessage.role === 'business' ? (
      <span>
        <Check className='inline-block h-3 w-3 mr-1 opacity-80' />Tú: {chat.lastMessage.content}
      </span>
    ) : chat.lastMessage.role === 'assistant' ? (
      <span>
        <Check className='inline-block w-3 mr-0.5 opacity-80' />Asistente: {chat.lastMessage.content}
      </span>
    ) : (
      chat.lastMessage.content
    )

  const PlatformIcon = {
    whatsapp: IconBrandWhatsapp,
    facebook: IconBrandFacebook,
    instagram: IconBrandInstagram,
  }[chat.platformName.toLowerCase()]

  return (
    <div
      className={cn(
        'flex w-full rounded-md px-2 py-2 text-left text-sm hover:bg-secondary/75 cursor-pointer',
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
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant='ghost'
                    className='h-6 w-6 p-0 hover:bg-muted'
                  >
                    <MoreVertical className='h-4 w-4' />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align='end' className='w-36'>
                  <DropdownMenuItem>Cambiar nombre</DropdownMenuItem>
                  <DropdownMenuItem>Ver perfil</DropdownMenuItem>
                  <DropdownMenuItem>Encender/Apagar IA</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </span>
        </div>
      </div>
    </div>
  )
}
