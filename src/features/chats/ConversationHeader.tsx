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
} from '@tabler/icons-react'
import { CalendarFold } from 'lucide-react'
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
      id: chatData.client.id,
      businessId: chatData.client.businessId,
      name: chatData.client.name,
      platformIdentities: chatData.client.platformIdentities,
      tagIds: chatData.client.tagIds,
      annexes: chatData.client.annexes,
      photo: chatData.client.photo,
      notes: chatData.client.notes,
      email: chatData.client.email,
      address: chatData.client.address,
      birthdate: chatData.client.birthdate,
      createdAt: chatData.client.createdAt,
      updatedAt: chatData.client.updatedAt,
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
        <div className='flex items-center'>
          <IconIaEnabled
            bgColor={'bg-background'}
            iconColor={'bg-secondary'}
            enabled={chatData.thread.enabled}
            onToggle={onToggleIA}
            tooltip={chatData.thread.enabled ? 'Desactivar IA' : 'Activar IA'}
          />

          <RenderIfCan permission={PERMISSIONS.CONVERSATION_UPDATE}>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size='icon'
                    variant='ghost'
                    className='size-8 rounded-full sm:inline-flex lg:size-10'
                    onClick={handleConnectionClick}
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
        <div className='flex items-center gap-2 p-1 rounded-lg bg-background/50 border border-border/50'>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size='sm'
                  variant='ghost'
                  className='h-9 w-9 rounded-md hover:bg-purple-50 hover:text-purple-600 transition-all duration-200 group'
                  onClick={handleViewClientClick}
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
                    size='sm'
                    variant='ghost'
                    className='h-9 w-9 rounded-md hover:bg-blue-50 hover:text-blue-600 transition-all duration-200 group'
                    onClick={handleAppointmentClick}
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
                    size='sm'
                    variant='ghost'
                    className='h-9 w-9 rounded-md hover:bg-emerald-50 hover:text-emerald-600 transition-all duration-200 group'
                    onClick={handleEventClick}
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
