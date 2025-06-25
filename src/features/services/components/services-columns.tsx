import { ColumnDef, FilterFn } from '@tanstack/react-table'
import { Calendar, Clock, DollarSign, Users } from 'lucide-react'
import { Badge } from '@/components/ui/badge.tsx'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip.tsx'
import { DataTableColumnHeader } from '@/components/tables/data-table-column-header.tsx'
import { Service } from '@/features/appointments/types.ts'
import { DataTableRowActions } from './data-table-row-actions'
import { dayInitialsMap } from '@/features/employees/types'

// Helper function to get work days summary
function getWorkDaysSummary(schedule: Record<string, any>): string {
  if (!schedule || Object.keys(schedule).length === 0) return 'Sin horario'
  
  const workDays = Object.keys(schedule)
    .filter(day => schedule[day] && schedule[day].startAt !== undefined)
    .map(day => dayInitialsMap[day as keyof typeof dayInitialsMap])
    .filter(Boolean)
  
  if (workDays.length === 0) return 'Sin horario'
  if (workDays.length === 7) return 'L-DO'
  if (workDays.length === 6 && !workDays.includes('DO')) return 'L-SA'
  if (workDays.length === 5 && workDays.includes('LU') && workDays.includes('VI')) return 'L-V'
  
  return workDays.join(', ')
}

// Global filter function for multi-field search
export const globalFilterFn: FilterFn<Service> = (row, columnId, value) => {
  if (!value) return true

  const service = row.original
  const searchValue = String(value).toLowerCase()

  // Search only in name and description
  return (
    service.name.toLowerCase().includes(searchValue) ||
    service.description.toLowerCase().includes(searchValue)
  )
}

export const createColumns = (): ColumnDef<Service>[] => [
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
  {
    id: 'actions',
    cell: DataTableRowActions,
  },
]
