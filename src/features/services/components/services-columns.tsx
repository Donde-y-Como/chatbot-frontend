import { ColumnDef } from '@tanstack/react-table'
import { Calendar, Clock, DollarSign, Package, Users } from 'lucide-react'
import { getWorkDaysSummary } from '@/lib/utils.ts'
import { Badge } from '@/components/ui/badge'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { DataTableColumnHeader } from '@/components/tables/data-table-column-header'
import { Service } from '@/features/appointments/types'
import {
  Category,
  ProductStatus,
  ProductTag,
  Unit,
} from '@/features/products/types.ts'
import { getServiceStatus } from '../utils/serviceUtils'
import { DataTableRowActions } from './data-table-row-actions'
import { Tag } from '@/features/settings/tags/types.ts'

// Global filter function for multi-field search
export function globalFilterFn(
  row: { original: Service },
  _columnId: string,
  value: string
) {
  if (!value) return true

  const service = row.original
  const searchValue = String(value).toLowerCase()

  // Search in name, description, and SKU
  return (
    service.name.toLowerCase().includes(searchValue) ||
    service.description.toLowerCase().includes(searchValue) ||
    (service.productInfo?.sku &&
      service.productInfo.sku.toLowerCase().includes(searchValue))
  )
}

export const createColumns = (
  units: Unit[] = [],
  categories: Category[] = [],
  tags: Tag[] = []
): ColumnDef<Service>[] => [
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Nombre' />
    ),
    cell: ({ row }) => {
      const name = row.original.name
      const truncatedName =
        name.length > 25 ? `${name.substring(0, 25)}...` : name
      const needsTooltip = name.length > 25

      const content = (
        <div className='flex flex-col'>
          <p className='font-medium text-sm'>{truncatedName}</p>
        </div>
      )

      if (needsTooltip) {
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className='cursor-help'>{content}</div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{name}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )
      }

      return content
    },
    enableHiding: false,
    enableSorting: true,
  },

  {
    accessorKey: 'description',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Descripción' />
    ),
    cell: ({ row }) => {
      const description = row.original.description
      if (!description)
        return (
          <span className='text-muted-foreground text-sm'>Sin descripción</span>
        )

      const truncatedDescription =
        description.length > 35
          ? `${description.substring(0, 35)}...`
          : description
      const needsTooltip = description.length > 35

      const content = (
        <div className='text-sm text-muted-foreground max-w-[250px]'>
          {truncatedDescription}
        </div>
      )

      if (needsTooltip) {
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className='cursor-help'>{content}</div>
              </TooltipTrigger>
              <TooltipContent className='max-w-[300px]'>
                <p>{description}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )
      }

      return content
    },
    enableSorting: true,
    enableHiding: true,
  },

  {
    id: 'duration',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Duración' />
    ),
    cell: ({ row }) => {
      const { duration } = row.original
      const unitLabel = duration.unit === 'minutes' ? 'min' : 'h'

      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant='secondary' className='text-xs font-medium gap-1'>
                <Clock className='h-3 w-3' />
                {duration.value} {unitLabel}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p>
                Duración: {duration.value}{' '}
                {duration.unit === 'minutes' ? 'minutos' : 'horas'}
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )
    },
    enableSorting: true,
    enableHiding: true,
  },

  {
    id: 'price',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Precio' />
    ),
    cell: ({ row }) => {
      const { amount, currency } = row.original.price

      return (
        <Badge variant='outline' className='text-sm font-semibold gap-1'>
          <DollarSign className='h-3 w-3' />
          {amount} {currency}
        </Badge>
      )
    },
    enableSorting: true,
    enableHiding: false,
  },

  {
    id: 'maxConcurrentBooks',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Espacios' />
    ),
    cell: ({ row }) => {
      const maxBooks = row.original.maxConcurrentBooks

      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant='default' className='text-xs font-medium gap-1'>
                <Users className='h-3 w-3' />
                {maxBooks}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p>Máximo {maxBooks} citas concurrentes</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )
    },
    enableSorting: true,
    enableHiding: true,
  },

  {
    id: 'minBookingLeadHours',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Anticipación' />
    ),
    cell: ({ row }) => {
      const leadHours = row.original.minBookingLeadHours

      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant='secondary' className='text-xs font-medium gap-1'>
                <Calendar className='h-3 w-3' />
                {leadHours}h
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p>Reservar con {leadHours} horas de anticipación</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )
    },
    enableSorting: true,
    enableHiding: true,
  },
  {
    id: 'schedule',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Horario' />
    ),
    cell: ({ row }) => {
      const schedule = row.original.schedule
      const workDays = getWorkDaysSummary(schedule)

      return (
        <Badge variant='outline' className='text-xs font-medium'>
          {workDays}
        </Badge>
      )
    },
    enableSorting: false,
    enableHiding: true,
  },

  // Hidden filter columns
  {
    id: 'status',
    accessorFn: (row) => getServiceStatus(row),
    header: 'Status',
    cell: ({ row }) => {
      const status = getServiceStatus(row.original)
      const variant = status === ProductStatus.ACTIVO ? 'default' : 'secondary'
      const label = status === ProductStatus.ACTIVO ? 'Activo' : 'Inactivo'

      return (
        <Badge variant={variant} className='text-xs'>
          <Package className='w-3 h-3 mr-1' />
          {label}
        </Badge>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(getServiceStatus(row.original))
    },
    enableSorting: false,
    enableHiding: true,
  },
  {
    id: 'categoryIds',
    accessorFn: (row) => row.productInfo?.categoryIds || [],
    header: 'Categorias',
    cell: ({ row }) => {
      const categoryIds = row.original.productInfo?.categoryIds || []
      if (categoryIds.length === 0)
        return (
          <span className='text-muted-foreground text-xs'>Sin categoría</span>
        )

      const categoryNames = categoryIds
        .map((id) => categories.find((cat) => cat.id === id)?.name)
        .filter(Boolean)
        .slice(0, 2)

      return (
        <div className='flex flex-wrap gap-1'>
          {categoryNames.map((name, idx) => (
            <Badge key={idx} variant='outline' className='text-xs'>
              {name}
            </Badge>
          ))}
          {categoryIds.length > 2 && (
            <Badge variant='outline' className='text-xs'>
              +{categoryIds.length - 2}
            </Badge>
          )}
        </div>
      )
    },
    filterFn: (row, id, value) => {
      const categoryIds = row.original.productInfo?.categoryIds || []
      return value.some((filterValue: string) =>
        categoryIds.includes(filterValue)
      )
    },
    enableSorting: false,
    enableHiding: true,
  },
  {
    id: 'tagIds',
    accessorFn: (row) => row.productInfo?.tagIds || [],
    header: 'Etiquetas',
    cell: ({ row }) => {
      const tagIds = row.original.productInfo?.tagIds || []
      if (tagIds.length === 0)
        return (
          <span className='text-muted-foreground text-xs'>Sin etiquetas</span>
        )

      const tagNames = tagIds
        .map((id) => tags.find((tag) => tag.id === id)?.name)
        .filter(Boolean)
        .slice(0, 2)

      return (
        <div className='flex flex-wrap gap-1'>
          {tagNames.map((name, idx) => (
            <Badge key={idx} variant='secondary' className='text-xs'>
              {name}
            </Badge>
          ))}
          {tagIds.length > 2 && (
            <Badge variant='secondary' className='text-xs'>
              +{tagIds.length - 2}
            </Badge>
          )}
        </div>
      )
    },
    filterFn: (row, id, value) => {
      const tagIds = row.original.productInfo?.tagIds || []
      return value.some((filterValue: string) => tagIds.includes(filterValue))
    },
    enableSorting: false,
    enableHiding: true,
  },
  {
    id: 'actions',
    cell: DataTableRowActions,
  },
]
