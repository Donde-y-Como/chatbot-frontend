import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Plus, X } from 'lucide-react'
import { useState } from 'react'
import { useGetServices } from '../hooks/useGetServices'
import { useCreateService } from '../hooks/useCreateService'
import { toast } from 'sonner'

interface CreateOrSelectMultipleServicesProps {
  selectedIds: string[]
  onChange: (ids: string[]) => void
  onToggle: (id: string) => void
}

export function CreateOrSelectMultipleServices({ 
  selectedIds, 
  onChange, 
  onToggle 
}: CreateOrSelectMultipleServicesProps) {
  const [isCreatingNew, setIsCreatingNew] = useState(false)
  const [newServiceName, setNewServiceName] = useState('')
  const { data: services } = useGetServices()
  const createServiceMutation = useCreateService()

  const handleCreateService = async () => {
    if (!newServiceName.trim()) {
      toast.error('Por favor, ingresa un nombre para el servicio')
      return
    }

    try {
      // Save the name before making the API call
      const serviceName = newServiceName
      
      // Create the service
      const result = await createServiceMutation.mutateAsync(serviceName)
      
      if (result) {
        // Add new service to selection
        onChange([...selectedIds, result.id])
        
        // Reset form state and close the creation UI
        setNewServiceName('')
        setIsCreatingNew(false)
        
        // Show success toast
        toast.success(`Servicio ${serviceName} creado con éxito`)
      }
    } catch (error) {
      toast.error('Error al crear el servicio')
      console.error(error)
    }
  }

  if (isCreatingNew) {
    return (
      <div className="flex gap-2 items-center">
        <Input
          autoFocus
          value={newServiceName}
          onChange={(e) => setNewServiceName(e.target.value)}
          placeholder="Nombre del servicio"
          className="flex-1"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && newServiceName.trim() !== '' && !createServiceMutation.isPending) {
              e.preventDefault()
              handleCreateService()
            }
          }}
        />
        <Button onClick={handleCreateService} disabled={createServiceMutation.isPending || newServiceName.trim() === ''}>
          {createServiceMutation.isPending ? 'Creando...' : 'Guardar'}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCreatingNew(false)}
          disabled={createServiceMutation.isPending}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2 items-center">
        <ScrollArea className="h-32 w-full border rounded-md p-2">
          {services?.length ? (
            <div className="space-y-2">
              {services.map((service) => (
                <div key={service.id} className="flex items-center space-x-2 py-1">
                  <Checkbox 
                    id={`service-${service.id}`} 
                    checked={selectedIds.includes(service.id)}
                    onCheckedChange={() => onToggle(service.id)} 
                  />
                  <label
                    htmlFor={`service-${service.id}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {service.name}
                  </label>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              No hay servicios disponibles
            </div>
          )}
        </ScrollArea>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsCreatingNew(true)}
          disabled={createServiceMutation.isPending}
          className="flex-shrink-0"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      {selectedIds.length > 0 && (
        <div className="text-sm">
          <span className="font-medium">{selectedIds.length}</span> servicio{selectedIds.length !== 1 ? 's' : ''} seleccionado{selectedIds.length !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  )
}