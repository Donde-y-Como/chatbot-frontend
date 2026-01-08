// Intent prompt configuration
import { AvailableToolId } from '@/features/settings/aiAssistant/available-tools.ts'

export interface IntentPrompt {
  intentName: string
  prompt: string
  priority: number
  enabled: boolean
  tools: AvailableToolId[]
}

// AI Assistant configuration data
export interface AIAssistantConfig {
  id?: string
  businessId?: string
  basePrompt: string
  contextPrompt: string
  quickReplyPrompt: string
  intentPrompts?: IntentPrompt[]
  createdAt?: string
  updatedAt?: string
}

// Create AI Assistant request data
export interface CreateAIAssistantData {
  basePrompt: string
  contextPrompt: string
  quickReplyPrompt: string
  intentPrompts?: IntentPrompt[]
}

// Update AI Assistant request data
export interface UpdateAIAssistantData {
  basePrompt?: string
  contextPrompt?: string
  quickReplyPrompt?: string
  intentPrompts?: IntentPrompt[]
}

// API response types
export interface AIAssistantResponse {
  success: boolean
  data?: AIAssistantConfig
  message?: string
}

export interface CreateAIAssistantResponse {
  message: string
  success: boolean
}

export interface ErrorResponse {
  success: false
  status: number
  title: string
  detail: string
}
