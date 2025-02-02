import React from 'react'
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
import type { Employee, Event } from './types'

interface EventBlockProps {
  event: Event
  employee: Employee
  column: number
  totalColumns: number
  workHours: {
    startAt: number
    endAt: number
  }
}

export function EventBlock({
  event,
  employee,
  column,
  totalColumns,
  workHours,
}: EventBlockProps) {
  // Calculate top offset and height in minutes from the start of the day view (starting at 9 AM = 540 minutes)
  const startMinutes =
    event.start.getHours() * 60 + event.start.getMinutes() - workHours.startAt
  const duration = (event.end.getTime() - event.start.getTime()) / (1000 * 60)

  // Calculate left offset and width based on column info.
  const leftPercent = (column / totalColumns) * 100
  const widthPercent = 100 / totalColumns

  return (
    <Dialog>
      <DialogTrigger asChild>
        <div
          className='absolute rounded p-2 overflow-hidden cursor-pointer transition-opacity hover:opacity-90'
          style={{
            top: `${startMinutes}px`,
            height: `${duration}px`,
            left: `calc(${leftPercent}% + 2px)`,
            width: `calc(${widthPercent}% - 4px)`,
            backgroundColor: employee.color,
          }}
        >
          <div className='text-white text-sm font-semibold truncate'>
            {event.client}
          </div>
          <div className='text-white text-xs truncate'>{event.service}</div>
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
