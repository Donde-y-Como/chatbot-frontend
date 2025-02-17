import * as React from 'react'
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useGetEventWithBookings } from '@/features/events/hooks/useGetEventWithBookings.ts'
import { Booking } from '@/features/events/types.ts'

export function EventBookingModal({
  eventId,
  open,
  onClose,
  onSave,
}: {
  eventId: string
  open: boolean
  onClose: () => void
  onSave: (clientIds: string[]) => void
}) {
  const { data: event, isLoading } = useGetEventWithBookings(eventId)
  const [clientIds, setClientIds] = React.useState<string[]>([])

  useEffect(() => {
    setClientIds(
      event?.bookings.map((booking: Booking) => booking.clientId) ?? []
    )
  }, [event])

  if (isLoading) return <div>Cargando...</div>

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className='sm:max-w-[600px]'>
        <DialogHeader>
          <DialogTitle>Agendar clientes</DialogTitle>
        </DialogHeader>

        <DialogFooter>
          <Button variant='outline' onClick={onClose}>
            Cancelar
          </Button>
          <Button
            onClick={() => {
              onSave(clientIds)
              onClose()
            }}
          >
            Guardar Cambios
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
