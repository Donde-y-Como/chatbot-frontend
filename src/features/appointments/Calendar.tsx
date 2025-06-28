import { useEffect, useMemo, useState } from 'react'
import { Separator } from '@radix-ui/react-separator'
import { CalendarHeader } from '@/features/appointments/CalendarHeader.tsx'
import { CalendarSidebar } from '@/features/appointments/CalendarSidebar.tsx'
import { DayView } from '@/features/appointments/DayView.tsx'
import { useGetAppointments } from '@/features/appointments/hooks/useGetAppointments.ts'
import { useGetEmployees } from '@/features/appointments/hooks/useGetEmployees.ts'
import { SidebarTrigger } from '../../components/ui/sidebar'

export function Calendar() {
  const { data: employees } = useGetEmployees()
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [view, setView] = useState<'day' | 'week'>('day')
  const { data: appointments } = useGetAppointments(selectedDate.toISOString())
  const [selectedEmployees, setSelectedEmployees] = useState<Set<string>>(
    new Set()
  )

  useEffect(() => {
    setSelectedEmployees(new Set(employees?.map((emp) => emp.id) ?? []))
  }, [employees])

  const filteredAppointments = useMemo(() => {
    if (!appointments) return []

    return appointments.filter((appointment) => {
      if (appointment.employeeIds.length === 0) {
        return true
      }

      return appointment.employeeIds.some((id) => selectedEmployees.has(id))
    })
  }, [appointments, selectedEmployees])

  return (
    <div className='flex flex-col h-screen p-2 w-full relative'>
      <div className='flex gap-2 mb-2'>
        <SidebarTrigger variant='outline' className='sm:hidden' />
        <Separator orientation='vertical' className='h-7 sm:hidden' />
        <h1 className='text-2xl font-bold'>Citas</h1>
      </div>

      <div className='h-screen w-full flex bg-background text-foreground relative' role='application' aria-label='Sistema de citas'>
        <aside 
          className='flex-shrink-0' 
          role='complementary' 
          aria-label='Panel lateral de calendario y filtros'
        >
          <CalendarSidebar
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            employees={employees}
            selectedEmployees={selectedEmployees}
            setSelectedEmployees={setSelectedEmployees}
          />
        </aside>

        <main className='flex-1 flex flex-col overflow-hidden' role='main' aria-label='Vista principal del calendario'>
          <header role='banner'>
            <CalendarHeader
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              view={view}
              setView={setView}
            />
          </header>

          <section className='flex-1 overflow-y-auto' aria-label='Vista de citas del día'>
            <DayView appointments={filteredAppointments} date={selectedDate} />
          </section>
        </main>
      </div>
    </div>
  )
}
