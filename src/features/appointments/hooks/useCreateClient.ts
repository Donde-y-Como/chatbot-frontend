import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ClientApiService } from '@/features/clients/ClientApiService'
import { PlatformIdentity, PlatformName } from '@/features/clients/types'

interface CreateClientData {
  name: string
  phoneNumber?: string
}

export function useCreateClient() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ name, phoneNumber }: CreateClientData) => {
      const platformIdentities: PlatformIdentity[] = []

      if (phoneNumber && phoneNumber.length === 10) {
        const identity = {
          platformName: PlatformName.WhatsappWeb,
          platformId: `521${phoneNumber}@s.whatsapp.net`,
          profileName: name,
        }
        platformIdentities.push(identity)
      }

      return await ClientApiService.create({
        name,
        platformIdentities,
        tagIds: [],
        annexes: [],
        photo: '',
        notes: '',
        email: '',
        address: '',
      })
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['clients'] })
    },
  })
}
