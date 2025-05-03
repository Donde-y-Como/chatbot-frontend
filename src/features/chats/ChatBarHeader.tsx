import React, { useMemo, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  IconBrandFacebook,
  IconBrandInstagram,
  IconBrandWhatsapp,
  IconRefresh,
  IconSearch,
} from '@tabler/icons-react'
import { CheckCheckIcon } from 'lucide-react'
import { toast } from 'sonner'
import { api } from '@/api/axiosInstance.ts'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { IconIaEnabled } from '@/features/chats/IconIaEnabled.tsx'
import {
  NewConversation,
  StartConversation,
} from '@/features/chats/StartConversation.tsx'
import { useGetTemplates } from '@/features/clients/hooks/useGetTemplates.ts'
import { useGetWhatsAppWebSession } from '@/features/settings/whatsappWeb/useGetWhatsAppWebSession.ts'
import { useGetTags } from '../clients/hooks/useGetTags'
import { AddTagButton } from './AddTagButton'

interface ChatSearchInputProps {
  value: string
  onInputChange: (value: string) => void
  onFilterChange: (value: string | null) => void
  onToggleAllAI: (enabled: boolean) => void
  onRefresh?: () => void
  AIEnabled: boolean
}

export const UNREAD_LABEL_FILTER = 'No leídos'

export function ChatBarHeader({
  AIEnabled,
  value,
  onInputChange,
  onFilterChange,
  onToggleAllAI,
  onRefresh,
}: ChatSearchInputProps) {
  const [allAIEnabled, setAllAIEnabled] = useState(AIEnabled)
  const { data: tags, isLoading: isTagsLoading } = useGetTags()
  const queryClient = useQueryClient()
  const { data: templates } = useGetTemplates()

  const startConversationMutation = useMutation({
    mutationKey: ['start-conversation'],
    async mutationFn(data: NewConversation) {
      const response = await api.post('/chats', data)
      return response.data
    },
    onSuccess: async () => {
      setTimeout(async () => {
        await queryClient.invalidateQueries({ queryKey: ['chats'] })
      }, 1000)
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

  const platforms = useMemo(() => {
    const metaPlatforms = [
      { name: 'whatsapp', icon: IconBrandWhatsapp, color: 'text-green-500' },
      { name: 'facebook', icon: IconBrandFacebook, color: 'text-blue-500' },
      { name: 'instagram', icon: IconBrandInstagram, color: 'text-pink-500' },
    ]

    const unread = {
      name: UNREAD_LABEL_FILTER,
      icon: CheckCheckIcon,
      color: 'text-foreground',
    }

    if (!tags || isTagsLoading) {
      return [...metaPlatforms, unread]
    }

    const tagPlatforms = tags.map((tag) => ({
      name: tag.name,
      icon: null,
      color: 'text-foreground',
    }))

    return [...metaPlatforms, unread, ...tagPlatforms]
  }, [isTagsLoading, tags])

  const handleOnNewConversation = (data: NewConversation) => {
    startConversationMutation.mutate(data)
    toast.success('Mensaje enviado')
  }

  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh()
      toast.success('Chats actualizados')
    }
  }
  const { data: whatsAppWebData } = useGetWhatsAppWebSession()

  const isWhatsAppWebConnected = useMemo(async () => {
    if (!whatsAppWebData) {
      return false
    }

    return whatsAppWebData.data.status === 'connected'
  }, [whatsAppWebData])

  return (
    <div className='sticky top-0 z-10 bg-background pb-3 w-full shadow-sm sm:pt-2'>
      <div className='flex items-center justify-between px-3  mb-2'>
        <div className='flex gap-2'>
          <SidebarTrigger variant='outline' className='sm:hidden' />
          <Separator orientation='vertical' className='h-7 sm:hidden' />
          <h1 className='text-2xl font-bold'>Chats</h1>
        </div>
        <div className='flex items-center gap-2'>
          {onRefresh && (
            <Button
              variant='ghost'
              size='icon'
              onClick={handleRefresh}
              title='Refrescar chats'
              className='h-8 w-8'
            >
              <IconRefresh size={18} />
            </Button>
          )}

          <div className='group relative'>
            <IconBrandWhatsapp
              color={whatsAppWebData ? 'green' : 'red'}
              title={
                whatsAppWebData
                  ? 'Whatsapp Web Conectado'
                  : 'Whatsapp Web Desconectado'
              }
            />
            <span className='absolute right-full bottom-0 scale-0 rounded bg-popover p-2 text-xs text-popover-foreground group-hover:scale-100 whitespace-nowrap shadow-md'>
              {whatsAppWebData
                ? 'Whatsapp Web Conectado'
                : 'Whatsapp Web Desconectado'}
            </span>
          </div>
          <IconIaEnabled
            bgColor={'bg-secondary'}
            iconColor={'bg-background'}
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

      <div
        className='mx-4 flex gap-2 my-2 overflow-x-auto overflow-y-hidden whitespace-nowrap no-scrollbar'
        style={{
          maskImage:
            'linear-gradient(to right, transparent, black 10px, black calc(100% - 10px), transparent)',
        }}
      >
        {platforms.map(({ name, icon: Icon, color }) => (
          <Badge
            key={name}
            variant={activeFilter === name ? 'default' : 'outline'}
            className='cursor-pointer select-none'
            onClick={() => toggleFilter(name)}
          >
            {Icon && <Icon size={14} className={`mr-1 ${color}`} />}
            {name.charAt(0).toUpperCase() + name.slice(1)}
          </Badge>
        ))}
        <AddTagButton />
      </div>
    </div>
  )
}
