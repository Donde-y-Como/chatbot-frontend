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
import { Tag } from '../types'

interface DeleteTagDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => Promise<void>
  isDeleting: boolean
  tag?: Tag
}

export function DeleteTagDialog({
  isOpen,
  onClose,
  onConfirm,
  isDeleting,
  tag,
}: DeleteTagDialogProps) {
  if (!tag) return null

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className='flex items-center gap-2'>
            <AlertTriangle className='h-5 w-5 text-destructive' />
            ¿Eliminar etiqueta?
          </AlertDialogTitle>
          <AlertDialogDescription className='space-y-3'>
            <p>
              ¿Estás seguro de que deseas eliminar la etiqueta{' '}
              <strong>"{tag.name}"</strong>?
            </p>

            <div className='flex items-center gap-3 p-3 rounded-lg bg-muted/50'>
              <div 
                className='w-6 h-6 rounded-full border-2 border-white shadow-sm flex-shrink-0'
                style={{ backgroundColor: tag.color }}
              />
              <div className='flex items-center gap-2'>
                <span className='font-medium'>{tag.name}</span>
                <Badge variant='outline' className='font-mono text-xs'>
                  {tag.color}
                </Badge>
              </div>
            </div>

            {tag.description && (
              <div className='text-sm text-muted-foreground italic'>
                "{tag.description}"
              </div>
            )}

            <p className='text-sm text-muted-foreground'>
              Esta acción no se puede deshacer. La etiqueta será eliminada 
              permanentemente y se quitará de todos los productos que la tengan asignada.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isDeleting}
            className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
          >
            {isDeleting && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
            Eliminar etiqueta
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
