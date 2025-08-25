import { IconEdit, IconEye, IconTrash } from '@tabler/icons-react'
import { PERMISSIONS } from '@/api/permissions.ts'
import { RenderIfCan } from '@/lib/Can.tsx'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { QuickResponse } from '../types'

interface QuickResponseListProps {
  quickResponses: QuickResponse[]
  onEdit: (quickResponse: QuickResponse) => void
  onDelete: (quickResponse: QuickResponse) => void
  onView: (quickResponse: QuickResponse) => void
}

export function QuickResponseList({
  quickResponses,
  onEdit,
  onDelete,
  onView,
}: QuickResponseListProps) {
  if (quickResponses.length === 0) {
    return (
      <div className='text-center py-4'>
        <p className='text-muted-foreground'>
          No hay respuestas rápidas configuradas.
        </p>
      </div>
    )
  }

  return (
    <div className='border rounded-md'>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Atajo</TableHead>
            <TableHead>Mensaje</TableHead>
            <TableHead>Multimedia</TableHead>
            <TableHead>Asistente</TableHead>
            <TableHead className='w-[100px]'>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {quickResponses.map((quickResponse) => (
            <TableRow key={quickResponse.id}>
              <TableCell className='font-medium'>
                {quickResponse.title}
              </TableCell>
              <TableCell className='truncate max-w-xs'>
                {quickResponse.content}
              </TableCell>
              <TableCell className='truncate max-w-xs'>
                {quickResponse.medias.length}
              </TableCell>
              <TableCell className='truncate max-w-xs'>
                {quickResponse.assistantConfig.enabled ? 'Si' : 'No'}
              </TableCell>
              <TableCell>
                <div className='flex items-center'>
                  <Button
                    variant='ghost'
                    size='icon'
                    onClick={() => onView(quickResponse)}
                    title='Ver'
                  >
                    <IconEye size={14} />
                  </Button>
                  <RenderIfCan permission={PERMISSIONS.QUICK_REPLY_UPDATE}>
                    <Button
                      variant='ghost'
                      size='icon'
                      onClick={() => onEdit(quickResponse)}
                      title='Editar'
                    >
                      <IconEdit size={14} />
                    </Button>
                  </RenderIfCan>
                  <RenderIfCan permission={PERMISSIONS.QUICK_REPLY_DELETE}>
                    <Button
                      variant='ghost'
                      size='icon'
                      onClick={() => onDelete(quickResponse)}
                      title='Eliminar'
                    >
                      <IconTrash size={14} />
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
