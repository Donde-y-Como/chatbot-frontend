import React from 'react'
import { format, parseISO } from 'date-fns'
import { ColumnDef } from '@tanstack/react-table'
import { es } from 'date-fns/locale/es'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar.tsx'
import { Badge } from '@/components/ui/badge.tsx'
import { DataTableColumnHeader } from '@/components/tables/data-table-column-header.tsx'
import { Employee } from '@/features/appointments/types.ts'
import { DataTableRowActions } from './data-table-row-actions'

export const columns: ColumnDef<Employee>[] = [
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Nombre' />
    ),
    cell: ({ row }) => {
      const { photo, name } = row.original
      return (
        <div className='flex items-center space-x-2'>
          <Avatar className='h-6 w-6'>
            <AvatarImage src={photo} alt={name} />
            <AvatarFallback>{name.charAt(0)}</AvatarFallback>
          </Avatar>
          <p className=''>{name}</p>
        </div>
      )
    },
    enableHiding: false,
    enableSorting: false,
  },

  {
    accessorKey: 'email',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Email' />
    ),
    cell: ({ row }) => (
      <div className='w-fit text-nowrap'>{row.getValue('email')}</div>
    ),
    enableHiding: false,
  },

  {
    accessorKey: 'role',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Rol' />
    ),
    cell: ({ row }) => {
      return (
        <Badge variant='outline' className='capitalize text-sm'>
          {row.getValue('role')}
        </Badge>
      )
    },
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'dirección',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Dirección' />
    ),
    cell: ({ row }) => <div>{row.original.address}</div>,
    enableSorting: false,
    enableHiding: true,
  },
  {
    accessorKey: 'fecha nacimiento',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Fecha de nacimiento' />
    ),
    cell: ({ row }) => (
      <div>
        {row.original.birthDate
          ? format(parseISO(row.original.birthDate), 'd/M/y', { locale: es })
          : ''}
      </div>
    ),
    enableSorting: false,
    enableHiding: true,
  },
  {
    id: 'actions',
    cell: DataTableRowActions,
  },
]
