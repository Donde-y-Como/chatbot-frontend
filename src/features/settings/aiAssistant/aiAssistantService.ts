import { api } from '@/api/axiosInstance'
import {
  AIAssistantConfig,
  AIAssistantResponse,
  CreateAIAssistantData,
  CreateAIAssistantResponse,
  UpdateAIAssistantData,
} from './types'

export const aiAssistantService = {
  // Get AI Assistant configuration for the current business
  getConfiguration: async (): Promise<AIAssistantConfig | null> => {
    try {
      const response = await api.get<AIAssistantResponse>('/ai-assistants')
      if (response.data.success && response.data.data) {
        return response.data.data
      }
      return null
    } catch (error: any) {
      // If 404 (no configuration exists), return null instead of throwing
      if (error.response?.status === 404) {
        return null
      }
      throw error
    }
  },

  // Create AI Assistant configuration
  createConfiguration: async (
    data: CreateAIAssistantData
  ): Promise<CreateAIAssistantResponse> => {
    const response = await api.post<CreateAIAssistantResponse>(
      '/ai-assistants',
      data
    )
    return response.data
  },

  // Update AI Assistant configuration
  updateConfiguration: async (
    data: UpdateAIAssistantData
  ): Promise<CreateAIAssistantResponse> => {
    const response = await api.put<CreateAIAssistantResponse>(
      '/ai-assistants',
      data
    )
    return response.data
  },

  // Delete AI Assistant configuration
  deleteConfiguration: async (): Promise<{ message: string }> => {
    const response = await api.delete<{ message: string }>('/ai-assistants')
    return response.data
  },
}