import React, {
  ChangeEvent,
  KeyboardEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { Phone, Search, X } from 'lucide-react'
import { useDebounce } from '@/hooks/useDebounce'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PlatformName } from '@/features/chats/ChatTypes'
import { useGetClients } from '@/features/appointments/hooks/useGetClients'
import { useInfiniteClientSearch } from '@/features/appointments/hooks/useInfiniteClientSearch'
import { useIntersectionObserver } from '@/features/appointments/hooks/useIntersectionObserver'
import type { Client } from '@/features/clients/types'

const DEFAULT_RESULTS = 15
const MAX_RESULTS = 50
const PAGE_SIZE = 15

interface PhoneNumberSelectorProps {
  value: string[]
  onChange: (phones: string[]) => void
}

function extractWhatsAppWebPhone(client: Client): string | null {
  const identity = client.platformIdentities?.find(
    (i) => i.platformName === PlatformName.WhatsappWeb
  )
  if (!identity) return null
  const match = identity.platformId.match(/^(\d+)@s\.whatsapp\.net$/)
  return match ? match[1] : null
}

function formatDisplayPhone(phone: string): string {
  if (phone.startsWith('521') && phone.length === 13) {
    const local = phone.slice(3)
    return `+52 1 ${local.slice(0, 3)}-${local.slice(3, 6)}-${local.slice(6)}`
  }
  return phone
}

const ClientRow = React.memo(function ClientRow({
  client,
  phone,
  onSelect,
}: {
  client: Client
  phone: string
  onSelect: () => void
}) {
  return (
    <div
      className='flex items-center gap-3 p-3 hover:bg-accent cursor-pointer transition-colors border-b border-border/30 last:border-b-0'
      onMouseDown={(e) => e.preventDefault()}
      onClick={onSelect}
    >
      <Avatar className='h-8 w-8 shrink-0'>
        <AvatarImage src={client.photo} alt={client.name} className='object-cover' />
        <AvatarFallback className='bg-primary/10 text-primary font-semibold text-xs'>
          {client.name.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className='flex flex-col min-w-0 flex-1'>
        <span className='font-medium text-sm truncate'>{client.name}</span>
        <span className='text-xs text-muted-foreground font-mono'>
          {formatDisplayPhone(phone)}
        </span>
      </div>
    </div>
  )
})

export function PhoneNumberSelector({ value, onChange }: PhoneNumberSelectorProps) {
  const [inputValue, setInputValue] = useState('')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  // Tracks client name per phone — purely for display; parent never sees this
  const [labelMap, setLabelMap] = useState<Record<string, string>>({})
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const debouncedInput = useDebounce(inputValue, 200)
  const { data: clients, isLoading: isLoadingClients } = useGetClients()

  const {
    clients: searchResults,
    loadMore,
    isLoadingMore,
    hasMore,
    isDefaultList,
    totalCount,
  } = useInfiniteClientSearch({
    clients,
    searchQuery: debouncedInput,
    defaultResults: DEFAULT_RESULTS,
    maxResults: MAX_RESULTS,
    pageSize: PAGE_SIZE,
  })

  const { targetRef } = useIntersectionObserver({
    onIntersect: loadMore,
    enabled: hasMore && !isLoadingMore && !isLoadingClients,
  })

  const filteredResults = useMemo(
    () =>
      searchResults.filter((client) => {
        const phone = extractWhatsAppWebPhone(client)
        return phone && !value.includes(phone)
      }),
    [searchResults, value]
  )

  const digits = inputValue.replace(/\D/g, '')
  const isManualEntry =
    digits.length > 0 && digits.length <= 10 && /^\d+$/.test(inputValue.trim())
  const manualPhone = digits.length === 10 ? `521${digits}` : null
  const canAddManual = manualPhone !== null && !value.includes(manualPhone)

  // label is the client name when selected from the list, undefined for manual entries
  const addPhone = useCallback(
    (phone: string, label?: string) => {
      if (!value.includes(phone)) {
        onChange([...value, phone])
        if (label) {
          setLabelMap((prev) => ({ ...prev, [phone]: label }))
        }
      }
      // Keep dropdown open so multiple recipients can be selected quickly.
      // Preserve the search query when selecting from the list.
      if (!label) {
        setInputValue('')
      }
      setIsDropdownOpen(true)
      inputRef.current?.focus()
    },
    [value, onChange]
  )

  const removePhone = useCallback(
    (phone: string) => {
      onChange(value.filter((p) => p !== phone))
      setLabelMap((prev) => {
        const next = { ...prev }
        delete next[phone]
        return next
      })
    },
    [value, onChange]
  )

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === 'Enter' || e.key === ',' || e.key === ' ') && canAddManual) {
      e.preventDefault()
      addPhone(manualPhone!)
    }
    if (e.key === 'Backspace' && inputValue === '' && value.length > 0) {
      removePhone(value[value.length - 1])
    }
    if (e.key === 'Escape') {
      setIsDropdownOpen(false)
    }
  }

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
    setIsDropdownOpen(true)
  }

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current?.contains(e.target as Node) ||
        inputRef.current?.contains(e.target as Node)
      )
        return
      setIsDropdownOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const showDropdown =
    isDropdownOpen &&
    (canAddManual || filteredResults.length > 0 || isLoadingClients)

  return (
    <div className='space-y-2'>
      <Label>
        Destinatarios
        {value.length > 0 && (
          <span className='ml-2 font-normal text-muted-foreground'>
            ({value.length} número{value.length !== 1 ? 's' : ''})
          </span>
        )}
      </Label>

      {/* Selected recipients chips */}
      {value.length > 0 && (
        <div className='flex flex-wrap gap-1.5 rounded-md border border-input bg-muted/20 p-2'>
          {value.map((phone) => {
            const label = labelMap[phone]
            return (
              <div key={phone} className='group relative'>
                <Badge variant='secondary' className='gap-1 pr-1 text-xs max-w-[160px]'>
                  <span className='truncate'>
                    {label ?? formatDisplayPhone(phone)}
                  </span>
                  <button
                    type='button'
                    className='ml-0.5 shrink-0 rounded-full p-0.5 hover:bg-muted-foreground/20 transition-colors'
                    onClick={() => removePhone(phone)}
                    aria-label={`Quitar ${label ?? phone}`}
                  >
                    <X className='h-3 w-3' />
                  </button>
                </Badge>
                {/* Hover tooltip: shows phone when chip displays a client name */}
                {label && (
                  <div className='pointer-events-none absolute bottom-full left-0 z-50 mb-1.5 hidden rounded-md border bg-popover px-2 py-1 shadow-md group-hover:block'>
                    <span className='whitespace-nowrap font-mono text-xs text-popover-foreground'>
                      {formatDisplayPhone(phone)}
                    </span>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Search / number input */}
      <div className='relative' ref={dropdownRef}>
        <div className='relative'>
          <Search className='absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none' />
          <Input
            ref={inputRef}
            value={inputValue}
            onChange={handleInputChange}
            onFocus={() => setIsDropdownOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder='Escribe 10 dígitos o busca un cliente…'
            className='pl-8'
            autoComplete='off'
          />
        </div>

        {showDropdown && (
          <div className='absolute z-50 mt-1 w-full rounded-md border border-border bg-popover shadow-lg'>
            {/* Manual number quick-add */}
            {canAddManual && (
              <div
                className='flex cursor-pointer items-center gap-3 border-b border-border/50 p-3 hover:bg-accent'
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => addPhone(manualPhone!)}
              >
                <div className='flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30'>
                  <Phone className='h-4 w-4 text-green-600 dark:text-green-400' />
                </div>
                <div className='flex flex-col'>
                  <span className='text-sm font-medium'>Agregar número</span>
                  <span className='font-mono text-xs text-muted-foreground'>
                    {formatDisplayPhone(manualPhone!)}
                  </span>
                </div>
              </div>
            )}

            {/* Client results */}
            {isLoadingClients ? (
              <div className='flex items-center justify-center gap-2 p-4 text-sm text-muted-foreground'>
                <div className='h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent' />
                Cargando clientes…
              </div>
            ) : filteredResults.length > 0 ? (
              <div className='max-h-52 overflow-y-auto'>
                <div className='sticky top-0 z-10 border-b bg-popover px-3 py-1.5'>
                  <span className='text-xs text-muted-foreground'>
                    {isDefaultList
                      ? `${totalCount} clientes`
                      : `${filteredResults.length} resultado${filteredResults.length !== 1 ? 's' : ''}`}
                  </span>
                </div>
                {filteredResults.map((client) => {
                  const phone = extractWhatsAppWebPhone(client)!
                  return (
                    <ClientRow
                      key={client.id}
                      client={client}
                      phone={phone}
                      onSelect={() => addPhone(phone, client.name)}
                    />
                  )
                })}
                {hasMore && (
                  <div ref={targetRef} className='border-t bg-muted/20 p-3 text-center'>
                    {isLoadingMore && (
                      <div className='flex items-center justify-center gap-2 text-xs text-muted-foreground'>
                        <div className='h-3 w-3 animate-spin rounded-full border-2 border-primary border-t-transparent' />
                        Cargando más…
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : !canAddManual ? (
              <div className='p-4 text-center text-sm text-muted-foreground'>
                No se encontraron clientes con WhatsApp Web
              </div>
            ) : null}
          </div>
        )}
      </div>

      {isManualEntry && digits.length < 10 && (
        <p className='text-xs text-muted-foreground'>
          Faltan {10 - digits.length} dígito{10 - digits.length !== 1 ? 's' : ''} — se
          prefijará <span className='font-mono'>521</span>
        </p>
      )}
      {canAddManual && (
        <p className='text-xs text-muted-foreground'>
          Presiona{' '}
          <kbd className='rounded bg-muted px-1 font-mono text-xs'>Enter</kbd> para
          agregar
        </p>
      )}
    </div>
  )
}
