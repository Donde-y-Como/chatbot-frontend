import { Row } from '@tanstack/react-table'
import { Eye, MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
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
import { useProductActions } from '../context/products-context'
import { Product } from '../types'

interface DataTableRowActionsProps {
  row: Row<Product>
}

export function DataTableRowActions({ row }: DataTableRowActionsProps) {
  const product = row.original
  const { openViewDialog, openEditDialog, openDeleteDialog } =
    useProductActions()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant='ghost'
          className='flex h-8 w-8 p-0 data-[state=open]:bg-muted'
        >
          <MoreHorizontal className='h-4 w-4' />
          <span className='sr-only'>Abrir menú</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-[160px]'>
        <DropdownMenuItem onClick={() => openViewDialog(product)}>
          <Eye className='mr-2 h-4 w-4' />
          Ver detalles
        </DropdownMenuItem>
        <RenderIfCan permission={PERMISSIONS.PRODUCT_UPDATE}>
          <DropdownMenuItem onClick={() => openEditDialog(product)}>
            <Pencil className='mr-2 h-4 w-4' />
            Editar
          </DropdownMenuItem>
        </RenderIfCan>
        <RenderIfCan permission={PERMISSIONS.PRODUCT_DELETE}>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => openDeleteDialog(product)}
            className='text-red-600 focus:text-red-600'
          >
            <Trash2 className='mr-2 h-4 w-4' />
            Eliminar
          </DropdownMenuItem>
        </RenderIfCan>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
