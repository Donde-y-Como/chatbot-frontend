import { KeyboardEvent, useMemo, useRef, useState } from 'react'
import { Check, Loader2, Plus, X } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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
  const inputRef = useRef<HTMLInputElement>(null)

  const { data: services = [], isLoading } = useGetServices()
  const createServiceMutation = useCreateService()

  const filteredServices = useMemo(() => {
    if (!searchQuery.trim()) return services

    return services.filter((service) =>
      service.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [services, searchQuery])

  const noExactMatch = useMemo(() => {
    if (!searchQuery.trim()) return false

    return !services.some(
      (service) => service.name.toLowerCase() === searchQuery.toLowerCase()
    )
  }, [services, searchQuery])

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
    if (selectedIds.length === services.length) {
      onChange([])
    } else {
      onChange(services.map((service) => service.id))
    }
  }

  const selectedServices = useMemo(
    () => services.filter((service) => selectedIds.includes(service.id)),
    [services, selectedIds]
  )

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
      <div className='space-y-4'>
        <div className='flex gap-2 items-center'>
          <Input
            autoFocus
            ref={inputRef}
            value={newServiceName}
            onChange={(e) => setNewServiceName(e.target.value)}
            placeholder='Nombre del nuevo servicio'
            className='flex-1'
            onKeyDown={handleKeyDown}
          />
          <Button
            onClick={handleCreateService}
            disabled={createServiceMutation.isPending || !newServiceName.trim()}
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
    )
  }

  return (
    <div className='space-y-3'>
      <Command className='rounded-lg border shadow-md'>
        <div className='flex items-center border-b w-full '>
          <CommandInput
            placeholder={placeholder}
            value={searchQuery}
            onValueChange={setSearchQuery}
            onKeyDown={handleKeyDown}
            className='border-0 focus:ring-0'
          />
          <Button
            variant='ghost'
            size='icon'
            onClick={() => {
              setIsCreatingNew(true)
              setTimeout(() => inputRef.current?.focus(), 0)
            }}
            className='h-8 w-8'
            title='Crear nuevo servicio'
          >
            <Plus className='h-4 w-4' />
          </Button>
        </div>

        <CommandList className={`max-h-[${maxHeight}] no-scrollbar`}>
          {isLoading ? (
            <div className='flex items-center justify-center py-6'>
              <Loader2 className='h-6 w-6 animate-spin text-primary' />
            </div>
          ) : (
            <>
              {services.length > 0 && (
                <div className='flex items-center justify-between px-2 py-1.5 border-b'>
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={handleSelectAll}
                    className='text-xs text-muted-foreground hover:text-foreground'
                  >
                    {selectedIds.length === services.length
                      ? 'Deseleccionar todos'
                      : 'Seleccionar todos'}
                  </Button>
                  {selectedIds.length > 0 && (
                    <span className='text-xs font-medium text-muted-foreground'>
                      {selectedIds.length} de {services.length} seleccionados
                    </span>
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
                {filteredServices.map((service) => (
                  <CommandItem
                    key={service.id}
                    onSelect={() => onToggle(service.id)}
                    className='flex items-center justify-between cursor-pointer'
                  >
                    <div className='flex items-center space-x-2 flex-1'>
                      <Checkbox
                        id={`service-${service.id}`}
                        checked={selectedIds.includes(service.id)}
                        onCheckedChange={() => onToggle(service.id)}
                        className='h-4 w-4'
                      />
                      <label
                        htmlFor={`service-${service.id}`}
                        className='flex-1 text-sm cursor-pointer'
                      >
                        {service.name}
                      </label>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </>
          )}
        </CommandList>
      </Command>

      {selectedServices.length > 0 && (
        <div className='flex flex-wrap gap-2 mt-2'>
          {selectedServices.map((service) => (
            <Badge
              key={service.id}
              variant='secondary'
              className='flex items-center gap-1 px-2 py-1'
            >
              {service.name}
              <Button
                variant='ghost'
                size='icon'
                className='h-4 w-4 p-0 ml-1 hover:bg-transparent'
                onClick={() => onToggle(service.id)}
              >
                <X className='h-3 w-3' />
              </Button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}
