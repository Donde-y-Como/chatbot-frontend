import { Button } from '@/components/ui/button'
import { Plus, Download } from 'lucide-react'
import { useClients } from '../context/clients-context'
import { useWhatsApp } from '@/features/settings/whatsappWeb/useWhatsApp'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

export function ClientPrimaryButtons() {
  const { setOpen } = useClients()
  const { isConnected } = useWhatsApp()

  return (
    <div className='flex gap-2'>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant='outline'
              className='w-full sm:w-auto'
              onClick={() => setOpen('import')}
              disabled={!isConnected}
            >
              <Download className='mr-2 h-4 w-4' />
              <span className='hidden sm:inline'>Importar de WhatsApp</span>
              <span className='sm:hidden'>Importar</span>
            </Button>
          </TooltipTrigger>
          {!isConnected && (
            <TooltipContent>
              <p>Conecta WhatsApp en Configuración para importar contactos</p>
            </TooltipContent>
          )}
        </Tooltip>
      </TooltipProvider>

      <Button className='w-full sm:w-auto' onClick={() => setOpen('add')}>
        <Plus className='mr-2 h-4 w-4' />
        Nuevo cliente
      </Button>
    </div>
  )
}
