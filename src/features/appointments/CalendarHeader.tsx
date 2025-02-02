import type React from 'react'
import { addDays, addWeeks, format } from 'date-fns'
import { es } from 'date-fns/locale/es'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface CalendarHeaderProps {
  selectedDate: Date
  setSelectedDate: (date: Date) => void
  view: 'day' | 'week'
  setView: (view: 'day' | 'week') => void
}

export function CalendarHeader({
  selectedDate,
  setSelectedDate,
  view,
  setView,
}: CalendarHeaderProps) {
  return (
    <div className='p-4 border-b flex justify-between items-center'>
      <div className='flex items-center gap-2'>
        <Button variant='ghost' onClick={() => setSelectedDate(new Date())}>
          Hoy
        </Button>
        <Button
          variant='ghost'
          onClick={() =>
            setSelectedDate(
              view === 'day'
                ? addDays(selectedDate, -1)
                : addWeeks(selectedDate, -1)
            )
          }
        >
          <ChevronLeft />
        </Button>
        <Button
          variant='ghost'
          onClick={() =>
            setSelectedDate(
              view === 'day'
                ? addDays(selectedDate, 1)
                : addWeeks(selectedDate, 1)
            )
          }
        >
          <ChevronRight />
        </Button>
        <h2 className='text-xl font-semibold capitalize'>
          {format(
            selectedDate,
            view === 'day' ? 'EEEE MMMM d, yyyy' : "'Semana de ' MMMM d, yyyy",
            { locale: es }
          )}
        </h2>
      </div>
      <div className='flex gap-2'>
        <Button
          variant={view === 'day' ? 'default' : 'ghost'}
          onClick={() => setView('day')}
        >
          Dia
        </Button>
        {/*<Button variant={view === "week" ? "default" : "ghost"} onClick={() => setView("week")}>*/}
        {/*  Week*/}
        {/*</Button>*/}
      </div>
    </div>
  )
}
