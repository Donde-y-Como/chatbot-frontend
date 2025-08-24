import { useEffect, useMemo, useState } from 'react'
import { Separator } from '@radix-ui/react-separator'
import { startOfWeek, endOfWeek } from 'date-fns'
import { MenuIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CalendarHeader } from '@/features/appointments/CalendarHeader.tsx'
import { CalendarSidebar } from '@/features/appointments/CalendarSidebar.tsx'
import { DayView } from '@/features/appointments/DayView.tsx'
import { WeekView } from '@/features/appointments/WeekView.tsx'
import { useGetAppointments } from '@/features/appointments/hooks/useGetAppointments.ts'
import { useGetEmployees } from '@/features/appointments/hooks/useGetEmployees.ts'
import { SidebarTrigger } from '../../components/ui/sidebar'

// Calendar Sidebar Toggle Component
function CalendarSidebarToggle({ isOpen, onToggle }: { isOpen: boolean; onToggle: () => void }) {
  return (
    <Button
      variant='ghost'
      size='sm'
      className='h-8 w-8 p-0 shrink-0'
      onClick={onToggle}
    >
      <MenuIcon className='h-4 w-4' />
    </Button>
  )
}

export function Calendar() {
  const { data: employees } = useGetEmployees()
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [view, setView] = useState<'day' | 'week'>('day')
  const [selectedEmployees, setSelectedEmployees] = useState<Set<string>>(
    new Set()
  )
  const [sidebarOpen, setSidebarOpen] = useState(true)

  // Get appointments based on current view
  const startDate = view === 'week' 
    ? startOfWeek(selectedDate, { weekStartsOn: 1 })
    : selectedDate
  const endDate = view === 'week'
    ? endOfWeek(selectedDate, { weekStartsOn: 1 })
    : selectedDate
    
  const { data: appointments } = useGetAppointments(
    startDate.toISOString(),
    endDate.toISOString()
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
    <div className='flex flex-col h-full w-full bg-background'>
      {/* Mobile Header */}
      <div className='flex md:hidden items-center justify-between p-3 border-b bg-background/95 backdrop-blur shrink-0'>
        <div className='flex items-center gap-2'>
          <SidebarTrigger variant='outline' className='shrink-0' />
          <Separator orientation='vertical' className='h-5' />
          <CalendarSidebarToggle isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
          <h1 className='text-lg font-bold'>Citas</h1>
        </div>
      </div>

      {/* Desktop Header */}
      <div className='hidden md:flex items-center gap-3 px-4 lg:px-6 py-3 lg:py-4 border-b bg-background/95 backdrop-blur shrink-0'>
        <div className='flex items-center gap-3'>
          <SidebarTrigger variant='outline' className='shrink-0' />
          <Separator orientation='vertical' className='h-5' />
          <CalendarSidebarToggle isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
          <h1 className='text-xl lg:text-2xl font-bold tracking-tight'>Citas</h1>
        </div>
      </div>

      {/* Main Layout */}
      <div className='flex-1 flex overflow-hidden relative' role='application' aria-label='Sistema de citas'>
        {/* Sidebar - Only on desktop when open */}
        <CalendarSidebar
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          employees={employees}
          selectedEmployees={selectedEmployees}
          setSelectedEmployees={setSelectedEmployees}
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
        />

        {/* Main Content - Responsive */}
        <main className='flex-1 flex flex-col overflow-hidden' role='main' aria-label='Vista principal del calendario'>
          {/* Calendar Header */}
          <header className='shrink-0 bg-background' role='banner'>
            <CalendarHeader
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              view={view}
              setView={setView}
            />
          </header>

          {/* Calendar Content */}
          <section className='flex-1 overflow-hidden p-2 md:p-4' aria-label={view === 'day' ? 'Vista de citas del día' : 'Vista de citas de la semana'}>
            <div className='h-full rounded-lg md:rounded-xl bg-card overflow-hidden'>
              {view === 'day' ? (
                <DayView appointments={filteredAppointments} date={selectedDate} />
              ) : (
                <WeekView appointments={filteredAppointments} date={selectedDate} />
              )}
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}
