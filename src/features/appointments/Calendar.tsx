import { useEffect, useMemo, useState } from 'react'
import { isSameDay } from 'date-fns'
import { CalendarHeader } from '@/features/appointments/CalendarHeader.tsx'
import { CalendarSidebar } from '@/features/appointments/CalendarSidebar.tsx'
import { DayView } from '@/features/appointments/DayView.tsx'
import {
  generateMockEvents,
  mockEmployees,
} from '@/features/appointments/mockData.ts'

export function Calendar() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [view, setView] = useState<'day' | 'week'>('day')
  const events = useMemo(() => generateMockEvents(), [])
  const [selectedEmployees, setSelectedEmployees] = useState<Set<string>>(
    new Set(mockEmployees.map((emp) => emp.id))
  )

  const filteredEvents = useMemo(() => {
    return events.filter(
      (event) =>
        selectedEmployees.has(event.employeeId) &&
        isSameDay(event.start, selectedDate)
    )
  }, [events, selectedEmployees, selectedDate])

  return (
    <div className='h-screen w-full flex bg-background text-foreground'>
      <CalendarSidebar
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        employees={mockEmployees}
        selectedEmployees={selectedEmployees}
        setSelectedEmployees={setSelectedEmployees}
      />

      <div className='flex-1 flex flex-col overflow-hidden'>
        <CalendarHeader
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          view={view}
          setView={setView}
        />

        <div className='flex-1 overflow-y-auto'>
          <DayView events={filteredEvents} />
        </div>
      </div>
    </div>
  )
}
