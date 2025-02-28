import React, { useEffect, useState } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { EventBlock } from '@/features/appointments/EventBlock.tsx'
import {
  ServiceFilter,
  ServiceFilterProps,
} from '@/features/appointments/ServiceFilter.tsx'
import { TimeSlots } from '@/features/appointments/TimeSlots.tsx'
import { useGetClients } from '@/features/appointments/hooks/useGetClients.ts'
import { useGetEmployees } from '@/features/appointments/hooks/useGetEmployees.ts'
import { useGetServices } from '@/features/appointments/hooks/useGetServices.ts'
import { useGetWorkSchedule } from '@/features/appointments/hooks/useGetWorkSchedule.ts'
import { usePositionedEvents } from '@/features/appointments/hooks/usePositionedEvents.ts'
import type { Appointment } from './types'
import { appointmentService } from '@/features/appointments/appointmentService.ts'
import { toast } from 'sonner'
import { format, isSameDay } from 'date-fns'
import { useQueryClient } from '@tanstack/react-query'

export function DayView({
  appointments,
  date,
}: {
  appointments: Appointment[]
  date: Date
}) {
  const { data: workHours, isLoading: isWorkHoursLoading } =
    useGetWorkSchedule(date)
  const { data: employees = [], isLoading: isEmployeesLoading } =
    useGetEmployees()
  const { data: services = [], isLoading: isServicesLoading } = useGetServices()
  const { data: clients = [], isLoading: isClientsLoading } = useGetClients()

  const [selectedService, setSelectedService] =
    useState<ServiceFilterProps['selectedService']>('all')
  const [currentTime, setCurrentTime] = useState(date)

  const queryClient = useQueryClient()

  const handleSelectedService = (serviceId: string | 'all') => {
    setSelectedService(serviceId)
  }

  const positionedEvents = usePositionedEvents({
    appointments,
    selectedService,
  })

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(date)
    }, 60000)
    return () => clearInterval(interval)
  }, [date])

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
        queryKey: [
          'appointments',
          format(date, 'yyyy-MM-dd'),
          format(date, 'yyyy-MM-dd'),
        ],
      })
      toast.success('Cita cancelada exitosamente')
    } catch (e) {
      toast.error('No se pudo cancelar la cita')
    }
  }

  const isLoading =
    isWorkHoursLoading ||
    isEmployeesLoading ||
    isServicesLoading ||
    isClientsLoading

  if (isLoading) {
    return (
      <div className='flex flex-col space-y-2 h-full'>
        <Skeleton className='h-10 w-full' />
        <div className='flex relative'>
          <Skeleton className='w-16 h-screen' />
          <Skeleton className='flex-1 h-screen' />
        </div>
      </div>
    )
  }

  if (!workHours) {
    return <div>No working hours available for this date</div>
  }

  return (
    <div className='flex flex-col space-y-2 h-full'>
      <ServiceFilter
        services={services}
        selectedService={selectedService}
        onServiceSelect={handleSelectedService}
      />

      <div className='flex relative'>
        <div className='w-16 flex-shrink-0 border-r'>
          <TimeSlots startAt={workHours.startAt} endAt={workHours.endAt} />
        </div>

        {isSameDay(currentTime, date) && workHours && currentTime.getHours() * 60 < workHours.endAt && (
          <div
            className='absolute left-16 right-0 z-10 border-t-2 border-red-500'
            style={{ top: `${getCurrentTimePosition()}px` }}
          >
            <div className='absolute -left-1 -top-1 w-2 h-2 rounded-full bg-red-500' />
          </div>
        )}

        <div
          className='flex-1 relative'
          style={{
            backgroundImage: `repeating-linear-gradient(
              to bottom,
              transparent,
              transparent 63px,
              hsl(var(--border)) 63px,
              hsl(var(--border)) 64px
            )`,
            backgroundSize: '100% 64px',
          }}
        >
          {positionedEvents.map(({ appointment, column, totalColumns }) => {
            const employee = employees.find(
              (emp) => emp.id === appointment.employeeId
            )
            if (!employee) return null

            return (
              <EventBlock
                cancelAppointment={handleCancel}
                key={appointment._id}
                appointment={appointment}
                client={clients.find((c) => c.id === appointment.clientId)!}
                employee={employee}
                service={services.find((s) => s.id === appointment.serviceId)!}
                column={column}
                totalColumns={totalColumns}
                workHours={workHours}
              />
            )
          })}
        </div>
      </div>
    </div>
  )
}
