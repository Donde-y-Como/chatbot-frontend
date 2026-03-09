import { useMemo, useState } from 'react'
import {
  addDays,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  parseISO,
  startOfMonth,
  startOfWeek,
} from 'date-fns'
import { useQueryClient } from '@tanstack/react-query'
import { es } from 'date-fns/locale/es'
import { Clock, User, CalendarRange } from 'lucide-react'
import { toast } from 'sonner'
import { PERMISSIONS } from '@/api/permissions'
import { RenderIfCan } from '@/lib/Can'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { appointmentService } from '@/features/appointments/appointmentService'
import { EditAppointmentDialog } from '@/features/appointments/components/EditAppointmentDialog'
import { QuickEditStatusDialog } from '@/features/appointments/components/QuickEditStatusDialog'
import { useDialogState } from '@/features/appointments/contexts/DialogStateContext'
import { UseGetAppointmentsQueryKey } from '@/features/appointments/hooks/useGetAppointments'
import { useGetClients } from '@/features/appointments/hooks/useGetClients'
import { useGetEmployees } from '@/features/appointments/hooks/useGetEmployees'
import { useGetServices } from '@/features/appointments/hooks/useGetServices'
import {
  Appointment,
  getAppointmentStatusConfig,
} from '@/features/appointments/types'
import { formatTime } from '@/features/appointments/utils/formatters'

interface MonthViewProps {
  appointments: Appointment[]
  date: Date
  selectedService?: string | 'all'
}

export function MonthView({
  appointments,
  date,
  selectedService,
}: MonthViewProps) {
  const monthStart = startOfMonth(date)
  const monthEnd = endOfMonth(date)
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 })
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })
  const { data: clients } = useGetClients()
  const { data: services } = useGetServices()
  const { data: employees } = useGetEmployees()
  const queryClient = useQueryClient()

  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null)

  // Filter appointments by service if needed
  const filteredAppointments = useMemo(() => {
    if (!selectedService || selectedService === 'all') return appointments
    return appointments.filter((apt) =>
      apt.serviceIds.includes(selectedService)
    )
  }, [appointments, selectedService])

  // Get appointments for a specific day, considering multi-day spans
  const getAppointmentsForDay = (day: Date): Appointment[] => {
    return filteredAppointments.filter((apt) => {
      const aptStartDate = parseISO(apt.date)
      const aptEndDate = apt.endDate ? parseISO(apt.endDate) : aptStartDate

      // Normalize to date-only comparison
      const dayOnly = new Date(day.getFullYear(), day.getMonth(), day.getDate())
      const startOnly = new Date(
        aptStartDate.getFullYear(),
        aptStartDate.getMonth(),
        aptStartDate.getDate()
      )
      const endOnly = new Date(
        aptEndDate.getFullYear(),
        aptEndDate.getMonth(),
        aptEndDate.getDate()
      )

      return dayOnly >= startOnly && dayOnly <= endOnly
    })
  }

  const cancelAppointment = async (id: string) => {
    try {
      await appointmentService.cancelAppointment(id)
      toast.success('Cita cancelada exitosamente')
      queryClient.invalidateQueries({ queryKey: [UseGetAppointmentsQueryKey] })
    } catch {
      toast.error('Error al cancelar la cita')
    }
  }

  const weekDays = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

  // Build calendar grid
  const calendarRows: Date[][] = []
  let currentDay = calendarStart
  while (currentDay <= calendarEnd) {
    const week: Date[] = []
    for (let i = 0; i < 7; i++) {
      week.push(currentDay)
      currentDay = addDays(currentDay, 1)
    }
    calendarRows.push(week)
  }

  const renderAppointmentItem = (apt: Appointment, currentDay: Date) => {
    const statusConfig = getAppointmentStatusConfig(apt.status || 'pendiente')
    const aptStartDate = parseISO(apt.date)
    const aptEndDate = apt.endDate ? parseISO(apt.endDate) : aptStartDate
    const isMultiDay = !isSameDay(aptStartDate, aptEndDate)
    const isFirstDay = isSameDay(aptStartDate, currentDay)
    const isLastDay = isSameDay(aptEndDate, currentDay)

    let indicator = ''
    if (isMultiDay) {
      if (isFirstDay && !isLastDay) indicator = '→ '
      else if (!isFirstDay && isLastDay) indicator = '✔ '
      else if (!isFirstDay && !isLastDay) indicator = '… '
    }

    return (
      <div
        key={`${apt.id}-${currentDay.toISOString()}`}
        className={cn(
          'text-xs p-1 truncate cursor-pointer hover:opacity-80 transition-opacity flex items-center justify-between gap-1 rounded',
          isMultiDay && 'border-l-2',
          isMultiDay && !isFirstDay && !isLastDay && 'rounded-none',
          isMultiDay && isFirstDay && !isLastDay && 'rounded-r-none',
          isMultiDay && !isFirstDay && isLastDay && 'rounded-l-none'
        )}
        style={{
          backgroundColor: `${statusConfig.color}20`,
          borderLeftColor: isMultiDay ? statusConfig.color : 'transparent',
          color: statusConfig.color,
        }}
        onClick={(e) => {
          e.stopPropagation()
          setSelectedAppointment(apt)
        }}
      >
        <div className="flex items-center gap-1 overflow-hidden">
          {isFirstDay && (
            <span className='font-medium text-[10px] shrink-0'>
              {formatTime(apt.timeRange.startAt)}
            </span>
          )}
          <span className='truncate font-medium'>
            {indicator}
            {apt.clientName || 'Sin cliente'}
          </span>
        </div>

        {isMultiDay && (
          <span className='text-[8px] uppercase font-bold tracking-wider px-1 py-0.5 rounded-sm bg-background/50 shrink-0'>
            {isFirstDay && !isLastDay ? 'Inicio' : (!isFirstDay && isLastDay ? 'Fin' : 'Cont.')}
          </span>
        )}
      </div>
    )
  }

  const getClientForAppointment = (apt: Appointment) => {
    return clients?.find((c) => c.id === apt.clientId)
  }

  const getServicesForAppointment = (apt: Appointment) => {
    return services?.filter((s) => apt.serviceIds.includes(s.id)) || []
  }

  const getEmployeesForAppointment = (apt: Appointment) => {
    return employees?.filter((e) => apt.employeeIds.includes(e.id)) || []
  }

  return (
    <div className='flex flex-col h-full'>
      {/* Week day headers */}
      <div className='grid grid-cols-7 border-b bg-muted/30'>
        {weekDays.map((day) => (
          <div
            key={day}
            className='text-center text-sm font-medium py-2 text-muted-foreground'
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <ScrollArea className='flex-1'>
        <div className='flex flex-col'>
          {calendarRows.map((week, weekIdx) => (
            <div
              key={weekIdx}
              className='grid grid-cols-7 border-b last:border-b-0'
            >
              {week.map((day) => {
                const dayAppointments = getAppointmentsForDay(day)
                const isCurrentMonth = isSameMonth(day, monthStart)
                const isToday = isSameDay(day, new Date())
                const maxVisible = 3
                const visibleApts = dayAppointments.slice(0, maxVisible)
                const remainingCount = dayAppointments.length - maxVisible

                return (
                  <div
                    key={day.toISOString()}
                    className={cn(
                      'min-h-[100px] md:min-h-[120px] p-1 border-r last:border-r-0 transition-colors',
                      !isCurrentMonth && 'bg-muted/30 text-muted-foreground',
                      isToday && 'bg-primary/5'
                    )}
                  >
                    {/* Day number */}
                    <div className='flex justify-end mb-1'>
                      <span
                        className={cn(
                          'text-sm rounded-full h-6 w-6 flex items-center justify-center font-medium',
                          isToday && 'bg-primary text-primary-foreground'
                        )}
                      >
                        {format(day, 'd')}
                      </span>
                    </div>

                    {/* Appointments list */}
                    <div className='space-y-0.5'>
                      {visibleApts.map((apt) =>
                        renderAppointmentItem(apt, day)
                      )}
                      {remainingCount > 0 && (
                        <div className='text-[10px] text-muted-foreground text-center font-medium py-0.5'>
                          +{remainingCount} más
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Appointment detail dialog */}
      {selectedAppointment &&
        (() => {
          const client = getClientForAppointment(selectedAppointment)
          const aptServices = getServicesForAppointment(selectedAppointment)
          const aptEmployees = getEmployeesForAppointment(selectedAppointment)
          const statusConfig = getAppointmentStatusConfig(
            selectedAppointment.status || 'pendiente'
          )
          const aptStartDate = parseISO(selectedAppointment.date)
          const aptEndDate = selectedAppointment.endDate
            ? parseISO(selectedAppointment.endDate)
            : aptStartDate
          const isMultiDay = !isSameDay(aptStartDate, aptEndDate)
          const totalPrice = aptServices.reduce(
            (sum, s) => sum + s.price.amount,
            0
          )

          return (
            <Dialog
              open={!!selectedAppointment}
              onOpenChange={(open) => {
                if (!open) setSelectedAppointment(null)
              }}
            >
              <DialogContent className='sm:max-w-lg max-h-[85vh] overflow-auto'>
                <DialogHeader>
                  <div className='flex items-center gap-2 mb-2'>
                    <Badge
                      style={{
                        backgroundColor: `${statusConfig.color}20`,
                        color: statusConfig.color,
                        borderColor: statusConfig.color,
                      }}
                      variant='outline'
                    >
                      {statusConfig.label}
                    </Badge>
                    {selectedAppointment.folio && (
                      <span className='text-xs text-muted-foreground'>
                        #{selectedAppointment.folio}
                      </span>
                    )}
                  </div>
                  <DialogTitle className='text-lg'>
                    {client?.name || 'Sin cliente'}
                  </DialogTitle>
                  <DialogDescription className='flex flex-col gap-1'>
                    <span className='flex items-center gap-1.5'>
                      <Clock className='h-3.5 w-3.5' />
                      {format(aptStartDate, "EEEE d 'de' MMMM", { locale: es })}
                      {' • '}
                      {formatTime(selectedAppointment.timeRange.startAt)} -{' '}
                      {formatTime(selectedAppointment.timeRange.endAt)}
                    </span>
                    {isMultiDay && (
                      <span className='flex items-center gap-1.5 text-primary'>
                        <CalendarRange className='h-3.5 w-3.5' />
                        Hasta el{' '}
                        {format(aptEndDate, "EEEE d 'de' MMMM", { locale: es })}
                      </span>
                    )}
                  </DialogDescription>
                </DialogHeader>

                <div className='space-y-4 mt-2'>
                  {/* Services */}
                  {aptServices.length > 0 && (
                    <div>
                      <h4 className='text-sm font-medium text-muted-foreground mb-2'>
                        Servicios
                      </h4>
                      <div className='space-y-1.5'>
                        {aptServices.map((service) => (
                          <div
                            key={service.id}
                            className='flex justify-between items-center text-sm'
                          >
                            <span>{service.name}</span>
                            <Badge variant='outline' className='text-xs'>
                              {service.price.amount.toLocaleString('es-MX')}{' '}
                              {service.price.currency}
                            </Badge>
                          </div>
                        ))}
                        {totalPrice > 0 && (
                          <div className='flex justify-between items-center text-sm font-medium pt-1 border-t'>
                            <span>Total</span>
                            <span className='text-primary'>
                              {totalPrice.toLocaleString('es-MX')}{' '}
                              {aptServices[0]?.price.currency || 'MXN'}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Employees */}
                  {aptEmployees.length > 0 && (
                    <div>
                      <h4 className='text-sm font-medium text-muted-foreground mb-2'>
                        Personal
                      </h4>
                      <div className='flex flex-wrap gap-2'>
                        {aptEmployees.map((emp) => (
                          <div
                            key={emp.id}
                            className='flex items-center gap-2 p-1.5 rounded-md bg-muted/50'
                          >
                            <Avatar className='h-6 w-6'>
                              <AvatarImage
                                src={emp.photo}
                                alt={emp.name}
                                className='object-cover'
                              />
                              <AvatarFallback className='text-[10px]'>
                                {emp.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <span className='text-sm'>{emp.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Notes */}
                  {selectedAppointment.notes && (
                    <div>
                      <h4 className='text-sm font-medium text-muted-foreground mb-1'>
                        Notas
                      </h4>
                      <p className='text-sm bg-muted/50 p-2 rounded-md'>
                        {selectedAppointment.notes}
                      </p>
                    </div>
                  )}

                  {/* Actions */}
                  <RenderIfCan permission={PERMISSIONS.APPOINTMENT_UPDATE}>
                    <div className='flex flex-wrap gap-2 pt-2 border-t'>
                      <QuickEditStatusDialog
                        appointment={selectedAppointment}
                      />
                      <EditAppointmentDialog
                        appointment={selectedAppointment}
                      />
                    </div>
                  </RenderIfCan>
                </div>
              </DialogContent>
            </Dialog>
          )
        })()}
    </div>
  )
}
