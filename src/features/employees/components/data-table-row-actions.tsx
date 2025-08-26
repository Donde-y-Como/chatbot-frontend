import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import { Row } from '@tanstack/react-table'
import { IconEdit, IconEye, IconTrash } from '@tabler/icons-react'
import { PERMISSIONS } from '@/api/permissions.ts'
import { RenderIfCan } from '@/lib/Can.tsx'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useGetUser } from '@/components/layout/hooks/useGetUser.ts'
import { useEmployees } from '../context/employees-context'
import { Employee } from '../types'

interface DataTableRowActionsProps {
  row: Row<Employee>
}

export function DataTableRowActions({ row }: DataTableRowActionsProps) {
  const { setOpen, setCurrentRow } = useEmployees()
  const { data: user } = useGetUser()

  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button
            variant='ghost'
            className='flex h-8 w-8 p-0 data-[state=open]:bg-muted'
          >
            <DotsHorizontalIcon className='h-4 w-4' />
            <span className='sr-only'>Abrir menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end' className='w-[160px]'>
          <DropdownMenuItem
            onClick={() => {
              setCurrentRow(row.original)
              setOpen('view')
            }}
          >
            Ver
            <DropdownMenuShortcut>
              <IconEye size={16} />
            </DropdownMenuShortcut>
          </DropdownMenuItem>
          <RenderIfCan permission={PERMISSIONS.EMPLOYEE_UPDATE}>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                setCurrentRow(row.original)
                setOpen('edit')
              }}
            >
              Editar
              <DropdownMenuShortcut>
                <IconEdit size={16} />
              </DropdownMenuShortcut>
            </DropdownMenuItem>
          </RenderIfCan>
          {row.original.userId !== user?.id && (
            <RenderIfCan permission={PERMISSIONS.EMPLOYEE_DELETE}>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  setCurrentRow(row.original)
                  setOpen('delete')
                }}
                className='!text-red-500'
              >
                Eliminar
                <DropdownMenuShortcut>
                  <IconTrash size={16} />
                </DropdownMenuShortcut>
              </DropdownMenuItem>
            </RenderIfCan>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}
