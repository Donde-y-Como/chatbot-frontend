import { format, parseISO } from 'date-fns'
import { ColumnDef } from '@tanstack/react-table'
import {
  IconBrandFacebook,
  IconBrandInstagram,
  IconBrandWhatsapp,
} from '@tabler/icons-react'
import { es } from 'date-fns/locale/es'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar.tsx'
import { Badge } from '@/components/ui/badge.tsx'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { WhatsAppBusinessIcon } from '@/components/ui/whatsAppBusinessIcon.tsx'
import { DataTableColumnHeader } from '@/components/tables/data-table-column-header.tsx'
import { ClientPrimitives, PlatformName, Tag } from '../types'
import { DataTableRowActions } from './data-table-row-actions'
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

// Helper function to format WhatsApp Web phone numbers
function formatWhatsAppPhone(platformId: string): string {
  // Extract phone number from format like 5219512010452@s.whatsapp.net
  const phoneMatch = platformId.match(/^(\d+)@s\.whatsapp\.net$/)
  if (!phoneMatch) return platformId
  
  const phoneNumber = phoneMatch[1]
  // Format 521XXXXXXXXX to +52 1 XXX XXX XXXX
  if (phoneNumber.startsWith('521') && phoneNumber.length === 13) {
    const formatted = `+52 1 ${phoneNumber.slice(3, 6)} ${phoneNumber.slice(6, 9)} ${phoneNumber.slice(9)}`
    return formatted
  }
  return phoneNumber
}

// Global filter function for multi-field search
function globalFilterFn(row: { original: ClientPrimitives }, columnId: string, filterValue: string) {
  if (!filterValue) return true
  
  const searchValue = filterValue.toLowerCase()
  const client = row.original as ClientPrimitives
  
  // Search in basic fields
  const searchFields = [
    client.name?.toLowerCase() || '',
    client.email?.toLowerCase() || '',
    client.address?.toLowerCase() || '',
    client.notes?.toLowerCase() || '',
  ]
  
  // Search in platform IDs (especially phone numbers)
  const platformSearchTerms = client.platformIdentities?.map(identity => {
    if (identity.platformName === PlatformName.WhatsappWeb) {
      return formatWhatsAppPhone(identity.platformId).toLowerCase()
    }
    return identity.platformId.toLowerCase()
  }) || []
  
  const allSearchTerms = [...searchFields, ...platformSearchTerms]
  
  return allSearchTerms.some(field => field.includes(searchValue))
}

export const createColumns = (
  tags: Tag[] = []
): ColumnDef<ClientPrimitives>[] => [
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
      <DataTableColumnHeader column={column} title='Cliente' />
    ),
    cell: ({ row }) => {
      const { photo, name, email } = row.original
      return (
        <div className='flex items-center space-x-3'>
          <Avatar className='h-10 w-10'>
            <AvatarImage src={photo} alt={name} className='object-cover' />
            <AvatarFallback className='text-sm font-medium'>{name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className='flex flex-col'>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <p className='font-medium text-sm leading-tight max-w-[200px] truncate'>
                    {name}
                  </p>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{name}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            {email && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <p className='text-xs text-muted-foreground max-w-[200px] truncate'>
                      {email}
                    </p>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{email}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        </div>
      )
    },
    enableHiding: false,
    enableSorting: true,
    size: 250,
  },


  {
    accessorKey: 'platformIdentities',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Plataformas' />
    ),
    cell: ({ row }) => {
      const platformIdentities = row.original.platformIdentities
      if (!platformIdentities || platformIdentities.length === 0) {
        return <div className='text-muted-foreground text-sm'>-</div>
      }

      return (
        <div className='flex flex-wrap gap-1 max-w-[300px]'>
          {platformIdentities.map((identity, index) => {
            const PlatformIcon = {
              [PlatformName.Whatsapp]: IconBrandWhatsapp,
              [PlatformName.WhatsappWeb]: WhatsAppBusinessIcon,
              [PlatformName.Facebook]: IconBrandFacebook,
              [PlatformName.Instagram]: IconBrandInstagram,
            }[identity.platformName] || null

            const displayText = identity.platformName === PlatformName.WhatsappWeb 
              ? `${getPlatformDisplayName(identity.platformName)}: ${formatWhatsAppPhone(identity.platformId)}`
              : getPlatformDisplayName(identity.platformName)

            return (
              <TooltipProvider key={index}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant='outline'
                      size='sm'
                      className='h-7 px-2 text-xs flex items-center gap-1.5 max-w-[200px]'
                      onClick={() => {
                        const chatButton = document.getElementById(
                          `platform-chat-${row.original.id}-${identity.platformName}`
                        )
                        if (chatButton) {
                          chatButton.click()
                        }
                      }}
                    >
                      <PlatformChatButton
                        clientId={row.original.id}
                        platformName={identity.platformName}
                        profileName={identity.profileName}
                        id={`platform-chat-${row.original.id}-${identity.platformName}`}
                        className='hidden'
                      />
                      {PlatformIcon && (
                        <PlatformIcon
                          size={12}
                          className={cn(
                            (identity.platformName === PlatformName.Whatsapp ||
                              identity.platformName === PlatformName.WhatsappWeb) &&
                              'text-green-600',
                            identity.platformName === PlatformName.Facebook &&
                              'text-blue-600',
                            identity.platformName === PlatformName.Instagram &&
                              'text-pink-600'
                          )}
                        />
                      )}
                      <span className='truncate'>{displayText}</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{displayText}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )
          })}
        </div>
      )
    },
    filterFn: (row, id, value) => {
      const platformIdentities = row.original.platformIdentities || []
      if (!value || value.length === 0) return true
      return platformIdentities.some(identity => 
        value.includes(identity.platformName)
      )
    },
    enableSorting: false,
    enableHiding: false,
    size: 300,
  },

  {
    accessorKey: 'tagIds',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Etiquetas' />
    ),
    cell: ({ row }) => {
      const tagIds = row.original.tagIds
      if (!tagIds || tagIds.length === 0 || !tags.length) {
        return <div className='text-muted-foreground text-sm'>Sin etiquetas</div>
      }

      const clientTags = tagIds
        .map(tagId => tags.find(tag => tag.id === tagId))
        .filter(Boolean)

      if (clientTags.length === 0) {
        return <div className='text-muted-foreground text-sm'>Sin etiquetas</div>
      }

      return (
        <div className='flex flex-wrap gap-1 max-w-[200px]'>
          {clientTags.slice(0, 2).map((tag) => (
            <Badge
              key={tag!.id}
              variant='secondary'
              className='text-xs px-2 py-0.5'
            >
              {tag!.name}
            </Badge>
          ))}
          {clientTags.length > 2 && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge variant='outline' className='text-xs px-2 py-0.5'>
                    +{clientTags.length - 2}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <div className='flex flex-col gap-1'>
                    {clientTags.slice(2).map(tag => (
                      <span key={tag!.id} className='text-sm'>{tag!.name}</span>
                    ))}
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      )
    },
    filterFn: (row, id, value) => {
      const tagIds = row.original.tagIds || []
      if (!value || value.length === 0) return true
      return value.some((tagId: string) => tagIds.includes(tagId))
    },
    enableSorting: false,
    enableHiding: false,
    size: 200,
  },

  {
    accessorKey: 'address',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Dirección' />
    ),
    cell: ({ row }) => {
      const address = row.original.address
      if (!address) {
        return <div className='text-muted-foreground text-sm'>-</div>
      }
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className='max-w-[150px] truncate text-sm'>
                {address}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p className='max-w-[300px] break-words'>{address}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )
    },
    enableSorting: true,
    enableHiding: true,
    size: 150,
  },

  {
    accessorKey: 'birthdate',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Cumpleaños' />
    ),
    cell: ({ row }) => {
      const birthdate = row.original.birthdate
      if (!birthdate) return <div className='text-muted-foreground text-sm'>-</div>

      return (
        <Badge variant='outline' className='text-xs font-mono'>
          {format(parseISO(birthdate), 'dd/MM/y', { locale: es })}
        </Badge>
      )
    },
    enableSorting: true,
    enableHiding: true,
    size: 120,
  },

  {
    accessorKey: 'createdAt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Registrado' />
    ),
    cell: ({ row }) => (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge variant='secondary' className='text-xs font-mono cursor-help'>
              {format(parseISO(row.original.createdAt), 'dd/MM/y', { locale: es })}
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>{format(parseISO(row.original.createdAt), 'dd/MM/yyyy HH:mm', { locale: es })}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    ),
    enableSorting: true,
    enableHiding: true,
    size: 120,
  },

  {
    id: 'actions',
    cell: DataTableRowActions,
    size: 50,
  },
]
