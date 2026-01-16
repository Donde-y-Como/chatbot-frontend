import { useEffect, useMemo, useRef, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  IconAffiliate,
  IconArrowLeft,
  IconBrandFacebook,
  IconBrandInstagram,
  IconBrandWhatsapp,
  IconChecklist,
  IconUser,
  IconPlus,
  IconRefresh,
  IconEdit,
} from '@tabler/icons-react'
import { Bot, CalendarFold, MoreVertical } from 'lucide-react'
import { toast } from 'sonner'
import { PERMISSIONS } from '@/api/permissions.ts'
import { RenderIfCan } from '@/lib/Can.tsx'
import { cn } from '@/lib/utils.ts'
import { useWebSocket } from '@/hooks/use-web-socket.ts'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { WhatsAppBusinessIcon } from '@/components/ui/whatsAppBusinessIcon.tsx'
import { MakeAppointmentDialog } from '@/features/appointments/components/MakeAppointmentDialog.tsx'
import { chatService } from '@/features/chats/ChatService.ts'
import { ChatMessages } from '@/features/chats/ChatTypes.ts'
import { ConnectClient } from '@/features/chats/ConnectClient.tsx'
import { IconIaEnabled } from '@/features/chats/IconIaEnabled.tsx'
import { useClients } from '@/features/clients/context/clients-context'
import { AddClientFromChats } from '@/features/events/addClientFromChats.tsx'
import { Client } from '../clients/types'

// Declarar la interfaz Window para acceder a openAppointmentDialog
declare global {
  interface Window {
    openAppointmentDialog?: (clientName?: string) => void
  }
}

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
  const { setOpen, setCurrentRow } = useClients()
  const [connectionDialogOpen, setConnectionDialogOpen] = useState(false)
  const [eventDialogOpen, setEventDialogOpen] = useState(false)
  const [appointmentDialogOpen, setAppointmentDialogOpen] = useState(false)
  const [customLimitDialogOpen, setCustomLimitDialogOpen] = useState(false)
  const [customLimitValue, setCustomLimitValue] = useState('')
  const appointmentButtonRef = useRef<HTMLButtonElement>(null)

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
            assistantEnabled: variables.enabled
          }
        }
      )
    },
  })

  const onToggleIA = (enabled: boolean) => {
    toggleIAMutation.mutate({ enabled, conversationId: selectedChatId })
  }

  const setAiLimitMutation = useMutation({
    mutationKey: ['set-ai-limit', selectedChatId],
    mutationFn: async (newLimit: number) => {
      return await chatService.setAiMessageLimit([selectedChatId], newLimit)
    },
    onMutate: async (newLimit) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['chat', selectedChatId] })

      // Snapshot the previous value
      const previousChat = queryClient.getQueryData<ChatMessages>(['chat', selectedChatId])

      // Optimistically update to the new value
      queryClient.setQueryData<ChatMessages>(['chat', selectedChatId], (old) => {
        if (!old) return old
        return {
          ...old,
          aiMessageLimit: newLimit,
        }
      })

      // Return a context object with the snapshotted value
      return { previousChat }
    },
    onError: (_err, _newLimit, context) => {
      // Rollback on error
      if (context?.previousChat) {
        queryClient.setQueryData(['chat', selectedChatId], context.previousChat)
      }
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: ['chat', selectedChatId] })
    },
  })

  const resetAiLimitMutation = useMutation({
    mutationKey: ['reset-ai-limit', selectedChatId],
    mutationFn: async () => {
      return await chatService.resetAiMessageLimit([selectedChatId])
    },
    onMutate: async () => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['chat', selectedChatId] })

      // Snapshot the previous value
      const previousChat = queryClient.getQueryData<ChatMessages>(['chat', selectedChatId])

      // Optimistically update to the new value
      queryClient.setQueryData<ChatMessages>(['chat', selectedChatId], (old) => {
        if (!old) return old
        return {
          ...old,
          aiMessageCount: 0,
        }
      })

      // Return a context object with the snapshotted value
      return { previousChat }
    },
    onError: (_err, _variables, context) => {
      // Rollback on error
      if (context?.previousChat) {
        queryClient.setQueryData(['chat', selectedChatId], context.previousChat)
      }
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: ['chat', selectedChatId] })
    },
  })

  const PlatformIcon = {
    whatsappweb: WhatsAppBusinessIcon,
    whatsapp: IconBrandWhatsapp,
    facebook: IconBrandFacebook,
    instagram: IconBrandInstagram,
  }[chatData.platformName.toLowerCase()]

  const platformId = useMemo(() => {
    const identity = chatData.client.platformIdentities
      .filter((i) => i.platformName === chatData.platformName)
      .at(0)

    if (chatData.platformName === 'whatsapp') {
      const platformId = identity?.platformId
      if (platformId) {
        const lastTenDigits = platformId.slice(-10)
        const countryCode = platformId.slice(0, -10)
        return `+${countryCode} ${lastTenDigits}`
      }
      return platformId
    }

    return identity?.platformId || ''
  }, [chatData])

  const handleConnectionClick = () => {
    setConnectionDialogOpen(true)
  }

  const handleViewClientClick = () => {
    // Open client view dialog with current client data
    setCurrentRow({
      ...chatData.client
    })
    setOpen('view')
  }

  const handleConnectionSuccess = async (linkedClient: Client) => {
    console.log('Successfully linked client:', linkedClient)

    try {
      // Update the conversation in the backend to use the new client
      await chatService.updateConversation(selectedChatId, {
        clientId: linkedClient.id,
      })

      // Update the chat data in cache to use the new linked client
      queryClient.setQueryData<ChatMessages>(
        ['chat', selectedChatId],
        (oldChatData) => {
          if (!oldChatData) return oldChatData

          return {
            ...oldChatData,
            client: linkedClient,
          }
        }
      )
    } catch (error) {
      console.error('Error updating conversation client:', error)
      // The UI will still be updated optimistically, but the backend update failed
      // You might want to show a toast or handle this error differently
    }
  }

  const handleConnectionError = (error: Error) => {
    console.error('Connection error:', error)
    // Additional error handling if needed
  }

  // Función para abrir el diálogo de agendar cita
  const handleAppointmentClick = () => {
    // Abrir directamente el diálogo con el control interno
    setAppointmentDialogOpen(true)
  }

  // Efecto para establecer la función global openAppointmentDialog
  useEffect(() => {
    // Definir la función global para abrir el diálogo desde cualquier parte
    window.openAppointmentDialog = () => {
      // Si se proporciona un nombre de cliente, podríamos usarlo en futuras implementaciones
      setAppointmentDialogOpen(true)
    }

    // Limpiar cuando el componente se desmonte
    return () => {
      window.openAppointmentDialog = undefined
    }
  }, [])

  // Prepare current client data for ConnectClient component
  const currentClientData = useMemo(
    () => ({
      id: chatData.client.id,
      name: chatData.client.name,
      platformName: chatData.platformName,
      platformId: platformId || '',
      platformIdentities: chatData.client.platformIdentities,
    }),
    [chatData.client, chatData.platformName, platformId]
  )

  // Función para abrir el diálogo de agendar evento
  const handleEventClick = () => {
    // Abrir directamente el diálogo de AddClientFromChats
    setEventDialogOpen(true)
  }

  // Función para abrir el diálogo de límite personalizado
  const handleCustomLimitClick = () => {
    setCustomLimitValue(chatData.aiMessageLimit.toString())
    setCustomLimitDialogOpen(true)
  }

  // Función para guardar el límite personalizado
  const handleSaveCustomLimit = () => {
    const newLimit = parseInt(customLimitValue, 10)
    if (isNaN(newLimit) || newLimit < 0) {
      toast.error('Por favor ingresa un número válido')
      return
    }
    setAiLimitMutation.mutate(newLimit)
    setCustomLimitDialogOpen(false)
  }

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
            {chatData.client.photo.length > 0 && (
              <AvatarImage
                src={chatData.client.photo}
                alt={chatData.client.name}
                className='object-cover w-full'
              />
            )}
            <AvatarFallback className='bg-background'>
              {chatData.client.name ? chatData.client.name.at(0) : 'U'}
            </AvatarFallback>
          </Avatar>
          {PlatformIcon && (
            <div className='absolute -bottom-0.5 -right-0.5 rounded-full bg-white p-0.5 shadow-md'>
              <PlatformIcon
                className={cn(
                  'w-3.5 h-3.5',
                  chatData.platformName.toLowerCase() === 'whatsappweb' &&
                  'text-green-700',
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
        <span className='text-sm font-medium lg:text-base  flex flex-col justify-center'>
          {chatData.client.name || <Skeleton className='h-3 w-24' />}
          <small className='opacity-60 '>{platformId}</small>
        </span>
      </div>

      <div className='flex items-center gap-3'>
        {/* IA Toggle - Secondary Action */}
        <div className='hidden sm:flex items-center gap-2'>
          <IconIaEnabled
            bgColor={'bg-background'}
            iconColor={'bg-secondary'}
            enabled={chatData.assistantEnabled}
            onToggle={onToggleIA}
            tooltip={chatData.assistantEnabled ? 'Desactivar IA' : 'Activar IA'}
          />

          {/* AI Message Limit Indicator with Actions */}
          {chatData.assistantEnabled && (
            <DropdownMenu>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <DropdownMenuTrigger asChild>
                      <button
                        className={cn(
                          'px-2 py-1 rounded-md text-xs font-medium transition-all hover:ring-2 hover:ring-offset-1',
                          'disabled:opacity-50 disabled:cursor-not-allowed',
                          chatData.aiMessageCount >= chatData.aiMessageLimit
                            ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 hover:ring-red-300'
                            : chatData.aiMessageCount >= chatData.aiMessageLimit * 0.8
                            ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 hover:ring-amber-300'
                            : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 hover:ring-blue-300'
                        )}
                        disabled={setAiLimitMutation.isPending || resetAiLimitMutation.isPending}
                      >
                        <span className='font-semibold'>{chatData.aiMessageCount}</span>
                        <span className='opacity-60'>/{chatData.aiMessageLimit}</span>
                      </button>
                    </DropdownMenuTrigger>
                  </TooltipTrigger>
                  <TooltipContent
                    side='bottom'
                    className='bg-gray-900 text-white px-3 py-2 rounded-lg text-sm font-medium shadow-lg border border-gray-700'
                    sideOffset={8}
                  >
                    Mensajes IA: {chatData.aiMessageCount} de {chatData.aiMessageLimit} usados
                    {chatData.aiMessageCount >= chatData.aiMessageLimit && (
                      <div className='text-xs text-red-300 mt-1'>Límite alcanzado</div>
                    )}
                    <div className='absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-900 border-l border-t border-gray-700 rotate-45'></div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <DropdownMenuContent align='end' className='w-48'>
                <DropdownMenuLabel>Ajustar límite</DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={() => setAiLimitMutation.mutate(chatData.aiMessageLimit + 5)}
                  disabled={setAiLimitMutation.isPending || resetAiLimitMutation.isPending}
                  className='cursor-pointer'
                >
                  <IconPlus size={16} className='mr-2' />
                  +5 mensajes
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setAiLimitMutation.mutate(chatData.aiMessageLimit + 10)}
                  disabled={setAiLimitMutation.isPending || resetAiLimitMutation.isPending}
                  className='cursor-pointer'
                >
                  <IconPlus size={16} className='mr-2' />
                  +10 mensajes
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setAiLimitMutation.mutate(chatData.aiMessageLimit + 20)}
                  disabled={setAiLimitMutation.isPending || resetAiLimitMutation.isPending}
                  className='cursor-pointer'
                >
                  <IconPlus size={16} className='mr-2' />
                  +20 mensajes
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleCustomLimitClick}
                  disabled={setAiLimitMutation.isPending || resetAiLimitMutation.isPending}
                  className='cursor-pointer'
                >
                  <IconEdit size={16} className='mr-2' />
                  Límite personalizado
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => resetAiLimitMutation.mutate()}
                  disabled={setAiLimitMutation.isPending || resetAiLimitMutation.isPending || chatData.aiMessageCount === 0}
                  className='cursor-pointer text-orange-600 dark:text-orange-400'
                >
                  <IconRefresh size={16} className='mr-2' />
                  Reiniciar contador
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          <RenderIfCan permission={PERMISSIONS.CONVERSATION_UPDATE}>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size='icon'
                    variant='ghost'
                    className='size-8 rounded-full sm:inline-flex lg:size-10'
                    onClick={handleConnectionClick}
                    aria-label='Vincular perfil'
                  >
                    <IconAffiliate
                      size={22}
                      className='stroke-muted-foreground'
                    />
                  </Button>
                </TooltipTrigger>
                <TooltipContent
                  side='bottom'
                  className='bg-[#020817] text-white px-2 py-1 rounded-md text-xs'
                >
                  Vincular Perfil
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            {/* Connect Client Dialog - Now using refactored ConnectClient */}

            <ConnectClient
              isDialog={true}
              open={connectionDialogOpen}
              onOpenChange={setConnectionDialogOpen}
              currentClientData={currentClientData}
              conversationId={selectedChatId}
              onConnectionSuccess={handleConnectionSuccess}
              onConnectionError={handleConnectionError}
              onEmitSocketEvent={emit}
            />
          </RenderIfCan>
        </div>

        {/* Primary Actions Group - Appointments & Events */}
        <div className='hidden sm:flex items-center gap-2 p-1 rounded-lg bg-background/50 border border-border/50'>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size='icon'
                  variant='ghost'
                  className='h-9 w-9 rounded-md hover:bg-purple-50 hover:text-purple-600 transition-all duration-200 group'
                  onClick={handleViewClientClick}
                  aria-label='Ver cliente'
                >
                  <IconUser
                    size={18}
                    className='group-hover:scale-110 transition-transform duration-200'
                  />
                </Button>
              </TooltipTrigger>
              <TooltipContent
                side='bottom'
                className='bg-gray-900 text-white px-3 py-2 rounded-lg text-sm font-medium shadow-lg border border-gray-700 animate-in fade-in-0 zoom-in-95'
                sideOffset={8}
              >
                Ver Cliente
                <div className='absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-900 border-l border-t border-gray-700 rotate-45'></div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <RenderIfCan permission={PERMISSIONS.APPOINTMENT_CREATE}>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    ref={appointmentButtonRef}
                    size='icon'
                    variant='ghost'
                    className='h-9 w-9 rounded-md hover:bg-blue-50 hover:text-blue-600 transition-all duration-200 group'
                    onClick={handleAppointmentClick}
                    aria-label='Agendar cita'
                  >
                    <IconChecklist
                      size={18}
                      className='group-hover:scale-110 transition-transform duration-200'
                    />
                  </Button>
                </TooltipTrigger>
                <TooltipContent
                  side='bottom'
                  className='bg-gray-900 text-white px-3 py-2 rounded-lg text-sm font-medium shadow-lg border border-gray-700 animate-in fade-in-0 zoom-in-95'
                  sideOffset={8}
                >
                  Agendar Cita
                  <div className='absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-900 border-l border-t border-gray-700 rotate-45'></div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </RenderIfCan>

          <RenderIfCan permission={PERMISSIONS.EVENT_CREATE}>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size='icon'
                    variant='ghost'
                    className='h-9 w-9 rounded-md hover:bg-emerald-50 hover:text-emerald-600 transition-all duration-200 group'
                    onClick={handleEventClick}
                    aria-label='Agendar evento'
                  >
                    <CalendarFold
                      size={18}
                      className='group-hover:scale-110 transition-transform duration-200'
                    />
                  </Button>
                </TooltipTrigger>
                <TooltipContent
                  side='bottom'
                  className='bg-gray-900 text-white px-3 py-2 rounded-lg text-sm font-medium shadow-lg border border-gray-700 animate-in fade-in-0 zoom-in-95'
                  sideOffset={8}
                >
                  Agendar Evento
                  <div className='absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-900 border-l border-t border-gray-700 rotate-45'></div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </RenderIfCan>
        </div>

        {/* Mobile actions: collapse into 3-dots menu */}
        <div className='sm:hidden'>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size='icon' variant='ghost' aria-label='Abrir menú de acciones'>
                <MoreVertical className='h-5 w-5' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end' className='w-64'>
              <DropdownMenuLabel>Acciones</DropdownMenuLabel>

              <DropdownMenuItem onClick={handleViewClientClick}>
                <IconUser size={18} />
                Ver cliente
              </DropdownMenuItem>

              <RenderIfCan permission={PERMISSIONS.APPOINTMENT_CREATE}>
                <DropdownMenuItem onClick={handleAppointmentClick}>
                  <IconChecklist size={18} />
                  Agendar cita
                </DropdownMenuItem>
              </RenderIfCan>

              <RenderIfCan permission={PERMISSIONS.EVENT_CREATE}>
                <DropdownMenuItem onClick={handleEventClick}>
                  <CalendarFold className='h-4 w-4' />
                  Agendar evento
                </DropdownMenuItem>
              </RenderIfCan>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                onClick={() => onToggleIA(!chatData.assistantEnabled)}
                disabled={toggleIAMutation.isPending}
              >
                <Bot className='h-4 w-4' />
                {chatData.assistantEnabled ? 'Desactivar IA' : 'Activar IA'}
              </DropdownMenuItem>

              {chatData.assistantEnabled && (
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <Bot className='h-4 w-4' />
                    Mensajes IA
                    <span className='ml-auto text-xs opacity-60'>
                      {chatData.aiMessageCount}/{chatData.aiMessageLimit}
                    </span>
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent className='w-56'>
                    <DropdownMenuLabel>Ajustar límite</DropdownMenuLabel>
                    <DropdownMenuItem
                      onClick={() => setAiLimitMutation.mutate(chatData.aiMessageLimit + 5)}
                      disabled={setAiLimitMutation.isPending || resetAiLimitMutation.isPending}
                    >
                      <IconPlus size={16} />
                      +5 mensajes
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setAiLimitMutation.mutate(chatData.aiMessageLimit + 10)}
                      disabled={setAiLimitMutation.isPending || resetAiLimitMutation.isPending}
                    >
                      <IconPlus size={16} />
                      +10 mensajes
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setAiLimitMutation.mutate(chatData.aiMessageLimit + 20)}
                      disabled={setAiLimitMutation.isPending || resetAiLimitMutation.isPending}
                    >
                      <IconPlus size={16} />
                      +20 mensajes
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={handleCustomLimitClick}
                      disabled={setAiLimitMutation.isPending || resetAiLimitMutation.isPending}
                    >
                      <IconEdit size={16} />
                      Límite personalizado
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => resetAiLimitMutation.mutate()}
                      disabled={
                        setAiLimitMutation.isPending ||
                        resetAiLimitMutation.isPending ||
                        chatData.aiMessageCount === 0
                      }
                      className='text-orange-600 dark:text-orange-400'
                    >
                      <IconRefresh size={16} />
                      Reiniciar contador
                    </DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
              )}

              <RenderIfCan permission={PERMISSIONS.CONVERSATION_UPDATE}>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleConnectionClick}>
                  <IconAffiliate size={18} />
                  Vincular perfil
                </DropdownMenuItem>
              </RenderIfCan>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Dialogs */}
        <RenderIfCan permission={PERMISSIONS.EVENT_CREATE}>
          {eventDialogOpen && (
            <AddClientFromChats
              key='event-dialog'
              open={eventDialogOpen}
              onClose={() => setEventDialogOpen(false)}
              preselectedClientId={chatData.client?.id || ''}
              title='Agendar Cliente en Evento'
            />
          )}
        </RenderIfCan>

        <RenderIfCan permission={PERMISSIONS.APPOINTMENT_CREATE}>
          <MakeAppointmentDialog
            defaultOpen={appointmentDialogOpen}
            onOpenChange={setAppointmentDialogOpen}
            defaultClientName={chatData.client.id}
          />
        </RenderIfCan>

        {/* Custom AI Message Limit Dialog */}
        <Dialog open={customLimitDialogOpen} onOpenChange={setCustomLimitDialogOpen}>
          <DialogContent className='sm:max-w-md'>
            <DialogHeader>
              <DialogTitle>Establecer límite personalizado</DialogTitle>
              <DialogDescription>
                Ingresa el nuevo límite de mensajes IA para esta conversación.
                Límite actual: {chatData.aiMessageLimit} mensajes
              </DialogDescription>
            </DialogHeader>
            <div className='grid gap-4 py-4'>
              <div className='grid gap-2'>
                <Label htmlFor='custom-limit'>Nuevo límite</Label>
                <Input
                  id='custom-limit'
                  type='number'
                  min='0'
                  value={customLimitValue}
                  onChange={(e) => setCustomLimitValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSaveCustomLimit()
                    }
                  }}
                  placeholder='Ej: 50'
                  autoFocus
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant='outline'
                onClick={() => setCustomLimitDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSaveCustomLimit}
                disabled={setAiLimitMutation.isPending}
              >
                Guardar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

export function ConversationHeaderSkeleton() {
  // No es necesario incluir la navegación en el skeleton
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

      <div className='flex items-center gap-3'>
        {/* IA Toggle Skeleton */}
        <Skeleton className='h-8 w-8 rounded-full' />

        {/* Primary Actions Group Skeleton */}
        <div className='flex items-center gap-2 p-1 rounded-lg bg-background/50 border border-border/50'>
          <Skeleton className='h-9 w-9 rounded-md' />
          <Skeleton className='h-9 w-9 rounded-md' />
        </div>

        {/* More Options Skeleton */}
        <Skeleton className='h-9 w-6 rounded-md' />
      </div>
    </div>
  )
}
