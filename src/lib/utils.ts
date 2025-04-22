import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { Chat } from '@/features/chats/ChatTypes.ts'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
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
