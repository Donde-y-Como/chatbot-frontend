import { useEffect, useMemo, useState } from 'react'
import { format, isSameDay } from 'date-fns'
import { CalendarHeader } from '@/features/appointments/CalendarHeader.tsx'
import { CalendarSidebar } from '@/features/appointments/CalendarSidebar.tsx'
import { DayView } from '@/features/appointments/DayView.tsx'
import { useGetAppointments } from '@/features/appointments/hooks/useGetAppointments.ts'
import { useGetEmployees } from '@/features/appointments/hooks/useGetEmployees.ts'
import { SidebarTrigger } from '../../components/ui/sidebar'
import { Separator } from '@radix-ui/react-separator'
import { MakeAppointmentDialog } from './MakeAppointmentDialog'

export function Calendar() {
  const { data: employees } = useGetEmployees()
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [view, setView] = useState<'day' | 'week'>('day')
  const { data: events } = useGetAppointments(
    format(selectedDate, 'yyyy-MM-dd')
  )
  const [selectedEmployees, setSelectedEmployees] = useState<Set<string>>(
    new Set()
  )

  useEffect(() => {
    setSelectedEmployees(new Set(employees?.map((emp) => emp.id) ?? []))
  }, [employees])

  const filteredEvents = useMemo(() => {
    if (!events) return [];
  
    return events.filter((event) => {
      // Handle empty employeeIds array
      if (!event.employeeIds || event.employeeIds.length === 0) {
        // You can decide if unassigned events should be shown or not
        // Option 1: Always show unassigned events
        return isSameDay(event.date, selectedDate);
        
        // Option 2: Only show unassigned events if specifically selected
        // return selectedEmployees.has('unassigned') && isSameDay(event.date, selectedDate);
      }
      
      // Check if any of the event's employeeIds are in the selectedEmployees set
      const hasSelectedEmployee = event.employeeIds.some(id => selectedEmployees.has(id));
      
      return hasSelectedEmployee && isSameDay(event.date, selectedDate);
    });
  }, [events, selectedEmployees, selectedDate]);

  return (
    <div className='flex flex-col h-screen p-2 w-full'>
      <div className='flex gap-2 mb-2'>
        <SidebarTrigger variant='outline' className='sm:hidden' />
        <Separator orientation='vertical' className='h-7 sm:hidden' />
        <h1 className='text-2xl font-bold'>Citas</h1>
      </div>

      <div className="w-full sm:hidden">
        <MakeAppointmentDialog />
      </div>

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
            <DayView appointments={filteredEvents} date={selectedDate} />
          </div>
        </div>
      </div>
    </div>
  )
}
