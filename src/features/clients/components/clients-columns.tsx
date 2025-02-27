import { DataTableColumnHeader } from '@/components/tables/data-table-column-header.tsx'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar.tsx'
import { Badge } from '@/components/ui/badge.tsx'
import { ColumnDef } from '@tanstack/react-table'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale/es'
import { DataTableRowActions } from './data-table-row-actions'
import { ClientPrimitives, PlatformName, Tag } from '../types'

// Helper function para mostrar nombres de plataformas en español
function getPlatformDisplayName(platformName: PlatformName): string {
  switch (platformName) {
    case PlatformName.Whatsapp:
      return 'WhatsApp'
    case PlatformName.Facebook:
      return 'Facebook'
    case PlatformName.Instagram:
      return 'Instagram'
    default:
      return platformName
  }
}

export const createColumns = (tags: Tag[] = []): ColumnDef<ClientPrimitives>[] => [
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
          <p>{name}</p>
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
      <div className='w-fit text-nowrap'>{row.getValue('email') || '-'}</div>
    ),
    enableHiding: false,
  },

  {
    accessorKey: 'platformIdentities',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Plataformas' />
    ),
    cell: ({ row }) => {
      const platformIdentities = row.original.platformIdentities
      if (!platformIdentities || platformIdentities.length === 0) {
        return <div>-</div>
      }
      
      return (
        <div className='flex flex-wrap gap-1'>
          {platformIdentities.map((identity, index) => (
            <Badge 
              key={index}
              variant='outline' 
              className='capitalize text-sm'
            >
              {getPlatformDisplayName(identity.platformName)}: {identity.profileName}
            </Badge>
          ))}
        </div>
      )
    },
    enableSorting: false,
    enableHiding: false,
  },

  {
    accessorKey: 'tagIds',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Etiquetas' />
    ),
    cell: ({ row }) => {
      const tagIds = row.original.tagIds
      if (!tagIds || tagIds.length === 0 || !tags.length) {
        return <div>-</div>
      }
      
      return (
        <div className='flex flex-wrap gap-1'>
          {tagIds.map(tagId => {
            const tag = tags.find((tag: Tag) => tag.id === tagId)
            return (
              <Badge 
                key={tagId}
                variant='outline' 
                className='capitalize text-sm'
              >
                {tag ? tag.name : '-'}
              </Badge>
            )
          })}
        </div>
      )
    },
    enableSorting: false,
    enableHiding: false,
  },
  
  {
    accessorKey: 'address',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Dirección' />
    ),
    cell: ({ row }) => <div>{row.original.address || '-'}</div>,
    enableSorting: false,
    enableHiding: true,
  },
  
  {
    accessorKey: 'birthdate',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Fecha de nacimiento' />
    ),
    cell: ({ row }) => {
      const birthdate = row.original.birthdate
      if (!birthdate) return <div>-</div>
      
      return (
        <Badge variant='secondary' className='text-sm'>
          {format(parseISO(birthdate), 'dd/MM/y', { locale: es })}
        </Badge>
      )
    },
    enableSorting: false,
    enableHiding: true,
  },
  
  {
    accessorKey: 'createdAt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Fecha de creación' />
    ),
    cell: ({ row }) => (
      <Badge variant='secondary' className='text-sm'>
        {format(parseISO(row.original.createdAt), 'dd/MM/y', { locale: es })}
      </Badge>
    ),
    enableSorting: false,
    enableHiding: true,
  },
  
  {
    id: 'actions',
    cell: DataTableRowActions,
  },
]