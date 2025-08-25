import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import { Row } from '@tanstack/react-table'
import { Edit, Eye, Trash2 } from 'lucide-react'
import { PERMISSIONS } from '@/api/permissions.ts'
import { RenderIfCan } from '@/lib/Can.tsx'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useBundleContext } from '../context/bundles-context'
import { Bundle } from '../types'

interface DataTableRowActionsProps<TData> {
  row: Row<TData>
}

export function DataTableRowActions<TData>({
  row,
}: DataTableRowActionsProps<TData>) {
  const bundle = row.original as Bundle
  const { setSelectedBundle, setDialogMode, setIsDialogOpen } =
    useBundleContext()

  const handleView = () => {
    setSelectedBundle(bundle)
    setDialogMode('view')
    setIsDialogOpen(true)
  }

  const handleEdit = () => {
    setSelectedBundle(bundle)
    setDialogMode('edit')
    setIsDialogOpen(true)
  }

  const handleDelete = () => {
    setSelectedBundle(bundle)
    setDialogMode('delete')
    setIsDialogOpen(true)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant='ghost'
          className='flex h-8 w-8 p-0 data-[state=open]:bg-muted'
        >
          <DotsHorizontalIcon className='h-4 w-4' />
          <span className='sr-only'>Abrir menú</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-[160px]'>
        <DropdownMenuItem onClick={handleView}>
          <Eye className='mr-2 h-4 w-4' />
          Ver detalles
        </DropdownMenuItem>
        <RenderIfCan permission={PERMISSIONS.BUNDLE_UPDATE}>
          <DropdownMenuItem onClick={handleEdit}>
            <Edit className='mr-2 h-4 w-4' />
            Editar
          </DropdownMenuItem>
        </RenderIfCan>
        <RenderIfCan permission={PERMISSIONS.BUNDLE_DELETE}>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleDelete} className='text-destructive'>
            <Trash2 className='mr-2 h-4 w-4' />
            Eliminar
          </DropdownMenuItem>
        </RenderIfCan>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
