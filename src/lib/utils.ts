import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { Chat } from '@/features/chats/ChatTypes.ts'
import { UserData } from '../features/auth/types'
import { PlatformName } from '../features/clients/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getInstanceId(userData: UserData): string | undefined {
  const whatsappPlatform = userData.socialPlatforms.find(
    (platform) => platform.platformName === PlatformName.WhatsappWeb
  )
  return whatsappPlatform ? whatsappPlatform.platformId : undefined
}

/**
 * Format a number as currency
 * @param amount - The amount to format
 * @param currency - The currency code (e.g., 'USD', 'EUR')
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency || 'USD',
    minimumFractionDigits: 2,
  }).format(amount)
}

export function sortByLastMessageTimestamp(a: Chat, b: Chat): number {
  if (a.lastMessage && b.lastMessage) {
    return b.lastMessage.timestamp - a.lastMessage.timestamp
  }

  if (a.lastMessage && !b.lastMessage) {
    return -1
  }

  if (!a.lastMessage && b.lastMessage) {
    return 1
  }

  return 0
}
