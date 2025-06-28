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

export function DayView({
  appointments,
  date,
}: {
  appointments: Appointment[]
  date: Date
}) {
  const { workHours, isLoading: isWorkHoursLoading } =
    useGetWorkSchedule(date)
  const { data: allEmployees = [], isLoading: isEmployeesLoading } =
    useGetEmployees()
  const { data: allServices = [], isLoading: isServicesLoading } =
    useGetServices()
  const { data: clients = [], isLoading: isClientsLoading } = useGetClients()

  const [selectedService, setSelectedService] =
    useState<ServiceFilterProps['selectedService']>('all')
  const [currentTime, setCurrentTime] = useState(date)
  
  // Time slot selection state for Google Calendar-style appointment creation
  const [isSelecting, setIsSelecting] = useState(false)
  const [selectedTimeRange, setSelectedTimeRange] = useState<{
    startAt: number
    endAt: number
  } | null>(null)
  const [isQuickDialogOpen, setIsQuickDialogOpen] = useState(false)
  const [dialogTimeRange, setDialogTimeRange] = useState<{
    startAt: number
    endAt: number
  } | null>(null)
  const isDragging = useRef(false)
  const startY = useRef(0)
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

  // Removed click detection utility - no longer needed since day clicking is disabled

  const getCurrentTimePosition = () => {
    if (!workHours) return -100 // Position off-screen

    const startMinutes = currentTime.getHours() * 60 + currentTime.getMinutes()
    const startMinutesRelative = startMinutes - workHours.startAt
    return (startMinutesRelative * 64) / 60
  }

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

  // Google Calendar-style time slot selection logic
  const getTimeFromY = useCallback((y: number): number => {
    if (!workHours || !timeSlotAreaRef.current) return 0
    
    const rect = timeSlotAreaRef.current.getBoundingClientRect()
    const relativeY = y - rect.top
    const minutesFromStart = Math.round((relativeY / 64) * 60)
    const snapToMinutes = 15 // Snap to 15-minute intervals
    const snappedMinutes = Math.round(minutesFromStart / snapToMinutes) * snapToMinutes
    
    return Math.max(0, Math.min(workHours.endAt - workHours.startAt, snappedMinutes)) + workHours.startAt
  }, [workHours])

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    // Don't start selection if modals are open or if clicking on an appointment
    if (hasOpenDialogs || e.target !== e.currentTarget) return
    
    const startTime = getTimeFromY(e.clientY)
    const minDuration = 30 // Minimum 30 minutes
    
    setSelectedTimeRange({
      startAt: startTime,
      endAt: startTime + minDuration
    })
    setIsSelecting(true)
    isDragging.current = true
    startY.current = e.clientY
    
    e.preventDefault()
  }, [hasOpenDialogs, getTimeFromY])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging.current || !selectedTimeRange) return
    
    const currentTime = getTimeFromY(e.clientY)
    const minDuration = 30
    
    if (currentTime >= selectedTimeRange.startAt) {
      // Dragging down - extend end time
      setSelectedTimeRange(prev => prev ? {
        ...prev,
        endAt: Math.max(currentTime, prev.startAt + minDuration)
      } : null)
    } else {
      // Dragging up - adjust start time
      setSelectedTimeRange(prev => prev ? {
        startAt: currentTime,
        endAt: Math.max(prev.endAt, currentTime + minDuration)
      } : null)
    }
  }, [selectedTimeRange, getTimeFromY])

  const handleMouseUp = useCallback(() => {
    if (!isDragging.current || !selectedTimeRange) return
    
    isDragging.current = false
    setIsSelecting(false)
    
    // Capture the current time range for the dialog
    setDialogTimeRange({ ...selectedTimeRange })
    
    // Clear the visual selection immediately
    setSelectedTimeRange(null)
    
    // Open appointment creation dialog with pre-filled time
    setIsQuickDialogOpen(true)
  }, [selectedTimeRange])

  const handleClearSelection = useCallback(() => {
    setSelectedTimeRange(null)
    setIsSelecting(false)
    setDialogTimeRange(null)
    isDragging.current = false
  }, [])

  // Clear selection when clicking elsewhere or on appointments
  const handleTimeSlotAreaClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isDragging.current) {
      handleClearSelection()
    }
  }, [handleClearSelection])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedTimeRange) {
        handleClearSelection()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [selectedTimeRange, handleClearSelection])

  const isLoading =
    isWorkHoursLoading ||
    isEmployeesLoading ||
    isServicesLoading ||
    isClientsLoading

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

  // Calculate the total height needed for the schedule
  const totalHeight = ((workHours.endAt - workHours.startAt) / 60) * 64

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
              className={`flex-1 relative transition-colors ${
                hasOpenDialogs 
                  ? 'cursor-not-allowed opacity-60' 
                  : isSelecting 
                    ? 'cursor-ns-resize' 
                    : 'cursor-crosshair hover:bg-primary/5'
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
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onClick={handleTimeSlotAreaClick}
            >
              {isSameDay(currentTime, date) &&
                workHours &&
                currentTime.getHours() * 60 + currentTime.getMinutes() >=
                  workHours.startAt &&
                currentTime.getHours() * 60 + currentTime.getMinutes() <=
                  workHours.endAt && (
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

              {/* Time selection overlay - Google Calendar style */}
              {selectedTimeRange && workHours && (
                <div
                  className={`absolute left-0 right-0 z-20 bg-primary/20 border-2 border-primary rounded-md transition-all duration-200 ${
                    isSelecting ? 'shadow-lg' : 'shadow-md hover:shadow-lg'
                  }`}
                  style={{
                    top: `${((selectedTimeRange.startAt - workHours.startAt) / 60) * 64}px`,
                    height: `${((selectedTimeRange.endAt - selectedTimeRange.startAt) / 60) * 64}px`,
                  }}
                >
                  {/* Background pattern */}
                  <div className='absolute inset-0 opacity-30 bg-gradient-to-r from-primary/10 to-primary/30 rounded-md' />
                  
                  {/* Time display */}
                  <div className='absolute inset-0 flex items-center justify-center'>
                    <div className='bg-primary text-primary-foreground px-3 py-1.5 rounded-md text-sm font-medium shadow-lg transform transition-transform hover:scale-105'>
                      {Math.floor(selectedTimeRange.startAt / 60)}:
                      {String(selectedTimeRange.startAt % 60).padStart(2, '0')} -{' '}
                      {Math.floor(selectedTimeRange.endAt / 60)}:
                      {String(selectedTimeRange.endAt % 60).padStart(2, '0')}
                      {isSelecting && (
                        <span className='ml-2 text-xs'>
                          ({Math.round((selectedTimeRange.endAt - selectedTimeRange.startAt) / 60 * 10) / 10}h)
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* Selection handles */}
                  <div className='absolute -top-1.5 left-1/2 transform -translate-x-1/2 w-8 h-3 bg-primary rounded-full cursor-ns-resize opacity-80 hover:opacity-100 transition-opacity shadow-sm' />
                  <div className='absolute -bottom-1.5 left-1/2 transform -translate-x-1/2 w-8 h-3 bg-primary rounded-full cursor-ns-resize opacity-80 hover:opacity-100 transition-opacity shadow-sm' />
                  
                  {/* Side indicators */}
                  <div className='absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-l-md' />
                  <div className='absolute right-0 top-0 bottom-0 w-1 bg-primary rounded-r-md' />
                </div>
              )}

              {positionedEvents.length === 0 ? (
                <div className='absolute inset-0 flex items-center justify-center pointer-events-none'>
                  <div className='text-center p-6'>
                    <Clock className='h-12 w-12 text-muted-foreground mx-auto mb-4' />
                    <p className='text-muted-foreground mb-2'>
                      No hay citas programadas para este día
                    </p>
                    {!hasOpenDialogs && (
                      <p className='text-sm text-muted-foreground/70'>
                        Haz clic y arrastra para crear una nueva cita
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                positionedEvents.map(
                  ({ appointment, column, totalColumns }) => {
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
                        client={
                          clients.find((c) => c.id === appointment.clientId)!
                        }
                        employees={employees}
                        services={services}
                        column={column}
                        totalColumns={totalColumns}
                        workHours={workHours}
                      />
                    )
                  }
                )
              )}
            </div>
          </div>
          <ScrollBar orientation='vertical' />
        </ScrollArea>
      </div>

      {/* Quick appointment creation dialog */}
      <QuickAppointmentDialog
        open={isQuickDialogOpen}
        onOpenChange={(open) => {
          console.log('DayView opening dialog with:', {
            open,
            selectedTimeRange,
            dialogTimeRange,
            startAt: dialogTimeRange?.startAt,
            endAt: dialogTimeRange?.endAt
          })
          setIsQuickDialogOpen(open)
          if (!open) {
            // Clear selection when dialog closes
            handleClearSelection()
          }
        }}
        defaultDate={date}
        defaultStartTime={dialogTimeRange?.startAt}
        defaultEndTime={dialogTimeRange?.endAt}
        onSuccess={() => {
          // Refresh appointments after successful creation
          void queryClient.invalidateQueries({
            queryKey: [UseGetAppointmentsQueryKey, date.toISOString()],
          })
          setIsQuickDialogOpen(false)
          handleClearSelection()
        }}
      />
    </div>
  )
}
