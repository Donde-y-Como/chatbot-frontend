import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
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
import { useGetClients } from '../hooks/useGetClients'
import { useCreateClient } from '../hooks/useCreateClient'
import { toast } from 'sonner'

interface CreateOrSelectClientProps {
  value: string
  onChange: (value: string) => void
}

export function CreateOrSelectClient({ value, onChange }: CreateOrSelectClientProps) {
  const [isCreatingNew, setIsCreatingNew] = useState(false)
  const [newClientName, setNewClientName] = useState('')
  const { data: clients } = useGetClients()
  const createClientMutation = useCreateClient()

  const handleCreateClient = async () => {
    if (!newClientName.trim()) {
      toast.error('Por favor, ingresa un nombre para el cliente')
      return
    }

    try {
      const result = await createClientMutation.mutateAsync(newClientName)
      if (result?.id) {
        onChange(result.id)
        toast.success(`Cliente ${newClientName} creado con éxito`)
        setNewClientName('')
        setIsCreatingNew(false)
      }
    } catch (error) {
      toast.error('Error al crear el cliente')
      console.error(error)
    }
  }

  if (isCreatingNew) {
    return (
      <div className="flex gap-2 items-center">
        <Input
          autoFocus
          value={newClientName}
          onChange={(e) => setNewClientName(e.target.value)}
          placeholder="Nombre del cliente"
          className="flex-1"
        />
        <Button onClick={handleCreateClient} disabled={createClientMutation.isPending || newClientName.trim() === ''}>
          {createClientMutation.isPending ? 'Creando...' : 'Guardar'}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCreatingNew(false)}
          disabled={createClientMutation.isPending}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  return (
    <div className="flex gap-2 items-center">
      <Select value={value} onValueChange={onChange} disabled={createClientMutation.isPending}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Selecciona un cliente" />
        </SelectTrigger>
        <SelectContent>
          {clients?.map((client) => (
            <SelectItem key={client.id} value={client.id} className="py-2">
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={client.photo} alt={client.name} className="object-cover" />
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {client.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <span>{client.name}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button
        variant="outline"
        size="icon"
        onClick={() => setIsCreatingNew(true)}
        disabled={createClientMutation.isPending}
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  )
}
