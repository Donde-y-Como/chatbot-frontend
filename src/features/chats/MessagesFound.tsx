import { useEffect, useState } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { api } from '@/api/axiosInstance'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { AvatarImage } from '@radix-ui/react-avatar'
import { format } from 'date-fns'
import { IconBrandFacebook, IconBrandInstagram, IconBrandWhatsapp } from '@tabler/icons-react'
import { useDebounce } from '@/hooks/useDebounce'
import { Skeleton } from '@/components/ui/skeleton'
import { MessageRole } from './ChatTypes'

interface MessageFoundProps {
  message: {
    id: string
    content: string
    timestamp: number
    role: MessageRole
  }
  conversationId: string
  clientName: string
  clientPhoto: string
  platformName: string
}

interface MessagesFoundProps {
  search: string
  onMessageClick: (conversationId: string, messageId: string) => void
}

export function MessagesFound({ search, onMessageClick }: MessagesFoundProps) {
  const [messages, setMessages] = useState<MessageFoundProps[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const debouncedSearch = useDebounce(search, 250)

  useEffect(() => {
    const fetchMessages = async () => {
      if (!debouncedSearch || debouncedSearch.length < 2) {
        setMessages([])
        return
      }

      setIsLoading(true)
      try {
        const response = await api.get('chats-search?query=' + encodeURIComponent(debouncedSearch))
        setMessages(response.data.messages || [])
      } catch (error) {
        console.error('Error fetching messages:', error)
        setMessages([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchMessages()
  }, [debouncedSearch])

  // If search is empty or less than 2 characters, don't show the component
  if (!search || search.length < 2) {
    return null
  }

  // Helper function to highlight matching text
  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text

    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
    const parts = text.split(regex)

    return (
      <>
        {parts.map((part, i) =>
          regex.test(part) ? (
            <span key={i} className="bg-yellow-200 text-black px-0.5 rounded">
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

  return (
    <div className="mt-2 mx-4 bg-gray-50 rounded-md border overflow-hidden">
      <div className="px-3 py-2 font-medium bg-gray-100 border-b flex justify-between">
        <span>Mensajes encontrados</span>
        <span className="text-muted-foreground text-sm">
          {isLoading ? 'Buscando...' : `${messages.length} resultado${messages.length !== 1 ? 's' : ''}`}
        </span>
      </div>

      <ScrollArea className="h-80">
        {isLoading ? (
          // Loading skeleton
          <div className="p-2 space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-start gap-2 p-2">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-40 mb-2" />
                  <Skeleton className="h-14 w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : messages.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">
            No se encontraron mensajes para "{search}"
          </div>
        ) : (
          <div className="p-2">
            {messages.map((message, index) => (
              <div
                key={message.message.id}
                className="hover:bg-gray-100 rounded-md p-2 cursor-pointer transition-colors"
                onClick={() => onMessageClick(message.conversationId, message.message.id)}
              >
                <div className="flex gap-2">
                  <div className="relative flex-shrink-0">
                    <Avatar className="h-10 w-10">
                      {message.clientPhoto && <AvatarImage src={message.clientPhoto} alt={message.clientName} className="object-cover" />}
                      <AvatarFallback>{message.clientName[0]}</AvatarFallback>
                    </Avatar>
                    {message.platformName && (
                      <div className="absolute -bottom-0.5 -right-0.5 rounded-full bg-white p-0.5 shadow-md">
                        {getPlatformIcon(message.platformName)}
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex justify-between">
                      <span className="font-medium">{message.clientName}</span>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(message.message.timestamp), 'dd/MM/yy HH:mm')}
                      </span>
                    </div>
                    <div className="mt-1 text-sm text-muted-foreground overflow-hidden">
                      {message.message.role !== 'user' && <span className="font-semibold">Tú:</span>}{' '}
                      {highlightText(message.message.content, debouncedSearch)}
                    </div>
                  </div>
                </div>
                {index < messages.length - 1 && <Separator className="my-2" />}
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  )
}
