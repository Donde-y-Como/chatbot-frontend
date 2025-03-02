import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { api } from '@/api/axiosInstance'
import { MinutesTimeRange } from '../../appointments/types'

// Form data shape for service creation/update
export interface ServiceFormData {
  name: string
  description: string
  durationValue: number
  durationUnit: 'minutes' | 'hours'
  priceAmount: number
  priceCurrency: string
  maxConcurrentBooks: number
  minBookingLeadHours: number
  schedule: Record<string, MinutesTimeRange>
}

/**
 * Transforms form data to API service format
 */
const transformFormToApiData = (formData: ServiceFormData) => {
  return {
    ...formData,
    price: { 
      amount: formData.priceAmount, 
      currency: formData.priceCurrency 
    },
    duration: { 
      unit: formData.durationUnit, 
      value: formData.durationValue 
    },
  }
}

/**
 * Hook for creating a new service
 */
export const useCreateService = (options?: {
  onSuccess?: () => void
}) => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (formData: ServiceFormData) => {
      const body = transformFormToApiData(formData)
      
      const res = await api.post('/services', body)
      if (res.status !== 201) {
        throw new Error('Error al crear servicio')
      }
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['services']
      })
      toast.success('Servicio creado con éxito')
      options?.onSuccess?.()
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : 'Error al crear servicio'
      toast.error(errorMessage)
    }
  })
}

/**
 * Hook for updating an existing service
 */
export const useUpdateService = (options?: {
  onSuccess?: () => void
}) => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ 
      id, 
      formData 
    }: { 
      id: string
      formData: ServiceFormData 
    }) => {
      const body = transformFormToApiData(formData)
      
      const res = await api.put(`/services/${id}`, body)
      if (res.status !== 200) {
        throw new Error('Error al actualizar servicio')
      }
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['services']
      })
      toast.success('Servicio actualizado con éxito')
      options?.onSuccess?.()
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : 'Error al actualizar servicio'
      toast.error(errorMessage)
    }
  })
}