import { useMemo, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  IconBrandFacebook,
  IconBrandInstagram,
  IconBrandWhatsapp,
  IconRefresh,
  IconSearch,
  IconPlus,
  IconX,
} from '@tabler/icons-react'
import { CheckCheckIcon, TagIcon } from 'lucide-react'
import { toast } from 'sonner'
import { api } from '@/api/axiosInstance.ts'
import { PERMISSIONS } from '@/api/permissions.ts'
import { RenderIfCan } from '@/lib/Can.tsx'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Separator } from '@/components/ui/separator'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { WhatsAppBusinessIcon } from '@/components/ui/whatsAppBusinessIcon.tsx'
import { chatService } from '@/features/chats/ChatService.ts'
import { IconIaEnabled } from '@/features/chats/IconIaEnabled.tsx'
import {
  NewConversation,
  StartConversation,
} from '@/features/chats/StartConversation.tsx'
import { useGetTemplates } from '@/features/clients/hooks/useGetTemplates.ts'
import { useWhatsApp } from '@/features/settings/whatsappWeb/useWhatsApp'
import { useGetTags } from '../clients/hooks/useGetTags'
import { AddTagButton } from './AddTagButton'

interface ChatSearchInputProps {
  value: string
  onInputChange: (value: string) => void
  onFilterChange: (value: string | null) => void
  onToggleAllAI: (enabled: boolean) => void
  onRefresh?: () => void
  AIEnabled: boolean
  selectedChatIds?: string[]
  onClearSelection?: () => void
}

export const UNREAD_LABEL_FILTER = 'No leídos'

export function ChatBarHeader({
  AIEnabled,
  value,
  onInputChange,
  onFilterChange,
  onToggleAllAI,
  onRefresh,
  selectedChatIds = [],
  onClearSelection,
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
      await queryClient.invalidateQueries({ queryKey: ['chats'] })
    },
  })

  const bulkIncreaseAiLimitMutation = useMutation({
    mutationKey: ['bulk-increase-ai-limit'],
    mutationFn: async (amount: number) => {
      return await chatService.increaseAiMessageLimit(selectedChatIds, amount)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chats'] })
      toast.success(`Límite aumentado en ${selectedChatIds.length} conversaciones`)
      onClearSelection?.()
    },
    onError: () => {
      toast.error('Error al aumentar el límite')
    },
  })

  const bulkResetAiLimitMutation = useMutation({
    mutationKey: ['bulk-reset-ai-limit'],
    mutationFn: async () => {
      return await chatService.resetAiMessageLimit(selectedChatIds)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chats'] })
      toast.success(`Contador reiniciado en ${selectedChatIds.length} conversaciones`)
      onClearSelection?.()
    },
    onError: () => {
      toast.error('Error al reiniciar el contador')
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
      {
        name: 'whatsappweb',
        label: 'WhatsApp Web',
        icon: WhatsAppBusinessIcon,
        color: 'text-green-700',
      },
      {
        name: 'whatsapp',
        label: 'WhatsApp',
        icon: IconBrandWhatsapp,
        color: 'text-green-500',
      },
      {
        name: 'facebook',
        label: 'Facebook',
        icon: IconBrandFacebook,
        color: 'text-blue-500',
      },
      {
        name: 'instagram',
        label: 'Instagram',
        icon: IconBrandInstagram,
        color: 'text-pink-500',
      },
    ]

    const unread = {
      name: UNREAD_LABEL_FILTER,
      label: UNREAD_LABEL_FILTER,
      icon: CheckCheckIcon,
      color: 'text-foreground',
    }

    if (!tags || isTagsLoading) {
      return [...metaPlatforms, unread]
    }

    const tagPlatforms = tags.map((tag) => ({
      name: tag.name,
      label: tag.name,
      icon: TagIcon,
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
  const { isConnected: isWhatsAppWebConnected } = useWhatsApp()

  const isLoadingBulkActions = bulkIncreaseAiLimitMutation.isPending || bulkResetAiLimitMutation.isPending

  return (
    <div className='sticky top-0 z-10 bg-background pb-3 w-full shadow-sm sm:pt-2'>
      <div className='flex items-center justify-between px-3  mb-2'>
        <div className='flex gap-2'>
          <SidebarTrigger variant='outline' className='' />
          <Separator orientation='vertical' className='h-7 ' />
          <h1 className='text-2xl font-bold'>Chats</h1>
        </div>
        <div className='flex items-center gap-2'>
          {selectedChatIds.length > 0 && (
            <>
              <div className='flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-900/30'>
                <span className='text-xs font-medium text-blue-700 dark:text-blue-400'>
                  {selectedChatIds.length}
                </span>
                <Button
                  variant='ghost'
                  size='icon'
                  className='h-4 w-4 hover:bg-blue-200 dark:hover:bg-blue-800'
                  onClick={onClearSelection}
                >
                  <IconX size={12} />
                </Button>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant='default'
                    size='sm'
                    disabled={isLoadingBulkActions}
                    className='h-7 px-2 text-xs'
                  >
                    <IconPlus size={14} className='mr-1' />
                    IA
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align='end' className='w-48'>
                  <DropdownMenuItem
                    onClick={() => bulkIncreaseAiLimitMutation.mutate(10)}
                    disabled={isLoadingBulkActions}
                    className='cursor-pointer'
                  >
                    <IconPlus size={16} className='mr-2' />
                    Aumentar +10
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => bulkIncreaseAiLimitMutation.mutate(50)}
                    disabled={isLoadingBulkActions}
                    className='cursor-pointer'
                  >
                    <IconPlus size={16} className='mr-2' />
                    Aumentar +50
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => bulkIncreaseAiLimitMutation.mutate(100)}
                    disabled={isLoadingBulkActions}
                    className='cursor-pointer'
                  >
                    <IconPlus size={16} className='mr-2' />
                    Aumentar +100
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => bulkResetAiLimitMutation.mutate()}
                    disabled={isLoadingBulkActions}
                    className='cursor-pointer text-orange-600 dark:text-orange-400'
                  >
                    <IconRefresh size={16} className='mr-2' />
                    Reiniciar contador
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Separator orientation='vertical' className='h-7' />
            </>
          )}
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
              color={isWhatsAppWebConnected ? 'green' : 'red'}
              title={
                isWhatsAppWebConnected
                  ? 'Whatsapp Web Conectado'
                  : 'Whatsapp Web Desconectado'
              }
            />
            <span className='absolute right-full bottom-0 scale-0 rounded bg-popover p-2 text-xs text-popover-foreground group-hover:scale-100 whitespace-nowrap shadow-md'>
              {isWhatsAppWebConnected
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
          <RenderIfCan permission={PERMISSIONS.CONVERSATION_CREATE}>
            {templates && (
              <StartConversation
                templates={templates}
                onSubmit={handleOnNewConversation}
              />
            )}
          </RenderIfCan>
        </div>
      </div>

      <label className='flex h-8 px-4 mx-4 items-center space-x-0 rounded-md border border-input focus-within:outline-none focus-within:ring-1 focus-within:ring-ring'>
        <IconSearch size={15} className='mr-2 stroke-slate-500' />
        <input
          type='search'
          className='w-full flex-1 bg-inherit text-sm focus-visible:outline-none'
          placeholder='Buscar por nombre o teléfono...'
          value={value}
          onChange={(e) => onInputChange(e.target.value)}
        />
      </label>

      <div
        className='mx-4 flex gap-2 my-2 overflow-x-auto overflow-y-hidden whitespace-nowrap pb-1 filters-scrollbar'
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor:
            'hsl(var(--muted-foreground) / 0.3) hsl(var(--muted))',
        }}
      >
        <RenderIfCan permission={PERMISSIONS.TAG_CREATE}>
          <AddTagButton withLabel />
        </RenderIfCan>
        {platforms.map(({ name, label, icon: Icon, color }) => (
          <Badge
            key={name}
            variant={activeFilter === name ? 'default' : 'outline'}
            className='cursor-pointer select-none'
            onClick={() => toggleFilter(name)}
          >
            {Icon && <Icon className={`w-3.5 h-3.5 mr-1 ${color}`} />}
            {label}
          </Badge>
        ))}
      </div>
    </div>
  )
}
