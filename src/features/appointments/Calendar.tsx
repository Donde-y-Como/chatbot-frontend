import { useEffect, useMemo, useState } from 'react'
import { isSameDay, setMinutes } from 'date-fns'
import { CalendarHeader } from '@/features/appointments/CalendarHeader.tsx'
import { CalendarSidebar } from '@/features/appointments/CalendarSidebar.tsx'
import { DayView } from '@/features/appointments/DayView.tsx'
import { useGetEmployees } from '@/features/appointments/hooks/useGetEmployees.ts'
import { Event } from '@/features/appointments/types.ts'

export function Calendar() {
  const { data: employees } = useGetEmployees()
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [view, setView] = useState<'day' | 'week'>('day')
  const events = useMemo<Event[]>(
    () => [
      {
        id: '1',
        employeeId: '0c54613ab2c',
        start: setMinutes(new Date(), 900),
        end: setMinutes(new Date(),930),
        serviceId: 'a19eb22f-17bd-449a-9c29-cbefa2683bc9',
        clientId: "f8b3aae00c3",
        notes: '',
        status: 'scheduled',
      } satisfies Event,
      {
        id: '2',
        clientId: "f8b3aae00c3",
        employeeId: 'f44b57cc5a3',
        start: setMinutes(new Date(), 900),
        end: setMinutes(new Date(), 960),
        serviceId: 'haircut-id',
        notes: '',
        status: 'scheduled',
      } satisfies Event,
      {
        id: '3',
        clientId: "f8b3aae00c3",
        employeeId: '91b7f1845ce',
        start: setMinutes(new Date(), 1000),
        end: setMinutes(new Date(), 1060),
        serviceId: 'haircut-id',
        notes: '',
        status: 'scheduled',
      } satisfies Event,
    ],
    []
  )
  const [selectedEmployees, setSelectedEmployees] = useState<Set<string>>(
    new Set()
  )

  useEffect(() => {
    setSelectedEmployees(new Set(employees?.map((emp) => emp.id) ?? []))
  }, [employees])

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
        employees={employees}
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
          <DayView events={filteredEvents} date={selectedDate} />
        </div>
      </div>
    </div>
  )
}
