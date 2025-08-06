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
import { PlatformName } from '@/features/chats/ChatTypes'
import { type Client } from '@/features/clients/types'
import { useCreateClient } from '../hooks/useCreateClient'
import { useGetClients } from '../hooks/useGetClients'
import { useInfiniteClientSearch } from '../hooks/useInfiniteClientSearch'
import { useIntersectionObserver } from '../hooks/useIntersectionObserver'

interface CreateOrSelectClientProps {
  value: string // Selected client ID
  onChange: (value: string) => void
}

// Performance constants
const MAX_RESULTS = 50
const DEFAULT_RESULTS = 20 // Show 20 clients by default
const PAGE_SIZE = 15 // Load 15 more clients at a time
const MIN_SEARCH_LENGTH = 1 // Allow search with 1 character
const ITEM_HEIGHT = 64 // Height of each list item
const MAX_LIST_HEIGHT = 240 // Reduced height for better UX

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
      className='flex items-center gap-3 p-3 hover:bg-accent cursor-pointer transition-colors duration-150 border-b border-border/30 last:border-b-0'
      onClick={handleSelect}
    >
      <Avatar className='h-10 w-10 ring-2 ring-transparent hover:ring-primary/20 transition-all'>
        <AvatarImage
          src={client.photo}
          alt={client.name}
          className='object-cover'
        />
        <AvatarFallback className='bg-gradient-to-br from-primary/10 to-primary/20 text-primary font-semibold'>
          {client.name.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className='flex flex-col min-w-0 flex-1'>
        <span className='font-medium text-sm truncate text-foreground'>{client.name}</span>
        {phoneNumber && (
          <span className='text-xs text-muted-foreground flex items-center gap-1'>
            <span className='inline-block w-1 h-1 bg-muted-foreground rounded-full'></span>
            {phoneNumber}
          </span>
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
  
  const {
    clients: infiniteClients,
    loadMore,
    isLoadingMore,
    hasMore,
    totalCount,
    isDefaultList
  } = useInfiniteClientSearch({
    clients,
    searchQuery: debouncedSearchQuery,
    selectedClientId: value,
    defaultResults: DEFAULT_RESULTS,
    maxResults: MAX_RESULTS,
    pageSize: PAGE_SIZE
  })
  
  const { targetRef } = useIntersectionObserver({
    onIntersect: loadMore,
    enabled: hasMore && !isLoadingMore && !isLoadingClients
  })

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


  // Use infinite scroll clients
  const filteredClients = infiniteClients

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
      // Only open dropdown when user starts typing
      if (query.trim()) {
        setIsDropdownOpen(true)
      } else {
        setIsDropdownOpen(false)
      }
    },
    []
  )

  const handleSearchInputFocus = useCallback(() => {
    // Show dropdown when clicking/focusing the input
    setIsDropdownOpen(true)
  }, [])

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
                : 'Buscar cliente por nombre o teléfono...'
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
            className='absolute z-50 mt-1 w-full bg-popover rounded-md border border-border shadow-lg'
            style={{ maxHeight: MAX_LIST_HEIGHT + 40 }} // Extra space for header and footer
          >
            {isLoadingClients ? (
              <div className='p-6 text-center'>
                <div className='flex flex-col items-center gap-2'>
                  <div className='animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full'></div>
                  <span className='text-sm text-muted-foreground'>Cargando clientes...</span>
                </div>
              </div>
            ) : filteredClients.length === 0 ? (
              <div className='p-6 text-center'>
                <div className='flex flex-col items-center gap-2'>
                  <Search className='h-8 w-8 text-muted-foreground/50' />
                  <div className='text-sm text-muted-foreground'>
                    {debouncedSearchQuery 
                      ? `No se encontraron clientes con "${debouncedSearchQuery}"` 
                      : 'No hay clientes disponibles'
                    }
                  </div>
                  {debouncedSearchQuery && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => {
                        setIsCreatingNew(true)
                        setNewClientName(debouncedSearchQuery)
                        setIsDropdownOpen(false)
                      }}
                      className='mt-2'
                    >
                      <Plus className='h-4 w-4 mr-1' />
                      Crear "{debouncedSearchQuery}"
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <div className='max-h-60 overflow-y-auto' style={{ maxHeight: MAX_LIST_HEIGHT }}>
                {/* Header with count and context - improved styling */}
                <div className='p-3 bg-background border-b sticky top-0 z-20 shadow-sm backdrop-blur-sm'>
                  <div className='flex items-center justify-between text-xs'>
                    <span className='font-medium text-foreground'>
                      {isDefaultList 
                        ? `${filteredClients.length} de ${totalCount} clientes recientes`
                        : `${filteredClients.length} resultados para "${debouncedSearchQuery}"`
                      }
                    </span>
                    {hasMore && (
                      <span className='text-primary font-medium'>
                        {isDefaultList ? 'Scroll para más' : 'Más resultados'}
                      </span>
                    )}
                  </div>
                </div>
                
                {/* Client list with infinite scroll */}
                <div>
                  {filteredClients.map((client) => (
                    <ClientListItem
                      key={client.id}
                      client={client}
                      onSelect={handleSelectClient}
                    />
                  ))}
                  
                  {/* Infinite scroll trigger */}
                  {hasMore && (
                    <div
                      ref={targetRef}
                      className='p-4 text-center border-t bg-muted/20'
                    >
                      {isLoadingMore ? (
                        <div className='flex items-center justify-center gap-2'>
                          <div className='animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full'></div>
                          <span className='text-sm text-muted-foreground'>Cargando más...</span>
                        </div>
                      ) : (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={loadMore}
                          disabled={isLoadingMore}
                          className='text-sm'
                        >
                          Cargar más
                        </Button>
                      )}
                    </div>
                  )}
                  
                  {/* End of results indicator */}
                  {!hasMore && filteredClients.length > DEFAULT_RESULTS && (
                    <div className='p-3 text-center border-t bg-muted/20'>
                      <span className='text-xs text-muted-foreground'>
                        {isDefaultList ? 'Todos los clientes mostrados' : 'Fin de resultados'}
                      </span>
                    </div>
                  )}
                </div>
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
