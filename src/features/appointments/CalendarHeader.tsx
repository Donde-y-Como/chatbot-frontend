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
    <div className='p-2 md:p-4 space-y-3 md:space-y-0 md:flex md:items-center md:justify-between'>
      {/* Mobile Layout */}
      <div className='flex md:hidden items-center justify-between'>
        <div className='flex items-center gap-2'>
          <div className='flex items-center rounded-md bg-background p-0.5'>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant='ghost'
                    size='sm'
                    className='h-7 w-7 p-0'
                    onClick={() =>
                      setSelectedDate(
                        view === 'day'
                          ? addDays(selectedDate, -1)
                          : addWeeks(selectedDate, -1)
                      )
                    }
                    aria-label={view === 'day' ? 'Día anterior' : 'Semana anterior'}
                  >
                    <ChevronLeft className='h-3 w-3' />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side='bottom'>
                  <p>Anterior</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant='ghost'
                    size='sm'
                    className='h-7 w-7 p-0'
                    onClick={() =>
                      setSelectedDate(
                        view === 'day'
                          ? addDays(selectedDate, 1)
                          : addWeeks(selectedDate, 1)
                      )
                    }
                    aria-label={view === 'day' ? 'Día siguiente' : 'Semana siguiente'}
                  >
                    <ChevronRight className='h-3 w-3' />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side='bottom'>
                  <p>Siguiente</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant='outline'
                  size='sm'
                  className='h-7 px-2 text-xs'
                  onClick={() => setSelectedDate(new Date())}
                  aria-label='Ir a la fecha de hoy'
                >
                  Hoy
                </Button>
              </TooltipTrigger>
              <TooltipContent side='bottom'>
                <p>Ir a hoy</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        
        {/* Mobile View Switcher */}
        <div className='flex items-center gap-1 rounded-md bg-muted p-0.5'>
          <Button
            variant={view === 'day' ? 'default' : 'ghost'}
            size='sm'
            className='h-7 px-3 text-xs font-medium'
            onClick={() => setView('day')}
            aria-pressed={view === 'day'}
          >
            Día
          </Button>
          <Button
            variant={view === 'week' ? 'default' : 'ghost'}
            size='sm'
            className='h-7 px-3 text-xs font-medium'
            onClick={() => setView('week')}
            aria-pressed={view === 'week'}
          >
            Semana
          </Button>
        </div>
      </div>
      
      {/* Mobile Date Display */}
      <div className='md:hidden'>
        <h2 className='text-base font-bold first-letter:uppercase truncate' aria-live='polite'>
          {format(
            selectedDate,
            view === 'day' ? 'EEE, d MMM yyyy' : "'Semana' w 'de' MMM yyyy",
            { locale: es }
          )}
        </h2>
      </div>

      {/* Desktop Layout */}
      <nav className='hidden md:flex items-center gap-3' role='navigation' aria-label='Navegación de fechas'>
        <div className='flex items-center gap-1 rounded-lg bg-background p-1'>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant='ghost'
                  size='sm'
                  className='h-8 px-3 text-xs font-medium'
                  onClick={() => setSelectedDate(new Date())}
                  aria-label='Ir a la fecha de hoy'
                >
                  Hoy
                </Button>
              </TooltipTrigger>
              <TooltipContent side='bottom'>
                <p>Ir a hoy</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <div className='flex items-center'>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant='ghost'
                    size='sm'
                    className='h-8 w-8 p-0'
                    onClick={() =>
                      setSelectedDate(
                        view === 'day'
                          ? addDays(selectedDate, -1)
                          : addWeeks(selectedDate, -1)
                      )
                    }
                    aria-label={view === 'day' ? 'Día anterior' : 'Semana anterior'}
                  >
                    <ChevronLeft className='h-4 w-4' />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side='bottom'>
                  <p>Anterior</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant='ghost'
                    size='sm'
                    className='h-8 w-8 p-0'
                    onClick={() =>
                      setSelectedDate(
                        view === 'day'
                          ? addDays(selectedDate, 1)
                          : addWeeks(selectedDate, 1)
                      )
                    }
                    aria-label={view === 'day' ? 'Día siguiente' : 'Semana siguiente'}
                  >
                    <ChevronRight className='h-4 w-4' />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side='bottom'>
                  <p>Siguiente</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        <div className='flex flex-col'>
          <h2 className='text-lg lg:text-xl font-bold tracking-tight first-letter:uppercase' aria-live='polite'>
            {format(
              selectedDate,
              view === 'day' ? 'EEEE, d MMMM' : "'Semana' w 'de' MMMM",
              { locale: es }
            )}
          </h2>
          <p className='text-sm text-muted-foreground'>
            {format(selectedDate, 'yyyy', { locale: es })}
          </p>
        </div>
      </nav>

      {/* Desktop View Switcher */}
      <div className='hidden md:flex items-center gap-2' role='group' aria-label='Cambiar vista del calendario'>
        <div className='rounded-lg bg-background p-1'>
          <Button
            variant={view === 'day' ? 'default' : 'ghost'}
            size='sm'
            className='h-8 px-4 text-xs font-medium'
            onClick={() => setView('day')}
            aria-pressed={view === 'day'}
            aria-label='Cambiar a vista diaria'
          >
            Día
          </Button>
          <Button
            variant={view === 'week' ? 'default' : 'ghost'}
            size='sm'
            className='h-8 px-4 text-xs font-medium'
            onClick={() => setView('week')}
            aria-pressed={view === 'week'}
            aria-label='Cambiar a vista semanal'
          >
            Semana
          </Button>
        </div>
      </div>
    </div>
  )
}