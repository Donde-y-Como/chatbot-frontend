import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Info } from 'lucide-react'
import { MessageTemplate, templateTypeLabels, templateTypeDescriptions, availableVariables } from '../types'

interface ViewMessageTemplateDialogProps {
  isOpen: boolean
  onClose: () => void
  data?: MessageTemplate
}

export function ViewMessageTemplateDialog({ isOpen, onClose, data }: ViewMessageTemplateDialogProps) {
  if (!data) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='sm:max-w-[600px] max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-3'>
            {templateTypeLabels[data.type]}
            <Badge variant={data.isActive ? 'default' : 'secondary'}>
              {data.isActive ? 'Activa' : 'Inactiva'}
            </Badge>
            <Badge variant='outline' className='text-xs'>
              {data.language.toUpperCase()}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            {templateTypeDescriptions[data.type]}
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-4'>
          <div className='space-y-3'>
            <div>
              <span className='text-sm font-medium'>Tipo de evento:</span>
              <p className='text-sm text-muted-foreground mt-1'>
                {templateTypeLabels[data.type]}
              </p>
            </div>

            <Separator />

            <div>
              <span className='text-sm font-medium'>Plantilla del mensaje:</span>
              <div className='mt-2 p-3 rounded-lg bg-muted/50'>
                <pre className='text-sm whitespace-pre-wrap font-mono'>{data.template}</pre>
              </div>
            </div>

            <Separator />

            <div>
              <span className='text-sm font-medium'>Estado:</span>
              <p className='text-sm text-muted-foreground mt-1'>
                {data.isActive
                  ? 'Esta plantilla está activa y se usará para enviar mensajes automáticos.'
                  : 'Esta plantilla está inactiva. El sistema usará el mensaje predeterminado.'}
              </p>
            </div>

            <Separator />

            <div>
              <span className='text-sm font-medium'>Idioma:</span>
              <p className='text-sm text-muted-foreground mt-1'>
                {data.language === 'es' ? 'Español' : data.language.toUpperCase()}
              </p>
            </div>
          </div>

          <Alert>
            <Info className='h-4 w-4' />
            <AlertDescription>
              <div className='space-y-2'>
                <p className='font-medium text-sm'>Variables disponibles en esta plantilla:</p>
                <div className='grid gap-1 text-xs'>
                  {availableVariables.map((variable) => (
                    <div key={variable.name} className='flex justify-between'>
                      <code className='font-mono font-semibold'>{variable.name}</code>
                      <span className='text-muted-foreground'>{variable.description}</span>
                    </div>
                  ))}
                </div>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      </DialogContent>
    </Dialog>
  )
}
