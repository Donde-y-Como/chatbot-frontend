import { DataTableColumnHeader } from '@/components/tables/data-table-column-header.tsx'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar.tsx'
import { Badge } from '@/components/ui/badge.tsx'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip.tsx'
import { ColumnDef, FilterFn } from '@tanstack/react-table'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale/es'
import { DataTableRowActions } from './data-table-row-actions'
import { Employee, dayInitialsMap } from '../types'
import { getWorkDaysSummary } from '@/lib/utils.ts'

// Global filter function for multi-field search
export const globalFilterFn: FilterFn<Employee> = (row, columnId, value) => {
  if (!value) return true
  
  const employee = row.original
  const searchValue = String(value).toLowerCase()
  
  // Search only in name and email
  const matches = (
    employee.name.toLowerCase().includes(searchValue) ||
    employee.email.toLowerCase().includes(searchValue)
  )
  
  return matches
}


// Role color mapping
const getRoleVariant = (role: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
  const roleColors: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    'admin': 'destructive',
    'administrador': 'destructive',
    'manager': 'default',
    'gerente': 'default',
    'employee': 'secondary',
    'empleado': 'secondary',
    'specialist': 'outline',
    'especialista': 'outline'
  }
  return roleColors[role.toLowerCase()] || 'outline'
}

export const createColumns = (): ColumnDef<Employee>[] => [
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Nombre' />
    ),
    cell: ({ row }) => {
      const { photo, name } = row.original
      const truncatedName = name.length > 25 ? `${name.substring(0, 25)}...` : name
      const needsTooltip = name.length > 25
      
      const content = (
        <div className='flex items-center space-x-3'>
          <Avatar className='h-9 w-9'>
            <AvatarImage src={photo} alt={name} className='object-cover'/>
            <AvatarFallback className='bg-primary/10 text-primary font-semibold'>
              {name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className='flex flex-col'>
            <p className='font-medium text-sm'>{truncatedName}</p>
          </div>
        </div>
      )
      
      if (needsTooltip) {
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                {content}
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
    accessorKey: 'email',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Email' />
    ),
    cell: ({ row }) => {
      const email = row.getValue('email') as string
      const truncatedEmail = email.length > 30 ? `${email.substring(0, 30)}...` : email
      const needsTooltip = email.length > 30
      
      const content = (
        <div className='font-mono text-sm text-muted-foreground'>{truncatedEmail}</div>
      )
      
      if (needsTooltip) {
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                {content}
              </TooltipTrigger>
              <TooltipContent>
                <p>{email}</p>
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
    accessorKey: 'role',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Rol' />
    ),
    cell: ({ row }) => {
      const role = row.getValue('role') as string
      return (
        <Badge variant={getRoleVariant(role)} className='capitalize text-sm font-medium'>
          {role}
        </Badge>
      )
    },
    enableSorting: true,
    enableHiding: false,
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: 'address',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Dirección' />
    ),
    cell: ({ row }) => {
      const address = row.original.address || ''
      if (!address) return <span className='text-muted-foreground text-sm'>Sin dirección</span>
      
      const truncatedAddress = address.length > 30 ? `${address.substring(0, 30)}...` : address
      const needsTooltip = address.length > 30
      
      const content = (
        <div className='text-sm'>{truncatedAddress}</div>
      )
      
      if (needsTooltip) {
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                {content}
              </TooltipTrigger>
              <TooltipContent>
                <p>{address}</p>
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
    accessorKey: 'birthDate',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Fecha de nacimiento' />
    ),
    cell: ({ row }) => {
      const birthDate = row.original.birthDate
      if (!birthDate) return <span className='text-muted-foreground text-sm'>Sin fecha</span>
      
      return (
        <Badge variant='secondary' className='text-xs'>
          {format(parseISO(birthDate), 'dd/MM/y', { locale: es })}
        </Badge>
      )
    },
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Fecha de creación' />
    ),
    cell: ({ row }) => {
      const createdAt = row.original.createdAt
      if (!createdAt) return <span className='text-muted-foreground text-sm'>Sin fecha</span>
      
      return (
        <Badge variant='secondary' className='text-xs'>
          {format(parseISO(createdAt), 'dd/MM/y', { locale: es })}
        </Badge>
      )
    },
    enableSorting: true,
    enableHiding: true,
  },
  {
    id: 'actions',
    cell: DataTableRowActions,
  },
]

export const columns = createColumns()
