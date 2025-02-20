import React from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  IconArrowLeft,
  IconBrandFacebook,
  IconBrandInstagram,
  IconBrandWhatsapp,
  IconDotsVertical,
  IconPhone,
} from '@tabler/icons-react'
import { cn } from '@/lib/utils.ts'
import { useWebSocket } from '@/hooks/use-web-socket.ts'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ChatMessages } from '@/features/chats/ChatTypes.ts'
import { IconIaEnabled } from '@/features/chats/IconIaEnabled.tsx'

interface ConversationHeaderProps {
  onBackClick: () => void
  selectedChatId: string
  chatData: ChatMessages
}

export function ConversationHeader({
  selectedChatId,
  onBackClick,
  chatData,
}: ConversationHeaderProps) {
  const { emit } = useWebSocket()
  const queryClient = useQueryClient()

  const toggleIAMutation = useMutation({
    mutationKey: ['ia-toggle'],
    async mutationFn(data: { enabled: boolean; conversationId: string }) {
      emit(
        data.enabled ? 'enableAssistant' : 'disableAssistant',
        data.conversationId
      )
    },
    onSuccess: (_data, variables) => {
      queryClient.setQueryData<ChatMessages>(
        ['chat', selectedChatId],
        (oldChats) => {
          if (oldChats === undefined) return oldChats
          return {
            ...oldChats,
            thread: {
              ...oldChats.thread,
              enabled: variables.enabled,
            },
          }
        }
      )
    },
  })

  const onToggleIA = (enabled: boolean) => {
    toggleIAMutation.mutate({ enabled, conversationId: selectedChatId })
  }

  const PlatformIcon = {
    whatsapp: IconBrandWhatsapp,
    facebook: IconBrandFacebook,
    instagram: IconBrandInstagram,
  }[chatData.platformName.toLowerCase()]

  return (
    <div className='mb-1 flex flex-none justify-between rounded-t-md bg-secondary p-4 shadow-lg'>
      <div className='flex gap-3'>
        <Button
          size='icon'
          variant='ghost'
          className='-ml-2 h-full sm:hidden'
          onClick={onBackClick}
        >
          <IconArrowLeft />
        </Button>
        <div className='relative flex items-center gap-2 lg:gap-4'>
          <Avatar className='size-9 lg:size-11'>
            <AvatarFallback className='bg-background'>
              {chatData.client.name[0]}
            </AvatarFallback>
          </Avatar>
          {PlatformIcon && (
            <div className='absolute -bottom-0.5 -right-0.5 rounded-full bg-white p-0.5 shadow-md'>
              <PlatformIcon
                size={14}
                className={cn(
                  chatData.platformName.toLowerCase() === 'whatsapp' &&
                  'text-green-500',
                  chatData.platformName.toLowerCase() === 'facebook' &&
                  'text-blue-500',
                  chatData.platformName.toLowerCase() === 'instagram' &&
                  'text-pink-500'
                )}
              />
            </div>
          )}
        </div>
        <span className='text-sm font-medium lg:text-base  flex items-center'>
          {chatData.client.name || <Skeleton className='h-3 w-24' />}
        </span>
      </div>

      <div className='-mr-1 flex items-center gap-1 lg:gap-2'>
        <IconIaEnabled
          enabled={chatData.thread.enabled}
          onToggle={onToggleIA}
          tooltip={chatData.thread.enabled ? 'Desactivar IA' : 'Activar IA'}
        />

        <Button
          size='icon'
          variant='ghost'
          className='hidden size-8 rounded-full sm:inline-flex lg:size-10'
        >
          <IconPhone size={22} className='stroke-muted-foreground' />
        </Button>
        <Button
          size='icon'
          variant='ghost'
          className='h-10 rounded-md sm:h-8 sm:w-4 lg:h-10 lg:w-6'
        >
          <IconDotsVertical className='stroke-muted-foreground sm:size-5' />
        </Button>
      </div>
    </div>
  )
}

export function ConversationHeaderSkeleton() {
  return (
    <div className='mb-1 flex flex-none justify-between rounded-t-md bg-secondary p-4 shadow-lg'>
      <div className='flex gap-3'>
        <Button size='icon' variant='ghost' className='-ml-2 h-full sm:hidden'>
          <IconArrowLeft />
        </Button>
        <div className='flex items-center gap-2 lg:gap-4'>
          <Skeleton className='size-9 rounded-full lg:size-11' />
          <div>
            <Skeleton className='h-4 w-32 mb-1' />
            <Skeleton className='h-3 w-24' />
          </div>
        </div>
      </div>

      <div className='-mr-1 flex items-center gap-1 lg:gap-2'>
        <Button
          size='icon'
          variant='ghost'
          className='hidden size-8 rounded-full sm:inline-flex lg:size-10'
        >
          <IconPhone size={22} className='stroke-muted-foreground' />
        </Button>
        <Button
          size='icon'
          variant='ghost'
          className='h-10 rounded-md sm:h-8 sm:w-4 lg:h-10 lg:w-6'
        >
          <IconDotsVertical className='stroke-muted-foreground sm:size-5' />
        </Button>
      </div>
    </div>
  )
}
