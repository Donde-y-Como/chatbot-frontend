// Intent prompt configuration
export interface IntentPrompt {
  intentName: string
  prompt: string
  priority: number
  enabled: boolean
}

// AI Assistant configuration data
export interface AIAssistantConfig {
  id?: string
  businessId?: string
  basePrompt: string
  contextPrompt: string
  quickReplyPrompt: string
  assistantId: string
  intentPrompts?: IntentPrompt[]
  createdAt?: string
  updatedAt?: string
}

// Create AI Assistant request data
export interface CreateAIAssistantData {
  basePrompt: string
  contextPrompt: string
  quickReplyPrompt: string
  assistantId: string
  intentPrompts?: IntentPrompt[]
}

// Update AI Assistant request data
export interface UpdateAIAssistantData {
  basePrompt?: string
  contextPrompt?: string
  quickReplyPrompt?: string
  assistantId?: string
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