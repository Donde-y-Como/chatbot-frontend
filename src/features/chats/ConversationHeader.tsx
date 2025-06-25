import { useMemo, useState, useRef, useEffect } from 'react'
import * as Tooltip from '@radix-ui/react-tooltip'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  IconArrowLeft,
  IconBrandFacebook,
  IconBrandInstagram,
  IconBrandWhatsapp,
  IconChecklist,
  IconDotsVertical,
} from '@tabler/icons-react'
import { CalendarFold } from 'lucide-react'
import { cn } from '@/lib/utils.ts'
import { useWebSocket } from '@/hooks/use-web-socket.ts'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { MakeAppointmentDialog } from '@/features/appointments/components/MakeAppointmentDialog.tsx'
import { ChatMessages } from '@/features/chats/ChatTypes.ts'
import { IconIaEnabled } from '@/features/chats/IconIaEnabled.tsx'
import { AddClientFromChats } from '@/features/events/addClientFromChats.tsx'
import { WhatsAppBusinessIcon } from '@/components/ui/whatsAppBusinessIcon.tsx'

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

  // Función para abrir el diálogo de agendar cita
  const handleAppointmentClick = () => {
    // Abrir directamente el diálogo con el control interno
    setAppointmentDialogOpen(true)
  }
  
  // Efecto para establecer la función global openAppointmentDialog
  useEffect(() => {
    // Definir la función global para abrir el diálogo desde cualquier parte
    window.openAppointmentDialog = (clientName?: string) => {
      // Si se proporciona un nombre de cliente, podríamos usarlo en futuras implementaciones
      setAppointmentDialogOpen(true)
    }
    
    // Limpiar cuando el componente se desmonte
    return () => {
      window.openAppointmentDialog = undefined
    }
  }, [])

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
              {chatData.client.name[0]}
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
          <small className='opacity-60'>{platformId}</small>
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
        </div>

        {/* Primary Actions Group - Appointments & Events */}
        <div className='flex items-center gap-2 p-1 rounded-lg bg-background/50 border border-border/50'>
          <Tooltip.Provider>
            <Tooltip.Root>
              <Tooltip.Trigger asChild>
                <Button
                  ref={appointmentButtonRef}
                  size='sm'
                  variant='ghost'
                  className='h-9 w-9 rounded-md hover:bg-blue-50 hover:text-blue-600 transition-all duration-200 group'
                  onClick={handleAppointmentClick}
                >
                  <IconChecklist size={18} className='group-hover:scale-110 transition-transform duration-200' />
                </Button>
              </Tooltip.Trigger>
              <Tooltip.Content
                side='bottom'
                className='bg-gray-900 text-white px-3 py-2 rounded-lg text-sm font-medium shadow-lg border border-gray-700 animate-in fade-in-0 zoom-in-95'
                sideOffset={8}
              >
                Agendar Cita
                <div className='absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-900 border-l border-t border-gray-700 rotate-45'></div>
              </Tooltip.Content>
            </Tooltip.Root>
          </Tooltip.Provider>

          <Tooltip.Provider>
            <Tooltip.Root>
              <Tooltip.Trigger asChild>
                <Button
                  size='sm'
                  variant='ghost'
                  className='h-9 w-9 rounded-md hover:bg-emerald-50 hover:text-emerald-600 transition-all duration-200 group'
                  onClick={handleEventClick}
                >
                  <CalendarFold size={18} className='group-hover:scale-110 transition-transform duration-200' />
                </Button>
              </Tooltip.Trigger>
              <Tooltip.Content
                side='bottom'
                className='bg-gray-900 text-white px-3 py-2 rounded-lg text-sm font-medium shadow-lg border border-gray-700 animate-in fade-in-0 zoom-in-95'
                sideOffset={8}
              >
                Agendar Evento
                <div className='absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-900 border-l border-t border-gray-700 rotate-45'></div>
              </Tooltip.Content>
            </Tooltip.Root>
          </Tooltip.Provider>
        </div>

        {/* Secondary Action - More Options */}
        <Tooltip.Provider>
          <Tooltip.Root>
            <Tooltip.Trigger asChild>
              <Button
                size='sm'
                variant='ghost'
                className='h-9 w-6 rounded-md hover:bg-gray-100 transition-colors duration-200'
              >
                <IconDotsVertical size={16} className='text-muted-foreground' />
              </Button>
            </Tooltip.Trigger>
            <Tooltip.Content
              side='bottom'
              className='bg-gray-900 text-white px-3 py-2 rounded-lg text-sm font-medium shadow-lg border border-gray-700 animate-in fade-in-0 zoom-in-95'
              sideOffset={8}
            >
              Más opciones
              <div className='absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-900 border-l border-t border-gray-700 rotate-45'></div>
            </Tooltip.Content>
          </Tooltip.Root>
        </Tooltip.Provider>

        {/* Dialogs */}
        {eventDialogOpen && (
          <AddClientFromChats
            key='event-dialog'
            open={eventDialogOpen}
            onClose={() => setEventDialogOpen(false)}
            preselectedClientId={chatData.client?.id || ''}
            title='Agendar Cliente en Evento'
          />
        )}

        <MakeAppointmentDialog 
          defaultOpen={appointmentDialogOpen}
          onOpenChange={setAppointmentDialogOpen}
          defaultClientName={chatData.client.name}
        />
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