import React, { useCallback, useEffect, useRef, useState } from 'react'
import { format, startOfWeek, endOfWeek, eachDayOfInterval, addDays, isSameDay, addWeeks, subWeeks } from 'date-fns'
import { useQueryClient } from '@tanstack/react-query'
import { es } from 'date-fns/locale'
import { Calendar, CalendarX, Clock, Loader2, ChevronLeft, ChevronRight } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { AppointmentBlock } from '@/features/appointments/AppointmentBlock'
import {
  ServiceFilter,
  ServiceFilterProps,
} from '@/features/appointments/ServiceFilter.tsx'
import { appointmentService } from '@/features/appointments/appointmentService.ts'
import { useGetAppointments, UseGetAppointmentsQueryKey } from '@/features/appointments/hooks/useGetAppointments.ts'
import { useGetClients } from '@/features/appointments/hooks/useGetClients.ts'
import { useGetEmployees } from '@/features/appointments/hooks/useGetEmployees.ts'
import { useGetServices } from '@/features/appointments/hooks/useGetServices.ts'
import { useGetWorkSchedule } from '@/features/appointments/hooks/useGetWorkSchedule.ts'
import { usePositionedEvents } from '@/features/appointments/hooks/usePositionedEvents.ts'
import { QuickAppointmentDialog } from '@/features/appointments/components/QuickAppointmentDialog'
import { useDialogState } from '@/features/appointments/contexts/DialogStateContext'
import type { Appointment } from './types'

// Simple constants
const TIME_SLOT_HEIGHT = 64
const MINUTES_PER_HOUR = 60
const DEFAULT_DURATION = 60 // 1 hour
const MIN_DURATION = 15 // 15 minutes
const SNAP_MINUTES = 15

// Time block type
type TimeBlock = {
  startAt: number
  endAt: number
  dayIndex: number
}

export function WeekView({
  appointments,
  date,
}: {
  appointments: Appointment[]
  date: Date
}) {
  const weekStart = startOfWeek(date, { weekStartsOn: 1 }) // Monday as first day
  const weekEnd = endOfWeek(date, { weekStartsOn: 1 })
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd })

  // Get appointments for the entire week range
  const { data: weekAppointments, isLoading: isWeekAppointmentsLoading } = useGetAppointments(
    weekStart.toISOString(), 
    weekEnd.toISOString()
  )
  
  // Get work hours for the selected date (used as reference for overall layout)
  const { workHours, isLoading: isWorkHoursLoading } = useGetWorkSchedule(date)
  const { data: allEmployees = [], isLoading: isEmployeesLoading } = useGetEmployees()
  const { data: allServices = [], isLoading: isServicesLoading } = useGetServices()
  const { data: clients = [], isLoading: isClientsLoading } = useGetClients()

  const [selectedService, setSelectedService] = useState<ServiceFilterProps['selectedService']>('all')
  const [currentTime, setCurrentTime] = useState(new Date())
  
  // Simple time block state
  const [timeBlock, setTimeBlock] = useState<TimeBlock | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragHandle, setDragHandle] = useState<'top' | 'bottom' | null>(null)
  const [isQuickDialogOpen, setIsQuickDialogOpen] = useState(false)
  const [dialogTimeRange, setDialogTimeRange] = useState<TimeBlock | null>(null)
  
  const timeSlotAreaRef = useRef<HTMLDivElement>(null)
  const queryClient = useQueryClient()
  const { hasOpenDialogs } = useDialogState()

  const handleSelectedService = (serviceId: string | 'all') => {
    setSelectedService(serviceId)
  }

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

  // Time utility functions
  const getTimeFromY = useCallback((clientY: number): number => {
    if (!workHours || !timeSlotAreaRef.current) return workHours?.startAt || 540

    const rect = timeSlotAreaRef.current.getBoundingClientRect()
    const relativeY = Math.max(0, clientY - rect.top)
    const minutesFromStart = (relativeY / TIME_SLOT_HEIGHT) * MINUTES_PER_HOUR
    const snappedMinutes = Math.round(minutesFromStart / SNAP_MINUTES) * SNAP_MINUTES
    
    return Math.max(
      workHours.startAt,
      Math.min(workHours.endAt - MIN_DURATION, snappedMinutes + workHours.startAt)
    )
  }, [workHours])

  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / MINUTES_PER_HOUR)
    const mins = minutes % MINUTES_PER_HOUR
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`
  }

  const formatDuration = (startAt: number, endAt: number): string => {
    const duration = endAt - startAt
    const hours = Math.floor(duration / MINUTES_PER_HOUR)
    const minutes = duration % MINUTES_PER_HOUR
    
    if (hours === 0) return `${minutes}min`
    if (minutes === 0) return `${hours}h`
    return `${hours}h ${minutes}m`
  }

  const getBlockPosition = (block: TimeBlock) => {
    if (!workHours) return { top: 0, height: TIME_SLOT_HEIGHT }
    
    const top = ((block.startAt - workHours.startAt) / MINUTES_PER_HOUR) * TIME_SLOT_HEIGHT
    const height = ((block.endAt - block.startAt) / MINUTES_PER_HOUR) * TIME_SLOT_HEIGHT
    
    return { top: Math.max(0, top), height: Math.max(TIME_SLOT_HEIGHT * 0.25, height) }
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
        })
      ])
      
      toast.success('Estado de la cita cambiado a cancelada')
    } catch (e) {
      toast.error('No se pudo cancelar la cita')
    }
  }

  const isLoading = isWorkHoursLoading || isEmployeesLoading || isServicesLoading || isClientsLoading || isWeekAppointmentsLoading

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
              <p className='text-muted-foreground'>Preparando el calendario de la semana...</p>
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
  const totalHeight = ((displayWorkHours.endAt - displayWorkHours.startAt) / 60) * TIME_SLOT_HEIGHT

  return (
    <div className='flex flex-col h-full'>
      {/* Service Filter Header */}
      <div className='sticky top-0 z-20 bg-card shrink-0'>
        <div className='p-2 md:p-3'>
          <ServiceFilter
            services={allServices}
            selectedService={selectedService}
            onServiceSelect={handleSelectedService}
          />
        </div>
      </div>

      {/* Week Calendar Grid */}
      <div className='flex-1 overflow-hidden'>
        <ScrollArea className='h-full'>
          <div className='flex relative bg-background min-w-fit'>
            {/* Time Column */}
            <div className='w-12 md:w-16 flex-shrink-0 bg-muted/20 sticky left-0 z-10'>
              <div className='h-8 md:h-10 bg-card flex items-center justify-center'>
                <span className='text-xs font-medium text-muted-foreground'>Hora</span>
              </div>
              <div style={{ height: `${totalHeight}px` }}>
                {Array.from({ length: Math.ceil((displayWorkHours.endAt - displayWorkHours.startAt) / 60) }, (_, i) => {
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
                })}
              </div>
            </div>

            {/* Week Days Columns */}
            {weekDays.map((day, dayIndex) => {
              const dayAppointments = appointmentsToUse.filter(appointment => 
                isSameDay(new Date(appointment.date), day)
              )

              // Filter positioned events for this specific day
              const dayPositionedEvents = positionedEvents.filter(event =>
                isSameDay(new Date(event.appointment.date), day)
              )

              return (
                <div key={day.toISOString()} className='flex-1 min-w-[120px] md:min-w-[150px] lg:min-w-[180px]'>
                  {/* Day Header */}
                  <div className='h-8 md:h-10 bg-card flex flex-col items-center justify-center px-1 md:px-2'>
                    <span className='text-[10px] md:text-xs font-medium text-muted-foreground uppercase'>
                      {format(day, 'EEE', { locale: es })}
                    </span>
                    <span className={`text-xs md:text-sm font-semibold ${
                      isSameDay(day, new Date()) 
                        ? 'text-primary' 
                        : isSameDay(day, date)
                          ? 'text-foreground'
                          : 'text-muted-foreground'
                    }`}>
                      {format(day, 'd', { locale: es })}
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
                      currentTime.getHours() * 60 + currentTime.getMinutes() >= displayWorkHours.startAt &&
                      currentTime.getHours() * 60 + currentTime.getMinutes() <= displayWorkHours.endAt && (
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
                    {dayPositionedEvents.map(({ appointment, column, totalColumns }) => {
                      const employees = allEmployees.filter((emp) =>
                        appointment.employeeIds.includes(emp.id)
                      )

                      const services = allServices.filter((a) =>
                        appointment.serviceIds.includes(a.id)
                      )

                      return (
                        <AppointmentBlock
                          cancelAppointment={handleCancel}
                          key={appointment.id}
                          appointment={appointment}
                          client={clients.find((c) => c.id === appointment.clientId)!}
                          employees={employees}
                          services={services}
                          column={column}
                          totalColumns={totalColumns}
                          workHours={displayWorkHours}
                        />
                      )
                    })}

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