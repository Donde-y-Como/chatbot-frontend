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

    if (!hasSearch && !hasFilter) return chats;

    return chats.filter((chat) => {
      const matchesSearch = !hasSearch ||
        chat.client?.name.toLowerCase().includes(trimmedSearch);

      if (!matchesSearch) return false;
      if (!hasFilter) return true;
      const filterLower = activeFilter!.toLowerCase();

      if (activeFilter === UNREAD_LABEL_FILTER) {
        return chat.newClientMessagesCount > 0;
      }

      const isPlatformFilter = PLATFORM_NAMES.includes(filterLower as PlatformName);
      if (isPlatformFilter) {
        return chat.platformName.toLowerCase() === filterLower;
      }

      if (tags && tags.length > 0) {
        const matchingTag = tags.find(tag =>
          tag.name.toLowerCase() === filterLower
        );

        if (matchingTag && chat.client) {
          return chat.client.tagIds.includes(matchingTag.id);
        }
      }

      return false;
    });
  }, [chats, search, activeFilter, tags]);
}