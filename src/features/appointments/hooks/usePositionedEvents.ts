import { useMemo } from 'react'
import type { Event } from '@/features/appointments/types.ts'

interface PositionedEvent {
  event: Event
  column: number
  totalColumns: number
}

export function usePositionedEvents({
  events,
  selectedService,
}: {
  events: Event[]
  selectedService: string | 'all'
}) {
  const filteredEvents = useMemo(() => {
    return events.filter((event) =>
      selectedService === 'all' ? true : event.serviceId === selectedService
    )
  }, [events, selectedService])

  return useMemo(() => {
    const sorted = [...filteredEvents].sort(
      (a, b) => a.start.getTime() - b.start.getTime()
    )
    const results: PositionedEvent[] = []
    let currentGroup: Event[] = []
    let groupEnd = 0

    const flushGroup = () => {
      if (currentGroup.length === 0) return
      // For the current group, assign columns using a greedy algorithm.
      // columns[i] will store the end time of the last event in column i.
      const columns: number[] = []
      const groupResults: { event: Event; column: number }[] = []

      currentGroup.forEach((ev) => {
        // Find the first column that is free (i.e. its last event ended before this event starts)
        let assigned = false
        for (let i = 0; i < columns.length; i++) {
          if (columns[i] <= ev.start.getTime()) {
            columns[i] = ev.end.getTime()
            groupResults.push({ event: ev, column: i })
            assigned = true
            break
          }
        }
        if (!assigned) {
          // No free column, create a new one.
          columns.push(ev.end.getTime())
          groupResults.push({ event: ev, column: columns.length - 1 })
        }
      })

      const totalColumns = columns.length
      groupResults.forEach((r) => {
        results.push({ event: r.event, column: r.column, totalColumns })
      })
      currentGroup = []
    }

    sorted.forEach((ev) => {
      if (currentGroup.length === 0) {
        currentGroup.push(ev)
        groupEnd = ev.end.getTime()
      } else {
        // If the event starts before the current group ends, it's overlapping.
        if (ev.start.getTime() < groupEnd) {
          currentGroup.push(ev)
          groupEnd = Math.max(groupEnd, ev.end.getTime())
        } else {
          // flush the current group and start a new one.
          flushGroup()
          currentGroup.push(ev)
          groupEnd = ev.end.getTime()
        }
      }
    })
    flushGroup()
    return results
  }, [filteredEvents])
}
