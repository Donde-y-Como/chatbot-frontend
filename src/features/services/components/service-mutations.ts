import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { api } from '@/api/axiosInstance'
import { MinutesTimeRange } from '../../appointments/types'
import { ProductInfo } from '@/types'
import { Unit } from '../../settings/units/types'

// Form data shape for service creation/update - campos opcionales
export interface ServiceFormData {
  // CAMPOS OBLIGATORIOS
  name: string
  durationValue: number
  durationUnit: 'minutes' | 'hours'
  priceAmount: number
  priceCurrency: string
  maxConcurrentBooks: number
  minBookingLeadHours: number
  schedule: Record<string, MinutesTimeRange>
  
  // CAMPOS OPCIONALES
  description?: string
  productInfo?: ProductInfo
  codigoBarras?: number
  photos?: string[]
  equipmentIds?: string[]
  consumableUsages?: Array<{
    consumableId: string
    quantity: number
  }>
}

const transformFormToApiData = (formData: ServiceFormData) => {
  const transformed: any = {
    // CAMPOS OBLIGATORIOS
    name: formData.name,
    maxConcurrentBooks: formData.maxConcurrentBooks,
    minBookingLeadHours: formData.minBookingLeadHours,
    schedule: formData.schedule,
    
    // Campos transformados
    price: { 
      amount: formData.priceAmount, 
      currency: formData.priceCurrency 
    },
    duration: { 
      unit: formData.durationUnit, 
      value: formData.durationValue 
    },
  }
  
  // CAMPOS OPCIONALES - solo incluir si tienen valor
  if (formData.description !== undefined && formData.description !== '') {
    transformed.description = formData.description
  }
  
  if (formData.productInfo) {
    transformed.productInfo = formData.productInfo
  }
  
  if (formData.codigoBarras !== undefined && formData.codigoBarras > 0) {
    transformed.codigoBarras = formData.codigoBarras
  }
  
  if (formData.photos && formData.photos.length > 0) {
    transformed.photos = formData.photos
  }
  
  if (formData.equipmentIds && formData.equipmentIds.length > 0) {
    transformed.equipmentIds = formData.equipmentIds
  }
  
  if (formData.consumableUsages && formData.consumableUsages.length > 0) {
    transformed.consumableUsages = formData.consumableUsages
  }
  
  console.log('Datos enviados al backend:', transformed)
  
  return transformed
}

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
      // Invalidar todas las queries relacionadas con servicios
      queryClient.invalidateQueries({
        queryKey: ['services']
      })
      // También invalidar queries específicas si las hay
      queryClient.invalidateQueries({
        predicate: (query) => {
          return query.queryKey[0] === 'services' || 
                 (Array.isArray(query.queryKey) && query.queryKey.includes('services'))
        }
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
      // Invalidar todas las queries relacionadas con servicios
      queryClient.invalidateQueries({
        queryKey: ['services']
      })
      // También invalidar queries específicas si las hay
      queryClient.invalidateQueries({
        predicate: (query) => {
          return query.queryKey[0] === 'services' || 
                 (Array.isArray(query.queryKey) && query.queryKey.includes('services'))
        }
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
