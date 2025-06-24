import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { Chat } from '@/features/chats/ChatTypes.ts'
import { UserData } from '../features/auth/types'
import { PlatformName } from '../features/clients/types'
import { UserIcon } from 'lucide-react'
import { Employee } from '@/features/employees/types.ts'

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

// Function to generate role options dynamically from employees data
export function generateRoleOptions(employees: Employee[]) {
  const uniqueRoles = new Set(employees.map((employee) => employee.role))

  return Array.from(uniqueRoles).map((role) => {
    return {
      value: role,
      label: role.charAt(0).toUpperCase() + role.slice(1),
      icon: UserIcon,
    }
  })
}

export function formatWhatsAppPhone(platformId: string): string {
  // Extract phone number from format like 5219512010452@s.whatsapp.net
  const phoneMatch = platformId.match(/^(\d+)@s\.whatsapp\.net$/)
  if (!phoneMatch) return platformId

  const phoneNumber = phoneMatch[1]
  // Format 521XXXXXXXXX to +52 1 XXX XXX XXXX
  if (phoneNumber.startsWith('521') && phoneNumber.length === 13) {
    return `+52 1 ${phoneNumber.slice(3, 6)} ${phoneNumber.slice(6, 9)} ${phoneNumber.slice(9)}`
  }
  return phoneNumber
}
