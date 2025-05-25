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
            <div 
              className='w-6 h-6 rounded-full border-2 border-white shadow-sm flex-shrink-0'
              style={{ backgroundColor: data.color }}
            />
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

            <div>
              <span className='text-sm font-medium'>Color:</span>
              <div className='flex items-center gap-3 mt-1'>
                <div 
                  className='w-8 h-8 rounded-lg border-2 border-gray-200 shadow-sm'
                  style={{ backgroundColor: data.color }}
                />
                <div className='space-y-1'>
                  <Badge variant='outline' className='font-mono text-xs'>
                    {data.color}
                  </Badge>
                </div>
              </div>
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

          <Separator />

          <div className='space-y-2'>
            <div>
              <span className='text-sm font-medium'>Fecha de creación:</span>
              <p className='text-sm text-muted-foreground'>
                {format(new Date(data.createdAt), "dd 'de' MMMM 'de' yyyy 'a las' HH:mm", { locale: es })}
              </p>
            </div>

            <div>
              <span className='text-sm font-medium'>ID de la etiqueta:</span>
              <p className='text-sm text-muted-foreground font-mono'>
                {data.id}
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
