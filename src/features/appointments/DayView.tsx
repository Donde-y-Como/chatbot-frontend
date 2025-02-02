import React, { useState } from 'react'
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

  const positionedEvents = usePositionedEvents({ events, selectedService })

  return (
    <div className='flex flex-col space-y-2 h-full'>
      <ServiceFilter
        services={services}
        selectedService={selectedService}
        onServiceSelect={handleSelectedService}
      />
      <div className='flex h-full'>
        <div className='w-16 flex-shrink-0 border-r'>
          <TimeSlots startAt={startAt} endAt={endAt} />
        </div>
        <div className='flex-1 relative'>
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
