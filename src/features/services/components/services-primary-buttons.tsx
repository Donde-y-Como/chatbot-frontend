import { Button } from '@/components/ui/button'
import { Plus, Settings, ChevronDown, Zap } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useServices } from '../context/services-context.tsx'

export function ServicesPrimaryButtons() {
  const { handleSelectServiceType } = useServices()

  const handleQuickService = () => {
    handleSelectServiceType('quick')
  }

  const handleCompleteService = () => {
    handleSelectServiceType('complete')
  }

  return (
    <div className='flex gap-2'>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button className='w-full sm:w-auto'>
            <Plus className='mr-2 h-4 w-4' />
            Crear Servicio
            <ChevronDown className='ml-2 h-4 w-4' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          <DropdownMenuItem onClick={handleQuickService} className="p-3">
            <Zap className="mr-3 h-5 w-5 text-blue-500" />
            <div className="flex flex-col gap-1">
              <span className="font-medium">Creación rápida</span>
              <span className="text-xs text-muted-foreground">Solo campos esenciales: nombre, descripción, duración, horario y precio</span>
            </div>
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem onClick={handleCompleteService} className="p-3">
            <Settings className="mr-3 h-5 w-5 text-green-500" />
            <div className="flex flex-col gap-1">
              <span className="font-medium">Creación detallada</span>
              <span className="text-xs text-muted-foreground">Todos los campos y opciones avanzadas disponibles</span>
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
