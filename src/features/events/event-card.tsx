import { Booking, EventPrimitives } from '@/features/events/types.ts'
import { format } from 'date-fns'
import { Card, CardContent } from '@/components/ui/card.tsx'
import { Badge } from '@/components/ui/badge.tsx'
import { EventDetailsModal } from '@/features/events/event-details-modal.tsx'
import { EventEditModal } from '@/features/events/event-edit-modal.tsx'
import { EventDeleteDialog } from '@/features/events/event-delete-dialog.tsx'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu.tsx'
import { Button } from '@/components/ui/button.tsx'
import { MoreHorizontal } from 'lucide-react'
import { useState } from 'react'

function translateRecurrente(frequency: string) {
  return frequency === 'weekly'
    ? 'semanalmente'
    : frequency === 'daily'
      ? 'diariamente'
      : frequency === 'monthly'
        ? 'mensualmente'
        : 'anualmente'
}

function getRecurrenceText(event: EventPrimitives) {
  if (event.recurrence.frequency === 'never') return null

  let text = `Se repite ${translateRecurrente(event.recurrence.frequency)}`

  if (event.recurrence.endCondition) {
    if (event.recurrence.endCondition.type === 'occurrences') {
      text += `, ${event.recurrence.endCondition.occurrences} veces`
    } else if (event.recurrence.endCondition.type === 'date') {
      text += `, hasta ${format(event.recurrence.endCondition.until, 'MMM d, yyyy')}`
    }
  }

  return text
}


export function EventCard({ event, onDelete, bookings }: { bookings: Booking[], event: EventPrimitives; onDelete: (id: string) => void }) {
  const [showDetails, setShowDetails] = useState(false)
  const [showEdit, setShowEdit] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const recurrenceText = getRecurrenceText(event)

  return (
    <>
      <Card className="mb-2">
        <CardContent className="flex items-start gap-4 p-4">
          <div className="w-1 self-stretch rounded-full bg-primary" />
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold">{event.name}</h3>
                <div className="text-sm text-muted-foreground">
                  {format(event.duration.startAt, "h:mm a")}
                  {event.capacity.isLimited && (
                    <Badge variant="secondary" className="ml-2">
                      {`${bookings.length} /  ${event.capacity.maxCapacity} lugares`}
                    </Badge>
                  )}
                </div>
                {recurrenceText && <p className="mt-1 text-xs text-muted-foreground">{recurrenceText}</p>}
              </div>
              <div className="flex items-center gap-2">
                {event.price.amount > 0 && (
                  <Badge variant="secondary">
                    {new Intl.NumberFormat("es-MX", {
                      style: "currency",
                      currency: event.price.currency,
                    }).format(event.price.amount)}
                  </Badge>
                )}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setShowDetails(true)}>Ver detalles</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setShowEdit(true)}>Editar o agendar</DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive" onClick={() => setShowDeleteDialog(true)}>
                      Eliminar Evento
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <EventDetailsModal event={event} open={showDetails} onClose={() => setShowDetails(false)} />

      <EventEditModal event={event} open={showEdit} onClose={() => setShowEdit(false)} />

      <EventDeleteDialog
        open={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={() => {
          onDelete(event.id)
          setShowDeleteDialog(false)
        }}
      />
    </>
  )
}
