import { useState, useMemo, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar as CalendarComponent } from '@/components/ui/calendar'
import { useClientPortalServices, useClientPortalAvailability, useClientPortalBooking } from '../../../hooks/portal'
import { Loader2, AlertCircle, Clock, Calendar, CheckCircle2, User, Filter, Search, DollarSign, ArrowRight, ChevronDown, X } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { toast } from 'sonner'

interface BookingFormProps {
  clientId: string
  token: string
  isForOther: boolean
  onSuccess: () => void
  onCancel: () => void
}

type BookingStep = 'services' | 'date' | 'employees' | 'time' | 'confirm'

type DurationFilter = 'all' | 'short' | 'medium' | 'long'

type PriceFilter = 'all' | 'low' | 'medium' | 'high' | 'premium'

/**
 * BookingForm - Formulario completo de reserva de citas
 * Flujo: Servicios → Fecha → Empleados → Horarios → Confirmación
 */
export function BookingForm({ token, onSuccess, onCancel }: BookingFormProps) {
  const [activeTab, setActiveTab] = useState<BookingStep>('services')
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([])
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<string[]>([])
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<{ startAt: number; endAt: number } | null>(null)
  const [notes, setNotes] = useState('')
  const [durationFilter, setDurationFilter] = useState<DurationFilter>('all')
  const [priceFilter, setPriceFilter] = useState<PriceFilter>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [filtersOpen, setFiltersOpen] = useState(false)

  // Queries
  const { data: services, isLoading: servicesLoading } = useClientPortalServices(token, true)

  const { data: availability, isLoading: availabilityLoading } = useClientPortalAvailability(
    token,
    {
      serviceIds: selectedServiceIds,
      employeeIds: selectedEmployeeIds.length > 0 ? selectedEmployeeIds : undefined,
      date: selectedDate ? format(selectedDate, 'yyyy-MM-dd') : ''
    },
    activeTab === 'time' && selectedServiceIds.length > 0 && !!selectedDate
  )

  const bookingMutation = useClientPortalBooking(token)

  // Handlers
  const handleServiceToggle = (serviceId: string) => {
    setSelectedServiceIds(prev =>
      prev.includes(serviceId)
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    )
  }

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date)
    if (date) {
      setActiveTab('time')
    }
  }

  const handleTimeSlotSelect = (startAt: number, endAt: number) => {
    // Calcular la hora de finalización real basada en la duración total de los servicios
    const calculatedEndAt = startAt + totalDuration
    setSelectedTimeSlot({ startAt, endAt: calculatedEndAt })
    setActiveTab('confirm')
  }

  // Verificar si un tab está completado
  const isTabCompleted = (tab: BookingStep): boolean => {
    switch (tab) {
      case 'services':
        return selectedServiceIds.length > 0
      case 'date':
        return !!selectedDate
      case 'time':
        return !!selectedTimeSlot
      case 'confirm':
        return false
      default:
        return false
    }
  }

  // Verificar si un tab está disponible para navegar
  const isTabEnabled = (tab: BookingStep): boolean => {
    switch (tab) {
      case 'services':
        return true
      case 'date':
        return selectedServiceIds.length > 0
      case 'time':
        return selectedServiceIds.length > 0 && !!selectedDate
      case 'confirm':
        return selectedServiceIds.length > 0 && !!selectedDate && !!selectedTimeSlot
      default:
        return false
    }
  }

  const handleConfirmBooking = async () => {
    if (!selectedTimeSlot || !selectedDate) return

    try {
      await bookingMutation.mutateAsync({
        serviceIds: selectedServiceIds,
        employeeIds: selectedEmployeeIds.length > 0 ? selectedEmployeeIds : [],
        date: format(selectedDate, 'yyyy-MM-dd'),
        timeRange: selectedTimeSlot,
        notes: notes.trim() || undefined
      })

      toast.success('¡Cita agendada exitosamente!')
      onSuccess()
    } catch (error) {
      toast.error('Error al agendar la cita')
      console.error('Booking error:', error)
    }
  }

  const formatTimeFromMinutes = (minutes: number): string => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`
  }

  const formatDateForInput = (date: Date): string => {
    return format(date, 'yyyy-MM-dd')
  }

  const getMinDate = () => formatDateForInput(new Date())
  const getMaxDate = () => {
    const maxDate = new Date()
    maxDate.setMonth(maxDate.getMonth() + 3)
    return formatDateForInput(maxDate)
  }

  // Filtrar servicios por duración, precio y búsqueda
  const filteredServices = useMemo(() => {
    if (!services) return []

    let filtered = services

    // Filtrar por duración
    if (durationFilter !== 'all') {
      filtered = filtered.filter((service) => {
        const durationInMinutes = service.duration.unit === 'hours'
          ? service.duration.value * 60
          : service.duration.value

        switch (durationFilter) {
          case 'short':
            return durationInMinutes <= 30
          case 'medium':
            return durationInMinutes > 30 && durationInMinutes <= 60
          case 'long':
            return durationInMinutes > 60
          default:
            return true
        }
      })
    }

    // Filtrar por precio
    if (priceFilter !== 'all') {
      filtered = filtered.filter((service) => {
        const price = service.price.amount

        switch (priceFilter) {
          case 'low':
            return price <= 200
          case 'medium':
            return price > 200 && price <= 500
          case 'high':
            return price > 500 && price <= 1000
          case 'premium':
            return price > 1000
          default:
            return true
        }
      })
    }

    // Filtrar por búsqueda
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim()
      filtered = filtered.filter((service) => {
        const nameMatch = service.name.toLowerCase().includes(query)
        const descriptionMatch = service.description?.toLowerCase().includes(query)
        return nameMatch || descriptionMatch
      })
    }

    return filtered
  }, [services, durationFilter, priceFilter, searchQuery])

  const durationFilterOptions = [
    { value: 'all' as DurationFilter, label: 'Todos', icon: Filter },
    { value: 'short' as DurationFilter, label: '≤ 30 min', icon: Clock },
    { value: 'medium' as DurationFilter, label: '31-60 min', icon: Clock },
    { value: 'long' as DurationFilter, label: '> 60 min', icon: Clock },
  ]

  const priceFilterOptions = [
    { value: 'all' as PriceFilter, label: 'Todos', icon: Filter },
    { value: 'low' as PriceFilter, label: '≤ $200', icon: DollarSign },
    { value: 'medium' as PriceFilter, label: '$201-$500', icon: DollarSign },
    { value: 'high' as PriceFilter, label: '$501-$1000', icon: DollarSign },
    { value: 'premium' as PriceFilter, label: '> $1000', icon: DollarSign },
  ]

  // Render loading
  if (servicesLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        <span>Cargando servicios...</span>
      </div>
    )
  }

  // Render no services
  if (!services || services.length === 0) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600 dark:text-gray-400">No hay servicios disponibles</p>
        <Button variant="outline" onClick={onCancel} className="mt-4">
          Volver
        </Button>
      </div>
    )
  }

  const selectedServices = services.filter(s => selectedServiceIds.includes(s.id))
  const totalDuration = selectedServices.reduce((acc, s) =>
    acc + (s.duration.unit === 'hours' ? s.duration.value * 60 : s.duration.value), 0
  )
  const totalPrice = selectedServices.reduce((acc, s) => acc + s.price.amount, 0)

  return (
    <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as BookingStep)} className="w-full">
      <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900">
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl flex items-center gap-2">
            <Calendar className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            Nueva Cita
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Tabs Navigation */}
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger
              value="services"
              disabled={!isTabEnabled('services')}
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
            >
              <div className="flex items-center gap-2">
                {isTabCompleted('services') && <CheckCircle2 className="h-4 w-4" />}
                <span className="hidden sm:inline">Servicios</span>
                <span className="sm:hidden">1</span>
              </div>
            </TabsTrigger>
            <TabsTrigger
              value="date"
              disabled={!isTabEnabled('date')}
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
            >
              <div className="flex items-center gap-2">
                {isTabCompleted('date') && <CheckCircle2 className="h-4 w-4" />}
                <span className="hidden sm:inline">Fecha</span>
                <span className="sm:hidden">2</span>
              </div>
            </TabsTrigger>
            <TabsTrigger
              value="time"
              disabled={!isTabEnabled('time')}
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
            >
              <div className="flex items-center gap-2">
                {isTabCompleted('time') && <CheckCircle2 className="h-4 w-4" />}
                <span className="hidden sm:inline">Horario</span>
                <span className="sm:hidden">3</span>
              </div>
            </TabsTrigger>
            <TabsTrigger
              value="confirm"
              disabled={!isTabEnabled('confirm')}
              className="data-[state=active]:bg-green-600 data-[state=active]:text-white"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                <span className="hidden sm:inline">Confirmar</span>
                <span className="sm:hidden">4</span>
              </div>
            </TabsTrigger>
          </TabsList>

          {/* Tab Content: Services Selection */}
          <TabsContent value="services" className="mt-0 space-y-4 min-h-[600px]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Selecciona los Servicios</h3>
              <Badge variant="outline" className="text-sm">
                {filteredServices.length} servicios
              </Badge>
            </div>

            {/* Search Bar and Filters */}
            <div className="flex gap-3 mb-6">
              {/* Search Bar */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar servicios por nombre o descripción..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Filters Button */}
              <Popover open={filtersOpen} onOpenChange={setFiltersOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="whitespace-nowrap relative"
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    Filtros
                    {(durationFilter !== 'all' || priceFilter !== 'all') && (
                      <span className="absolute -top-1 -right-1 h-4 w-4 bg-blue-600 rounded-full text-[10px] text-white flex items-center justify-center">
                        {(durationFilter !== 'all' ? 1 : 0) + (priceFilter !== 'all' ? 1 : 0)}
                      </span>
                    )}
                    <ChevronDown className="h-4 w-4 ml-2" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80" align="end">
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-center justify-between pb-2 border-b">
                      <h4 className="font-semibold">Filtros</h4>
                      {(durationFilter !== 'all' || priceFilter !== 'all') && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setDurationFilter('all')
                            setPriceFilter('all')
                          }}
                          className="h-auto py-1 px-2 text-xs"
                        >
                          Limpiar todo
                        </Button>
                      )}
                    </div>

                    {/* Duration Filter */}
                    <div>
                      <div className="flex items-center space-x-2 mb-3">
                        <Clock className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                        <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                          Duración
                        </Label>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {durationFilterOptions.map((option) => {
                          const Icon = option.icon
                          const isActive = durationFilter === option.value
                          return (
                            <Button
                              key={option.value}
                              variant={isActive ? "default" : "outline"}
                              size="sm"
                              onClick={() => setDurationFilter(option.value)}
                              className={`transition-all duration-300 ${
                                isActive
                                  ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md'
                                  : 'hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                              }`}
                            >
                              <Icon className="h-3 w-3 mr-1" />
                              <span className="text-xs">{option.label}</span>
                            </Button>
                          )
                        })}
                      </div>
                    </div>

                    {/* Price Filter */}
                    <div>
                      <div className="flex items-center space-x-2 mb-3">
                        <DollarSign className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                        <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                          Precio
                        </Label>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {priceFilterOptions.map((option) => {
                          const Icon = option.icon
                          const isActive = priceFilter === option.value
                          return (
                            <Button
                              key={option.value}
                              variant={isActive ? "default" : "outline"}
                              size="sm"
                              onClick={() => setPriceFilter(option.value)}
                              className={`transition-all duration-300 ${
                                isActive
                                  ? 'bg-green-600 hover:bg-green-700 text-white shadow-md'
                                  : 'hover:border-green-400 hover:bg-green-50 dark:hover:bg-green-900/20'
                              }`}
                            >
                              <Icon className="h-3 w-3 mr-1" />
                              <span className="text-xs">{option.label}</span>
                            </Button>
                          )
                        })}
                      </div>
                    </div>

                    {/* Apply Button */}
                    <Button
                      className="w-full"
                      onClick={() => setFiltersOpen(false)}
                    >
                      Aplicar Filtros
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            {/* Services List with Scroll */}
            <div className="max-h-[450px] overflow-y-auto pr-2 custom-scrollbar">
              {filteredServices.length === 0 ? (
                <div className="text-center py-12">
                  <div className="mx-auto w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                    {searchQuery ? (
                      <Search className="h-10 w-10 text-gray-400" />
                    ) : (
                      <Clock className="h-10 w-10 text-gray-400" />
                    )}
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 font-medium mb-2">
                    {searchQuery
                      ? 'No se encontraron servicios'
                      : 'No hay servicios disponibles con esta duración'
                    }
                  </p>
                  {searchQuery && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                      No hay resultados para "{searchQuery}"
                    </p>
                  )}
                  <div className="flex gap-2 justify-center flex-wrap">
                    {searchQuery && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSearchQuery('')}
                        className="mt-2"
                      >
                        <Search className="h-4 w-4 mr-1" />
                        Limpiar búsqueda
                      </Button>
                    )}
                    {durationFilter !== 'all' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDurationFilter('all')}
                        className="mt-2"
                      >
                        <Clock className="h-4 w-4 mr-1" />
                        Todas las duraciones
                      </Button>
                    )}
                    {priceFilter !== 'all' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPriceFilter('all')}
                        className="mt-2"
                      >
                        <DollarSign className="h-4 w-4 mr-1" />
                        Todos los precios
                      </Button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="grid gap-4">
                  {filteredServices.map((service) => (
                  <Card
                    key={service.id}
                    className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
                      selectedServiceIds.includes(service.id)
                        ? 'border-2 border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 shadow-md'
                        : 'border-2 border-transparent hover:border-blue-300 dark:hover:border-blue-700'
                    }`}
                    onClick={() => handleServiceToggle(service.id)}
                  >
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-lg text-gray-900 dark:text-white">
                            {service.name}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                            {service.description}
                          </p>
                          <div className="flex items-center space-x-4 text-sm mt-3">
                            <span className="flex items-center space-x-1 px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full">
                              <Clock className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                              <span className="font-medium">
                                {service.duration.value} {service.duration.unit === 'minutes' ? 'min' : 'hrs'}
                              </span>
                            </span>
                            <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                              ${service.price.amount} {service.price.currency}
                            </span>
                          </div>
                        </div>
                        <div className={`h-7 w-7 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                          selectedServiceIds.includes(service.id)
                            ? 'bg-blue-600 border-blue-600 scale-110'
                            : 'border-gray-300 dark:border-gray-600'
                        }`}>
                          {selectedServiceIds.includes(service.id) && (
                            <CheckCircle2 className="h-5 w-5 text-white" />
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                </div>
              )}
            </div>

            {selectedServiceIds.length > 0 && (
              <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-medium">Total:</span>
                  <div className="text-right">
                    <div className="font-semibold text-lg text-blue-600 dark:text-blue-400">
                      ${totalPrice} MXN
                    </div>
                    <div className="text-xs text-gray-500">
                      {totalDuration} minutos aprox.
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-3 mt-3">
              <Button variant="outline" onClick={onCancel}>
                Cancelar
              </Button>
              <Button
                onClick={() => setActiveTab('date')}
                disabled={selectedServiceIds.length === 0}
              >
                Continuar
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </TabsContent>

          {/* Tab Content: Date Selection */}
          <TabsContent value="date" className="mt-0 space-y-6 min-h-[600px]">
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Selecciona la fecha de tu cita
                </h3>
                <p className="text-base text-gray-600 dark:text-gray-400">
                  Elige el día que mejor te convenga
                </p>
              </div>

              <div className="flex justify-center">
                <Card className="border-2 border-gray-200 dark:border-gray-700 shadow-2xl">
                  <CardContent className="p-8">
                    <CalendarComponent
                      mode="single"
                      selected={selectedDate}
                      onSelect={handleDateSelect}
                      disabled={(date) => {
                        const today = new Date()
                        today.setHours(0, 0, 0, 0)
                        const maxDate = new Date()
                        maxDate.setMonth(maxDate.getMonth() + 3)
                        return date < today || date > maxDate
                      }}
                      locale={es}
                      className="rounded-md scale-125"
                      classNames={{
                        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                        month: "space-y-4",
                        caption: "flex justify-center pt-1 relative items-center mb-4",
                        caption_label: "text-xl font-bold",
                        nav: "space-x-1 flex items-center",
                        nav_button: "h-10 w-10 bg-transparent hover:bg-blue-100 dark:hover:bg-blue-900/30 p-0 rounded-md transition-colors",
                        nav_button_previous: "absolute left-1",
                        nav_button_next: "absolute right-1",
                        table: "w-full border-collapse space-y-1",
                        head_row: "flex",
                        head_cell: "text-gray-600 dark:text-gray-400 rounded-md w-12 font-bold text-base uppercase",
                        row: "flex w-full mt-2",
                        cell: "h-12 w-12 text-center text-base p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-gray-100/50 [&:has([aria-selected])]:bg-gray-100 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20 dark:[&:has([aria-selected].day-outside)]:bg-gray-800/50 dark:[&:has([aria-selected])]:bg-gray-800",
                        day: "h-12 w-12 p-0 font-semibold text-base hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-md transition-all duration-200 hover:scale-110",
                        day_range_end: "day-range-end",
                        day_selected: "bg-blue-600 text-white hover:bg-blue-700 hover:text-white focus:bg-blue-600 focus:text-white dark:bg-blue-600 dark:text-white dark:hover:bg-blue-700 scale-110 shadow-lg",
                        day_today: "bg-blue-100 dark:bg-blue-900/30 text-blue-900 dark:text-blue-100 font-bold ring-2 ring-blue-400 dark:ring-blue-600",
                        day_outside: "day-outside text-gray-400 dark:text-gray-600 opacity-50 aria-selected:bg-gray-100/50 aria-selected:text-gray-500 dark:aria-selected:bg-gray-800/50 dark:aria-selected:text-gray-400",
                        day_disabled: "text-gray-300 dark:text-gray-700 opacity-50 cursor-not-allowed hover:bg-transparent",
                        day_range_middle: "aria-selected:bg-gray-100 aria-selected:text-gray-900 dark:aria-selected:bg-gray-800 dark:aria-selected:text-gray-50",
                        day_hidden: "invisible",
                      }}
                    />
                  </CardContent>
                </Card>
              </div>

              {selectedDate && (
                <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border-2 border-blue-300 dark:border-blue-700 shadow-lg">
                  <div className="flex items-center justify-center space-x-4">
                    <div className="p-3 bg-blue-500/10 rounded-xl">
                      <Calendar className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600 dark:text-gray-400 uppercase font-medium mb-1">
                        Fecha seleccionada
                      </p>
                      <p className="text-xl font-bold text-gray-900 dark:text-white capitalize">
                        {format(selectedDate, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3 mt-3">
              <Button variant="outline" onClick={() => setActiveTab('services')}>
                Atrás
              </Button>
              <Button
                onClick={() => setActiveTab('time')}
                disabled={!selectedDate}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Ver Horarios Disponibles
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </TabsContent>

          {/* Tab Content: Time Slot Selection */}
          <TabsContent value="time" className="mt-0 space-y-6 min-h-[600px]">
            {availabilityLoading ? (
              <div className="flex items-center justify-center py-16">
                <div className="text-center space-y-4">
                  <Loader2 className="h-12 w-12 animate-spin mx-auto text-blue-500" />
                  <p className="text-base text-gray-600 dark:text-gray-400 font-medium">Cargando horarios disponibles...</p>
                </div>
              </div>
            ) : !availability || availability.availableSlots.length === 0 ? (
              <div className="text-center py-16">
                <div className="mx-auto w-24 h-24 bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-full flex items-center justify-center mb-6 shadow-lg">
                  <AlertCircle className="h-12 w-12 text-red-500 dark:text-red-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  No hay horarios disponibles
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Intenta seleccionando otra fecha
                </p>
                <Button
                  variant="outline"
                  onClick={() => setActiveTab('date')}
                  className="px-6 py-3 text-base font-medium hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-500 transition-all"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Cambiar Fecha
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="text-center space-y-2">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Selecciona tu horario
                  </h3>
                  <p className="text-base text-gray-600 dark:text-gray-400">
                    Elige la hora que mejor se ajuste a tu agenda
                  </p>
                </div>

                {/* Información de la fecha seleccionada y duración */}
                {selectedDate && (
                  <div className="space-y-3">
                    <Card className="border-2 border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-center space-x-3">
                          <div className="p-2 bg-blue-500/10 rounded-lg">
                            <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div className="text-center">
                            <p className="text-xs text-gray-600 dark:text-gray-400 uppercase font-medium">
                              Horarios disponibles para
                            </p>
                            <p className="text-base font-bold text-gray-900 dark:text-white capitalize">
                              {format(selectedDate, "EEEE, d 'de' MMMM", { locale: es })}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {selectedServiceIds.length > 1 && (
                      <Card className="border-2 border-purple-200 dark:border-purple-800 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-center space-x-3">
                            <div className="p-2 bg-purple-500/10 rounded-lg">
                              <Clock className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div className="text-center">
                              <p className="text-xs text-gray-600 dark:text-gray-400 uppercase font-medium">
                                Duración total de servicios
                              </p>
                              <p className="text-base font-bold text-gray-900 dark:text-white">
                                {totalDuration} minutos ({selectedServiceIds.length} servicios)
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                Los servicios se realizarán uno después del otro
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                )}

                {/* Grid de horarios */}
                <div className="max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {availability.availableSlots
                      .filter(slot => slot.available)
                      .map((slot, index) => (
                        <Card
                          key={index}
                          className="cursor-pointer border-2 border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-xl hover:scale-105 transition-all duration-300 group overflow-hidden"
                          onClick={() => handleTimeSlotSelect(slot.startAt, slot.endAt)}
                        >
                          <CardContent className="p-6 text-center">
                            <div className="mb-3 p-3 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-xl inline-block group-hover:scale-110 transition-transform">
                              <Clock className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div className="font-bold text-2xl text-gray-900 dark:text-white mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                              {formatTimeFromMinutes(slot.startAt)}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                              hasta {formatTimeFromMinutes(slot.endAt)}
                            </div>
                            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                              <Badge
                                variant="outline"
                                className="text-xs font-semibold bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-300 dark:border-green-700"
                              >
                                Disponible
                              </Badge>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                </div>

                {/* Información adicional */}
                <Card className="border border-blue-200 dark:border-blue-800 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                          Información importante
                        </p>
                        <p className="text-xs text-gray-700 dark:text-gray-300">
                          Los horarios mostrados están en tu zona horaria local. Te recomendamos llegar 5-10 minutos antes de tu cita.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex justify-end space-x-3 mt-3">
                  <Button variant="outline" onClick={() => setActiveTab('date')}>
                    Atrás
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>

          {/* Tab Content: Confirm Booking */}
          <TabsContent value="confirm" className="mt-0 space-y-4">
            {selectedTimeSlot && (
              <>
                {/* Summary */}
                <div className="space-y-4">
                  <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 space-y-4">
                    <div className="flex items-start space-x-4">
                      <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                        <User className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium mb-1">Servicios</p>
                        <p className="font-semibold text-gray-900 dark:text-white">{selectedServices.map(s => s.name).join(', ')}</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                        <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium mb-1">Fecha</p>
                        <p className="font-semibold text-gray-900 dark:text-white capitalize">
                          {selectedDate && format(selectedDate, "EEEE, d 'de' MMMM", { locale: es })}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4">
                      <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                        <Clock className="h-5 w-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium mb-1">Horario</p>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {formatTimeFromMinutes(selectedTimeSlot.startAt)} - {formatTimeFromMinutes(selectedTimeSlot.endAt)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border-2 border-blue-200 dark:border-blue-800">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-lg text-gray-900 dark:text-white">Total a pagar:</span>
                      <span className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                        ${totalPrice} MXN
                      </span>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <Label htmlFor="notes">Notas adicionales (opcional)</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Escribe aquí cualquier información adicional..."
                    className="mt-2"
                    rows={3}
                  />
                </div>

                {/* Actions */}
                <div className="flex justify-end space-x-3">
                  <Button variant="outline" onClick={() => setActiveTab('time')} disabled={bookingMutation.isPending}>
                    Atrás
                  </Button>
                  <Button
                    onClick={handleConfirmBooking}
                    disabled={bookingMutation.isPending}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    {bookingMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Agendando...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Confirmar Reserva
                      </>
                    )}
                  </Button>
                </div>
              </>
            )}
          </TabsContent>
        </CardContent>
      </Card>
    </Tabs>
  )
}
