import React, { useEffect, useState } from 'react'
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
import { MakeAppointmentDialog } from '@/features/appointments/components/MakeAppointmentDialog.tsx'
import { appointmentService } from '@/features/appointments/appointmentService.ts'
import { UseGetAppointmentsQueryKey } from '@/features/appointments/hooks/useGetAppointments.ts'
import { useDialogState } from '@/features/appointments/contexts/DialogStateContext'
import { useGetClients } from '@/features/appointments/hooks/useGetClients.ts'
import { useGetEmployees } from '@/features/appointments/hooks/useGetEmployees.ts'
import { useGetServices } from '@/features/appointments/hooks/useGetServices.ts'
import { useGetWorkSchedule } from '@/features/appointments/hooks/useGetWorkSchedule.ts'
import { usePositionedEvents } from '@/features/appointments/hooks/usePositionedEvents.ts'
import type { Appointment, MinutesTimeRange } from './types'

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
  
  // States for appointment modal
  const [showAppointmentModal, setShowAppointmentModal] = useState(false)
  const [selectedTimeRange, setSelectedTimeRange] = useState<MinutesTimeRange | null>(null)
  const [isRadixUIActive, setIsRadixUIActive] = useState(false)

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

  // Effect para detectar actividad en elementos de Radix UI
  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      
      // Si hay un clic en elementos de Radix UI, marcar que hay actividad
      if (
        target.closest('[data-radix-select-content]') ||
        target.closest('[data-radix-select-item]') ||
        target.closest('[data-radix-popover-content]') ||
        target.closest('[data-radix-dialog-content]') ||
        target.closest('[data-radix-portal]') ||
        // Detectar elementos con atributos de Radix
        target.hasAttribute('data-radix-select-content') ||
        target.hasAttribute('data-radix-select-item') ||
        // Si el elemento está renderizado directamente en el body (portal)
        (target.parentElement === document.body && target.getAttribute('data-radix-select-content'))
      ) {
        setIsRadixUIActive(true)
        // Resetear después de un breve delay
        setTimeout(() => setIsRadixUIActive(false), 150)
      }
    }
    
    // Usar capturing phase para detectar antes que otros listeners
    document.addEventListener('click', handleGlobalClick, true)
    document.addEventListener('mousedown', handleGlobalClick, true)
    
    return () => {
      document.removeEventListener('click', handleGlobalClick, true)
      document.removeEventListener('mousedown', handleGlobalClick, true)
    }
  }, [])

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

  // Handle click on time slot to create appointment
  const handleTimeSlotClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!workHours) return
    
    // PRIMERA VERIFICACIÓN: Si hay dialogs abiertos, no crear cita
    if (hasOpenDialogs) {
      return
    }
    
    // SEGUNDA VERIFICACIÓN: Si hay actividad reciente en Radix UI, no crear cita
    if (isRadixUIActive) {
      return
    }
    
    // TERCERA VERIFICACIÓN: Si el clic viene de un elemento interactivo
    const target = event.target as HTMLElement
    
    // Si el clic viene de elementos de Radix UI o interactivos, no crear cita
    if (
      target.closest('button') ||
      target.closest('[role="dialog"]') ||
      target.closest('[data-dialog-content]') ||
      target.closest('[data-appointment-block]') ||
      target.closest('.appointment-block') ||
      target.closest('[data-radix-popper-content-wrapper]') ||
      target.closest('[data-radix-dialog-content]') ||
      target.closest('[data-radix-select-content]') ||
      target.closest('[data-radix-select-item]') ||
      target.closest('[cmdk-root]') ||
      target.closest('[data-radix-popover-content]') ||
      target.closest('[data-radix-portal]') ||
      target.hasAttribute('data-radix-select-trigger') ||
      target.hasAttribute('data-radix-select-content') ||
      target.hasAttribute('data-radix-select-item') ||
      target.getAttribute('data-appointment-block') === 'true'
    ) {
      return
    }
    
    const rect = event.currentTarget.getBoundingClientRect()
    const clickY = event.clientY - rect.top
    
    // Each hour is 64px tall
    const pixelsPerMinute = 64 / 60
    const clickedMinutesFromStart = Math.floor(clickY / pixelsPerMinute)
    
    // Round to nearest 15 minutes
    const roundedMinutes = Math.round(clickedMinutesFromStart / 15) * 15
    const startAtMinutes = workHours.startAt + roundedMinutes
    
    // Default 1 hour duration
    const endAtMinutes = startAtMinutes + 60
    
    // Make sure we don't exceed work hours
    if (startAtMinutes >= workHours.endAt || endAtMinutes > workHours.endAt) {
      return
    }
    
    const timeRange: MinutesTimeRange = {
      startAt: startAtMinutes,
      endAt: Math.min(endAtMinutes, workHours.endAt)
    }
    
    setSelectedTimeRange(timeRange)
    setShowAppointmentModal(true)
  }

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
              className='flex-1 relative cursor-pointer'
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

              {positionedEvents.length === 0 ? (
                <div className='absolute inset-0 flex items-center justify-center'>
                  <div className='text-center p-6'>
                    <Clock className='h-12 w-12 text-muted-foreground mx-auto mb-4' />
                    <p className='text-muted-foreground'>
                      No hay citas programadas para este día
                    </p>
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
      
      {/* Appointment Creation Modal */}
      <MakeAppointmentDialog
        defaultOpen={showAppointmentModal}
        onOpenChange={(open) => {
          setShowAppointmentModal(open)
          if (!open) {
            setSelectedTimeRange(null)
          }
        }}
        defaultDate={date}
        defaultTimeRange={selectedTimeRange || undefined}
      />
    </div>
  )
}
