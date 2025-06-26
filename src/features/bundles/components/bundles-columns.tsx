import { format, parseISO } from 'date-fns'
import { ColumnDef } from '@tanstack/react-table'
import { es } from 'date-fns/locale/es'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { DataTableColumnHeader } from '@/components/tables/data-table-column-header'
import { ProductStatus, ProductTag } from '@/features/products/types'
import { Bundle } from '../types'
import { formatBundlePrice } from '../utils/bundleUtils'
import { DataTableRowActions } from './data-table-row-actions'

const getStatusBadge = (status: ProductStatus) => {
  if (!status) {
    return (
      <Badge
        variant='secondary'
        className='text-sm bg-gray-100 text-gray-800 border-gray-200'
      >
        Sin estado
      </Badge>
    )
  }

  const statusConfig = {
    [ProductStatus.ACTIVO]: {
      label: 'Activo',
      className: 'bg-green-100 text-green-800 border-green-200',
    },
    [ProductStatus.INACTIVO]: {
      label: 'Inactivo',
      className: 'bg-red-100 text-red-800 border-red-200',
    },
    [ProductStatus.SIN_STOCK]: {
      label: 'Sin Stock',
      className: 'bg-red-100 text-red-800 border-red-200',
    },
  }

  const config = statusConfig[status] || statusConfig[ProductStatus.INACTIVO]

  return (
    <Badge variant='secondary' className={cn('text-sm', config.className)}>
      {config.label}
    </Badge>
  )
}

// Global filter function for multi-field search
export function globalFilterFn(
  row: { original: Bundle },
  columnId: string,
  filterValue: string
) {
  if (!filterValue) return true

  const searchValue = filterValue.toLowerCase()
  const bundle = row.original

  // Search in basic fields
  const searchFields = [
    bundle.name?.toLowerCase() || '',
    bundle.description?.toLowerCase() || '',
    bundle.sku?.toLowerCase() || '',
  ]

  return searchFields.some((field) => field.includes(searchValue))
}

export const createBundleColumns = (
  tags: ProductTag[] = []
): ColumnDef<Bundle>[] => [
  // Global filter column (hidden, used for multi-field search)
  {
    id: 'globalFilter',
    filterFn: globalFilterFn,
    enableColumnFilter: false,
  },
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Nombre' />
    ),
    cell: ({ row }) => {
      const bundle = row.original
      return (
        <div className='flex flex-col'>
          <span className='font-medium'>{bundle.name}</span>
          <span className='text-sm text-muted-foreground'>{bundle.sku}</span>
        </div>
      )
    },
    enableSorting: true,
    enableHiding: false,
  },
  {
    accessorKey: 'description',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Descripción' />
    ),
    cell: ({ row }) => {
      const description = row.getValue('description') as string
      return (
        <div className='max-w-[200px] truncate' title={description}>
          {description || 'Sin descripción'}
        </div>
      )
    },
    enableSorting: false,
  },
  {
    accessorKey: 'items',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Items' />
    ),
    cell: ({ row }) => {
      const items = row.getValue('items') as Bundle['items']
      const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
      const uniqueItems = items.length

      return (
        <div className='flex flex-col'>
          <span className='font-medium'>{totalItems} items</span>
          <span className='text-sm text-muted-foreground'>
            {uniqueItems} únicos
          </span>
        </div>
      )
    },
    enableSorting: false,
  },
  {
    accessorKey: 'price',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Precio' />
    ),
    cell: ({ row }) => {
      const price = row.getValue('price') as Bundle['price']
      return (
        <div className='font-medium'>
          {formatBundlePrice(price.amount, price.currency)}
        </div>
      )
    },
    enableSorting: true,
  },
  {
    accessorKey: 'cost',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Costo' />
    ),
    cell: ({ row }) => {
      const cost = row.getValue('cost') as Bundle['cost']
      return (
        <div className='text-muted-foreground'>
          {formatBundlePrice(cost.amount, cost.currency)}
        </div>
      )
    },
    enableSorting: true,
  },
  {
    accessorKey: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Estado' />
    ),
    cell: ({ row }) => {
      const status = row.getValue('status') as ProductStatus
      return getStatusBadge(status)
    },
    enableSorting: true,
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: 'tagIds',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Etiquetas' />
    ),
    cell: ({ row }) => {
      const { tagIds } = row.original
      if (!tagIds || tagIds.length === 0) {
        return <span className='text-muted-foreground text-sm'>-</span>
      }

      const tagItems = tagIds
        .map((tagId) => {
          const tag = tags.find((t) => t.id === tagId)
          return tag || null
        })
        .filter((item): item is ProductTag => item !== null)

      return (
        <div className='flex flex-wrap gap-1 max-w-[200px]'>
          {tagItems.slice(0, 2).map((item) => (
            <Badge
              key={item.id}
              variant='outline'
              className='text-xs'
              style={{
                backgroundColor: item.color ? `${item.color}20` : undefined,
                borderColor: item.color || undefined,
                color: item.color || undefined,
              }}
            >
              {item.name}
            </Badge>
          ))}
          {tagItems.length > 2 && (
            <Badge variant='secondary' className='text-xs'>
              +{tagItems.length - 2}
            </Badge>
          )}
        </div>
      )
    },
    enableSorting: false,
    filterFn: (row, id, value) => {
      const rowValue = row.getValue(id) as string[]
      if (!rowValue || !Array.isArray(rowValue)) return false
      return value.some((filterValue: string) => rowValue.includes(filterValue))
    },
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Fecha creación' />
    ),
    cell: ({ row }) => {
      const dateStr = row.getValue('createdAt') as string
      try {
        const date = parseISO(dateStr)
        return (
          <div className='text-sm'>
            {format(date, 'dd/MM/yyyy', { locale: es })}
          </div>
        )
      } catch {
        return <span className='text-muted-foreground'>Fecha inválida</span>
      }
    },
    enableSorting: true,
  },
  {
    id: 'actions',
    header: 'Acciones',
    cell: ({ row }) => <DataTableRowActions row={row} />,
    enableHiding: false,
  },
]
