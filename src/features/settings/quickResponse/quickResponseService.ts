import { api } from '@/api/axiosInstance'
import { QuickResponse, QuickResponseFormValues } from './types'

const endpoint = '/replies' as const

export const getQuickResponses = async (): Promise<QuickResponse[]> => {
  try {
    const response = await api.get<QuickResponse[]>(endpoint)
    return response.data
  } catch (error) {
    return []
  }
}

export const createQuickResponse = async (
  data: QuickResponseFormValues
): Promise<boolean> => {
  try {
    await api.post(endpoint, data)
    return true
  } catch (error) {
    return false
  }
}

export const updateQuickResponse = async (
  id: string,
  data: Partial<QuickResponse>
): Promise<boolean> => {
  try {
    await api.put<QuickResponse>(`${endpoint}/${id}`, data)
    return true
  } catch (error) {
    return false
  }
}

export const deleteQuickResponse = async (id: string): Promise<boolean> => {
  try {
    await api.delete(`${endpoint}/${id}`)
    return true
  } catch (error) {
    return false
  }
}
