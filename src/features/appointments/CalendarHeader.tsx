import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { addDays, addWeeks, format } from 'date-fns'
import { es } from 'date-fns/locale/es'
import { ChevronLeft, ChevronRight } from 'lucide-react'

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
    <div className='p-4 border-b flex flex-col md:flex-row items-center justify-between gap-4'>
      {/* Date Navigation */}
      <nav className='flex items-center gap-2' role='navigation' aria-label='Navegación de fechas'>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant='ghost'
                size='icon'
                onClick={() => setSelectedDate(new Date())}
                aria-label='Ir a la fecha de hoy'
              >
                Hoy
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Ir a hoy</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant='ghost'
                size='icon'
                onClick={() =>
                  setSelectedDate(
                    view === 'day'
                      ? addDays(selectedDate, -1)
                      : addWeeks(selectedDate, -1)
                  )
                }
                aria-label={view === 'day' ? 'Día anterior' : 'Semana anterior'}
              >
                <ChevronLeft className='h-5 w-5' />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Anterior</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant='ghost'
                size='icon'
                onClick={() =>
                  setSelectedDate(
                    view === 'day'
                      ? addDays(selectedDate, 1)
                      : addWeeks(selectedDate, 1)
                  )
                }
                aria-label={view === 'day' ? 'Día siguiente' : 'Semana siguiente'}
              >
                <ChevronRight className='h-5 w-5' />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Siguiente</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <h2 className='text-lg md:text-xl font-semibold first-letter:uppercase' aria-live='polite'>
          {format(
            selectedDate,
            view === 'day' ? 'EEEE, d MMMM yyyy' : "'Semana' w 'de' MMMM yyyy",
            { locale: es }
          )}
        </h2>
      </nav>

      {/* View Switcher (Hidden on Mobile for Simplicity) */}
      <div className='flex gap-2' role='group' aria-label='Cambiar vista del calendario'>
        <Button
          variant={view === 'day' ? 'outline' : 'ghost'}
          onClick={() => setView('day')}
          aria-pressed={view === 'day'}
          aria-label='Cambiar a vista diaria'
        >
          Día
        </Button>
        {/*<Button
          variant={view === 'week' ? 'outline' : 'ghost'}
          onClick={() => setView('week')}
        >
          Semana
        </Button>*/}
      </div>
    </div>
  )
}