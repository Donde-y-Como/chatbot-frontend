import { type ClassValue, clsx } from 'clsx'
import { UserIcon } from 'lucide-react'
import { twMerge } from 'tailwind-merge'
import { Chat, PlatformName } from '@/features/chats/ChatTypes.ts'
import { dayInitialsMap, Employee } from '@/features/employees/types.ts'
import { UserData, Role, BusinessData } from '../features/auth/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getInstanceId(businessData: BusinessData): string | undefined {
  const whatsappPlatform = businessData.socialPlatforms.find(
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

// Function to generate role options from the roles API
export function generateRoleOptions(roles: Role[]) {
  return roles.map((role) => {
    return {
      value: role.id,
      label: role.name,
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

export const getFileType = (mimetype: string): string => {
  if (mimetype.startsWith('image/')) return 'image'
  if (mimetype.startsWith('video/')) return 'video'
  if (mimetype.startsWith('audio/')) return 'audio'
  return 'document'
}

export const isValidFileType = (mimetype: string): boolean => {
  const allowedTypes = [
    // Images
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
    // Videos
    'video/mp4',
    'video/avi',
    'video/mov',
    'video/wmv',
    'video/flv',
    'video/webm',
    // Audio
    'audio/mp3',
    'audio/wav',
    'audio/ogg',
    'audio/aac',
    'audio/flac',
    // Documents
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    'text/csv',
    'application/rtf',
    'application/xml',
    'text/xml',
  ]

  const dangerousTypes = [
    'application/x-executable',
    'application/x-msdownload',
    'application/x-dosexec',
    'application/zip',
    'application/x-zip-compressed',
    'application/x-rar-compressed',
    'application/x-7z-compressed',
    'application/x-tar',
    'application/gzip',
  ]

  return allowedTypes.includes(mimetype) && !dangerousTypes.includes(mimetype)
}


// Helper function to get work days summary
export function getWorkDaysSummary(schedule: Record<string, any>): string {
  if (!schedule || Object.keys(schedule).length === 0) return 'Sin horario'

  const workDays = Object.keys(schedule)
    .filter(day => schedule[day] && schedule[day].startAt !== undefined)
    .map(day => dayInitialsMap[day as keyof typeof dayInitialsMap])
    .filter(Boolean)

  if (workDays.length === 0) return 'Sin horario'
  if (workDays.length === 7) return 'L-DO'
  if (workDays.length === 6 && !workDays.includes('DO')) return 'L-SA'
  if (workDays.length === 5 && workDays.includes('LU') && workDays.includes('VI')) return 'L-V'

  return workDays.join(', ')
}