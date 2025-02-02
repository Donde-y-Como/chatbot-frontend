import React, { useEffect, useState } from 'react'
import { EventBlock } from '@/features/appointments/EventBlock.tsx'
import {
  ServiceFilter,
  ServiceFilterProps,
} from '@/features/appointments/ServiceFilter.tsx'
import { TimeSlots } from '@/features/appointments/TimeSlots.tsx'
import { usePositionedEvents } from '@/features/appointments/hooks/usePositionedEvents.ts'
import {
  mockEmployees,
  mockServices,
} from '@/features/appointments/mockData.ts'
import type { Employee, Event, Service } from './types'

export function DayView({ events }: { events: Event[] }) {
  const startAt = 540
  const endAt = 1080
  const employees = mockEmployees satisfies Employee[]
  const services = mockServices satisfies Service[]
  const [selectedService, setSelectedService] =
    useState<ServiceFilterProps['selectedService']>('all')

  const handleSelectedService = (serviceId: string | 'all') => {
    setSelectedService(serviceId)
  }
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000)
    return () => clearInterval(interval)
  }, [])

  const positionedEvents = usePositionedEvents({ events, selectedService })

  const getCurrentTimePosition = () => {
    const startMinutes = currentTime.getHours() * 60 + currentTime.getMinutes()
    const startMinutesRelative = startMinutes - startAt

    return (startMinutesRelative * 64) / 60
  }

  return (
    <div className='flex flex-col space-y-2 h-full'>
      <ServiceFilter
        services={services}
        selectedService={selectedService}
        onServiceSelect={handleSelectedService}
      />

      <div className='flex h-full relative'>
        <div className='w-16 flex-shrink-0 border-r'>
          <TimeSlots startAt={startAt} endAt={endAt} />
        </div>

        <div
          className='absolute left-16 right-0 z-10 border-t-2 border-red-500'
          style={{ top: `${getCurrentTimePosition()}px` }}
        >
          <div className='absolute -left-1 -top-1 w-2 h-2 rounded-full bg-red-500' />
        </div>

        <div
          className='flex-1 relative  '
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
          {positionedEvents.map(({ event, column, totalColumns }) => {
            const employee = employees.find(
              (emp) => emp.id === event.employeeId
            )
            if (!employee) return null

            return (
              <EventBlock
                key={event.id}
                event={event}
                employee={employee}
                column={column}
                totalColumns={totalColumns}
                workHours={{ startAt, endAt }}
              />
            )
          })}
        </div>
      </div>
    </div>
  )
}
