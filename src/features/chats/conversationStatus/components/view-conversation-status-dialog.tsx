import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { ConversationStatus } from '../types'

interface ViewConversationStatusDialogProps {
  isOpen: boolean
  onClose: () => void
  data?: ConversationStatus
}

export function ViewConversationStatusDialog({
  isOpen,
  onClose,
  data,
}: ViewConversationStatusDialogProps) {
  if (!data) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='sm:max-w-[500px]'>
        <DialogHeader>
          <DialogTitle>Detalles del Estado</DialogTitle>
          <DialogDescription>
            Información completa sobre este estado de conversación
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-4'>
          <div>
            <p className='text-sm font-medium text-muted-foreground mb-1'>Nombre</p>
            <p className='text-base'>{data.name}</p>
          </div>

          <div>
            <p className='text-sm font-medium text-muted-foreground mb-1'>
              Número de orden
            </p>
            <p className='text-base'>{data.orderNumber}</p>
          </div>

          <div>
            <p className='text-sm font-medium text-muted-foreground mb-1'>Color</p>
            {data.color ? (
              <Badge
                variant='secondary'
                style={{
                  backgroundColor: `${data.color}20`,
                  borderColor: data.color,
                  color: data.color,
                }}
              >
                {data.color}
              </Badge>
            ) : (
              <p className='text-sm text-muted-foreground'>Sin color asignado</p>
            )}
          </div>

          <div>
            <p className='text-sm font-medium text-muted-foreground mb-1'>ID</p>
            <p className='text-xs text-muted-foreground font-mono'>{data.id}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
