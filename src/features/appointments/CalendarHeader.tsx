import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { addDays, addWeeks, format } from 'date-fns'
import { es } from 'date-fns/locale/es'
import { ChevronLeft, ChevronRight, Search } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CalendarHeaderProps {
  selectedDate: Date
  setSelectedDate: (date: Date) => void
  view: 'day' | 'week'
  setView: (view: 'day' | 'week') => void
  searchQuery: string
  onSearchChange: (query: string) => void
}

export function CalendarHeader({
  selectedDate,
  setSelectedDate,
  view,
  setView,
  searchQuery,
  onSearchChange,
}: CalendarHeaderProps) {
  return (
    <div className='border-b bg-background'>
      {/* Mobile Layout - Super Compact */}
      <div className='md:hidden'>
        {/* Row 1: View tabs + Navigation (single line) */}
        <div className='flex items-center justify-between gap-2 px-3 py-2 border-b'>
          {/* View tabs - Compact */}
          <div className='flex items-center gap-0.5 bg-muted/50 rounded-md p-0.5' role='tablist'>
            <button
              role='tab'
              aria-selected={view === 'day'}
              onClick={() => setView('day')}
              className={cn(
                'px-2.5 py-1 text-xs font-medium rounded transition-colors',
                view === 'day'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground'
              )}
            >
              Day
            </button>
            <button
              role='tab'
              aria-selected={view === 'week'}
              onClick={() => setView('week')}
              className={cn(
                'px-2.5 py-1 text-xs font-medium rounded transition-colors',
                view === 'week'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground'
              )}
            >
              Week
            </button>
          </div>

          {/* Navigation - Compact */}
          <div className='flex items-center gap-1'>
            <Button
              variant='ghost'
              size='icon'
              className='h-7 w-7'
              onClick={() =>
                setSelectedDate(
                  view === 'day'
                    ? addDays(selectedDate, -1)
                    : addWeeks(selectedDate, -1)
                )
              }
              aria-label={view === 'day' ? 'Día anterior' : 'Semana anterior'}
            >
              <ChevronLeft className='h-3.5 w-3.5' />
            </Button>

            <Button
              variant='ghost'
              size='sm'
              className='h-7 px-2 text-xs font-medium'
              onClick={() => setSelectedDate(new Date())}
            >
              Hoy
            </Button>

            <Button
              variant='ghost'
              size='icon'
              className='h-7 w-7'
              onClick={() =>
                setSelectedDate(
                  view === 'day'
                    ? addDays(selectedDate, 1)
                    : addWeeks(selectedDate, 1)
                )
              }
              aria-label={view === 'day' ? 'Día siguiente' : 'Semana siguiente'}
            >
              <ChevronRight className='h-3.5 w-3.5' />
            </Button>
          </div>
        </div>

        {/* Row 2: Search only */}
        <div className='px-3 py-2'>
          <div className='relative'>
            <Search className='absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground' />
            <Input
              type='text'
              placeholder='Buscar citas, eventos o personas'
              className='pl-8 h-8 text-xs bg-muted/50 border-0'
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Desktop Layout - Original */}
      <div className='hidden md:block'>
        <div className='p-3'>
          <div className='flex items-center gap-4'>
            {/* View tabs */}
            <div className='flex items-center gap-0.5 bg-muted/50 rounded-lg p-0.5' role='tablist'>
              <button
                role='tab'
                aria-selected={view === 'day'}
                onClick={() => setView('day')}
                className={cn(
                  'px-4 py-1 text-sm font-medium rounded-md transition-colors',
                  view === 'day'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                Day
              </button>
              <button
                role='tab'
                aria-selected={view === 'week'}
                onClick={() => setView('week')}
                className={cn(
                  'px-4 py-1 text-sm font-medium rounded-md transition-colors',
                  view === 'week'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                Week
              </button>
              <button
                role='tab'
                aria-selected={false}
                disabled
                className='px-4 py-1 text-sm font-medium rounded-md text-muted-foreground/50 cursor-not-allowed'
              >
                Month
              </button>
            </div>

            {/* Navigation */}
            <div className='flex items-center gap-2'>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant='ghost'
                      size='icon'
                      className='h-8 w-8'
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
                  <TooltipContent>
                    <p>Anterior</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant='outline'
                      size='sm'
                      className='h-8 px-3 text-sm font-medium'
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
                      className='h-8 w-8'
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
                  <TooltipContent>
                    <p>Siguiente</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            {/* Search */}
            <div className='relative flex-1 max-w-sm'>
              <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
              <Input
                type='text'
                placeholder='Busca por cliente, empleado o servicio'
                className='pl-9 h-9 text-sm bg-muted/50 border-0'
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}