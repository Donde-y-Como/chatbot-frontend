import { useMemo } from 'react'
import { Chat } from '@/features/chats/ChatTypes'

export function useFilteredChats(
  chats: Chat[] | undefined,
  search: string,
  activeFilter: string | null
) {
  return useMemo(() => {
    return (
      chats?.filter((chat) => {
        const searchQuery = chat.client.name
          .toLowerCase()
          .includes(search.trim().toLowerCase())
        let matchesFilter = true

        if (activeFilter) {
          matchesFilter = chat.platformName === activeFilter
        }

        return searchQuery && matchesFilter
      }) || []
    )
  }, [chats, search, activeFilter])
}
