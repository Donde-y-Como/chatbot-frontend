import { IconEdit, IconMessages } from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import { SidebarTrigger } from '@/components/ui/sidebar.tsx'
import React from 'react'
import { Separator } from '@/components/ui/separator.tsx'

export function ChatBarHeader() {
  return (
    <div className='flex items-center justify-between py-2'>
      <div className='flex gap-2'>
        <SidebarTrigger variant='outline' className='scale-125 sm:scale-100' />
        <Separator orientation='vertical' className='h-6' />
        <h1 className='text-2xl font-bold'>Chats</h1>
        <IconMessages size={20} />
      </div>
      <Button size='icon' variant='ghost' className='rounded-lg'>
        <IconEdit size={24} className='stroke-muted-foreground' />
      </Button>
    </div>
  )
}