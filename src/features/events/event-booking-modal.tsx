import * as React from 'react'
import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { AlertCircle, Loader2, Search, X } from 'lucide-react'
import moment from 'moment-timezone'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useGetClients } from '@/features/appointments/hooks/useGetClients.ts'
import { Client } from '@/features/chats/ChatTypes.ts'
import { useCheckEventAvailability } from '@/features/events/hooks/useCheckEventAvailability'
import { useGetEventWithBookings } from '@/features/events/hooks/useGetEventWithBookings'

function getInitials(name: string) {
  return name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function getClientsByIds(
  clients: Client[] | undefined,
  ids: string[]
): Client[] {
  if (!clients) return []
  return clients.filter((client) => ids.includes(client.id))
}

export function EventBookingModal({
  eventId,
  open,
  onClose,
  onSave,
}: {
  eventId: string
  open: boolean
  onClose: () => void
  onSave: (clientIds: string[], date: Date) => void
}) {
  const { data: event, isLoading: isEventLoading } =
    useGetEventWithBookings(eventId)
  const { data: clients, isLoading: isClientsLoading } = useGetClients()
  const [selectedDate, setSelectedDate] = useState<Date | null>(() => {
    return event
      ? moment.tz(event.duration.startAt, 'America/Mexico_Ci1ty').toDate()
      : null
  })

  useEffect(() => {
    if(event) {
      const date = moment.tz(event.duration.startAt, 'America/Mexico_City').toDate()
      setSelectedDate(date)
    }
  }, [event])

  const { data: availability, isLoading: isAvailabilityLoading } =
    useCheckEventAvailability(eventId, selectedDate)
  const [selectedClientIds, setSelectedClientIds] = useState<string[]>([])
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (event && selectedDate) {
      const dateBookings = event.bookings.filter((booking) => {
        return booking.date === selectedDate.getTime()
      })
      setSelectedClientIds(dateBookings.map((booking) => booking.clientId))
    }
  }, [event, selectedDate])

  const handleAddClient = (clientId: string) => {
    if (selectedClientIds.includes(clientId)) return

    const remainingSpots = availability?.remainingSpots ?? null
    if (remainingSpots !== null && remainingSpots <= 0) {
      setError('No hay lugares disponibles para más clientes.')
      return
    }

    setSelectedClientIds((prev) => [...prev, clientId])
    setSearchOpen(false)
    setSearchQuery('')
  }

  const handleRemoveClient = (clientId: string) => {
    setSelectedClientIds((prev) => prev.filter((id) => id !== clientId))
  }

  const filteredClients = React.useMemo(() => {
    if (!clients) return []
    return clients.filter(
      (client) =>
        client.profileName.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !selectedClientIds.includes(client.id)
    )
  }, [clients, searchQuery, selectedClientIds])

  const selectedClients = getClientsByIds(clients, selectedClientIds)

  const saveAndClose = () => {
    const newClientIds = selectedClientIds.filter(
      (clientId) =>
        !event?.bookings.find((booking) => booking.clientId === clientId)
    )
    if (selectedDate) onSave(newClientIds, selectedDate)
    onClose()
  }

  if (isEventLoading || isClientsLoading) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className='sm:max-w-[600px]'>
          <div className='flex justify-center items-center h-40'>
            <Loader2 className='h-8 w-8 animate-spin' />
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className='sm:max-w-[600px]'>
        <DialogHeader>
          <DialogTitle>Agregar invitados</DialogTitle>
          <DialogDescription>
            {selectedDate && format(selectedDate, "EEEE d 'de' MMMM, yyyy", { locale: es })}
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-4'>
          <Popover open={searchOpen} onOpenChange={setSearchOpen}>
            <PopoverTrigger asChild>
              <Button
                variant='outline'
                role='combobox'
                aria-expanded={searchOpen}
                className='w-full justify-between'
              >
                <Search className='mr-2 h-4 w-4' />
                Buscar clientes...
              </Button>
            </PopoverTrigger>
            <PopoverContent className='w-full p-0'>
              <Command>
                <CommandInput
                  placeholder='Buscar por nombre...'
                  value={searchQuery}
                  onValueChange={setSearchQuery}
                />
                <CommandList>
                  <CommandEmpty>No se encontraron clientes.</CommandEmpty>
                  <CommandGroup>
                    {filteredClients.map((client) => (
                      <CommandItem
                        key={client.id}
                        onSelect={() => handleAddClient(client.id)}
                        className='flex items-center gap-2'
                      >
                        <Avatar className='h-8 w-8'>
                          <AvatarFallback>
                            {getInitials(client.profileName)}
                          </AvatarFallback>
                        </Avatar>
                        <span>{client.profileName}</span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>

          <ScrollArea className='h-[200px]'>
            <div className='flex flex-wrap gap-2'>
              {selectedClients.map((client) => (
                <div
                  key={client.id}
                  className='flex items-center gap-2 bg-secondary p-2 rounded-full'
                >
                  <Avatar className='h-8 w-8'>
                    <AvatarFallback>
                      {getInitials(client.profileName)}
                    </AvatarFallback>
                  </Avatar>
                  <span className='text-sm font-medium'>
                    {client.profileName}
                  </span>
                  <Button
                    variant='ghost'
                    size='sm'
                    className='h-6 w-6 p-0 rounded-full'
                    onClick={() => handleRemoveClient(client.id)}
                  >
                    <X className='h-4 w-4' />
                  </Button>
                </div>
              ))}
            </div>
          </ScrollArea>

          {availability && (
            <div className='text-sm text-muted-foreground'>
              Lugares disponibles: {availability.remainingSpots ?? 'Ilimitados'}
            </div>
          )}

          {error && (
            <Alert variant='destructive'>
              <AlertCircle className='h-4 w-4' />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button variant='outline' onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={saveAndClose} disabled={isAvailabilityLoading}>
            {isAvailabilityLoading ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                Verificando...
              </>
            ) : (
              'Guardar Cambios'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
