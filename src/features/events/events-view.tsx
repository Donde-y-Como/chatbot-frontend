import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Calendar as CalendarComponent } from '@/components/ui/calendar'
import {
  Card,
  CardContent,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { EventCard } from '@/features/events/event-card.tsx'
import { EventCreateModal } from '@/features/events/event-create-modal.tsx'
import { useGetBookings } from '@/features/events/hooks/useGetBookings.ts'
import { useGetEvents } from '@/features/events/hooks/useGetEvents.ts'
import {
  EventPrimitives
} from '@/features/events/types.ts'
import { Separator } from '@radix-ui/react-separator'
import { format, isAfter, isBefore, isToday } from 'date-fns'
import { es } from 'date-fns/locale/es'
import {
  AlertCircle,
  Calendar,
  CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Filter,
  List,
  Plus,
  Search,
  X
} from 'lucide-react'
import moment from "moment-timezone"
import { useMemo, useState } from 'react'
import { SidebarTrigger } from '../../components/ui/sidebar'
import { EventCalendarView } from './event-calendar-view'
import { useEventMutations } from './hooks/useEventMutations'

type DateRange = {
  from: Date | null;
  to: Date | null;
};

type ViewMode = 'list' | 'calendar';
type FilterStatus = 'upcoming' | 'today' | 'past' | 'all';
type SortOption = 'date-asc' | 'date-desc' | 'name-asc' | 'name-desc' | 'price-asc' | 'price-desc';

export default function EventsView() {
  const { data: allBookings, isLoading: isBookingsLoading, error: bookingsError } = useGetBookings()
  const { data: events, isLoading: isEventsLoading, error: eventsError } = useGetEvents()
  const [showCreate, setShowCreate] = useState<boolean>(false)
  const [viewMode, setViewMode] = useState<string>('calendar')
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('upcoming')
  const [sortBy, setSortBy] = useState<SortOption>('date-asc')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [dateRange, setDateRange] = useState<DateRange>({ from: null, to: null })
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [isDatePopoverOpen, setIsDatePopoverOpen] = useState(false)
  const eventsPerPage = 10

  // Apply filters and search to events
  const filteredEvents = useMemo(() => {
    if (!events) return []

    let filtered = [...events]
    const now = new Date()

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(event =>
        event.name.toLowerCase().includes(query) ||
        event.description.toLowerCase().includes(query) ||
        event.location.toLowerCase().includes(query)
      )
    }

    // Apply status filter
    if (filterStatus === 'upcoming') {
      filtered = filtered.filter(event => isAfter(new Date(event.duration.startAt), now))
    } else if (filterStatus === 'past') {
      filtered = filtered.filter(event => isBefore(new Date(event.duration.endAt), now))
    } else if (filterStatus === 'today') {
      filtered = filtered.filter(event => isToday(new Date(event.duration.startAt)))
    }

    // Apply date range filter
    if (dateRange.from instanceof Date) {
      const fromDate = new Date(dateRange.from)
      fromDate.setHours(0, 0, 0, 0)
      filtered = filtered.filter(event => {
        const eventDate = new Date(event.duration.startAt)
        return isAfter(eventDate, fromDate) || format(eventDate, 'yyyy-MM-dd') === format(fromDate, 'yyyy-MM-dd')
      })
    }

    if (dateRange.to instanceof Date) {
      const toDate = new Date(dateRange.to)
      toDate.setHours(23, 59, 59, 999)
      filtered = filtered.filter(event => {
        const eventDate = new Date(event.duration.startAt)
        return isBefore(eventDate, toDate) || format(eventDate, 'yyyy-MM-dd') === format(toDate, 'yyyy-MM-dd')
      })
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date-asc':
          return new Date(a.duration.startAt).getTime() - new Date(b.duration.startAt).getTime()
        case 'date-desc':
          return new Date(b.duration.startAt).getTime() - new Date(a.duration.startAt).getTime()
        case 'name-asc':
          return a.name.localeCompare(b.name)
        case 'name-desc':
          return b.name.localeCompare(a.name)
        case 'price-asc':
          return a.price.amount - b.price.amount
        case 'price-desc':
          return b.price.amount - a.price.amount
        default:
          return 0
      }
    })

    return filtered
  }, [events, searchQuery, filterStatus, dateRange, sortBy])

  // Group events by date (for list view)
  const groupedEvents = useMemo(() => {
    const groups: Record<string, EventPrimitives[]> = {}

    if (!filteredEvents.length) return groups

    filteredEvents.forEach((event) => {
      const date = format(
        new Date(event.duration.startAt),
        'yyyy-MM-dd'
      )
      if (!groups[date]) {
        groups[date] = []
      }
      groups[date].push(event)
    })

    return groups
  }, [filteredEvents])

  // Pagination
  const paginatedGroupedEvents = useMemo(() => {
    const dates = Object.keys(groupedEvents).sort()
    const pageDates = dates.slice((currentPage - 1) * eventsPerPage, currentPage * eventsPerPage)

    const paginatedGroups: Record<string, EventPrimitives[]> = {}
    pageDates.forEach(date => {
      paginatedGroups[date] = groupedEvents[date]
    })

    return paginatedGroups
  }, [groupedEvents, currentPage, eventsPerPage])

  const totalPages = useMemo(() => {
    return Math.ceil(Object.keys(groupedEvents).length / eventsPerPage)
  }, [groupedEvents, eventsPerPage])

  // Calculate total upcoming events
  const totalUpcomingEvents = useMemo(() => {
    if (!events) return 0
    const now = new Date()
    return events.filter(event => isAfter(new Date(event.duration.startAt), now)).length
  }, [events])

  // Calculate today's events
  const todayEvents = useMemo(() => {
    if (!events) return 0
    return events.filter(event => isToday(new Date(event.duration.startAt))).length
  }, [events])

  const resetFilters = (): void => {
    setSearchQuery('')
    setFilterStatus('upcoming')
    setDateRange({ from: null, to: null })
    setSortBy('date-asc')
    setCurrentPage(1)
  }

  const formatDateRange = () => {
    if (dateRange.from && dateRange.to) {
      return `${format(dateRange.from, 'dd/MM/yyyy')} - ${format(dateRange.to, 'dd/MM/yyyy')}`
    } else if (dateRange.from) {
      return `Desde ${format(dateRange.from, 'dd/MM/yyyy')}`
    } else if (dateRange.to) {
      return `Hasta ${format(dateRange.to, 'dd/MM/yyyy')}`
    }
    return 'Rango de fechas'
  }

  const clearDateRange = () => {
    setDateRange({ from: null, to: null })
  }

  // Loading and error states
  if (isBookingsLoading || isEventsLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-lg font-medium">Cargando eventos...</p>
        </div>
      </div>
    )
  }

  if (bookingsError || eventsError) {
    return (
      <div className="p-4 md:p-6 w-full">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Ha ocurrido un error al cargar los eventos. Por favor, intenta de nuevo más tarde.
          </AlertDescription>
          <Button variant="outline" className="mt-2" onClick={() => window.location.reload()}>
            Reintentar
          </Button>
        </Alert>
      </div>
    )
  }

  return (
    <div className='p-2 w-full'>
      <ScrollArea className="w-full h-full" type="auto">
        <div className='mb-6 bg-background pb-4 z-10'>
          <div className='flex flex-col md:flex-row md:items-center justify-between gap-4'>
            <div>
              <div className='flex gap-2'>
                <SidebarTrigger variant='outline' className='sm:hidden' />
                <Separator orientation='vertical' className='h-7 sm:hidden' />
                <h1 className='text-2xl font-bold'>Eventos</h1>
              </div>
              <p className='text-muted-foreground'>
                {totalUpcomingEvents} eventos próximos, {todayEvents} hoy
              </p>
            </div>

            <div className='flex flex-col sm:flex-row items-center gap-2'>
              <Button variant='default' onClick={() => setShowCreate(true)} className="w-full sm:w-auto">
                <Plus className='mr-2 h-4 w-4' />
                Nuevo Evento
              </Button>

              <div className='flex items-center w-full sm:w-auto'>
                <Tabs value={viewMode} onValueChange={setViewMode} className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="list">
                      <List className='mr-2 h-4 w-4' />
                      Lista
                    </TabsTrigger>
                    <TabsTrigger value="calendar">
                      <Calendar className='mr-2 h-4 w-4' />
                      Calendario
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>
          </div>

          <div className='mt-4 grid grid-cols-1 md:grid-cols-4 gap-2'>
            <div className="col-span-1 md:col-span-2">
              <div className="relative w-full">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type='search'
                  placeholder="Buscar eventos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8"
                />
              </div>
            </div>

            <Select value={filterStatus} onValueChange={(value) => {
              setFilterStatus(value as FilterStatus)
              setCurrentPage(1)
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="upcoming">Próximos</SelectItem>
                <SelectItem value="today">Hoy</SelectItem>
                <SelectItem value="past">Pasados</SelectItem>
                <SelectItem value="all">Todos</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex gap-2">
              <Popover open={isDatePopoverOpen} onOpenChange={setIsDatePopoverOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={`justify-between flex-1 ${dateRange.from || dateRange.to ? 'text-primary' : ''}`}>
                    <div className="flex items-center">
                      <CalendarIcon className="h-4 w-4 mr-2" />
                      <span className="truncate">{formatDateRange()}</span>
                    </div>
                    {(dateRange.from || dateRange.to) && (
                      <X
                        className="h-4 w-4 ml-1 opacity-60 hover:opacity-100"
                        onClick={(e) => {
                          e.stopPropagation()
                          clearDateRange()
                        }}
                      />
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    initialFocus
                    mode="range"
                    defaultMonth={dateRange.from || new Date()}
                    selected={{
                      from: dateRange.from as Date,
                      to: dateRange.to as Date
                    }}
                    onSelect={(range) => {
                      setDateRange({
                        from: range?.from || null,
                        to: range?.to || null
                      })
                      setCurrentPage(1)
                    }}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>

              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="flex-none px-3">
                    <Filter className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                  <div className="space-y-4">
                    <h4 className="font-medium">Filtros avanzados</h4>

                    <div className="space-y-2">
                      <h5 className="text-sm font-medium">Ordenar por</h5>
                      <Select value={sortBy} onValueChange={(value) => {
                        setSortBy(value as SortOption)
                        setCurrentPage(1)
                      }}>
                        <SelectTrigger>
                          <SelectValue placeholder="Ordenar por" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="date-asc">Fecha (ascendente)</SelectItem>
                          <SelectItem value="date-desc">Fecha (descendente)</SelectItem>
                          <SelectItem value="name-asc">Nombre (A-Z)</SelectItem>
                          <SelectItem value="name-desc">Nombre (Z-A)</SelectItem>
                          <SelectItem value="price-asc">Precio (menor a mayor)</SelectItem>
                          <SelectItem value="price-desc">Precio (mayor a menor)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Button variant="outline" size="sm" onClick={resetFilters}>
                      Limpiar filtros
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Active filters display */}
          {(searchQuery || filterStatus !== 'upcoming' || dateRange.from || dateRange.to || sortBy !== 'date-asc') && (
            <div className="mt-3 flex flex-wrap gap-2">
              {searchQuery && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <span>Búsqueda: {searchQuery}</span>
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => setSearchQuery('')}
                  />
                </Badge>
              )}

              {filterStatus !== 'upcoming' && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <span>Estado: {
                    filterStatus === 'today' ? 'Hoy' :
                      filterStatus === 'past' ? 'Pasados' :
                        filterStatus === 'all' ? 'Todos' : 'Próximos'
                  }</span>
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => setFilterStatus('upcoming')}
                  />
                </Badge>
              )}

              {(dateRange.from || dateRange.to) && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <span>Fechas: {formatDateRange()}</span>
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={clearDateRange}
                  />
                </Badge>
              )}

              {sortBy !== 'date-asc' && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <span>Orden: {
                    sortBy === 'date-desc' ? 'Fecha (desc)' :
                      sortBy === 'name-asc' ? 'Nombre (A-Z)' :
                        sortBy === 'name-desc' ? 'Nombre (Z-A)' :
                          sortBy === 'price-asc' ? 'Precio (menor a mayor)' :
                            sortBy === 'price-desc' ? 'Precio (mayor a menor)' : ''
                  }</span>
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => setSortBy('date-asc')}
                  />
                </Badge>
              )}

              <Button
                variant="ghost"
                size="sm"
                className="text-xs h-6"
                onClick={resetFilters}
              >
                Limpiar todo
              </Button>
            </div>
          )}
        </div>

        {filteredEvents.length === 0 && (
          <Card className="w-full">
            <CardContent className="flex flex-col items-center justify-center h-64 p-6">
              <Calendar className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold">No hay eventos</h3>
              <p className="text-muted-foreground mb-4">
                No se encontraron eventos que coincidan con tus criterios de búsqueda.
              </p>
              <Button onClick={resetFilters}>Limpiar filtros</Button>
            </CardContent>
          </Card>
        )}

        <Tabs value={viewMode} className="mt-4">
          <TabsContent value="list" className="space-y-6">
            {Object.entries(paginatedGroupedEvents).length > 0 && (
              Object.entries(paginatedGroupedEvents).map(([date, events]) => (
                <div key={date} className="mb-8">
                  <div className="bg-background/95 backdrop-blur-sm py-2 mb-2 z-[5]">
                    <div className="flex items-center">
                      <div className="bg-primary/10 rounded-md px-3 py-1 mr-3">
                        <h2 className="font-semibold text-lg first-letter:uppercase">
                          {format(moment(date).tz("America/Mexico_City").toDate(), 'dd', { locale: es })}
                        </h2>
                      </div>
                      <div>
                        <h3 className="font-semibold first-letter:uppercase text-xl">
                          {format(moment(date).tz("America/Mexico_City").toDate(), 'MMMM', { locale: es })}
                        </h3>
                        <p className="text-sm text-muted-foreground first-letter:uppercase">
                          {format(moment(date).tz("America/Mexico_City").toDate(), 'EEEE', { locale: es })}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {events.map((event) => {
                      const bookings =
                        allBookings?.filter(
                          (booking) => booking.eventId === event.id
                        ) || []

                      return (
                        <EventCard
                          key={event.id}
                          event={event}
                          bookings={bookings}
                        />
                      )
                    })}
                  </div>
                </div>
              ))
            )}

            {totalPages > 1 && (
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Anterior
                </Button>
                <span className="text-sm">
                  Página {currentPage} de {totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  Siguiente
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="calendar">
            {filteredEvents.length > 0 && (
              <Card>
                <CardContent className="p-6">
                  <EventCalendarView
                    events={filteredEvents}
                    bookings={allBookings || []}
                  />
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        <EventCreateModal
          open={showCreate}
          onClose={() => setShowCreate(false)}
        />
      </ScrollArea >
    </div >
  )
}

// Badge component for active filters display
const Badge = ({
  children,
  variant = 'default',
  className = ''
}) => {
  const baseStyle = "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
  const variantStyles = {
    default: "bg-primary text-primary-foreground hover:bg-primary/80",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
    outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground"
  }

  return (
    <div className={`${baseStyle} ${variantStyles[variant]} ${className}`}>
      {children}
    </div>
  )
}