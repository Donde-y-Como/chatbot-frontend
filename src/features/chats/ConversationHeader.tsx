import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ChatMessages } from '@/features/chats/ChatTypes.ts'
import { IconIaEnabled } from '@/features/chats/IconIaEnabled.tsx'
import { useWebSocket } from '@/hooks/use-web-socket.ts'
import { cn } from '@/lib/utils.ts'
import {
  IconArrowLeft,
  IconBrandFacebook,
  IconBrandInstagram,
  IconBrandWhatsapp,
  IconDotsVertical,
  IconPhone,
} from '@tabler/icons-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { IconChecklist } from '@tabler/icons-react'
import { CalendarFold } from 'lucide-react'
import * as Tooltip from '@radix-ui/react-tooltip';
import { MakeAppointmentDialog } from '@/features/appointments/components/MakeAppointmentDialog.tsx'
import { AddClientFromChats } from '@/features/events/addClientFromChats.tsx'
import { useNavigate } from '@tanstack/react-router'

// Declarar la interfaz Window para acceder a openAppointmentDialog
declare global {
  interface Window {
    openAppointmentDialog?: (clientName?: string) => void;
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

  const platformId = useMemo(() => {
    const identity = chatData.client.platformIdentities.filter(i => i.platformName === chatData.platformName).at(0)

    if(chatData.platformName === 'whatsapp') {
      const platformId = identity?.platformId;
      if (platformId) {
        const lastTenDigits = platformId.slice(-10);
        const countryCode = platformId.slice(0, -10);
        return `+${countryCode} ${lastTenDigits}`;
      }
      return platformId;
    }

    return identity?.platformId || ''
  }, [chatData])

  // Función para abrir el diálogo de agendar cita
  const handleAppointmentClick = () => {
    // Utilizamos la función global para abrir el diálogo con el nombre del cliente
    if (typeof window !== 'undefined' && window.openAppointmentDialog && chatData.client.name) {
      window.openAppointmentDialog(chatData.client.name);
    } else if (window.openAppointmentDialog) {
      window.openAppointmentDialog(); // Abrimos el diálogo sin nombre de cliente si no hay
    }
  }

  // Función para abrir el diálogo de agendar evento
  const handleEventClick = () => {
    // Abrir directamente el diálogo de AddClientFromChats
    setEventDialogOpen(true);
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
            {chatData.client.photo.length > 0 && <AvatarImage src={chatData.client.photo} alt={chatData.client.name} className="object-cover w-full" />}
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
        <span className='text-sm font-medium lg:text-base  flex flex-col justify-center'>
          {chatData.client.name || <Skeleton className='h-3 w-24' />}
          <small className='opacity-60'>{platformId}</small>
        </span>
      </div>

      <div className='-mr-1 flex items-center gap-1 lg:gap-2'>
        <IconIaEnabled
          bgColor={"bg-background"}
          iconColor={"bg-secondary"}
          enabled={chatData.thread.enabled}
          onToggle={onToggleIA}
          tooltip={chatData.thread.enabled ? 'Desactivar IA' : 'Activar IA'}
        />

        {/* Componente AddClientFromChats para agendar eventos - renderiza condicionalmente */}
        {eventDialogOpen && (
          <AddClientFromChats 
            key="event-dialog"
            open={eventDialogOpen}
            onClose={() => setEventDialogOpen(false)}
            preselectedClientId={chatData.client?.id || ''}
            title="Agendar Cliente en Evento" /* Agregar título para evitar advertencia de accesibilidad */
          />
        )}

        <Tooltip.Provider>
          <Tooltip.Root>
            <Tooltip.Trigger asChild>
              <Button
                size='icon'
                variant='ghost'
                className='size-8 rounded-full sm:inline-flex lg:size-10'
                onClick={handleAppointmentClick}
              >
                <IconChecklist size={22} className='stroke-muted-foreground' />
              </Button>
            </Tooltip.Trigger>
            <Tooltip.Content side="bottom" className="bg-[#020817] text-white px-2 py-1 rounded-md text-xs">
              Agendar Cita
            </Tooltip.Content>
          </Tooltip.Root>
        </Tooltip.Provider>

        {/* Componente MakeAppointmentDialog (oculto) */}
        <div className="hidden">
          <MakeAppointmentDialog />
        </div>

        <Tooltip.Provider>
          <Tooltip.Root>
            <Tooltip.Trigger asChild>
              <Button
                size='icon'
                variant='ghost'
                className='size-8 rounded-full sm:inline-flex lg:size-10'
                onClick={handleEventClick}
              >
                <CalendarFold size={22} className='stroke-muted-foreground' />
              </Button>
            </Tooltip.Trigger>
            <Tooltip.Content side="bottom" className="bg-[#020817] text-white px-2 py-1 rounded-md text-xs">
              Agendar a Evento
            </Tooltip.Content>
          </Tooltip.Root>
        </Tooltip.Provider>

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

      <div className='-mr-1 flex items-center gap-1 lg:gap-2'>
        <Button
          size='icon'
          variant='ghost'
          className='size-8 rounded-full sm:inline-flex lg:size-10'
        >
          <IconChecklist size={22} className='stroke-muted-foreground' />
        </Button>

        {/* Botón Calendar Fold */}
        <Button
          size='icon'
          variant='ghost'
          className='size-8 rounded-full sm:inline-flex lg:size-10'
        >
          <CalendarFold size={22} className='stroke-muted-foreground' />
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