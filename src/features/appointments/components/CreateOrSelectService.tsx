import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select.tsx'
import { Input } from '@/components/ui/input'
import { Plus, X } from 'lucide-react'
import { useState } from 'react'
import { useGetServices } from '../hooks/useGetServices'
import { useCreateService } from '../hooks/useCreateService'
import { toast } from 'sonner'

interface CreateOrSelectServiceProps {
  value: string
  onChange: (value: string) => void
}

export function CreateOrSelectService({ value, onChange }: CreateOrSelectServiceProps) {
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
        // Critical: Update the parent component with the new service ID
        onChange(result.id)
        
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
    <div className="flex gap-2 items-center">
      <Select value={value} onValueChange={onChange} disabled={createServiceMutation.isPending}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Selecciona un servicio" />
        </SelectTrigger>
        <SelectContent>
          {services?.map((service) => (
            <SelectItem key={service.id} value={service.id} className="py-2">
              <div className="flex items-center gap-2">
                <span>{service.name}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button
        variant="outline"
        size="icon"
        onClick={() => setIsCreatingNew(true)}
        disabled={createServiceMutation.isPending}
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  )
}