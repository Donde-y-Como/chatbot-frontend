import { useEffect, useState } from 'react';
import { eachDayOfInterval, endOfWeek, format, isSameDay, startOfWeek } from 'date-fns';
import { useQueryClient } from '@tanstack/react-query';
import { es } from 'date-fns/locale';
import { Clock, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { AppointmentBlock } from '@/features/appointments/AppointmentBlock';
import { appointmentService } from '@/features/appointments/appointmentService.ts';
import { useGetAppointments, UseGetAppointmentsQueryKey } from '@/features/appointments/hooks/useGetAppointments.ts';
import { useGetClients } from '@/features/appointments/hooks/useGetClients.ts';
import { useGetEmployees } from '@/features/appointments/hooks/useGetEmployees.ts';
import { useGetServices } from '@/features/appointments/hooks/useGetServices.ts';
import { useGetWorkSchedule } from '@/features/appointments/hooks/useGetWorkSchedule.ts';
import { usePositionedEvents } from '@/features/appointments/hooks/usePositionedEvents.ts';
import type { Appointment } from './types';


// Simple constants
const TIME_SLOT_HEIGHT = 64
const MINUTES_PER_HOUR = 60 // 1 hour

export function WeekView({
  appointments,
  date,
  selectedService = 'all',
}: {
  appointments: Appointment[]
  date: Date
  selectedService?: string | 'all'
}) {
  const weekStart = startOfWeek(date, { weekStartsOn: 1 }) // Monday as first day
  const weekEnd = endOfWeek(date, { weekStartsOn: 1 })
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd })

  // Get appointments for the entire week range
  const { data: weekAppointments, isLoading: isWeekAppointmentsLoading } =
    useGetAppointments(weekStart.toISOString(), weekEnd.toISOString())

  // Get work hours for the selected date (used as reference for overall layout)
  const { workHours, isLoading: isWorkHoursLoading } = useGetWorkSchedule(date)
  const { data: allEmployees = [], isLoading: isEmployeesLoading } =
    useGetEmployees()
  const { data: allServices = [], isLoading: isServicesLoading } =
    useGetServices()
  const { data: clients = [], isLoading: isClientsLoading } = useGetClients()

  const [currentTime, setCurrentTime] = useState(new Date())

  const queryClient = useQueryClient()

  // Use week appointments if available, fallback to passed appointments
  const appointmentsToUse = weekAppointments || appointments

  const positionedEvents = usePositionedEvents({
    appointments: appointmentsToUse,
    selectedService,
  })

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000)
    return () => clearInterval(interval)
  }, [])

  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / MINUTES_PER_HOUR)
    const mins = minutes % MINUTES_PER_HOUR
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`
  }

  const getCurrentTimePosition = () => {
    const startMinutes = currentTime.getHours() * 60 + currentTime.getMinutes()
    const startMinutesRelative = startMinutes - displayWorkHours.startAt
    return (startMinutesRelative * TIME_SLOT_HEIGHT) / 60
  }

  const handleCancel = async (id: string) => {
    try {
      await appointmentService.cancelAppointment(id)

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: [UseGetAppointmentsQueryKey],
        }),
        queryClient.refetchQueries({
          queryKey: [UseGetAppointmentsQueryKey],
        }),
      ])

      toast.success('Estado de la cita cambiado a cancelada')
    } catch (e) {
      toast.error('No se pudo cancelar la cita')
    }
  }

  const isLoading =
    isWorkHoursLoading ||
    isEmployeesLoading ||
    isServicesLoading ||
    isClientsLoading ||
    isWeekAppointmentsLoading

  if (isLoading) {
    return (
      <div className='flex flex-col h-full bg-gradient-to-br from-background to-muted/30'>
        <div className='flex-1 flex items-center justify-center p-8'>
          <div className='flex flex-col items-center justify-center space-y-6 max-w-md text-center'>
            <div className='relative'>
              <div className='w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center'>
                <Loader2 className='h-8 w-8 text-primary animate-spin' />
              </div>
              <div className='absolute inset-0 rounded-full border-2 border-primary/20 animate-pulse' />
            </div>

            <div className='space-y-2'>
              <h3 className='text-xl font-semibold'>Cargando vista semanal</h3>
              <p className='text-muted-foreground'>
                Preparando el calendario de la semana...
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // In week view, we always show the week regardless of work hours for individual days
  // Work hours will be handled per day in the week grid

  // Use default work hours for week view layout (8 AM to 8 PM if no work hours)
  const defaultWorkHours = { startAt: 8 * 60, endAt: 20 * 60 } // 8:00 AM to 8:00 PM
  const displayWorkHours = workHours || defaultWorkHours
  const totalHeight =
    ((displayWorkHours.endAt - displayWorkHours.startAt) / 60) *
    TIME_SLOT_HEIGHT

  return (
    <div className='flex flex-col h-full'>
      {/* Week Calendar Grid */}
      <div className='flex-1 overflow-hidden'>
        <ScrollArea className='h-full'>
          <div className='flex relative bg-background min-w-fit'>
            {/* Time Column */}
            <div className='w-12 md:w-16 flex-shrink-0 bg-muted/20 sticky left-0 z-10'>
              <div className='h-16 bg-background flex items-center justify-center border-b border-border'>
                <span className='text-xs font-medium text-muted-foreground'>

                </span>
              </div>
              <div style={{ height: `${totalHeight}px` }}>
                {Array.from(
                  {
                    length: Math.ceil(
                      (displayWorkHours.endAt - displayWorkHours.startAt) / 60
                    ),
                  },
                  (_, i) => {
                    const hour = displayWorkHours.startAt + i * 60
                    return (
                      <div
                        key={hour}
                        className='h-16 flex items-start justify-center pt-1 border-b border-border/50'
                      >
                        <span className='text-xs font-medium text-muted-foreground'>
                          {formatTime(hour)}
                        </span>
                      </div>
                    )
                  }
                )}
              </div>
            </div>

            {/* Week Days Columns */}
            {weekDays.map((day) => {
              // Filter positioned events for this specific day
              const dayPositionedEvents = positionedEvents.filter((event) =>
                isSameDay(new Date(event.appointment.date), day)
              )

              return (
                <div
                  key={day.toISOString()}
                  className='flex-1 min-w-[120px] md:min-w-[150px] lg:min-w-[180px]'
                >
                  {/* Day Header */}
                  <div className='relative h-16 bg-background flex flex-col items-center justify-center px-1 md:px-2 border-b-4'
                    style={{
                      borderBottomColor: isSameDay(day, date)
                        ? 'hsl(var(--primary))'
                        : 'transparent'
                    }}
                  >
                    <span className='text-sm font-bold'
                      style={{
                        color: isSameDay(day, date)
                          ? 'hsl(var(--primary))'
                          : 'hsl(var(--muted-foreground))'
                      }}
                    >
                      {format(day, 'd', { locale: es })} {format(day, 'EEE', { locale: es })}
                    </span>
                  </div>

                  {/* Day Content */}
                  <div
                    className='relative'
                    style={{
                      backgroundImage: `repeating-linear-gradient(
                        to bottom,
                        transparent,
                        transparent 63px,
                        hsl(var(--border) / 0.2) 63px,
                        hsl(var(--border) / 0.2) 64px
                      )`,
                      backgroundSize: '100% 64px',
                      height: `${totalHeight}px`,
                      minHeight: `${totalHeight}px`,
                    }}
                  >
                    {/* Current time indicator for today */}
                    {isSameDay(currentTime, day) &&
                      currentTime.getHours() * 60 + currentTime.getMinutes() >=
                        displayWorkHours.startAt &&
                      currentTime.getHours() * 60 + currentTime.getMinutes() <=
                        displayWorkHours.endAt && (
                        <div
                          className='absolute left-0 right-0 z-20 border-t-2 border-red-500'
                          style={{ top: `${getCurrentTimePosition()}px` }}
                        >
                          <div className='absolute -left-2 -top-1.5'>
                            <div className='w-3 h-3 rounded-full bg-red-500 border border-background' />
                          </div>
                        </div>
                      )}

                    {/* Day appointments */}
                    {dayPositionedEvents.map(
                      ({ appointment, column, totalColumns }) => {
                        const employees = allEmployees.filter((emp) =>
                          appointment.employeeIds.includes(emp.id)
                        )

                        const services = allServices.filter((a) =>
                          appointment.serviceIds.includes(a.id)
                        )

                        const client = clients.find((c) => c.id === appointment.clientId)!

                        return (
                          <AppointmentBlock
                            cancelAppointment={handleCancel}
                            key={appointment.id}
                            appointment={appointment}
                            client={client}
                            employees={employees}
                            services={services}
                            column={column}
                            totalColumns={totalColumns}
                            workHours={displayWorkHours}
                          />
                        )
                      }
                    )}

                    {/* Empty state for day - show if no work hours for this specific day */}
                    {dayPositionedEvents.length === 0 && (
                      <div className='absolute inset-0 flex items-center justify-center opacity-50 pointer-events-none'>
                        <div className='text-center'>
                          <Clock className='h-4 w-4 md:h-6 md:w-6 text-muted-foreground mx-auto mb-2' />
                          <p className='text-xs text-muted-foreground'>
                            {/* Show different message if this specific day has no work hours */}
                            Sin citas
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
          <ScrollBar orientation='horizontal' />
          <ScrollBar orientation='vertical' />
        </ScrollArea>
      </div>
    </div>
  )
}