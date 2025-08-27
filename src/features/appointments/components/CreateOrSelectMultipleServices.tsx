import { KeyboardEvent, useMemo, useRef, useState } from 'react'
import {
  Check,
  Clock,
  CreditCard,
  Loader2,
  Plus,
  Search,
  X,
} from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Input } from '@/components/ui/input'
import { useCreateService } from '../hooks/useCreateService'
import { useGetServices } from '../hooks/useGetServices'

interface CreateOrSelectMultipleServicesProps {
  selectedIds: string[]
  onChange: (ids: string[]) => void
  onToggle: (id: string) => void
  maxHeight?: string
  placeholder?: string
}

export function CreateOrSelectMultipleServices({
  selectedIds,
  onChange,
  onToggle,
  maxHeight = '300px',
  placeholder = 'Buscar o crear un servicio...',
}: CreateOrSelectMultipleServicesProps) {
  const [isCreatingNew, setIsCreatingNew] = useState(false)
  const [newServiceName, setNewServiceName] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [isExpanded, setIsExpanded] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const { data: services = [], isLoading } = useGetServices()
  const createServiceMutation = useCreateService()

  // Utility function for improved searching
  const normalizeText = (text: string): string => {
    return text
      .toLowerCase()
      .trim()
      .normalize('NFD') // Decompose accented characters
      .replace(/[\u0300-\u036f]/g, '') // Remove accent marks
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
  }

  // Pre-compute normalized service names for better performance
  const normalizedServices = useMemo(() => {
    return services.map((service) => ({
      ...service,
      normalizedName: normalizeText(service.name)
    }))
  }, [services])

  // Instant reactive search filtering
  const filteredServices = useMemo(() => {
    const trimmedQuery = searchQuery.trim()
    if (!trimmedQuery) return services

    const normalizedQuery = normalizeText(trimmedQuery)

    return normalizedServices
      .filter((service) => service.normalizedName.includes(normalizedQuery))
      .map(({ normalizedName, ...service }) => service) // Remove normalizedName from result
  }, [normalizedServices, searchQuery])

  const noExactMatch = useMemo(() => {
    const trimmedQuery = searchQuery.trim()
    if (!trimmedQuery) return false

    const normalizedQuery = normalizeText(trimmedQuery)

    return !normalizedServices.some(
      (service) => service.normalizedName === normalizedQuery
    )
  }, [normalizedServices, searchQuery])

  const handleCreateService = async () => {
    const serviceName = newServiceName || searchQuery

    if (!serviceName.trim()) {
      toast.error('Por favor, ingresa un nombre para el servicio')
      return
    }

    try {
      const result = await createServiceMutation.mutateAsync(serviceName)

      if (result) {
        onChange([...selectedIds, result.id])
        setNewServiceName('')
        setSearchQuery('')
        setIsCreatingNew(false)
        toast.success(`Servicio "${serviceName}" creado con éxito`)
      }
    } catch (error) {
      toast.error('Error al crear el servicio')
      console.error(error)
    }
  }

  const handleSelectAll = () => {
    const visibleServices = searchQuery.trim() ? filteredServices : services
    const allVisibleSelected = visibleServices.every(service => selectedIds.includes(service.id))
    
    if (allVisibleSelected) {
      // Remove all visible services from selection
      const remainingIds = selectedIds.filter(id => !visibleServices.some(service => service.id === id))
      onChange(remainingIds)
    } else {
      // Add all visible services to selection
      const newIds = [...new Set([...selectedIds, ...visibleServices.map(service => service.id)])]
      onChange(newIds)
    }
  }

  const selectedServices = useMemo(
    () => services.filter((service) => selectedIds.includes(service.id)),
    [services, selectedIds]
  )

  const totalSelectedPrice = useMemo(() => {
    return selectedServices.reduce(
      (total, service) => total + service.price.amount,
      0
    )
  }, [selectedServices])

  const totalSelectedDuration = useMemo(() => {
    return selectedServices.reduce((total, service) => {
      const durationInMinutes =
        service.duration.unit === 'hours'
          ? service.duration.value * 60
          : service.duration.value
      return total + durationInMinutes
    }, 0)
  }, [selectedServices])

  const handleKeyDown = async (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !createServiceMutation.isPending) {
      if (isCreatingNew && newServiceName.trim()) {
        e.preventDefault()
        await handleCreateService()
      } else if (noExactMatch && searchQuery.trim()) {
        e.preventDefault()
        setIsCreatingNew(true)
        setNewServiceName(searchQuery)
      }
    } else if (e.key === 'Escape') {
      if (isCreatingNew) {
        setIsCreatingNew(false)
        setNewServiceName('')
      } else {
        setSearchQuery('')
      }
    }
  }

  if (isCreatingNew) {
    return (
      <Card className='border-2 border-primary/20 bg-primary/5'>
        <CardContent className='p-4'>
          <div className='space-y-4'>
            <div className='flex items-center gap-2 text-sm font-medium text-primary'>
              <Plus className='h-4 w-4' />
              Crear nuevo servicio
            </div>
            <div className='flex gap-2 items-center'>
              <Input
                autoFocus
                ref={inputRef}
                value={newServiceName}
                onChange={(e) => setNewServiceName(e.target.value)}
                placeholder='Nombre del nuevo servicio'
                className='flex-1 border-primary/30 focus:border-primary'
                onKeyDown={handleKeyDown}
              />
              <Button
                onClick={handleCreateService}
                disabled={
                  createServiceMutation.isPending || !newServiceName.trim()
                }
                className='flex-shrink-0'
              >
                {createServiceMutation.isPending ? (
                  <Loader2 className='h-4 w-4 animate-spin mr-2' />
                ) : (
                  <Check className='h-4 w-4 mr-2' />
                )}
                Crear
              </Button>
              <Button
                variant='ghost'
                size='icon'
                onClick={() => {
                  setIsCreatingNew(false)
                  setNewServiceName('')
                }}
                disabled={createServiceMutation.isPending}
                className='flex-shrink-0'
              >
                <X className='h-4 w-4' />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className='space-y-3'>
      {/* Compact Summary Header */}
      <Card className='border border-border/50 hover:border-border transition-colors'>
        <CardContent className='p-3'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-3'>
              <div className='flex items-center gap-2'>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => setIsExpanded(!isExpanded)}
                  className='text-xs h-8 px-2'
                  type='button'
                >
                  <Search className='h-4 w-4 text-muted-foreground' />
                  <span className='text-sm font-medium'>
                    {selectedIds.length > 0
                      ? `${selectedIds.length} servicio${selectedIds.length > 1 ? 's' : ''} seleccionado${selectedIds.length > 1 ? 's' : ''}`
                      : 'Seleccionar servicios'}
                  </span>
                </Button>
              </div>

              {selectedIds.length > 0 && (
                <div className='flex items-center gap-2 text-xs text-muted-foreground'>
                  <Badge variant='secondary' className='text-xs'>
                    {totalSelectedDuration >= 60
                      ? `${Math.floor(totalSelectedDuration / 60)}h ${totalSelectedDuration % 60 > 0 ? `${totalSelectedDuration % 60}min` : ''}`.trim()
                      : `${totalSelectedDuration}min`}
                  </Badge>
                  <Badge variant='secondary' className='text-xs'>
                    {totalSelectedPrice.toLocaleString('es-MX')}{' '}
                    {selectedServices[0]?.price.currency || 'MXN'}
                  </Badge>
                </div>
              )}
            </div>

            <div className='flex items-center gap-2'>
              {selectedIds.length > 0 && (
                <Button
                  type='button'
                  variant='ghost'
                  size='sm'
                  onClick={() => onChange([])}
                  className='text-xs h-8 px-2 text-muted-foreground hover:text-destructive'
                >
                  <X className='h-3 w-3 mr-1' />
                  Limpiar
                </Button>
              )}
            </div>
          </div>

          {/* Selected Services Preview (when collapsed) */}
          {selectedIds.length > 0 && !isExpanded && (
            <div className='mt-3 pt-3 border-t border-border/50'>
              <div className='flex flex-wrap gap-1.5'>
                {selectedServices.slice(0, 3).map((service) => (
                  <Badge
                    key={service.id}
                    variant='outline'
                    className='text-xs px-2 py-1 bg-primary/5 border-primary/20'
                  >
                    {service.name}
                    <Button
                      variant='ghost'
                      size='icon'
                      className='h-4 w-4 p-0 ml-1.5 hover:bg-destructive/20 text-muted-foreground hover:text-destructive'
                      onClick={() => onToggle(service.id)}
                    >
                      <X className='h-2.5 w-2.5' />
                    </Button>
                  </Badge>
                ))}
                {selectedServices.length > 3 && (
                  <Badge variant='secondary' className='text-xs px-2 py-1'>
                    +{selectedServices.length - 3} más
                  </Badge>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Expanded Service Selection Interface */}
      {isExpanded && (
        <Card className='border border-border/50 shadow-sm'>
          <CardContent className='p-0'>
            <Command className='rounded-lg'>
              <div className='flex items-center border-b w-full bg-muted/30 p-2'>
                <Input
                  placeholder={placeholder}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className='border-0 focus:ring-0 bg-transparent shadow-none p-3'
                />
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={() => {
                    setIsCreatingNew(true)
                    setTimeout(() => inputRef.current?.focus(), 0)
                  }}
                  className='h-8 px-3 text-xs text-primary hover:bg-primary/10 mr-2'
                  title='Crear nuevo servicio'
                >
                  <Plus className='h-3 w-3 mr-1' />
                  Nuevo
                </Button>
              </div>

              <CommandList className={`max-h-[250px] no-scrollbar`}>
                {isLoading ? (
                  <div className='flex items-center justify-center py-6'>
                    <Loader2 className='h-6 w-6 animate-spin text-primary' />
                  </div>
                ) : (
                  <>
                    {services.length > 0 && (
                      <div className='flex items-center justify-between px-3 py-2 border-b bg-muted/20'>
                        <div className='flex items-center'>
                          <Checkbox
                            checked={(() => {
                              const visibleServices = searchQuery.trim() ? filteredServices : services
                              return visibleServices.length > 0 && visibleServices.every(service => selectedIds.includes(service.id))
                            })()}
                            onCheckedChange={handleSelectAll}
                            className='mr-2 h-3 w-3'
                          />
                          <Button
                            variant='ghost'
                            size='sm'
                            onClick={handleSelectAll}
                            className='text-xs text-muted-foreground hover:text-foreground h-auto py-1 px-1'
                          >
                            {(() => {
                              const visibleServices = searchQuery.trim() ? filteredServices : services
                              const allVisibleSelected = visibleServices.every(service => selectedIds.includes(service.id))
                              return allVisibleSelected ? 'Deseleccionar todos' : 'Seleccionar todos'
                            })()}
                          </Button>
                        </div>
                        {selectedIds.length > 0 && (
                          <div className='flex items-center gap-2 text-xs font-medium text-muted-foreground'>
                            <Badge
                              variant='secondary'
                              className='text-xs px-2 py-0.5'
                            >
                              {selectedIds.length} de {searchQuery.trim() ? filteredServices.length : services.length}
                            </Badge>
                          </div>
                        )}
                      </div>
                    )}

                    <CommandEmpty className='py-6 text-center text-sm'>
                      {noExactMatch && searchQuery.trim() ? (
                        <div className='space-y-2'>
                          <p>No hay resultados para "{searchQuery}"</p>
                          <Button
                            variant='outline'
                            size='sm'
                            onClick={() => {
                              setIsCreatingNew(true)
                              setNewServiceName(searchQuery)
                            }}
                          >
                            <Plus className='h-4 w-4 mr-2' />
                            Crear "{searchQuery}"
                          </Button>
                        </div>
                      ) : (
                        'No hay servicios disponibles'
                      )}
                    </CommandEmpty>

                    <CommandGroup>
                      {filteredServices.map((service) => {
                        const isSelected = selectedIds.includes(service.id)
                        const durationText =
                          service.duration.unit === 'hours'
                            ? `${service.duration.value}h`
                            : `${service.duration.value}min`

                        return (
                          <CommandItem
                            key={service.id}
                            onSelect={() => onToggle(service.id)}
                            className={`flex items-center justify-between cursor-pointer p-3 transition-colors ${
                              isSelected
                                ? 'bg-primary/5 border-l-2 border-primary'
                                : 'hover:bg-muted/50'
                            }`}
                          >
                            <div
                              className='flex items-center space-x-3 flex-1'
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Checkbox
                                id={`service-${service.id}`}
                                checked={isSelected}
                                onCheckedChange={() => onToggle(service.id)}
                                className='h-4 w-4'
                                onClick={(e) => e.stopPropagation()}
                              />
                              <div
                                className='flex-1 min-w-0'
                                onClick={() => onToggle(service.id)}
                              >
                                <label
                                  htmlFor={`service-${service.id}`}
                                  className={`block text-sm font-medium cursor-pointer truncate ${
                                    isSelected ? 'text-primary' : ''
                                  }`}
                                  onClick={(e) => e.preventDefault()}
                                >
                                  {service.name}
                                </label>
                                <div className='flex items-center gap-4 mt-1'>
                                  <div className='flex items-center gap-1 text-xs text-muted-foreground'>
                                    <Clock className='h-3 w-3' />
                                    {durationText}
                                  </div>
                                  <div className='flex items-center gap-1 text-xs text-muted-foreground'>
                                    <CreditCard className='h-3 w-3' />
                                    {service.price.amount.toLocaleString(
                                      'es-MX'
                                    )}{' '}
                                    {service.price.currency}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </CommandItem>
                        )
                      })}
                    </CommandGroup>
                  </>
                )}
              </CommandList>
            </Command>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
