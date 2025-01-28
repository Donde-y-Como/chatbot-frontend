import {
  IconArrowLeft,
  IconDotsVertical,
  IconPhone,
  IconVideo,
} from '@tabler/icons-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ChatMessages } from '@/features/chats/ChatTypes.ts'

interface ConversationHeaderProps {
  isLoading: boolean
  chatData?: ChatMessages
  onBackClick: () => void
}

export function ConversationHeader({
  isLoading,
  chatData,
  onBackClick,
}: ConversationHeaderProps) {
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
        <div className='flex items-center gap-2 lg:gap-4'>
          {isLoading ? (
            <Skeleton className='size-9 rounded-full lg:size-11' />
          ) : (
            <Avatar className='size-9 lg:size-11'>
              <AvatarFallback>
                {chatData?.client.profileName[0] || 'D'}
              </AvatarFallback>
            </Avatar>
          )}
          <div>
            {isLoading ? (
              <>
                <Skeleton className='h-4 w-32 mb-1' />
                <Skeleton className='h-3 w-24' />
              </>
            ) : (
              <>
                <span className='text-sm font-medium lg:text-base'>
                  {chatData?.client.profileName || <Skeleton className='h-3 w-24' />}
                </span>
                <span className='block text-xs text-muted-foreground lg:text-sm'>
                  {chatData?.platformName}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className='-mr-1 flex items-center gap-1 lg:gap-2'>
        <Button
          size='icon'
          variant='ghost'
          className='hidden size-8 rounded-full sm:inline-flex lg:size-10'
        >
          <IconVideo size={22} className='stroke-muted-foreground' />
        </Button>
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
