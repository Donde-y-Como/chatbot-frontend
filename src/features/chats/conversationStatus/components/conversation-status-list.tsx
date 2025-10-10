import { Edit, Eye, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ConversationStatus } from '../types'
import { RenderIfCan } from '@/lib/Can'
import { PERMISSIONS } from '@/api/permissions'

interface ConversationStatusListProps {
  statuses: ConversationStatus[]
  onEdit: (status: ConversationStatus) => void
  onDelete: (status: ConversationStatus) => void
  onView: (status: ConversationStatus) => void
}

export function ConversationStatusList({
  statuses,
  onEdit,
  onDelete,
  onView,
}: ConversationStatusListProps) {
  if (statuses.length === 0) {
    return (
      <div className='text-center py-10'>
        <p className='text-muted-foreground'>
          No hay estados de conversación creados aún.
        </p>
      </div>
    )
  }

  // Sort by orderNumber
  const sortedStatuses = [...statuses].sort((a, b) => a.orderNumber - b.orderNumber)

  return (
    <div className='border rounded-lg'>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className='w-[100px]'>Orden</TableHead>
            <TableHead>Nombre</TableHead>
            <TableHead>Color</TableHead>
            <TableHead className='text-right'>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedStatuses.map((status) => (
            <TableRow key={status.id}>
              <TableCell className='font-medium'>{status.orderNumber}</TableCell>
              <TableCell>{status.name}</TableCell>
              <TableCell>
                {status.color ? (
                  <Badge
                    variant='secondary'
                    style={{
                      backgroundColor: `${status.color}20`,
                      borderColor: status.color,
                      color: status.color,
                    }}
                  >
                    {status.color}
                  </Badge>
                ) : (
                  <span className='text-muted-foreground text-sm'>Sin color</span>
                )}
              </TableCell>
              <TableCell className='text-right'>
                <div className='flex justify-end gap-2'>
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={() => onView(status)}
                    title='Ver detalles'
                  >
                    <Eye className='h-4 w-4' />
                  </Button>

                  <RenderIfCan permission={PERMISSIONS.CONVERSATION_STATUS_UPDATE}>
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() => onEdit(status)}
                      title='Editar'
                    >
                      <Edit className='h-4 w-4' />
                    </Button>
                  </RenderIfCan>

                  <RenderIfCan permission={PERMISSIONS.CONVERSATION_STATUS_DELETE}>
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() => onDelete(status)}
                      title='Eliminar'
                    >
                      <Trash2 className='h-4 w-4 text-destructive' />
                    </Button>
                  </RenderIfCan>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
