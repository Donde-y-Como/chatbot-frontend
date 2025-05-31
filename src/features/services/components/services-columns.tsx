import { ColumnDef } from '@tanstack/react-table'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import LongText from '@/components/long-text'
import { Service } from '@/features/appointments/types.ts'
import { DataTableColumnHeader } from '@/components/tables/data-table-column-header'
import { DataTableRowActions } from './data-table-row-actions'

export const columns: ColumnDef<Service>[] = [
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
    accessorKey: 'precioModificado',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Precio Final' />
    ),
    cell: ({ row }) => {
      const { amount, currency } = row.original.productInfo.precioModificado
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
    accessorKey: 'codigoBarras',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Código de Barras' />
    ),
    cell: ({ row }) => {
      return <span className='text-sm font-mono'>{row.original.codigoBarras || 'N/A'}</span>
    },
    enableSorting: false,
  },
  {
    accessorKey: 'sku',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='SKU' />
    ),
    cell: ({ row }) => {
      return <span className='text-sm font-mono'>{row.original.productInfo.sku}</span>
    },
    enableSorting: false,
  },
  {
    id: 'actions',
    cell: DataTableRowActions,
  },
]
