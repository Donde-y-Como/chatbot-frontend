import { useMutation, useQueryClient } from '@tanstack/react-query'
import { PlatformIdentity, Client } from '../../chats/ChatTypes'
import { ClientApiService } from '../services/ClientApiService'
import { ClientPrimitives } from '../types'

interface UpdateClientPlatformIdentitiesParams {
  clientId: string
  newPlatformIdentities: PlatformIdentity[]
  optimistic?: boolean
  replace?: boolean
}

interface UpdateClientPlatformIdentitiesResult {
  hasChanges: boolean
  addedIdentities: PlatformIdentity[]
  updatedClient: Client
}

export const useUpdateClientPlatformIdentities = () => {
  const queryClient = useQueryClient()

  return useMutation<
    UpdateClientPlatformIdentitiesResult,
    Error,
    UpdateClientPlatformIdentitiesParams
  >({
    mutationFn: async ({
      clientId,
      newPlatformIdentities,
      optimistic = false,
      replace = false,
    }) => {
      // Get current client data from cache or fetch it
      const currentClients =
        queryClient.getQueryData<Client[]>(['clients']) || []
      const currentClient = currentClients.find(
        (client) => client.id === clientId
      )

      if (!currentClient) {
        throw new Error('Cliente no encontrado')
      }

      let updatedPlatformIdentities: PlatformIdentity[]
      let addedIdentities: PlatformIdentity[]

      if (replace) {
        // Replace mode: use the new platform identities as-is
        updatedPlatformIdentities = newPlatformIdentities
        addedIdentities = newPlatformIdentities
      } else {
        // Add mode: determine which identities are actually new and merge
        addedIdentities = newPlatformIdentities.filter(
          (newIdentity) =>
            !currentClient.platformIdentities.some(
              (existing) =>
                existing.platformId === newIdentity.platformId &&
                existing.platformName === newIdentity.platformName
            )
        )
        
        // Merge existing platform identities with new ones
        updatedPlatformIdentities = [
          ...currentClient.platformIdentities,
          ...addedIdentities,
        ]
      }

      // Prepare the complete client data for update
      const clientUpdateData: Partial<ClientPrimitives> = {
        id: currentClient.id,
        businessId: currentClient.businessId,
        name: currentClient.name,
        platformIdentities: updatedPlatformIdentities,
        tagIds: currentClient.tagIds,
        annexes: currentClient.annexes,
        photo: currentClient.photo,
        notes: currentClient.notes,
        email: currentClient.email,
        address: currentClient.address,
        birthdate: currentClient.birthdate,
        createdAt: currentClient.createdAt,
        updatedAt: currentClient.updatedAt,
      }

      // Update the client via API
      console.log('esto es lo que estoy enviando ', clientUpdateData)
      const updatedClientData = await ClientApiService.update(
        clientId,
        clientUpdateData
      )

      // Create the updated client object
      const updatedClient: Client = {
        ...currentClient,
        ...updatedClientData,
        platformIdentities: updatedPlatformIdentities,
      }

      return {
        hasChanges: true,
        addedIdentities,
        updatedClient,
      }
    },
    onSuccess: (result, variables) => {
      
      if (result.hasChanges) {
        // Invalidate and refetch clients list
        queryClient.invalidateQueries({ queryKey: ['clients'] })

        // Optimistically update the clients list cache
        queryClient.setQueryData<Client[]>(['clients'], (oldClients) => {
          if (!oldClients) return oldClients

          return oldClients.map((client) =>
            client.id === variables.clientId ? result.updatedClient : client
          )
        })

        // Update specific client in cache
        queryClient.setQueryData(
          ['clients', variables.clientId],
          result.updatedClient
        )
      }
    },
    onError: (error) => {
      console.error('Error updating client platform identities:', error)
    },
  })
}
