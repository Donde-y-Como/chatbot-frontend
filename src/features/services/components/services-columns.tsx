import { ColumnDef, FilterFn } from '@tanstack/react-table'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import LongText from '@/components/long-text'
import { Service } from '@/features/appointments/types.ts'
import { DataTableColumnHeader } from '@/components/tables/data-table-column-header'
import { DataTableRowActions } from './data-table-row-actions'

// Global filter function for multi-field search
const globalFilterFn: FilterFn<Service> = (row, columnId, value) => {
  if (!value) return true
  
  const service = row.original
  const searchValue = String(value).toLowerCase()
  
  // Search in name, description, price amount, and currency
  const matches = (
    service.name.toLowerCase().includes(searchValue) ||
    service.description.toLowerCase().includes(searchValue) ||
    service.price.amount.toString().includes(searchValue) ||
    service.price.currency.toLowerCase().includes(searchValue) ||
    service.duration.value.toString().includes(searchValue) ||
    service.duration.unit.toLowerCase().includes(searchValue) ||
    service.maxConcurrentBooks.toString().includes(searchValue) ||
    service.minBookingLeadHours.toString().includes(searchValue)
  )
  
  return matches
}

export const columns: ColumnDef<Service>[] = [
  // Global filter column (hidden, used for multi-field search)
  {
    id: 'globalFilter',
    filterFn: globalFilterFn,
    enableColumnFilter: false,
    enableGlobalFilter: true,
  },
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Nombre' />
    ),
    cell: ({ row }) => {
      const name = row.getValue('name');
      const truncatedName = typeof name === 'string' && name.length > 30 ? `${name.substring(0, 30)}...` : name;
      return <LongText className=''>{typeof truncatedName === 'string' ? truncatedName : ''}</LongText>;
    },
    enableHiding: false,
    enableSorting: false,
  },
  {
    accessorKey: 'descripción',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Descripción' />
    ),
    cell: ({ row }) => {
      const description = row.original.description;
      const truncatedDescription = description.length > 25 ? `${description.substring(0, 25)}...` : description;
      return <LongText className=''>{truncatedDescription || ''}</LongText>;
    },
    meta: { className: '' },
    enableSorting: false,
  },
  {
    accessorKey: 'duración',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Duración' />
    ),
    cell: ({ row }) => {
      const { duration } = row.original
      return (
        <span className='w-fit text-nowrap'>
          {duration.value} {duration.unit === 'minutes' ? 'minutos' : 'horas'}
        </span>
      )
    },
    enableSorting: false,
  },
  {
    accessorKey: 'precio',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Precio' />
    ),
    cell: ({ row }) => {
      const { amount, currency } = row.original.price
      return (
        <span className='w-fit text-nowrap'>
          {amount} {currency}
        </span>
      )
    },
    enableSorting: false,
  },
  {
    accessorKey: 'espacios',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Espacios concurrentes' />
    ),
    cell: ({ row }) => {
      return (
        <div className='flex space-x-2'>
          <Badge variant='outline' className={cn('capitalize')}>
            {row.original.maxConcurrentBooks}
          </Badge>
        </div>
      )
    },
    enableSorting: false,
  },
  {
    accessorKey: 'horas',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Horas de anticipación' />
    ),
    cell: ({ row }) => {
      return <span className='text-sm'>{row.original.minBookingLeadHours}</span>
    },
    enableSorting: false,
  },
  {
    id: 'actions',
    cell: DataTableRowActions,
  },
]
