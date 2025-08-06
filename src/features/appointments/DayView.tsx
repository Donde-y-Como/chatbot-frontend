import React, { useCallback, useEffect, useRef, useState } from 'react'
import { format, isSameDay } from 'date-fns'
import { useQueryClient } from '@tanstack/react-query'
import { es } from 'date-fns/locale'
import { Calendar, CalendarX, Clock, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { AppointmentBlock } from '@/features/appointments/AppointmentBlock'
import {
  ServiceFilter,
  ServiceFilterProps,
} from '@/features/appointments/ServiceFilter.tsx'
import { TimeSlots } from '@/features/appointments/TimeSlots.tsx'
import { appointmentService } from '@/features/appointments/appointmentService.ts'
import { UseGetAppointmentsQueryKey } from '@/features/appointments/hooks/useGetAppointments.ts'
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
}

export function DayView({
  appointments,
  date,
}: {
  appointments: Appointment[]
  date: Date
}) {
  const { workHours, isLoading: isWorkHoursLoading } = useGetWorkSchedule(date)
  const { data: allEmployees = [], isLoading: isEmployeesLoading } = useGetEmployees()
  const { data: allServices = [], isLoading: isServicesLoading } = useGetServices()
  const { data: clients = [], isLoading: isClientsLoading } = useGetClients()

  const [selectedService, setSelectedService] = useState<ServiceFilterProps['selectedService']>('all')
  const [currentTime, setCurrentTime] = useState(date)
  
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

  const positionedEvents = usePositionedEvents({
    appointments,
    selectedService,
  })

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000)
    return () => clearInterval(interval)
  }, [])

  // Utility functions
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

  // Event handlers
  const handleTimeSlotClick = useCallback((e: React.MouseEvent) => {
    if (e.target !== e.currentTarget || hasOpenDialogs) return
    
    const clickTime = getTimeFromY(e.clientY)
    
    if (timeBlock) {
      // Clear existing block
      setTimeBlock(null)
      return
    }

    // Create new block
    if (!workHours) return
    
    let startAt = clickTime
    let endAt = clickTime + DEFAULT_DURATION
    
    // Ensure block fits within work hours
    if (endAt > workHours.endAt) {
      endAt = workHours.endAt
      startAt = Math.max(workHours.startAt, endAt - DEFAULT_DURATION)
    }
    
    if (startAt < workHours.startAt) {
      startAt = workHours.startAt
      endAt = Math.min(workHours.endAt, startAt + DEFAULT_DURATION)
    }

    setTimeBlock({ startAt, endAt })
  }, [hasOpenDialogs, timeBlock, getTimeFromY, workHours])

  const handleResizeStart = useCallback((handle: 'top' | 'bottom', e: React.MouseEvent) => {
    e.stopPropagation()
    setIsDragging(true)
    setDragHandle(handle)
    document.body.style.cursor = 'ns-resize'
  }, [])

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !timeBlock || !dragHandle || !workHours || !timeSlotAreaRef.current) return

    // Calculate the time from mouse position directly here to avoid stale closure issues
    const rect = timeSlotAreaRef.current.getBoundingClientRect()
    const relativeY = Math.max(0, e.clientY - rect.top)
    const minutesFromStart = (relativeY / TIME_SLOT_HEIGHT) * MINUTES_PER_HOUR
    const snappedMinutes = Math.round(minutesFromStart / SNAP_MINUTES) * SNAP_MINUTES
    const currentTime = Math.max(
      workHours.startAt,
      Math.min(workHours.endAt - MIN_DURATION, snappedMinutes + workHours.startAt)
    )

    console.log('Dragging:', {
      clientY: e.clientY,
      rectTop: rect.top,
      relativeY,
      minutesFromStart,
      snappedMinutes,
      currentTime,
      dragHandle,
      workHours
    })
    
    if (dragHandle === 'top') {
      const newStartAt = Math.max(
        workHours.startAt,
        Math.min(currentTime, timeBlock.endAt - MIN_DURATION)
      )
      setTimeBlock({ startAt: newStartAt, endAt: timeBlock.endAt })
    } else {
      const newEndAt = Math.min(
        workHours.endAt,
        Math.max(currentTime, timeBlock.startAt + MIN_DURATION)
      )
      setTimeBlock({ startAt: timeBlock.startAt, endAt: newEndAt })
    }
  }, [isDragging, timeBlock, dragHandle, workHours])

  const handleMouseUp = useCallback(() => {
    if (isDragging) {
      setIsDragging(false)
      setDragHandle(null)
      document.body.style.cursor = ''
    }
  }, [isDragging])

  // Global mouse events for dragging
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDragging, handleMouseMove, handleMouseUp])

  const handleConfirmBlock = useCallback(() => {
    if (!timeBlock) return
    
    setDialogTimeRange({ ...timeBlock })
    setTimeBlock(null)
    setIsQuickDialogOpen(true)
  }, [timeBlock])

  const handleClearBlock = useCallback(() => {
    setTimeBlock(null)
    setDialogTimeRange(null)
    setIsDragging(false)
    setDragHandle(null)
    document.body.style.cursor = ''
  }, [])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && timeBlock) {
        handleClearBlock()
      } else if (e.key === 'Enter' && timeBlock) {
        handleConfirmBlock()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [timeBlock, handleClearBlock, handleConfirmBlock])

  const handleCancel = async (id: string) => {
    try {
      await appointmentService.cancelAppointment(id)
      await queryClient.invalidateQueries({
        queryKey: [UseGetAppointmentsQueryKey, date.toISOString()],
      })
      toast.success('Estado de la cita cambiado a cancelada')
    } catch (e) {
      toast.error('No se pudo cancelar la cita')
    }
  }

  const getCurrentTimePosition = () => {
    if (!workHours) return -100
    const startMinutes = currentTime.getHours() * 60 + currentTime.getMinutes()
    const startMinutesRelative = startMinutes - workHours.startAt
    return (startMinutesRelative * TIME_SLOT_HEIGHT) / 60
  }

  const isLoading = isWorkHoursLoading || isEmployeesLoading || isServicesLoading || isClientsLoading

  if (isLoading) {
    return (
      <div className='flex flex-col space-y-6 h-full w-full items-center justify-center p-8'>
        <div className='flex flex-col items-center justify-center space-y-4'>
          <Loader2 className='h-12 w-12 text-primary animate-spin' />
          <h3 className='text-lg font-medium'>Cargando agenda del día</h3>
          <div className='grid grid-cols-2 gap-4 w-full max-w-md'>
            <div className='space-y-2'>
              <Skeleton className='h-4 w-full' />
              <Skeleton className='h-4 w-3/4' />
            </div>
            <div className='space-y-2'>
              <Skeleton className='h-4 w-full' />
              <Skeleton className='h-4 w-3/4' />
            </div>
            <div className='space-y-2'>
              <Skeleton className='h-4 w-full' />
              <Skeleton className='h-4 w-3/4' />
            </div>
            <div className='space-y-2'>
              <Skeleton className='h-4 w-full' />
              <Skeleton className='h-4 w-3/4' />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!workHours) {
    return (
      <div className='flex flex-col items-center justify-center h-full text-center p-8'>
        <CalendarX className='h-24 w-24 text-muted-foreground mb-6' />
        <h2 className='text-2xl font-bold mb-2'>¡Día libre!</h2>
        <p className='text-lg text-muted-foreground mb-6'>
          Hoy no hay horario laboral programado. ¡Disfruta de tu tiempo libre!
        </p>
        <div className='flex items-center justify-center p-4 bg-muted rounded-lg max-w-md'>
          <Calendar className='h-5 w-5 mr-2 text-muted-foreground' />
          <p className='text-sm text-muted-foreground first-letter:uppercase'>
            {format(date, 'EEEE, d MMMM yyyy', { locale: es })}
          </p>
        </div>
      </div>
    )
  }

  const totalHeight = ((workHours.endAt - workHours.startAt) / 60) * TIME_SLOT_HEIGHT

  return (
    <div className='flex flex-col space-y-4 h-full'>
      <div className='sticky top-0 z-20 bg-background border-b'>
        <ServiceFilter
          services={allServices}
          selectedService={selectedService}
          onServiceSelect={handleSelectedService}
        />
      </div>

      <div className='flex-1 overflow-hidden border rounded-lg flex flex-col'>
        <ScrollArea className='h-full'>
          <div className='flex relative'>
            <div className='w-16 flex-shrink-0 border-r bg-muted/30'>
              <TimeSlots startAt={workHours.startAt} endAt={workHours.endAt} />
            </div>

            <div
              ref={timeSlotAreaRef}
              className={`flex-1 relative ${
                hasOpenDialogs 
                  ? 'cursor-not-allowed opacity-60' 
                  : isDragging
                    ? 'cursor-ns-resize'
                    : 'cursor-pointer hover:bg-primary/5'
              }`}
              style={{
                backgroundImage: `repeating-linear-gradient(
                  to bottom,
                  transparent,
                  transparent 63px,
                  hsl(var(--border)) 63px,
                  hsl(var(--border)) 64px
                )`,
                backgroundSize: '100% 64px',
                height: `${totalHeight}px`,
                minHeight: `${totalHeight}px`,
              }}
              onClick={handleTimeSlotClick}
            >
              {/* Current time indicator */}
              {isSameDay(currentTime, date) &&
                workHours &&
                currentTime.getHours() * 60 + currentTime.getMinutes() >= workHours.startAt &&
                currentTime.getHours() * 60 + currentTime.getMinutes() <= workHours.endAt && (
                  <div
                    className='absolute left-0 right-0 z-10 border-t-2 border-red-500'
                    style={{ top: `${getCurrentTimePosition()}px` }}
                  >
                    <div className='absolute -left-3 -top-1.5 flex items-center justify-center'>
                      <div className='w-3 h-3 rounded-full bg-red-500' />
                      <div className='absolute text-xs font-medium text-red-500 -left-10'>
                        {format(currentTime, 'HH:mm')}
                      </div>
                    </div>
                  </div>
                )}

              {/* Simple Time Block */}
              {timeBlock && (
                <div
                  className='absolute left-0 right-0 z-20 bg-blue-500/20 border-2 border-blue-500 rounded-lg shadow-lg'
                  style={getBlockPosition(timeBlock)}
                >
                  {/* Duration label and confirm button */}
                  <div className='absolute inset-0 flex items-center justify-center gap-2'>
                    <div className='bg-white/95 text-blue-900 px-3 py-1 rounded text-sm font-medium'>
                      {formatDuration(timeBlock.startAt, timeBlock.endAt)}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleConfirmBlock()
                      }}
                      className='bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm font-medium transition-colors shadow-sm'
                    >
                      Crear Cita
                    </button>
                  </div>
                  
                  {/* Resize handles */}
                  <div 
                    className='absolute -top-1 left-1/2 transform -translate-x-1/2 w-16 h-2 bg-blue-500 rounded-full cursor-ns-resize hover:bg-blue-600'
                    onMouseDown={(e) => handleResizeStart('top', e)}
                  />
                  <div 
                    className='absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-16 h-2 bg-blue-500 rounded-full cursor-ns-resize hover:bg-blue-600'
                    onMouseDown={(e) => handleResizeStart('bottom', e)}
                  />
                </div>
              )}

              {/* Empty state */}
              {positionedEvents.length === 0 && !timeBlock && (
                <div className='absolute inset-0 flex items-center justify-center pointer-events-none'>
                  <div className='text-center p-6'>
                    <Clock className='h-12 w-12 text-muted-foreground mx-auto mb-4' />
                    <p className='text-muted-foreground mb-2'>
                      No hay citas programadas para este día
                    </p>
                    {!hasOpenDialogs && (
                      <p className='text-sm text-muted-foreground/70'>
                        Haz clic en cualquier horario para crear una nueva cita
                      </p>
                    )}
                  </div>
                </div>
              )}
              
              {/* Existing appointments */}
              {positionedEvents.map(({ appointment, column, totalColumns }) => {
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
                    workHours={workHours}
                  />
                )
              })}
            </div>
          </div>
          <ScrollBar orientation='vertical' />
        </ScrollArea>
      </div>

      {/* Quick appointment creation dialog */}
      <QuickAppointmentDialog
        open={isQuickDialogOpen}
        onOpenChange={(open) => {
          setIsQuickDialogOpen(open)
          if (!open) {
            handleClearBlock()
          }
        }}
        defaultDate={date}
        defaultStartTime={dialogTimeRange?.startAt}
        defaultEndTime={dialogTimeRange?.endAt}
        onSuccess={() => {
          void queryClient.invalidateQueries({
            queryKey: [UseGetAppointmentsQueryKey, date.toISOString()],
          })
          setIsQuickDialogOpen(false)
          handleClearBlock()
        }}
      />
    </div>
  )
}