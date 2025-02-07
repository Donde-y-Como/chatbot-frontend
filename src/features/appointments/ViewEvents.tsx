import { format, parseISO } from 'date-fns'
import { useQuery } from '@tanstack/react-query'
import { es } from 'date-fns/locale/es'
import {
  Calendar,
  CalendarDays,
  ChevronDown,
  Clock,
  DollarSign,
  Repeat,
  Users,
} from 'lucide-react'
import { cn } from '@/lib/utils.ts'
import { Button } from '@/components/ui/button.tsx'
import { Card, CardContent } from '@/components/ui/card.tsx'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible.tsx'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog.tsx'
import { Skeleton } from '@/components/ui/skeleton.tsx'
import { appointmentService } from '@/features/appointments/appointmentService.ts'
import type { Event } from '@/features/appointments/types.ts'

type EmployeesSelectorProps = {
  isEventsOpen: boolean
  setIsEventsOpen: (isOpen: boolean) => void
}

export function ViewEvents({
  isEventsOpen,
  setIsEventsOpen,
}: EmployeesSelectorProps) {
  const { data: events, isLoading } = useQuery({
    queryKey: ['events'],
    queryFn: appointmentService.getEvents,
  })

  if (isLoading || !events) return <Skeleton className='h-32 w-full' />

  return (
    <Collapsible
      open={isEventsOpen}
      onOpenChange={setIsEventsOpen}
      className='rounded-lg border p-4 transition-all duration-300 hover:shadow-lg mb-10'
    >
      <div className='flex items-center justify-between'>
        <h3 className='font-semibold text-primary/90'>Eventos</h3>
        <CollapsibleTrigger asChild>
          <Button variant='ghost' size='sm'>
            <ChevronDown
              className={cn(
                'h-4 w-4 transition-transform duration-300',
                isEventsOpen ? 'rotate-0' : '-rotate-180'
              )}
            />
          </Button>
        </CollapsibleTrigger>
      </div>

      <CollapsibleContent className='mt-4'>
        {events.map((event: Event) => (
          <Dialog key={event.id}>
            <DialogTrigger asChild>
              <Card className=' w-full max-w-sm hover:shadow-lg transition-all duration-300 group cursor-pointer mb-2'>
                <CardContent className='p-2'>
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center space-x-2'>
                      <div className='flex flex-col items-center justify-center w-12 h-12 bg-primary/10 rounded-full'>
                        <span className=' font-bold text-primary'>
                          {format(parseISO(event.startDate), 'dd')}
                        </span>
                        <span className='text-xs font-medium text-primary/80 uppercase'>
                          {format(parseISO(event.startDate), 'MMM', {
                            locale: es,
                          })}
                        </span>
                      </div>
                      <div>
                        <h3 className='font-semibold text-foreground line-clamp-1'>
                          {event.name}
                        </h3>
                        <div className='flex items-center text-sm text-muted-foreground mt-1 space-x-3'>
                          <span className='flex items-center capitalize'>
                            <CalendarDays className='w-4 h-4 mr-1' />
                            {format(
                              parseISO(event.startDate),
                              "d 'de' MMMM, yyyy",
                              { locale: es }
                            )}
                          </span>
                          <span className='flex items-center'>
                            <Clock className='w-4 h-4 mr-1' />
                            {formatearHora(event.startTime)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </DialogTrigger>
            <DialogContent className='sm:max-w-[425px]'>
              <DialogHeader>
                <DialogTitle className='flex items-center space-x-2'>
                  <Calendar className='h-5 w-5 text-primary' />
                  <span>{event.name}</span>
                </DialogTitle>
                <DialogDescription>
                  {event.description || 'Sin descripción'}
                </DialogDescription>
              </DialogHeader>
              <div className='mt-4 space-y-3 text-sm'>
                <div className='flex items-center'>
                  <Calendar className='h-4 w-4 text-muted-foreground' />
                  <span className='ml-2'>
                    <strong>Fecha de inicio:</strong>{' '}
                    {formatearFecha(event.startDate)}
                  </span>
                </div>
                <div className='flex items-center'>
                  <Clock className='h-4 w-4 text-muted-foreground' />
                  <span className='ml-2'>
                    <strong>Hora de inicio:</strong>{' '}
                    {formatearHora(event.startTime)}
                  </span>
                </div>
                <div className='flex items-center'>
                  <Calendar className='h-4 w-4 text-muted-foreground' />
                  <span className='ml-2'>
                    <strong>Fecha de fin:</strong>{' '}
                    {formatearFecha(event.endDate)}
                  </span>
                </div>
                <div className='flex items-center'>
                  <Clock className='h-4 w-4 text-muted-foreground' />
                  <span className='ml-2'>
                    <strong>Hora de fin:</strong> {formatearHora(event.endTime)}
                  </span>
                </div>
                {event.capacity !== null && (
                  <div className='flex items-center'>
                    <Users className='h-4 w-4 text-muted-foreground' />
                    <span className='ml-2'>
                      <strong>Capacidad:</strong> {event.capacity}
                    </span>
                  </div>
                )}
                <div className='flex items-center'>
                  <DollarSign className='h-4 w-4 text-muted-foreground' />
                  <span className='ml-2'>
                    <strong>Precio:</strong>{' '}
                    {event.price === 0
                      ? 'Gratuito'
                      : formatearPrecio(event.price)}
                  </span>
                </div>
                <div className='flex items-center'>
                  <Repeat className='h-4 w-4 text-muted-foreground' />
                  <span className='ml-2'>
                    <strong>Repetición:</strong>{' '}
                    {traducirRepeticion(event.repeatEvery)}
                  </span>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        ))}
      </CollapsibleContent>
    </Collapsible>
  )
}

/**
 * Función para formatear una fecha (ej: "06 febrero 2025")
 */
function formatearFecha(fecha: string): string {
  const opciones: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }
  return new Date(fecha).toLocaleDateString('es-ES', opciones)
}

/**
 * Función para formatear la hora (se asume que "hora" es un número entero en formato 24 horas)
 */
function formatearHora(minutosDesdeMedianoche: number): string {
  const horas = Math.floor(minutosDesdeMedianoche / 60)
  const minutos = minutosDesdeMedianoche % 60
  return `${horas.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}`
}

/**
 * Función para formatear el precio en euros.
 */
function formatearPrecio(precio: number): string {
  return precio.toLocaleString('es-ES', {
    style: 'currency',
    currency: 'MXN',
    notation: 'compact',
  })
}

/**
 * Función para traducir la repetición de un evento.
 */
function traducirRepeticion(repeticion: Event['repeatEvery']): string {
  switch (repeticion) {
    case 'never':
      return 'Nunca'
    case 'day':
      return 'Diario'
    case 'week':
      return 'Semanal'
    case 'month':
      return 'Mensual'
    case 'year':
      return 'Anual'
    default:
      return ''
  }
}
