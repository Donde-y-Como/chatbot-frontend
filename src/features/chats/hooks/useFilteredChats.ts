import { Chat } from '@/features/chats/ChatTypes'
import { useMemo } from 'react'
import { Tag } from '../../clients/types'
import { UNREAD_LABEL_FILTER } from '../ChatBarHeader'

const PLATFORM_NAMES = ['instagram', 'whatsapp', 'facebook'] as const;
type PlatformName = typeof PLATFORM_NAMES[number];

export function useFilteredChats(
  chats: Chat[] | undefined,
  search: string,
  activeFilter: string | null,
  tags: Tag[] | undefined
) {
  return useMemo(() => {
    if (!chats || chats.length === 0) return [];

    const trimmedSearch = search.trim().toLowerCase();
    const hasSearch = trimmedSearch.length > 0;
    const hasFilter = activeFilter !== null;

    // If no search or filter, return all chats
    if (!hasSearch && !hasFilter) return chats;

    return chats.filter((chat) => {
      // Check search criteria
      const matchesSearch = !hasSearch ||
        chat.client.name.toLowerCase().includes(trimmedSearch);

      // If doesn't match search, no need to check filter
      if (!matchesSearch) return false;

      // If no filter, search match is sufficient
      if (!hasFilter) return true;

      // Check filter criteria
      const filterLower = activeFilter!.toLowerCase();

      // 1. Unread messages filter
      if (activeFilter === UNREAD_LABEL_FILTER) {
        return chat.newClientMessagesCount > 0;
      }

      // 2. Platform filter (case insensitive)
      const isPlatformFilter = PLATFORM_NAMES.includes(filterLower as PlatformName);
      if (isPlatformFilter) {
        return chat.platformName.toLowerCase() === filterLower;
      }

      // 3. Tag filter
      if (tags && tags.length > 0) {
        const matchingTag = tags.find(tag =>
          tag.name.toLowerCase() === filterLower
        );

        if (matchingTag) {
          return chat.client.tagIds.includes(matchingTag.id);
        }
      }

      // No filter match
      return false;
    });
  }, [chats, search, activeFilter, tags]);
}