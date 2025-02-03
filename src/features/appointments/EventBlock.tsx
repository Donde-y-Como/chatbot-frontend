import React from 'react'
import { format } from 'date-fns'
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
import type { Employee, Event, Service } from './types'

interface EventBlockProps {
  event: Event
  employee: Employee
  service: Service
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
  event,
  employee,
  service,
  column,
  totalColumns,
  workHours,
}: EventBlockProps) {
  // Calculate the start time in minutes relative to the work day start.
  // (e.g. if event starts at 9:30 and workHours.startAt is 540 then:
  //  (570 - 540) = 30 minutes into the grid)
  const eventStartMinutes =
    event.start.getHours() * 60 + event.start.getMinutes()
  const startMinutesRelative = eventStartMinutes - workHours.startAt

  // Calculate duration in minutes.
  const duration = (event.end.getTime() - event.start.getTime()) / (1000 * 60)

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
          className='absolute rounded p-2 overflow-hidden cursor-pointer transition-opacity hover:opacity-90'
          style={{
            top: `${adjustedTopOffset}px`,
            height: `${adjustedEventHeight}px`,
            left: `calc(${leftPercent}% + 2px)`,
            width: `calc(${widthPercent}% - 4px)`,
            backgroundColor: employee.color,
          }}
        >
          <div className='flex items-center justify-between text-white text-sm font-semibold truncate'>
            {event.client}
            <small>
              {format(event.start, 'HH:mm')} - {format(event.end, 'HH:mm')}
            </small>
          </div>
          <div className='text-white text-xs truncate'>{service.name}</div>
        </div>
      </DialogTrigger>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>
            {event.client} - {event.service}
          </DialogTitle>
          <DialogDescription>{event.notes}</DialogDescription>
        </DialogHeader>
        <div className='mt-4 space-y-2 text-sm'>
          <div>
            <span className='font-semibold'>Status:</span> {event.status}
          </div>
          <div>
            <span className='font-semibold'>Employee:</span> {employee.name}
          </div>
          <div>
            <span className='font-semibold'>Start:</span>{' '}
            {event.start.toLocaleString()}
          </div>
          <div>
            <span className='font-semibold'>End:</span>{' '}
            {event.end.toLocaleString()}
          </div>
        </div>
        <DialogClose asChild>
          <Button className='mt-4 w-full'>Close</Button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  )
}
