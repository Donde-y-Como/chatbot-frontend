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
      <div className='flex items-center gap-2'>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant='ghost'
                size='icon'
                onClick={() => setSelectedDate(new Date())}
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
              >
                <ChevronRight className='h-5 w-5' />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Siguiente</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <h2 className='text-lg md:text-xl font-semibold first-letter:uppercase'>
          {format(
            selectedDate,
            view === 'day' ? 'EEEE, d MMMM yyyy' : "'Semana' w 'de' MMMM yyyy",
            { locale: es }
          )}
        </h2>
      </div>

      {/* View Switcher (Hidden on Mobile for Simplicity) */}
      <div className='flex gap-2'>
        <Button
          variant={view === 'day' ? 'outline' : 'ghost'}
          onClick={() => setView('day')}
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