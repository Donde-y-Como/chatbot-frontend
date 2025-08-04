import React, {
  ChangeEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import {
  IconBrandFacebook,
  IconBrandInstagram,
  IconBrandWhatsapp,
} from '@tabler/icons-react'
import { Check, Search, Users } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from '@/hooks/use-toast'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { WhatsAppBusinessIcon } from '@/components/ui/whatsAppBusinessIcon.tsx'
import { useGetClients } from '../clients/hooks/useGetClients'
import { useUpdateClientPlatformIdentities } from '../clients/hooks/useUpdateClientPlatformIdentities'
import { appointmentService } from '../appointments/appointmentService'
import { Client, PlatformIdentity, PlatformName } from './ChatTypes'

interface ConnectClientProps {
  value?: string
  onChange?: (client: Client) => void
  excludePlatform?: PlatformName
  isDialog?: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
  currentClientData?: {
    id?: string
    name?: string
    platformName?: string
    platformId?: string
    platformIdentities?: PlatformIdentity[]
  }
  conversationId?: string | null
  onConnectionSuccess?: (linkedClient: Client) => void
  onConnectionError?: (error: Error) => void
  onEmitSocketEvent?: (event: string, data: any) => void
}

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

interface ClientListItemProps {
  client: Client
  onSelect: (client: Client) => void
}

const ClientListItem = React.memo(function ClientListItem({
  client,
  onSelect,
}: ClientListItemProps) {
  const handleSelect = useCallback(() => {
    onSelect(client)
  }, [client, onSelect])

  return (
    <div
      className='group flex items-center gap-3 p-4 hover:bg-accent cursor-pointer rounded-lg transition-all duration-200 border border-transparent hover:border-border'
      onClick={handleSelect}
    >
      <div className='relative'>
        <Avatar className='h-10 w-10 border-2 border-primary/10'>
          <AvatarImage
            src={client.photo}
            alt={client.name}
            className='object-cover'
          />
          <AvatarFallback className='font-semibold'>
            {client.name.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        {client.platformIdentities.length > 0 && (
          <div className='absolute -bottom-1 -right-1 h-4 w-4 bg-primary rounded-full border-2 border-background'></div>
        )}
      </div>

      <div className='flex-1 min-w-0 space-y-1'>
        <div className='flex items-center justify-between'>
          <h4 className='font-semibold text-foreground truncate text-sm'>
            {client.name}
          </h4>
          {client.platformIdentities.length > 0 && (
            <Badge variant='secondary' className='text-xs'>
              {client.platformIdentities.length}
            </Badge>
          )}
        </div>

        {client.email && (
          <p className='text-xs text-muted-foreground truncate'>
            {client.email}
          </p>
        )}

        {client.platformIdentities.length > 0 && (
          <div className='flex gap-1 mt-2'>
            {client.platformIdentities.slice(0, 3).map((platform, index) => (
              <Badge
                key={index}
                variant='outline'
                className='text-xs capitalize'
              >
                {platform.platformName}
              </Badge>
            ))}
            {client.platformIdentities.length > 3 && (
              <span className='text-xs text-muted-foreground font-medium self-center'>
                +{client.platformIdentities.length - 3}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  )
})

export function ConnectClient({
  value,
  onChange,
  excludePlatform,
  isDialog = false,
  open = false,
  onOpenChange,
  currentClientData,
  conversationId,
  onConnectionSuccess,
  onConnectionError,
  onEmitSocketEvent,
}: ConnectClientProps) {
  const [searchQueryInput, setSearchQueryInput] = useState('')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [selectedClientForConnection, setSelectedClientForConnection] =
    useState<Client | null>(null)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)

  const dropdownRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const { data: clients, isLoading: isLoadingClients } = useGetClients()
  const updateClientPlatformIdentities = useUpdateClientPlatformIdentities()
  const debouncedSearchQuery = useDebounce(searchQueryInput, 300)

  const selectedClient = useMemo(() => {
    return clients?.find((client) => client.id === value)
  }, [clients, value])

  const filteredClients = useMemo(() => {
    if (!clients) return []

    let platformFilteredClients = clients

    // First filter by excludePlatform if provided
    if (excludePlatform) {
      platformFilteredClients = clients.filter((client) => {
        return !client.platformIdentities.some(
          (identity) => identity.platformName === excludePlatform
        )
      })
    }

    // Advanced filter: exclude clients that have ANY of the same platforms as current client
    if (
      currentClientData &&
      currentClientData.platformIdentities &&
      currentClientData.platformIdentities.length > 0
    ) {
      platformFilteredClients = platformFilteredClients.filter((client) => {
        // Check if this client has any platform that the current client already has
        const hasAnySharedPlatform = currentClientData.platformIdentities?.some(
          (currentIdentity) =>
            client.platformIdentities.some(
              (clientIdentity) =>
                clientIdentity.platformName === currentIdentity.platformName
            )
        )
        // Only include clients that DON'T have any shared platforms
        return !hasAnySharedPlatform
      })
    }

    if (!debouncedSearchQuery) {
      return platformFilteredClients.filter((client) => client.id !== value)
    }

    return platformFilteredClients.filter(
      (client) =>
        (client.name
          .toLowerCase()
          .includes(debouncedSearchQuery.toLowerCase()) ||
          (client.email &&
            client.email
              .toLowerCase()
              .includes(debouncedSearchQuery.toLowerCase())) ||
          client.platformIdentities.some((platform) =>
            platform.profileName
              .toLowerCase()
              .includes(debouncedSearchQuery.toLowerCase())
          )) &&
        client.id !== value
    )
  }, [clients, debouncedSearchQuery, value, excludePlatform, currentClientData])

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
    if (!isDialog) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
  }, [handleClickOutside, isDialog])

  const handleSelectClient = useCallback(
    (client: Client) => {
      if (isDialog) {
        setSelectedClientForConnection(client)
      } else {
        onChange?.(client)
        setSearchQueryInput('')
        setIsDropdownOpen(false)
      }
    },
    [isDialog, onChange]
  )

  const handleSearchInputChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const query = e.target.value
      setSearchQueryInput(query)
      if (query.length > 0 && !isDialog) {
        setIsDropdownOpen(true)
      } else if (!isDialog) {
        setIsDropdownOpen(false)
      }
    },
    [isDialog]
  )

  const handleSearchInputFocus = useCallback(() => {
    if (
      (filteredClients.length > 0 || searchQueryInput.length > 0) &&
      !isDialog
    ) {
      setIsDropdownOpen(true)
    }
  }, [filteredClients.length, searchQueryInput.length, isDialog])

  const handleConnectionButtonClick = useCallback(() => {
    setShowConfirmDialog(true)
  }, [])

  const handleConfirmConnection = useCallback(async () => {
    setShowConfirmDialog(false)
    if (!selectedClientForConnection || !currentClientData) {
      toast({
        title: 'Error de validación',
        description:
          'No se ha seleccionado un cliente o faltan datos de la conversación.',
        variant: 'destructive',
      })
      return
    }

    if (
      !currentClientData.platformIdentities ||
      currentClientData.platformIdentities.length === 0
    ) {
      toast({
        title: 'Sin identidades de plataforma',
        description:
          'La conversación actual no tiene identidades de plataforma para vincular.',
        variant: 'destructive',
      })
      return
    }

    try {
      if (!currentClientData.id) {
        toast({
          title: 'Error de validación',
          description: 'No se pudo identificar el cliente actual.',
          variant: 'destructive',
        })
        return
      }

      await updateClientPlatformIdentities.mutateAsync({
        clientId: currentClientData.id,
        newPlatformIdentities: [],
        optimistic: true,
        replace: true,
      })
      const result = await updateClientPlatformIdentities.mutateAsync({
        clientId: selectedClientForConnection.id,
        newPlatformIdentities: currentClientData.platformIdentities,
        optimistic: true,
      })

      if (!result.hasChanges) {
        toast({
          title: 'Sin cambios necesarios',
          description: `${selectedClientForConnection.name} ya tiene todas las identidades de plataforma de esta conversación.`,
          variant: 'default',
        })

        onOpenChange?.(false)
        setSelectedClientForConnection(null)
        setSearchQueryInput('')
        return
      }

      const addedCount = result.addedIdentities.length
      const platformNames = result.addedIdentities
        .map((identity) => {
          return (
            identity.platformName.charAt(0).toUpperCase() +
            identity.platformName.slice(1)
          )
        })
        .join(', ')

      // Actualizar citas del cliente anterior al nuevo cliente
      try {
        await appointmentService.updateAppointmentsClientId(
          currentClientData.id,
          selectedClientForConnection.id
        )
      } catch (appointmentError) {
        console.warn('Error updating appointments:', appointmentError)
        // No mostramos error al usuario ya que la transferencia principal fue exitosa
      }

      toast({
        title: '\u00a1Cliente vinculado exitosamente!',
        description: `Se ${addedCount === 1 ? 'transfirió' : 'transfirieron'} ${addedCount} ${addedCount === 1 ? 'identidad' : 'identidades'} de plataforma (${platformNames}) de ${currentClientData.name} a ${selectedClientForConnection.name}. Las citas también fueron transferidas.`,
        variant: 'default',
      })

      if (onEmitSocketEvent && conversationId) {
        onEmitSocketEvent('linkClientToConversation', {
          conversationId,
          newClientId: selectedClientForConnection.id,
          addedPlatformIdentities: result.addedIdentities,
          timestamp: new Date().toISOString(),
        })
      }

      onConnectionSuccess?.(result.updatedClient)

      onOpenChange?.(false)
      setSelectedClientForConnection(null)
      setSearchQueryInput('')
    } catch (error) {
      console.error('Error linking client:', error)

      let errorTitle = 'Error al vincular cliente'
      let errorDescription =
        'No se pudo vincular la conversación al cliente seleccionado.'

      if (error instanceof Error) {
        if (error.message.includes('no encontrado')) {
          errorTitle = 'Cliente no encontrado'
          errorDescription =
            'El cliente seleccionado ya no existe o no está disponible.'
        } else if (error.message.includes('identidades de plataforma')) {
          errorTitle = 'Error de identidades de plataforma'
          errorDescription = error.message
        } else {
          errorDescription = `Error: ${error.message}`
        }
      }

      toast({
        title: errorTitle,
        description: errorDescription,
        variant: 'destructive',
      })

      const enhancedError =
        error instanceof Error
          ? error
          : new Error('Error desconocido al vincular cliente')

      onConnectionError?.(enhancedError)
    }
  }, [
    selectedClientForConnection,
    currentClientData,
    updateClientPlatformIdentities,
    onEmitSocketEvent,
    conversationId,
    onConnectionSuccess,
    onConnectionError,
    onOpenChange,
  ])

  const handleCancelConnection = useCallback(() => {
    onOpenChange?.(false)
    setSelectedClientForConnection(null)
    setSearchQueryInput('')
  }, [onOpenChange])

  const handleCancelConfirmDialog = useCallback(() => {
    setShowConfirmDialog(false)
  }, [])

  useEffect(() => {
    if (!open) {
      setSelectedClientForConnection(null)
      setSearchQueryInput('')
    }
  }, [open])

  const SearchInput = (
    <div className='relative flex-1' ref={dropdownRef}>
      <div className='relative'>
        <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
          <Search className='h-4 w-4 text-muted-foreground' />
        </div>
        <Input
          ref={inputRef}
          placeholder={
            selectedClient ? selectedClient.name : 'Buscar cliente...'
          }
          value={searchQueryInput}
          onChange={handleSearchInputChange}
          onFocus={handleSearchInputFocus}
          className={`pl-10 pr-10 ${!value && !searchQueryInput ? 'text-muted-foreground' : ''} ${selectedClient && !searchQueryInput ? 'font-semibold' : ''}`}
        />
        <div className='absolute inset-y-0 right-0 pr-3 flex items-center'>
          {value && !searchQueryInput && selectedClient ? (
            <div className='bg-primary/10 text-primary rounded-full p-1 flex items-center justify-center'>
              <Check className='h-3 w-3' />
            </div>
          ) : (
            <Users className='h-4 w-4 text-muted-foreground' />
          )}
        </div>
      </div>
      {isDropdownOpen && !isDialog && (
        <div className='absolute z-50 mt-2 w-full bg-popover rounded-lg border shadow-lg max-h-80 overflow-hidden animate-in slide-in-from-top-2 duration-200'>
          {isLoadingClients ? (
            <div className='flex flex-col items-center justify-center py-8 space-y-3'>
              <div className='relative'>
                <div className='animate-spin rounded-full h-6 w-6 border-2 border-muted'></div>
                <div className='animate-spin rounded-full h-6 w-6 border-t-2 border-primary absolute top-0 left-0'></div>
              </div>
              <p className='text-sm text-muted-foreground font-medium'>
                Cargando clientes...
              </p>
            </div>
          ) : filteredClients.length === 0 && debouncedSearchQuery ? (
            <div className='flex flex-col items-center justify-center py-8 space-y-3'>
              <div className='h-10 w-10 bg-muted rounded-full flex items-center justify-center'>
                <Search className='h-4 w-4 text-muted-foreground' />
              </div>
              <p className='text-sm text-muted-foreground font-medium'>
                No se encontraron clientes
              </p>
              <p className='text-xs text-muted-foreground'>
                Intenta con "{debouncedSearchQuery}"
              </p>
            </div>
          ) : filteredClients.length === 0 && !debouncedSearchQuery ? (
            <div className='flex flex-col items-center justify-center py-8 space-y-3'>
              <div className='h-10 w-10 bg-muted rounded-full flex items-center justify-center'>
                <Users className='h-4 w-4 text-muted-foreground' />
              </div>
              <p className='text-sm text-muted-foreground font-medium'>
                No hay clientes disponibles
              </p>
              <p className='text-xs text-muted-foreground text-center'>
                {currentClientData
                  ? 'No hay clientes con plataformas diferentes'
                  : 'Crea un cliente primero'}
              </p>
            </div>
          ) : (
            <div className='max-h-80 overflow-y-auto'>
              <div className='p-2 space-y-1'>
                {filteredClients.map((client) => (
                  <ClientListItem
                    key={client.id}
                    client={client}
                    onSelect={handleSelectClient}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )

  if (!isDialog) {
    return SearchInput
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-2xl max-h-[90vh] overflow-hidden flex flex-col'>
        <DialogHeader>
          <DialogTitle className='text-xl font-bold'>
            Vincular Cliente
          </DialogTitle>
          <DialogDescription>
            Selecciona un cliente para vincular con esta conversación. Las
            identidades de plataforma se transferirán automáticamente.
          </DialogDescription>
        </DialogHeader>

        <div className='flex-1 flex flex-col space-y-4 min-h-0'>
          <div className='relative'>
            <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
              <Search className='h-4 w-4 text-muted-foreground' />
            </div>
            <Input
              placeholder='Buscar por nombre, email o plataforma...'
              value={searchQueryInput}
              onChange={handleSearchInputChange}
              className='pl-10 pr-4'
            />
            {searchQueryInput && (
              <div className='absolute inset-y-0 right-0 pr-3 flex items-center'>
                <button
                  onClick={() => setSearchQueryInput('')}
                  className='h-4 w-4 text-muted-foreground hover:text-foreground transition-colors'
                >
                  ×
                </button>
              </div>
            )}
          </div>

          <div className='flex-1 min-h-0 border rounded-lg overflow-hidden'>
            {isLoadingClients ? (
              <div className='flex flex-col items-center justify-center h-40 space-y-3'>
                <div className='relative'>
                  <div className='animate-spin rounded-full h-8 w-8 border-2 border-muted'></div>
                  <div className='animate-spin rounded-full h-8 w-8 border-t-2 border-primary absolute top-0 left-0'></div>
                </div>
                <p className='text-sm text-muted-foreground font-medium'>
                  Cargando clientes...
                </p>
              </div>
            ) : filteredClients.length === 0 && debouncedSearchQuery ? (
              <div className='flex flex-col items-center justify-center h-40 space-y-3'>
                <div className='h-12 w-12 bg-muted rounded-full flex items-center justify-center'>
                  <Search className='h-5 w-5 text-muted-foreground' />
                </div>
                <p className='text-sm text-muted-foreground font-medium'>
                  No se encontraron clientes
                </p>
                <p className='text-xs text-muted-foreground'>
                  Intenta con otro término de búsqueda
                </p>
              </div>
            ) : filteredClients.length === 0 && !debouncedSearchQuery ? (
              <div className='flex flex-col items-center justify-center h-40 space-y-3'>
                <div className='h-12 w-12 bg-muted rounded-full flex items-center justify-center'>
                  <Users className='h-5 w-5 text-muted-foreground' />
                </div>
                <p className='text-sm text-muted-foreground font-medium'>
                  No hay clientes disponibles
                </p>
                <p className='text-xs text-muted-foreground text-center max-w-64'>
                  {currentClientData
                    ? 'No hay clientes con plataformas complementarias disponibles'
                    : 'Crea un cliente primero'}
                </p>
              </div>
            ) : (
              <div className='max-h-80 overflow-y-auto'>
                <div className='p-2 space-y-1'>
                  {filteredClients.map((client) => (
                    <div
                      key={client.id}
                      className={`group relative flex items-center gap-3 p-3 cursor-pointer transition-all duration-200 rounded-lg border-2 ${
                        selectedClientForConnection?.id === client.id
                          ? 'bg-accent border-primary'
                          : 'hover:bg-accent border-transparent'
                      }`}
                      onClick={() => handleSelectClient(client)}
                    >
                      <div className='relative'>
                        <Avatar className='h-9 w-9 border-2 border-primary/10'>
                          <AvatarImage
                            src={client.photo}
                            alt={client.name}
                            className='object-cover'
                          />
                          <AvatarFallback className='font-semibold text-sm'>
                            {client.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        {selectedClientForConnection?.id === client.id && (
                          <div className='absolute -top-1 -right-1 h-4 w-4 bg-primary rounded-full flex items-center justify-center'>
                            <Check className='h-2.5 w-2.5 text-primary-foreground' />
                          </div>
                        )}
                      </div>

                      <div className='flex-1 min-w-0 space-y-1'>
                        <div className='flex items-center justify-between'>
                          <h4 className='font-semibold truncate text-sm text-foreground'>
                            {client.name}
                          </h4>
                          {client.platformIdentities.length > 0 && (
                            <Badge variant='secondary' className='text-xs'>
                              {client.platformIdentities.length}
                            </Badge>
                          )}
                        </div>

                        {client.email && (
                          <p className='text-xs text-muted-foreground truncate'>
                            {client.email}
                          </p>
                        )}

                        {client.platformIdentities.length > 0 && (
                          <div className='flex gap-1 mt-1'>
                            {client.platformIdentities
                              .slice(0, 2)
                              .map((platform, index) => (
                                <Badge
                                  key={index}
                                  variant='outline'
                                  className='text-xs capitalize'
                                >
                                  {platform.platformName}
                                </Badge>
                              ))}
                            {client.platformIdentities.length > 2 && (
                              <span className='text-xs text-muted-foreground self-center font-medium'>
                                +{client.platformIdentities.length - 2}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {currentClientData && (
          <div className='space-y-4'>
            <Separator />
            <Card>
              <CardContent className='p-4'>
                <div className='flex items-start gap-3'>
                  <div className='h-10 w-10 bg-muted rounded-lg flex items-center justify-center flex-shrink-0'>
                    <Users className='h-5 w-5 text-muted-foreground' />
                  </div>
                  <div className='flex-1 space-y-3'>
                    <h4 className='text-sm font-semibold'>
                      Conversación actual
                    </h4>
                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm'>
                      <div className='space-y-1'>
                        <p className='text-muted-foreground'>
                          Cliente:{' '}
                          <span className='text-foreground font-medium'>
                            {currentClientData.name}
                          </span>
                        </p>
                        <p className='text-muted-foreground'>
                          Plataforma:{' '}
                          <span className='text-foreground font-medium capitalize'>
                            {currentClientData.platformName}
                          </span>
                        </p>
                      </div>
                      <div className='space-y-1'>
                        <div className='text-muted-foreground'>
                          <p className='text-xs mb-1'>Plataformas:</p>
                          <div className='flex flex-wrap gap-1'>
                            {currentClientData.platformIdentities?.map(
                              (identity, index) => {
                                const PlatformIcon =
                                  {
                                    [PlatformName.Whatsapp]: IconBrandWhatsapp,
                                    [PlatformName.WhatsappWeb]:
                                      WhatsAppBusinessIcon,
                                    [PlatformName.Facebook]: IconBrandFacebook,
                                    [PlatformName.Instagram]:
                                      IconBrandInstagram,
                                  }[identity.platformName] || null

                                return (
                                  <div
                                    key={index}
                                    className='flex items-center gap-1 border-2 px-2 py-1 rounded-md'
                                  >
                                    {PlatformIcon && (
                                      <PlatformIcon
                                        className={cn(
                                          'w-4 h-4',
                                          (identity.platformName ===
                                            PlatformName.Whatsapp ||
                                            identity.platformName ===
                                              PlatformName.WhatsappWeb) &&
                                            'text-green-600',
                                          identity.platformName ===
                                            PlatformName.Facebook &&
                                            'text-blue-600',
                                          identity.platformName ===
                                            PlatformName.Instagram &&
                                            'text-pink-600'
                                        )}
                                      />
                                    )}
                                    <span className='text-xs font-medium'>
                                      {getPlatformDisplayName(
                                        identity.platformName
                                      )}
                                    </span>
                                  </div>
                                )
                              }
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {selectedClientForConnection && (
              <Card className='animate-in slide-in-from-top-2 duration-300'>
                <CardContent className='p-4'>
                  <div className='flex items-start gap-3'>
                    <div className='h-10 w-10 bg-muted rounded-lg flex items-center justify-center flex-shrink-0'>
                      <Users className='h-5 w-5 text-muted-foreground' />
                    </div>
                    <div className='flex-1 space-y-3'>
                      <h4 className='text-sm font-semibold'>
                        Vista previa de transferencia
                      </h4>

                      <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                        <div className='space-y-2'>
                          <p className='text-muted-foreground font-medium text-sm'>
                            Cliente destino:
                          </p>
                          <div className='flex items-center gap-2'>
                            <Avatar className='h-6 w-6 border-2 border-primary/10'>
                              <AvatarImage
                                src={selectedClientForConnection.photo}
                              />
                              <AvatarFallback className='text-xs font-semibold'>
                                {selectedClientForConnection.name
                                  .charAt(0)
                                  .toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <span className='text-foreground font-semibold text-sm'>
                              {selectedClientForConnection.name}
                            </span>
                          </div>
                        </div>

                        <div className='space-y-2'>
                          <p className='text-muted-foreground font-medium text-sm'>
                            Identidades actuales:
                          </p>
                          <Badge variant='secondary' className='text-xs'>
                            {
                              selectedClientForConnection.platformIdentities
                                .length
                            }
                          </Badge>
                        </div>
                      </div>

                      <div className='space-y-2'>
                        <p className='text-muted-foreground font-medium text-sm'>
                          Identidades a transferir:
                        </p>
                        <div className='space-y-1.5'>
                          {currentClientData.platformIdentities?.map(
                            (identity, index) => {
                              const alreadyExists =
                                selectedClientForConnection.platformIdentities.some(
                                  (existing) =>
                                    existing.platformId ===
                                      identity.platformId &&
                                    existing.platformName ===
                                      identity.platformName
                                )
                              return (
                                <div
                                  key={index}
                                  className={`flex items-center gap-2 text-xs p-2 rounded-lg border transition-all duration-200 ${
                                    alreadyExists
                                      ? 'bg-muted border-border'
                                      : 'bg-background border-border'
                                  }`}
                                >
                                  <div
                                    className={`w-2 h-2 rounded-full ${
                                      alreadyExists
                                        ? 'bg-muted-foreground'
                                        : 'bg-primary'
                                    }`}
                                  ></div>
                                  <span
                                    className={`font-medium capitalize ${
                                      alreadyExists
                                        ? 'text-muted-foreground line-through'
                                        : 'text-foreground'
                                    }`}
                                  >
                                    {identity.platformName}
                                  </span>
                                  <span
                                    className={`font-mono text-xs ${
                                      alreadyExists
                                        ? 'text-muted-foreground'
                                        : 'text-muted-foreground'
                                    }`}
                                  >
                                    {identity.platformId}
                                  </span>
                                  {alreadyExists && (
                                    <Badge
                                      variant='secondary'
                                      className='text-xs'
                                    >
                                      Ya existe
                                    </Badge>
                                  )}
                                </div>
                              )
                            }
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        <DialogFooter className='flex flex-col sm:flex-row gap-3'>
          <Button
            variant='outline'
            onClick={handleCancelConnection}
            className='order-2 sm:order-1'
          >
            Cancelar
          </Button>
          <Button
            onClick={handleConnectionButtonClick}
            disabled={
              !selectedClientForConnection ||
              updateClientPlatformIdentities.isPending
            }
            className='order-1 sm:order-2'
          >
            {updateClientPlatformIdentities.isPending ? (
              <div className='flex items-center gap-2'>
                <div className='relative'>
                  <div className='animate-spin rounded-full h-4 w-4 border-2 border-white/30'></div>
                  <div className='animate-spin rounded-full h-4 w-4 border-t-2 border-white absolute top-0 left-0'></div>
                </div>
                <span>Vinculando...</span>
              </div>
            ) : !selectedClientForConnection ? (
              'Seleccionar Cliente'
            ) : !currentClientData ? (
              'Faltan datos'
            ) : (
              (() => {
                const newIdentitiesCount =
                  currentClientData.platformIdentities?.filter(
                    (identity) =>
                      !selectedClientForConnection.platformIdentities.some(
                        (existing) =>
                          existing.platformId === identity.platformId &&
                          existing.platformName === identity.platformName
                      )
                  ).length || 0

                if (newIdentitiesCount === 0) {
                  return `${selectedClientForConnection.name} ya está actualizado`
                }

                return `Vincular ${newIdentitiesCount} ${newIdentitiesCount === 1 ? 'identidad' : 'identidades'}`
              })()
            )}
          </Button>
        </DialogFooter>
      </DialogContent>

      {/* Confirmation Alert Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Confirmar vinculación?</AlertDialogTitle>
            <AlertDialogDescription>
              {selectedClientForConnection && currentClientData && (
                <div className='space-y-4'>
                  <p>
                    Estás a punto de vincular la conversación actual con el cliente{' '}
                    <strong>{selectedClientForConnection.name}</strong>.
                  </p>
                  
                  <div className='space-y-3'>
                    <div>
                      <h4 className='font-semibold text-sm mb-2'>Lo que va a suceder:</h4>
                      <ul className='text-sm space-y-1 list-disc list-inside ml-2'>
                        <li>
                          Las identidades de plataforma de <strong>{currentClientData.name}</strong> se transferirán a <strong>{selectedClientForConnection.name}</strong>
                        </li>
                        <li>
                          <strong>{currentClientData.name}</strong> perderá sus identidades de plataforma actuales
                        </li>
                        <li>
                          Esta conversación quedará vinculada a <strong>{selectedClientForConnection.name}</strong>
                        </li>
                        <li>
                          <strong>{selectedClientForConnection.name}</strong> tendrá acceso a todas las plataformas combinadas
                        </li>
                      </ul>
                    </div>

                    {currentClientData.platformIdentities && (
                      <div>
                        <h4 className='font-semibold text-sm mb-2'>Identidades que se transferirán:</h4>
                        <div className='flex flex-wrap gap-1'>
                          {currentClientData.platformIdentities.map((identity, index) => {
                            const alreadyExists = selectedClientForConnection.platformIdentities.some(
                              (existing) =>
                                existing.platformId === identity.platformId &&
                                existing.platformName === identity.platformName
                            )
                            return (
                              <Badge
                                key={index}
                                variant={alreadyExists ? 'secondary' : 'default'}
                                className='text-xs'
                              >
                                {getPlatformDisplayName(identity.platformName)}
                                {alreadyExists && ' (ya existe)'}
                              </Badge>
                            )
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  <p className='text-xs text-muted-foreground font-medium'>
                    ⚠️ Esta acción no se puede deshacer
                  </p>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelConfirmDialog}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmConnection}>
              Sí, vincular cliente
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  )
}
