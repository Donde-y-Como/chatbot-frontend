import { Edit, MoreVertical, Trash2 } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { ConversationStatus } from '../types'
import { RenderIfCan } from '@/lib/Can'
import { PERMISSIONS } from '@/api/permissions'

interface ColumnSettingsMenuProps {
  status: ConversationStatus
  onEdit: () => void
  onDelete: () => void
}

export function ColumnSettingsMenu({
  status,
  onEdit,
  onDelete,
}: ColumnSettingsMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' size='sm' className='h-8 w-8 p-0'>
          <MoreVertical className='h-4 w-4' />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end'>
        <RenderIfCan permission={PERMISSIONS.CONVERSATION_STATUS_UPDATE}>
          <DropdownMenuItem onClick={onEdit}>
            <Edit className='mr-2 h-4 w-4' />
            Editar columna
          </DropdownMenuItem>
        </RenderIfCan>
        <RenderIfCan permission={PERMISSIONS.CONVERSATION_STATUS_DELETE}>
          <DropdownMenuItem onClick={onDelete} className='text-destructive'>
            <Trash2 className='mr-2 h-4 w-4' />
            Eliminar columna
          </DropdownMenuItem>
        </RenderIfCan>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
