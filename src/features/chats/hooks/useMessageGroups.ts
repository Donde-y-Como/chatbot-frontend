import { useMemo } from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale/es'
import { Message } from '@/features/chats/ChatTypes'

export function useMessageGroups(messages?: Message[]) {
  return useMemo(() => {
    if (!messages) return {}

    return messages.reduce((acc, msg) => {
      const date = new Date(msg.timestamp)
      const key = format(date, 'd MMM yyyy', { locale: es })
      if (!acc[key]) acc[key] = []
      acc[key].push(msg)
      return acc
    }, {} as Record<string, Message[]>)
  }, [messages])
}