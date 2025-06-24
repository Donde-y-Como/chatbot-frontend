import React, {
  ChangeEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { Check, Plus, Search, X } from 'lucide-react'
import { toast } from 'sonner'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useCreateClient } from '../hooks/useCreateClient'
import { useGetClients } from '../hooks/useGetClients'
import { ClientPrimitives, PlatformName } from '@/features/clients/types'

// Use the full client type that includes platform identities
type Client = ClientPrimitives

interface CreateOrSelectClientProps {
  value: string // Selected client ID
  onChange: (value: string) => void
}

// Helper hook for debouncing
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

// Memoized Client List Item
interface ClientListItemProps {
  client: Client
  onSelect: (clientId: string) => void
}

const ClientListItem = React.memo(function ClientListItem({
  client,
  onSelect,
}: ClientListItemProps) {
  const handleSelect = useCallback(() => {
    onSelect(client.id)
  }, [client.id, onSelect])

  // Extract phone number from WhatsApp Web platform identity
  const phoneNumber = useMemo(() => {
    const whatsappIdentity = client.platformIdentities?.find(
      identity => identity.platformName === PlatformName.WhatsappWeb
    )
    
    if (!whatsappIdentity) return null
    
    const phoneMatch = whatsappIdentity.platformId.match(/^(\d+)@s\.whatsapp\.net$/)
    if (!phoneMatch) return null
    
    const phoneNum = phoneMatch[1]
    if (phoneNum.startsWith('521') && phoneNum.length === 13) {
      return `+52 1 ${phoneNum.slice(3, 6)} ${phoneNum.slice(6, 9)} ${phoneNum.slice(9)}`
    }
    return phoneNum
  }, [client.platformIdentities])

  return (
    <div
      className='flex items-center gap-3 p-3 hover:bg-accent cursor-pointer'
      onClick={handleSelect}
    >
      <Avatar className='h-8 w-8'>
        <AvatarImage
          src={client.photo}
          alt={client.name}
          className='object-cover'
        />
        <AvatarFallback className='bg-primary/10 text-primary'>
          {client.name.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className='flex flex-col min-w-0 flex-1'>
        <span className='font-medium text-sm truncate'>{client.name}</span>
        {phoneNumber && (
          <span className='text-xs text-muted-foreground'>{phoneNumber}</span>
        )}
      </div>
    </div>
  )
})

export function CreateOrSelectClient({
  value,
  onChange,
}: CreateOrSelectClientProps) {
  const [isCreatingNew, setIsCreatingNew] = useState(false)
  const [newClientName, setNewClientName] = useState('')
  const [searchQueryInput, setSearchQueryInput] = useState('')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const { data: clients, isLoading: isLoadingClients } = useGetClients()
  const createClientMutation = useCreateClient()
  const debouncedSearchQuery = useDebounce(searchQueryInput, 300)

  const selectedClient = useMemo(() => {
    return clients?.find((client) => client.id === value)
  }, [clients, value])

  // Helper function to extract phone digits for search
  const extractPhoneDigits = useCallback((platformId: string): string => {
    const phoneMatch = platformId.match(/^(\d+)@s\.whatsapp\.net$/)
    if (!phoneMatch) return ''
    
    const phoneNumber = phoneMatch[1]
    // For 521XXXXXXXXX, return the last 10 digits (the actual phone number without country code)
    if (phoneNumber.startsWith('521') && phoneNumber.length === 13) {
      return phoneNumber.slice(3) // Remove 521 prefix, return 10 digits
    }
    return phoneNumber
  }, [])

  // Helper function to format WhatsApp Web phone numbers for display
  const formatWhatsAppPhone = useCallback((platformId: string): string => {
    const phoneMatch = platformId.match(/^(\d+)@s\.whatsapp\.net$/)
    if (!phoneMatch) return platformId
    
    const phoneNumber = phoneMatch[1]
    // Format 521XXXXXXXXX to +52 1 XXX XXX XXXX
    if (phoneNumber.startsWith('521') && phoneNumber.length === 13) {
      const formatted = `+52 1 ${phoneNumber.slice(3, 6)} ${phoneNumber.slice(6, 9)} ${phoneNumber.slice(9)}`
      return formatted
    }
    return phoneNumber
  }, [])

  const filteredClients = useMemo(() => {
    if (!clients) return []
    if (!debouncedSearchQuery) {
      return clients.filter((client) => client.id !== value)
    }
    
    const searchValue = debouncedSearchQuery.toLowerCase()
    
    return clients.filter((client) => {
      if (client.id === value) return false // Don't show already selected client
      
      // Search in name
      if (client.name.toLowerCase().includes(searchValue)) {
        return true
      }
      
      // Search in platform IDs (especially phone numbers)
      if (client.platformIdentities && client.platformIdentities.length > 0) {
        for (const identity of client.platformIdentities) {
          // Search in original platform ID
          if (identity.platformId.toLowerCase().includes(searchValue)) {
            return true
          }
          
          // For WhatsApp Web, also search in formatted phone and raw digits
          if (identity.platformName === PlatformName.WhatsappWeb) {
            const formattedPhone = formatWhatsAppPhone(identity.platformId).toLowerCase()
            const rawDigits = extractPhoneDigits(identity.platformId)
            
            if (formattedPhone.includes(searchValue) || rawDigits.includes(searchValue)) {
              return true
            }
          }
        }
      }
      
      return false
    })
  }, [clients, debouncedSearchQuery, value, extractPhoneDigits, formatWhatsAppPhone])

  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(event.target as Node) &&
      inputRef.current &&
      !inputRef.current.contains(event.target as Node)
    ) {
      setIsDropdownOpen(false)
    }
  }, [])

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [handleClickOutside])

  const handleSelectClient = useCallback(
    (clientId: string) => {
      onChange(clientId)
      setSearchQueryInput('')
      setIsDropdownOpen(false)
    },
    [onChange]
  )

  const handleCreateClient = useCallback(async () => {
    const trimmedName = newClientName.trim()
    if (!trimmedName) {
      toast.error('Por favor, ingresa un nombre para el cliente')
      return
    }

    try {
      const result = await createClientMutation.mutateAsync(trimmedName)
      if (result?.id) {
        onChange(result.id)
        toast.success(`Cliente ${trimmedName} creado con éxito`)
        setNewClientName('')
        setIsCreatingNew(false)
        setSearchQueryInput('') // Clear search if any
      } else {
        toast.error('No se pudo obtener el ID del cliente creado.')
      }
    } catch (error) {
      toast.error('Error al crear el cliente')
      console.error('Error creating client:', error)
    }
  }, [newClientName, createClientMutation, onChange])

  const handleSearchInputChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const query = e.target.value
      setSearchQueryInput(query)
      if (query.length > 0) {
        setIsDropdownOpen(true)
      } else {
        setIsDropdownOpen(false)
      }
    },
    []
  )

  const handleSearchInputFocus = useCallback(() => {
    if (filteredClients.length > 0 || searchQueryInput.length > 0) {
      setIsDropdownOpen(true)
    }
  }, [filteredClients.length, searchQueryInput.length])

  if (isCreatingNew) {
    return (
      <div className='flex gap-2 items-center'>
        <Input
          autoFocus
          value={newClientName}
          onChange={(e) => setNewClientName(e.target.value)}
          placeholder='Nombre del cliente'
          className='flex-1'
          onKeyDown={async (e) => {
            if (
              e.key === 'Enter' &&
              !createClientMutation.isPending &&
              newClientName.trim() !== ''
            ) {
              await handleCreateClient()
            }
          }}
        />
        <Button
          onClick={handleCreateClient}
          disabled={
            createClientMutation.isPending || newClientName.trim() === ''
          }
        >
          {createClientMutation.isPending ? 'Creando...' : 'Guardar'}
        </Button>
        <Button
          variant='ghost'
          size='icon'
          onClick={() => setIsCreatingNew(false)}
          disabled={createClientMutation.isPending}
          aria-label='Cancelar creación de cliente'
        >
          <X className='h-4 w-4' />
        </Button>
      </div>
    )
  }

  return (
    <div className='flex gap-2 items-center'>
      <div className='relative flex-1' ref={dropdownRef}>
        <div className='relative'>
          <Search className='absolute left-2 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none' />
          <Input
            ref={inputRef}
            placeholder={
              selectedClient ? selectedClient.name : 'Buscar por nombre o teléfono...'
            }
            value={searchQueryInput}
            onChange={handleSearchInputChange}
            onFocus={handleSearchInputFocus}
            className={`pl-8 ${!value && !searchQueryInput ? 'text-muted-foreground' : ''} ${selectedClient && !searchQueryInput ? 'font-medium' : ''}`}
          />
          {value && !searchQueryInput && selectedClient && (
            <div className='absolute right-2 top-1/2 -translate-y-1/2 bg-primary text-primary-foreground rounded-full p-0.5 flex items-center justify-center'>
              <Check className='h-3 w-3' />
            </div>
          )}
        </div>
        {isDropdownOpen && (
          <div
            className='absolute z-50 mt-1 w-full bg-popover rounded-md border border-border shadow-md max-h-60 overflow-y-auto' // Reduced max-h for better UX
          >
            {isLoadingClients ? (
              <div className='p-4 text-center text-muted-foreground'>
                Cargando clientes...
              </div>
            ) : filteredClients.length === 0 && debouncedSearchQuery ? (
              <div className='p-4 text-center text-muted-foreground'>
                No se encontraron clientes "{debouncedSearchQuery}"
              </div>
            ) : filteredClients.length === 0 && !debouncedSearchQuery ? (
              <div className='p-4 text-center text-muted-foreground'>
                No hay clientes para mostrar.
              </div>
            ) : (
              <div>
                {filteredClients.map((client) => (
                  <ClientListItem
                    key={client.id}
                    client={client}
                    onSelect={handleSelectClient}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <Button
        variant='outline'
        size='icon'
        onClick={() => {
          setIsCreatingNew(true)
          setIsDropdownOpen(false)
        }}
        disabled={createClientMutation.isPending}
        aria-label='Crear nuevo cliente'
      >
        <Plus className='h-4 w-4' />
      </Button>
    </div>
  )
}
