import { api } from '@/api/axiosInstance.ts'
import {
  Bundle,
  BundleFilters,
  CreateBundleForm,
  EditBundleForm,
} from './types'

export const BundleApiService = {
  // Operaciones CRUD principales
  createBundle: async (bundle: CreateBundleForm): Promise<Bundle> => {
    const response = await api.post('/bundles/', bundle)
    if (response.status !== 201) {
      throw new Error('Error creando bundle')
    }
    return response.data
  },

  getAllBundles: async (filters?: BundleFilters): Promise<Bundle[]> => {
    const params = new URLSearchParams()

    if (filters?.query) {
      params.set('query', filters.query)
    }
    if (filters?.tagIds?.length) {
      params.set('tagIds', filters.tagIds.join(','))
    }
    if (filters?.status) {
      params.set('status', filters.status)
    }

    const queryString = params.toString()
    const url = queryString ? `/bundles/?${queryString}` : '/bundles/'

    const response = await api.get<Bundle[]>(url)
    if (response.status !== 200) {
      throw new Error('Error obteniendo bundles')
    }
    return response.data
  },

  getBundleById: async (bundleId: string): Promise<Bundle> => {
    const response = await api.get(`/bundles/${bundleId}`)
    if (response.status !== 200) {
      throw new Error('Error obteniendo bundle')
    }
    return response.data
  },

  updateBundle: async (
    bundleId: string,
    changes: Partial<EditBundleForm>
  ): Promise<Bundle> => {
    const response = await api.put(`/bundles/${bundleId}`, changes)
    if (response.status !== 200) {
      throw new Error('Error actualizando bundle')
    }
    return response.data
  },

  deleteBundle: async (bundleId: string): Promise<void> => {
    const response = await api.delete(`/bundles/${bundleId}`)
    if (response.status !== 204 && response.status !== 200) {
      throw new Error('Error eliminando bundle')
    }
  },

  // Búsquedas específicas
  searchBundles: async (query: string): Promise<Bundle[]> => {
    const response = await api.get(
      `/bundles/?query=${encodeURIComponent(query)}`
    )
    if (response.status !== 200) {
      throw new Error('Error buscando bundles')
    }
    return Array.isArray(response.data)
      ? response.data
      : response.data.bundles || []
  },
}
