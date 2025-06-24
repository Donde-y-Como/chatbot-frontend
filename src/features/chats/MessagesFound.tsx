import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { useDebounce } from '@/hooks/useDebounce'
import { AvatarImage } from '@radix-ui/react-avatar'
import { IconBrandFacebook, IconBrandInstagram, IconBrandWhatsapp, IconSearch, IconLoader2 } from '@tabler/icons-react'
import { format } from 'date-fns'
import { useCallback, useEffect, useRef } from 'react'
import { MessageRole } from './ChatTypes'
import { useSearchMessages } from './hooks/useSearchMessages'

const highlightText = (text: string, query: string) => {
  if (!query.trim()) return text

  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
  const parts = text.split(regex)

  return (
    <>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <span key={i} className="bg-yellow-200 dark:bg-yellow-800 text-yellow-900 dark:text-yellow-100 px-1 py-0.5 rounded-sm font-medium">
            {part}
          </span>
        ) : (
          part
        )
      )}
    </>
  )
}

const getPlatformIcon = (platform: string) => {
  const platformMap = {
    whatsapp: { Icon: IconBrandWhatsapp, color: 'text-green-500' },
    facebook: { Icon: IconBrandFacebook, color: 'text-blue-500' },
    instagram: { Icon: IconBrandInstagram, color: 'text-pink-500' }
  }

  const platformKey = platform.toLowerCase() as keyof typeof platformMap
  if (platformMap[platformKey]) {
    const { Icon, color } = platformMap[platformKey]
    return <Icon size={14} className={color} />
  }

  return null
}

interface MessagesFoundProps {
  search: string
  onMessageClick: (conversationId: string, messageId: string) => void
}

export function MessagesFound({ search, onMessageClick }: MessagesFoundProps) {
  const debouncedSearch = useDebounce(search, 300)
  const loadingRef = useRef<HTMLDivElement>(null)
  
  const {
    messages,
    totalCount,
    isLoading,
    isError,
    hasNextPage,
    isFetchingNextPage,
    loadMore,
    isEmpty,
  } = useSearchMessages({
    query: debouncedSearch,
    enabled: debouncedSearch.length >= 2,
    limit: 20,
  })

  const handleIntersection = useCallback(
    async (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries
      if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
        await loadMore()
      }
    },
    [hasNextPage, isFetchingNextPage, loadMore]
  )

  useEffect(() => {
    if (!loadingRef.current || !hasNextPage) return

    const observer = new IntersectionObserver(handleIntersection, {
      rootMargin: '100px',
      threshold: 0.1,
    })

    observer.observe(loadingRef.current)
    return () => observer.disconnect()
  }, [handleIntersection, hasNextPage])

  if (!search || search.length < 2) {
    return null
  }

  if (isError) {
    return (
      <div className="mt-2 mx-4 bg-background rounded-lg border border-destructive/20 overflow-hidden">
        <div className="px-4 py-3 text-center text-destructive text-sm">
          Error al buscar mensajes. Intente nuevamente.
        </div>
      </div>
    )
  }

  return (
    <div className="bg-background overflow-hidden">
      <div className="px-4 py-3 bg-gradient-to-r from-secondary/30 to-secondary/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <IconSearch size={16} className="text-muted-foreground" />
            <span className="font-semibold text-sm">Mensajes encontrados</span>
          </div>
          <div className="flex items-center gap-2">
            {isLoading && <IconLoader2 size={14} className="animate-spin text-muted-foreground" />}
            <span className="text-muted-foreground text-xs font-medium">
              {isLoading && messages.length === 0
                ? 'Buscando...'
                : totalCount > 0
                ? `${totalCount} total • ${messages.length} cargados`
                : `${messages.length} resultado${messages.length !== 1 ? 's' : ''}`}
            </span>
          </div>
        </div>
      </div>

      <ScrollArea className="h-80 w-full">
        {isLoading && messages.length === 0 ? (
          <div className="p-3 space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-lg">
                <Skeleton className="h-11 w-11 rounded-full flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                  <Skeleton className="h-12 w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : isEmpty ? (
          <div className="p-8 text-center">
            <IconSearch size={48} className="mx-auto text-muted-foreground/50 mb-3" />
            <p className="text-muted-foreground font-medium mb-1">
              No se encontraron mensajes
            </p>
            <p className="text-muted-foreground/80 text-sm">
              Intenta con otros términos de búsqueda
            </p>
          </div>
        ) : (
          <div className="p-3 space-y-2">
            {messages.map((message, index) => (
              <div
                key={`${message.conversationId}-${message.message.id}-${index}`}
                className="group hover:bg-muted/70 rounded-lg p-3 cursor-pointer transition-all duration-200 hover:shadow-sm border border-transparent hover:border-border/50"
                onClick={() => onMessageClick(message.conversationId, message.message.id)}
              >
                <div className="flex gap-3">
                  <div className="relative flex-shrink-0">
                    <Avatar className="h-11 w-11 ring-2 ring-background shadow-sm">
                      {message.clientPhoto && (
                        <AvatarImage 
                          src={message.clientPhoto} 
                          alt={message.clientName || 'Cliente'} 
                          className="object-cover" 
                        />
                      )}
                      <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-semibold text-sm">
                        {(message.clientName || 'U')[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    {message.platformName && (
                      <div className="absolute -bottom-1 -right-1 rounded-full bg-background p-1 shadow-md ring-2 ring-background">
                        {getPlatformIcon(message.platformName)}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-sm truncate group-hover:text-primary transition-colors">
                        {message.clientName || 'Cliente sin nombre'}
                      </h4>
                      <div className="flex flex-col items-end gap-1 ml-2">
                        <span className="text-xs text-muted-foreground whitespace-nowrap font-medium">
                          {format(new Date(message.message.timestamp), 'dd/MM/yy')}
                        </span>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {format(new Date(message.message.timestamp), 'HH:mm')}
                        </span>
                      </div>
                    </div>
                    <div className="text-sm leading-relaxed">
                      <div className="flex items-start gap-1">
                        {message.message.role !== 'user' && (
                          <span className="font-semibold text-primary text-xs px-1.5 py-0.5 bg-primary/10 rounded-md whitespace-nowrap">
                            Tú:
                          </span>
                        )}
                        <div className="text-foreground/90 break-words flex-1">
                          {highlightText(message.message.content, debouncedSearch)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {hasNextPage && (
              <div ref={loadingRef} className="pt-4 pb-2">
                {isFetchingNextPage && (
                  <div className="flex justify-center items-center gap-2 py-3">
                    <IconLoader2 size={16} className="animate-spin text-primary" />
                    <span className="text-sm text-muted-foreground font-medium">
                      Cargando más mensajes...
                    </span>
                  </div>
                )}
              </div>
            )}
            
            {!hasNextPage && messages.length > 0 && (
              <div className="pt-4 pb-2 text-center">
                <span className="text-xs text-muted-foreground/70 font-medium">
                  {totalCount > messages.length 
                    ? `Mostrando ${messages.length} de ${totalCount} mensajes`
                    : 'Todos los mensajes cargados'
                  }
                </span>
              </div>
            )}
          </div>
        )}
      </ScrollArea>
    </div>
  )
}