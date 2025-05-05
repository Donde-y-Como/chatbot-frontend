import { DataTableColumnHeader } from '@/components/tables/data-table-column-header.tsx'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar.tsx'
import { Badge } from '@/components/ui/badge.tsx'
import { Button } from '@/components/ui/button'
import { ColumnDef } from '@tanstack/react-table'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale/es'
import { DataTableRowActions } from './data-table-row-actions'
import { ClientPrimitives, PlatformName, Tag } from '../types'
import {
  IconBrandFacebook,
  IconBrandInstagram,
  IconBrandWhatsapp,
} from '@tabler/icons-react'
import { cn } from '@/lib/utils'
import { PlatformChatButton } from './platform-chat-button'

// Helper function para mostrar nombres de plataformas en español
function getPlatformDisplayName(platformName: PlatformName): string {
  switch (platformName) {
    case PlatformName.Whatsapp:
      return 'WhatsApp'
    case PlatformName.WhatsappWeb:
      return 'WhatsApp Web'
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
      const truncatedName = name.length > 30 ? `${name.substring(0, 30)}...` : name;
      return (
        <div className='flex items-center space-x-2'>
          <Avatar className='h-6 w-6'>
            <AvatarImage src={photo} alt={name} className='object-cover'/>
            <AvatarFallback>{name.charAt(0)}</AvatarFallback>
          </Avatar>
          <p>{truncatedName}</p>
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
          {platformIdentities.map((identity, index) => {
            // Determinar qué icono mostrar según la plataforma
            const PlatformIcon = {
              [PlatformName.Whatsapp]: IconBrandWhatsapp,
              [PlatformName.WhatsappWeb]: IconBrandWhatsapp,
              [PlatformName.Facebook]: IconBrandFacebook,
              [PlatformName.Instagram]: IconBrandInstagram,
            }[identity.platformName] || null;
            
            return (
            <Button 
              key={index}
              variant='ghost' 
              className='capitalize text-sm flex items-center gap-1 h-8 px-2 rounded-md border'
              onClick={() => {
                const chatButton = document.getElementById(`platform-chat-${row.original.id}-${identity.platformName}`);
                if (chatButton) {
                  chatButton.click();
                }
              }}
            >
              <PlatformChatButton 
                clientId={row.original.id}
                platformName={identity.platformName}
                profileName={identity.profileName}
                id={`platform-chat-${row.original.id}-${identity.platformName}`}
                className="hidden"
              />
              {PlatformIcon && (
                <PlatformIcon 
                  size={14}
                  className={cn(
                    (identity.platformName === PlatformName.Whatsapp || identity.platformName === PlatformName.WhatsappWeb) && 'text-green-500',
                    identity.platformName === PlatformName.Facebook && 'text-blue-500',
                    identity.platformName === PlatformName.Instagram && 'text-pink-500'
                  )}
                />
              )}
              {getPlatformDisplayName(identity.platformName)}
            </Button>
          )})}
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
    cell: ({ row }) => {
      const address = row.original.address || '';
      const truncatedAddress = address.length > 25 ? `${address.substring(0, 25)}...` : address;
      return <div>{truncatedAddress}</div>;
    },    enableSorting: false,
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