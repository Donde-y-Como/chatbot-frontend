import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tag } from '../types'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface ViewTagDialogProps {
  isOpen: boolean
  onClose: () => void
  data?: Tag
}

export function ViewTagDialog({ isOpen, onClose, data }: ViewTagDialogProps) {
  if (!data) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='sm:max-w-[500px]'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-3'>
            {data.name}
            <Badge variant='secondary'>Etiqueta</Badge>
          </DialogTitle>
          <DialogDescription>
            Detalles de la etiqueta
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-4'>
          <div className='space-y-3'>
            <div>
              <span className='text-sm font-medium'>Nombre:</span>
              <p className='text-sm text-muted-foreground mt-1'>
                {data.name}
              </p>
            </div>

            {data.description && (
              <div>
                <span className='text-sm font-medium'>Descripción:</span>
                <p className='text-sm text-muted-foreground mt-1'>
                  {data.description}
                </p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
