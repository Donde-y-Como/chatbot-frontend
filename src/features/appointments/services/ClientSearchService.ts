import { PlatformName } from '@/features/chats/ChatTypes'
import { type Client } from '@/features/clients/types'
import { formatWhatsAppPhone } from '@/lib/utils'

export interface ClientSearchOptions {
  maxResults: number
  defaultResults: number
  excludeClientId?: string
  offset?: number
  limit?: number
}

export interface ClientSearchResult {
  clients: Client[]
  totalCount: number
  hasMore: boolean
  isDefaultList: boolean
  nextOffset?: number
}

export class ClientSearchService {
  private static instance: ClientSearchService
  private searchCache = new Map<string, ClientSearchResult>()
  private sortedClientsCache: Client[] | null = null
  private lastDataHash: string | null = null

  static getInstance(): ClientSearchService {
    if (!ClientSearchService.instance) {
      ClientSearchService.instance = new ClientSearchService()
    }
    return ClientSearchService.instance
  }

  private generateDataHash(clients: Client[]): string {
    return `${clients.length}-${clients[0]?.id || ''}-${clients[clients.length - 1]?.id || ''}`
  }

  private extractPhoneDigits(platformId: string): string {
    const phoneMatch = platformId.match(/^(\d+)@s\.whatsapp\.net$/)
    if (!phoneMatch) return ''

    const phoneNumber = phoneMatch[1]
    // For 521XXXXXXXXX, return the last 10 digits (the actual phone number without country code)
    if (phoneNumber.startsWith('521') && phoneNumber.length === 13) {
      return phoneNumber.slice(3) // Remove 521 prefix, return 10 digits
    }
    return phoneNumber
  }

  private sortClientsByRelevance(clients: Client[]): Client[] {
    // Sort by: recent activity (approximate), then name
    return clients.sort((a, b) => {
      // First, prioritize clients with WhatsApp identities (more active)
      const aHasWhatsApp = a.platformIdentities?.some(
        p => p.platformName === PlatformName.WhatsappWeb
      ) ? 1 : 0
      const bHasWhatsApp = b.platformIdentities?.some(
        p => p.platformName === PlatformName.WhatsappWeb
      ) ? 1 : 0
      
      if (aHasWhatsApp !== bHasWhatsApp) {
        return bHasWhatsApp - aHasWhatsApp
      }

      // Then sort by name alphabetically
      return a.name.localeCompare(b.name)
    })
  }

  private getSortedClients(clients: Client[]): Client[] {
    const currentHash = this.generateDataHash(clients)
    
    if (this.sortedClientsCache && this.lastDataHash === currentHash) {
      return this.sortedClientsCache
    }

    this.sortedClientsCache = this.sortClientsByRelevance([...clients])
    this.lastDataHash = currentHash
    
    return this.sortedClientsCache
  }

  private isClientMatch(client: Client, searchValue: string): boolean {
    // Search in name first (most common case)
    if (client.name.toLowerCase().includes(searchValue)) {
      return true
    }

    // Search in platform identities
    if (client.platformIdentities && client.platformIdentities.length > 0) {
      for (const identity of client.platformIdentities) {
        // Search in original platform ID
        if (identity.platformId.toLowerCase().includes(searchValue)) {
          return true
        }

        // For WhatsApp Web, also search in formatted phone and raw digits
        if (identity.platformName === PlatformName.WhatsappWeb) {
          const rawDigits = this.extractPhoneDigits(identity.platformId)
          if (rawDigits.includes(searchValue)) {
            return true
          }

          const formattedPhone = formatWhatsAppPhone(
            identity.platformId
          ).toLowerCase()
          if (formattedPhone.includes(searchValue)) {
            return true
          }
        }
      }
    }

    return false
  }

  searchClients(
    clients: Client[],
    searchQuery: string,
    options: ClientSearchOptions
  ): ClientSearchResult {
    const offset = options.offset || 0
    const limit = options.limit || (searchQuery ? options.maxResults : options.defaultResults)
    
    const sortedClients = this.getSortedClients(clients)
    let allMatchingClients: Client[]
    let isDefaultList = false

    if (!searchQuery) {
      // Get all clients excluding selected one
      allMatchingClients = sortedClients
        .filter(client => client.id !== options.excludeClientId)
      isDefaultList = true
    } else {
      // Perform search on all clients
      const searchValue = searchQuery.toLowerCase()
      const results: Client[] = []

      // Use for loop for better performance
      for (let i = 0; i < sortedClients.length; i++) {
        const client = sortedClients[i]

        if (client.id === options.excludeClientId) continue

        if (this.isClientMatch(client, searchValue)) {
          results.push(client)
        }
      }

      allMatchingClients = results
    }

    // Apply pagination
    const paginatedClients = allMatchingClients.slice(offset, offset + limit)
    const hasMore = offset + limit < allMatchingClients.length
    const nextOffset = hasMore ? offset + limit : undefined

    const result: ClientSearchResult = {
      clients: paginatedClients,
      totalCount: allMatchingClients.length,
      hasMore,
      isDefaultList,
      nextOffset
    }

    return result
  }

  clearCache(): void {
    this.searchCache.clear()
    this.sortedClientsCache = null
    this.lastDataHash = null
  }

  getRecentClients(clients: Client[], count: number, excludeClientId?: string): Client[] {
    const sortedClients = this.getSortedClients(clients)
    return sortedClients
      .filter(client => client.id !== excludeClientId)
      .slice(0, count)
  }
}