import { useMemo } from 'react'
import { formatWhatsAppPhone } from '@/lib/utils'
import { Chat } from '@/features/chats/ChatTypes'
import { Tag } from '../../clients/types'
import { UNREAD_LABEL_FILTER } from '../ChatBarHeader'

const PLATFORM_NAMES = [
  'instagram',
  'whatsapp',
  'facebook',
  'whatsappweb',
] as const
type PlatformName = (typeof PLATFORM_NAMES)[number]

// Helper function to extract raw phone number digits for search
function extractPhoneDigits(platformId: string): string {
  const phoneMatch = platformId.match(/^(\d+)@s\.whatsapp\.net$/)
  if (!phoneMatch) return ''

  const phoneNumber = phoneMatch[1]
  // For 521XXXXXXXXX, return the last 10 digits (the actual phone number without country code)
  if (phoneNumber.startsWith('521') && phoneNumber.length === 13) {
    return phoneNumber.slice(3) // Remove 521 prefix, return 10 digits
  }
  return phoneNumber
}

export function useFilteredChats(
  chats: Chat[] | undefined,
  search: string,
  activeFilter: string | null,
  tags: Tag[] | undefined
) {
  return useMemo(() => {
    if (!chats || chats.length === 0) return []

    const trimmedSearch = search.trim().toLowerCase()
    const hasSearch = trimmedSearch.length > 0
    const hasFilter = activeFilter !== null

    if (!hasSearch && !hasFilter) return chats

    return chats.filter((chat) => {
      if (!chat) return false

      // Search in client name
      const matchesName = chat.client?.name.toLowerCase().includes(trimmedSearch)
      
      // Search in phone numbers from platformIdentities
      const matchesPhone = chat.client?.platformIdentities?.some((identity) => {
        const platformId = identity.platformId.toLowerCase()
        return (
          platformId.includes(trimmedSearch) ||
          formatWhatsAppPhone(identity.platformId).toLowerCase().includes(trimmedSearch) ||
          extractPhoneDigits(identity.platformId).includes(trimmedSearch)
        )
      }) || false

      const matchesSearch = !hasSearch || matchesName || matchesPhone

      if (!matchesSearch) return false
      if (!hasFilter) return true
      const filterLower = activeFilter!.toLowerCase()

      if (activeFilter === UNREAD_LABEL_FILTER) {
        return chat.newClientMessagesCount > 0
      }

      const isPlatformFilter = PLATFORM_NAMES.includes(
        filterLower as PlatformName
      )

      if (isPlatformFilter) {
        return chat.platformName.toLowerCase() === filterLower
      }

      if (tags && tags.length > 0) {
        const matchingTag = tags.find(
          (tag) => tag.name.toLowerCase() === filterLower
        )

        if (matchingTag && chat.client) {
          return chat.client.tagIds.includes(matchingTag.id)
        }
      }

      return false
    })
  }, [chats, search, activeFilter, tags])
}
