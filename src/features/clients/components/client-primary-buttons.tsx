import { Button } from '@/components/ui/button'
import { Plus, Download, Tag } from 'lucide-react'
import { useClients } from '../context/clients-context'
import { useWhatsApp } from '@/features/settings/whatsappWeb/useWhatsApp'
import { useTagMutations } from '../hooks/useGetTags'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { useState } from 'react'

export function ClientPrimaryButtons() {
  const { setOpen } = useClients()
  const { isConnected } = useWhatsApp()
  const { importFromWhatsApp, importMutation } = useTagMutations()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [override, setOverride] = useState(false)

  const handleImportTags = async () => {
    await importFromWhatsApp(override)
    setDialogOpen(false)
    setOverride(false)
  }

  const handleDialogChange = (open: boolean) => {
    setDialogOpen(open)
    if (!open) {
      setOverride(false)
    }
  }

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

      <AlertDialog open={dialogOpen} onOpenChange={handleDialogChange}>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <AlertDialogTrigger asChild>
                <Button
                  variant='outline'
                  className='w-full sm:w-auto'
                  disabled={!isConnected}
                >
                  <Tag className='mr-2 h-4 w-4' />
                  <span className='hidden sm:inline'>Importar Etiquetas</span>
                  <span className='sm:hidden'>Etiquetas</span>
                </Button>
              </AlertDialogTrigger>
            </TooltipTrigger>
            {!isConnected && (
              <TooltipContent>
                <p>Conecta WhatsApp en Configuración para importar etiquetas</p>
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Importar etiquetas de WhatsApp?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción importará todas las etiquetas configuradas en tu cuenta
              de WhatsApp Business.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className='flex items-start space-x-2 py-4'>
            <Checkbox
              id='override'
              checked={override}
              onCheckedChange={(checked) => setOverride(checked as boolean)}
            />
            <div className='grid gap-1.5 leading-none'>
              <Label
                htmlFor='override'
                className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer'
              >
                Sincronizar completamente
              </Label>
              <p className='text-sm text-muted-foreground'>
                Eliminar etiquetas que no existan en WhatsApp y actualizar las existentes
              </p>
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleImportTags}
              disabled={importMutation.isPending}
            >
              {importMutation.isPending ? (override ? 'Sincronizando...' : 'Importando...') : (override ? 'Sincronizar' : 'Importar')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Button className='w-full sm:w-auto' onClick={() => setOpen('add')}>
        <Plus className='mr-2 h-4 w-4' />
        Nuevo cliente
      </Button>
    </div>
  )
}
