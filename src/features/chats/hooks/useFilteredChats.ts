import { useMemo } from 'react'
import { Chat } from '@/features/chats/ChatTypes'

export function useFilteredChats(chats: Chat[] | undefined, search: string) {
  return useMemo(
    () => chats?.filter((chat) =>
      chat.client.profileName
        .toLowerCase()
        .includes(search.trim().toLowerCase())
    ) || [],
    [chats, search]
  )
}