import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Loader2, AlertTriangle } from 'lucide-react'
import { MessageTemplate, templateTypeLabels } from '../types'

interface DeleteMessageTemplateDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => Promise<void>
  isDeleting: boolean
  template?: MessageTemplate
}

export function DeleteMessageTemplateDialog({
  isOpen,
  onClose,
  onConfirm,
  isDeleting,
  template,
}: DeleteMessageTemplateDialogProps) {
  if (!template) return null

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className='flex items-center gap-2'>
            <AlertTriangle className='h-5 w-5 text-destructive' />
            ¿Eliminar plantilla de mensaje?
          </AlertDialogTitle>
          <AlertDialogDescription className='space-y-3'>
            <p>
              ¿Estás seguro de que deseas eliminar la plantilla de{' '}
              <strong>"{templateTypeLabels[template.type]}"</strong>?
            </p>

            <div className='flex flex-col gap-2 p-3 rounded-lg bg-muted/50'>
              <div className='flex items-center gap-2'>
                <span className='font-medium'>{templateTypeLabels[template.type]}</span>
                <Badge variant={template.isActive ? 'default' : 'secondary'}>
                  {template.isActive ? 'Activa' : 'Inactiva'}
                </Badge>
              </div>
              <p className='text-xs text-muted-foreground line-clamp-2 whitespace-pre-wrap'>
                {template.template}
              </p>
            </div>

            <p className='text-sm text-muted-foreground'>
              Esta acción no se puede deshacer. Si eliminas esta plantilla, el sistema usará el
              mensaje predeterminado para este tipo de evento.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isDeleting}
            className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
          >
            {isDeleting && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
            Eliminar plantilla
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
