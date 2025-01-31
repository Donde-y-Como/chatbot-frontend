import { useCallback, useState } from 'react'
import { setHours, setMinutes } from 'date-fns'
import { DragEndEvent } from '@dnd-kit/core'
import type { Event } from '../types'

export function useCalendarEvents(initialEvents: Event[]) {
  const [events, setEvents] = useState<Event[]>(initialEvents)

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      setEvents((prevEvents) => {
        return prevEvents.map((ev) => {
          if (ev.id === active.id) {
            const dropDate = new Date(over.id)
            const timeDiff = ev.end.getTime() - ev.start.getTime()
            const newStart = setMinutes(
              setHours(dropDate, ev.start.getHours()),
              ev.start.getMinutes()
            )
            const newEnd = new Date(newStart.getTime() + timeDiff)
            return { ...ev, start: newStart, end: newEnd }
          }
          return ev
        })
      })
    }
  }, [])

  const updateEvent = useCallback((updatedEvent: Event) => {
    setEvents((prevEvents) =>
      prevEvents.map((ev) => (ev.id === updatedEvent.id ? updatedEvent : ev))
    )
  }, [])

  const createEvent = useCallback((newEvent: Omit<Event, 'id'>) => {
    setEvents((prevEvents) => [
      ...prevEvents,
      { ...newEvent, id: `event-${Date.now()}` },
    ])
  }, [])

  const deleteEvent = useCallback((eventId: string) => {
    setEvents((prevEvents) => prevEvents.filter((ev) => ev.id !== eventId))
  }, [])

  return { events, handleDragEnd, updateEvent, createEvent, deleteEvent }
}