import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Unit } from '../types'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface ViewUnitDialogProps {
  isOpen: boolean
  onClose: () => void
  data?: Unit
}

export function ViewUnitDialog({ isOpen, onClose, data }: ViewUnitDialogProps) {
  if (!data) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='sm:max-w-[400px]'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-3'>
            {data.name}
            <Badge variant='outline' className='font-mono'>
              {data.abbreviation}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            Detalles de la unidad de medida
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

            <div>
              <span className='text-sm font-medium'>Abreviación:</span>
              <p className='text-sm text-muted-foreground mt-1 font-mono'>
                {data.abbreviation}
              </p>
            </div>
          </div>

          <Separator />

          <div className='space-y-2'>
            <div>
              <span className='text-sm font-medium'>Fecha de creación:</span>
              <p className='text-sm text-muted-foreground'>
                {format(new Date(data.createdAt), "dd 'de' MMMM 'de' yyyy 'a las' HH:mm", { locale: es })}
              </p>
            </div>

            <div>
              <span className='text-sm font-medium'>Última actualización:</span>
              {/* <p className='text-sm text-muted-foreground'>
                {format(new Date(data.updatedAt), "dd 'de' MMMM 'de' yyyy 'a las' HH:mm", { locale: es })}
              </p> */}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
