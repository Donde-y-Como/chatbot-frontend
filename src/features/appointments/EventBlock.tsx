import React from 'react'
import { format, setMinutes } from 'date-fns'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Client } from '@/features/chats/ChatTypes.ts'
import type { Appointment, Employee,  Service } from './types'

interface EventBlockProps {
  appointment: Appointment
  employee: Employee
  service: Service
  client: Client
  column: number
  totalColumns: number
  workHours: {
    startAt: number // minutes since midnight (e.g. 9AM = 540)
    endAt: number // minutes since midnight (e.g. 18PM = 1080)
  }
}

// This constant defines how many pixels represent one minute.
// For example, if each hour slot is 64px tall then:
const MINUTE_HEIGHT = 64 / 60 // ~1.0667 pixels per minute
const verticalGap = 4

export function EventBlock({
  appointment,
  employee,
  service,
  client,
  column,
  totalColumns,
  workHours,
}: EventBlockProps) {
  // Calculate the start time in minutes relative to the work day start.
  // (e.g. if event starts at 9:30 and workHours.startAt is 540 then:
  //  (570 - 540) = 30 minutes into the grid)
  const eventStartMinutes = appointment.timeRange.startAt
  const startMinutesRelative = eventStartMinutes - workHours.startAt

  // Calculate duration in minutes.
  const duration = (appointment.timeRange.endAt - appointment.timeRange.startAt)

  // Multiply by the pixel conversion factor.
  const topOffset = startMinutesRelative * MINUTE_HEIGHT
  const eventHeight = duration * MINUTE_HEIGHT

  const adjustedTopOffset = topOffset + verticalGap / 2
  const adjustedEventHeight = eventHeight - verticalGap

  // Calculate left offset and width based on column info.
  const leftPercent = (column / totalColumns) * 100
  const widthPercent = 100 / totalColumns

  return (
    <Dialog>
      <DialogTrigger asChild>
        <div
          className='absolute rounded  overflow-hidden cursor-pointer transition-opacity hover:opacity-90'
          style={{
            top: `${adjustedTopOffset}px`,
            height: `${adjustedEventHeight}px`,
            left: `calc(${leftPercent}% + 2px)`,
            width: `calc(${widthPercent}% - 4px)`,
            backgroundColor: employee.color,
          }}
        >
          {adjustedEventHeight >= MINUTE_HEIGHT * 60 - verticalGap ? (
            <div className='p-2'>
              <div className='flex items-center justify-between text-white text-sm font-semibold truncate'>
                {client.profileName}
                <small>
                  {format(setMinutes(appointment.date, appointment.timeRange.startAt), 'HH:mm')} - {format(setMinutes(appointment.date, appointment.timeRange.endAt), 'HH:mm')}
                </small>
              </div>
              <div className='text-white text-xs truncate'>{service.name}</div>
            </div>
          ) : (
            <div className='p-1 flex items-center justify-between text-white text-xs font-semibold truncate'>
              {client.profileName} - {service.name}
              <small>
                {format(setMinutes(appointment.date, appointment.timeRange.startAt), 'HH:mm')} - {format(setMinutes(appointment.date, appointment.timeRange.endAt), 'HH:mm')}
              </small>
            </div>
          )}
        </div>
      </DialogTrigger>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>
            {client.profileName} - {service.name}
          </DialogTitle>
          <DialogDescription>{appointment.notes}</DialogDescription>
        </DialogHeader>
        <div className='mt-4 space-y-2 text-sm'>
          <div>
            <span className='font-semibold'>Notes:</span> {appointment.notes}
          </div>
          <div>
            <span className='font-semibold'>Employee:</span> {employee.name}
          </div>
          <div>
            <span className='font-semibold'>Start:</span>{' '}
            {appointment.date.toLocaleString()}
          </div>
          <div>
            <span className='font-semibold'>End:</span>{' '}
            {appointment.date.toLocaleString()}
          </div>
        </div>
        <DialogClose asChild>
          <Button className='mt-4 w-full'>Close</Button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  )
}
