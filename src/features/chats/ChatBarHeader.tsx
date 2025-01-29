import React from 'react'
import { IconEdit, IconSearch } from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator.tsx'
import { SidebarTrigger } from '@/components/ui/sidebar.tsx'

interface ChatSearchInputProps {
  value: string
  onChange: (value: string) => void
}

export function ChatBarHeader({ value, onChange }: ChatSearchInputProps) {
  return (
    <div className='sticky top-0 z-10 bg-background pb-3 w-full shadow-sm sm:pt-2'>
      <div className='flex items-center justify-between px-3'>
        <div className='flex gap-2'>
          <SidebarTrigger variant='outline' />
          <Separator orientation='vertical' className='h-7' />
          <h1 className='text-2xl font-bold'>Chats</h1>
          {/*<IconMessages size={20} />*/}
        </div>
        <Button size='icon' variant='ghost' className='rounded-lg'>
          <IconEdit size={24} className='stroke-muted-foreground' />
        </Button>
      </div>
      <label className='flex h-8 px-4 mx-4 mt-2 items-center space-x-0 rounded-md border border-input focus-within:outline-none focus-within:ring-1 focus-within:ring-ring'>
        <IconSearch size={15} className='mr-2 stroke-slate-500' />
        <input
          type='search'
          className='w-full flex-1 bg-inherit text-sm focus-visible:outline-none'
          placeholder='Buscar conversación...'
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </label>
    </div>
  )
}
