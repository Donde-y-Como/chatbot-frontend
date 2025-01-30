import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { IconBrandFacebook, IconBrandInstagram, IconBrandWhatsapp, IconSearch } from '@tabler/icons-react';
import { api } from '@/api/axiosInstance.ts';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Template } from '@/features/chats/ChatTypes.ts';
import { IconIaEnabled } from '@/features/chats/IconIaEnabled.tsx';
import { NewConversation, StartConversation } from '@/features/chats/StartConversation.tsx'
import { toast } from "sonner"

interface ChatSearchInputProps {
  value: string
  onInputChange: (value: string) => void
  onFilterChange: (value: string | null) => void
  onToggleAllAI: (enabled: boolean) => void
}

export function ChatBarHeader({
  value,
  onInputChange,
  onFilterChange,
  onToggleAllAI,
}: ChatSearchInputProps) {
  const [allAIEnabled, setAllAIEnabled] = useState(true)

  const { data: templates } = useQuery({
    queryKey: ['templates'],
    queryFn: async () => {
      const t = await api.get<Template[]>('/templates')
      return t.data
    },
  })

  const handleAIToggle = (checked: boolean) => {
    setAllAIEnabled(checked)
    onToggleAllAI(checked)
  }

  const [activeFilter, setActiveFilter] = useState<string | null>(null)
  const toggleFilter = (platform: string) => {
    setActiveFilter((prev) => (prev === platform ? null : platform))
    onFilterChange(activeFilter === platform ? null : platform)
  }

  const platforms = [
    { name: 'whatsapp', icon: IconBrandWhatsapp, color: 'text-green-500' },
    { name: 'facebook', icon: IconBrandFacebook, color: 'text-blue-500' },
    { name: 'instagram', icon: IconBrandInstagram, color: 'text-pink-500' },
  ]

  const handleOnNewConversation = (data: NewConversation) => {
    console.log(data)
    toast.success("Mensaje enviado")
  }

  return (
    <div className='sticky top-0 z-10 bg-background pb-3 w-full shadow-sm sm:pt-2'>
      <div className='flex items-center justify-between px-3  mb-2'>
        <div className='flex gap-2'>
          <SidebarTrigger variant='outline' />
          <Separator orientation='vertical' className='h-7' />
          <h1 className='text-2xl font-bold'>Chats</h1>
        </div>
        <div className='flex items-center gap-2'>
          <IconIaEnabled
            enabled={allAIEnabled}
            onToggle={handleAIToggle}
            tooltip={allAIEnabled ? 'Desactivar IAs' : 'Activar IAs'}
          />
          {templates && (
            <StartConversation
              templates={templates}
              onSubmit={handleOnNewConversation}
            />
          )}
        </div>
      </div>

      <label className='flex h-8 px-4 mx-4 items-center space-x-0 rounded-md border border-input focus-within:outline-none focus-within:ring-1 focus-within:ring-ring'>
        <IconSearch size={15} className='mr-2 stroke-slate-500' />
        <input
          type='search'
          className='w-full flex-1 bg-inherit text-sm focus-visible:outline-none'
          placeholder='Buscar conversación...'
          value={value}
          onChange={(e) => onInputChange(e.target.value)}
        />
      </label>

      <div className='flex gap-2 px-4 mt-2 mb-2'>
        {platforms.map(({ name, icon: Icon, color }) => (
          <Badge
            key={name}
            variant={activeFilter === name ? 'default' : 'outline'}
            className='cursor-pointer select-none'
            onClick={() => toggleFilter(name)}
          >
            <Icon size={14} className={`mr-1 ${color}`} />
            {name.charAt(0).toUpperCase() + name.slice(1)}
          </Badge>
        ))}
      </div>
    </div>
  )
}
