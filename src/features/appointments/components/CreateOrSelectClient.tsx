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
import { formatWhatsAppPhone } from '@/lib/utils.ts'
import { useDebounce } from '@/hooks/useDebounce.ts'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { type Client, PlatformName } from '@/features/clients/types'
import { useCreateClient } from '../hooks/useCreateClient'
import { useGetClients } from '../hooks/useGetClients'

interface CreateOrSelectClientProps {
  value: string // Selected client ID
  onChange: (value: string) => void
}

// Performance constants
const MAX_RESULTS = 50
const MIN_SEARCH_LENGTH = 2
const ITEM_HEIGHT = 64 // Height of each list item
const MAX_LIST_HEIGHT = 240 // Max height of dropdown

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
      (identity) => identity.platformName === PlatformName.WhatsappWeb
    )

    if (!whatsappIdentity) return null

    const phoneMatch = whatsappIdentity.platformId.match(
      /^(\d+)@s\.whatsapp\.net$/
    )
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
  const [newClientPhone, setNewClientPhone] = useState('')
  const [searchQueryInput, setSearchQueryInput] = useState('')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const { data: clients, isLoading: isLoadingClients } = useGetClients()
  const createClientMutation = useCreateClient()
  const debouncedSearchQuery = useDebounce(searchQueryInput, 200) // Faster debounce

  // Phone number formatting functions
  const formatPhoneNumber = useCallback((value: string): string => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '')

    // Limit to 10 digits
    const limitedDigits = digits.slice(0, 10)

    // Apply XXX-XXX-XXXX format
    if (limitedDigits.length >= 6) {
      return `${limitedDigits.slice(0, 3)}-${limitedDigits.slice(3, 6)}-${limitedDigits.slice(6)}`
    } else if (limitedDigits.length >= 3) {
      return `${limitedDigits.slice(0, 3)}-${limitedDigits.slice(3)}`
    }
    return limitedDigits
  }, [])

  const getCleanPhoneNumber = useCallback((formattedPhone: string): string => {
    return formattedPhone.replace(/\D/g, '')
  }, [])

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

  const filteredClients = useMemo(() => {
    if (!clients) return []

    // If no search query, don't show any results to avoid rendering 5000 items
    if (!debouncedSearchQuery) {
      return []
    }

    // Only start searching after minimum characters to improve performance
    if (debouncedSearchQuery.length < MIN_SEARCH_LENGTH) {
      return []
    }

    const searchValue = debouncedSearchQuery.toLowerCase()
    const results: Client[] = []

    // Use for loop for better performance than filter + early exit
    for (let i = 0; i < clients.length && results.length < MAX_RESULTS; i++) {
      const client = clients[i]

      if (client.id === value) continue // Don't show already selected client

      let isMatch = false

      // Search in name first (most common case)
      if (client.name.toLowerCase().includes(searchValue)) {
        isMatch = true
      } else if (
        client.platformIdentities &&
        client.platformIdentities.length > 0
      ) {
        // Only search in platform IDs if name doesn't match
        for (const identity of client.platformIdentities) {
          // Search in original platform ID
          if (identity.platformId.toLowerCase().includes(searchValue)) {
            isMatch = true
            break
          }

          // For WhatsApp Web, also search in formatted phone and raw digits
          if (identity.platformName === PlatformName.WhatsappWeb) {
            const rawDigits = extractPhoneDigits(identity.platformId)
            if (rawDigits.includes(searchValue)) {
              isMatch = true
              break
            }

            const formattedPhone = formatWhatsAppPhone(
              identity.platformId
            ).toLowerCase()
            if (formattedPhone.includes(searchValue)) {
              isMatch = true
              break
            }
          }
        }
      }

      if (isMatch) {
        results.push(client)
      }
    }

    return results
  }, [clients, debouncedSearchQuery, value, extractPhoneDigits])

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

    const cleanPhone = getCleanPhoneNumber(newClientPhone)
    if (cleanPhone && cleanPhone.length !== 10) {
      toast.error('El número de teléfono debe tener exactamente 10 dígitos')
      return
    }

    try {
      const result = await createClientMutation.mutateAsync({
        name: trimmedName,
        phoneNumber: cleanPhone || undefined,
      })
      if (result?.id) {
        onChange(result.id)
        const phoneMessage = cleanPhone
          ? ` con teléfono ${formatPhoneNumber(cleanPhone)}`
          : ''
        toast.success(`Cliente ${trimmedName}${phoneMessage} creado con éxito`)
        setNewClientName('')
        setNewClientPhone('')
        setIsCreatingNew(false)
        setSearchQueryInput('') // Clear search if any
      } else {
        toast.error('No se pudo obtener el ID del cliente creado.')
      }
    } catch (error) {
      toast.error('Error al crear el cliente')
      console.error('Error creating client:', error)
    }
  }, [
    newClientName,
    newClientPhone,
    getCleanPhoneNumber,
    formatPhoneNumber,
    createClientMutation,
    onChange,
  ])

  const handleSearchInputChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const query = e.target.value
      setSearchQueryInput(query)
      if (query.length >= MIN_SEARCH_LENGTH) {
        setIsDropdownOpen(true)
      } else {
        setIsDropdownOpen(false)
      }
    },
    []
  )

  const handleSearchInputFocus = useCallback(() => {
    if (searchQueryInput.length >= MIN_SEARCH_LENGTH) {
      setIsDropdownOpen(true)
    }
  }, [searchQueryInput.length])

  const handlePhoneInputChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const formatted = formatPhoneNumber(e.target.value)
      setNewClientPhone(formatted)
    },
    [formatPhoneNumber]
  )

  if (isCreatingNew) {
    return (
      <div className='flex flex-col gap-2'>
        <div className='flex gap-2 items-center'>
          <Input
            autoFocus
            value={newClientName}
            onChange={(e) => setNewClientName(e.target.value)}
            placeholder='Nombre del cliente *'
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
            onClick={() => {
              setIsCreatingNew(false)
              setNewClientName('')
              setNewClientPhone('')
            }}
            disabled={createClientMutation.isPending}
            aria-label='Cancelar creación de cliente'
          >
            <X className='h-4 w-4' />
          </Button>
        </div>
        <Input
          value={newClientPhone}
          onChange={handlePhoneInputChange}
          placeholder='Teléfono (opcional) - XXX-XXX-XXXX'
          className='w-full'
          maxLength={12} // XXX-XXX-XXXX format
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
              selectedClient
                ? selectedClient.name
                : `Buscar por nombre o teléfono (mín. ${MIN_SEARCH_LENGTH} caracteres)...`
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
            className='absolute z-50 mt-1 w-full bg-popover rounded-md border border-border shadow-md'
            style={{ maxHeight: MAX_LIST_HEIGHT + 32 }} // Extra space for padding
          >
            {isLoadingClients ? (
              <div className='p-4 text-center text-muted-foreground'>
                Cargando clientes...
              </div>
            ) : debouncedSearchQuery.length < MIN_SEARCH_LENGTH ? (
              <div className='p-4 text-center text-muted-foreground'>
                Escribe al menos {MIN_SEARCH_LENGTH} caracteres para buscar
              </div>
            ) : filteredClients.length === 0 ? (
              <div className='p-4 text-center text-muted-foreground'>
                No se encontraron clientes "{debouncedSearchQuery}"
              </div>
            ) : (
              <div className='max-h-60 overflow-y-auto'>
                {filteredClients.length >= MAX_RESULTS && (
                  <div className='p-2 text-xs text-muted-foreground bg-popover border-b sticky top-0 z-10 shadow-sm'>
                    Mostrando primeros {MAX_RESULTS} resultados. Refina tu
                    búsqueda para mejores resultados.
                  </div>
                )}
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
