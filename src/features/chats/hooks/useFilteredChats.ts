import { Chat } from '@/features/chats/ChatTypes'
import { useMemo } from 'react'
import { Tag } from '../../clients/types'

export function useFilteredChats(
  chats: Chat[] | undefined,
  search: string,
  activeFilter: string | null,
  tags: Tag[] | undefined
) {
  return useMemo(() => {
    return (
      chats?.filter((chat) => {
        const searchQuery = chat.client.name
          .toLowerCase()
          .includes(search.trim().toLowerCase())
        let matchesFilter = true

        if (activeFilter) {
          if (activeFilter.toLowerCase() === "instagram"
            || activeFilter.toLowerCase() === "whatsapp"
            || activeFilter.toLowerCase() === "facebook") {
            matchesFilter = chat.platformName === activeFilter
          } else if (tags && tags.length > 0) {
            const tagId = tags.find(
              (tag) => tag.name.toLowerCase() === activeFilter.toLowerCase()
            )?.id;

            if (tagId) {
              matchesFilter = chat.client.tagIds.length > 0 && chat.client.tagIds.includes(tagId)
            } else {
              matchesFilter = false
            }
          }
        }

        return searchQuery && matchesFilter
      }) || []
    )
  }, [chats, search, activeFilter, tags])
}