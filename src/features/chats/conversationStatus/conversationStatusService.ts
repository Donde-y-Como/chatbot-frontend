import { api } from '@/api/axiosInstance'
import {
  ConversationStatus,
  ConversationStatusFormValues,
  UpdateConversationStatusValues,
} from './types'

const endpoint = '/conversation-status' as const

export const getConversationStatuses = async (): Promise<ConversationStatus[]> => {
  try {
    const response = await api.get<ConversationStatus[]>(endpoint)
    return response.data
  } catch (error) {
    throw new Error('Error al obtener los estados de conversación')
  }
}

export const getConversationStatusById = async (id: string): Promise<ConversationStatus> => {
  try {
    const response = await api.get<ConversationStatus>(`${endpoint}/${id}`)
    return response.data
  } catch (error: any) {
    if (error.response?.status === 404) {
      throw new Error('El estado de conversación no existe')
    }
    throw new Error('Error al obtener el estado de conversación')
  }
}

export const createConversationStatus = async (
  data: ConversationStatusFormValues
): Promise<ConversationStatus> => {
  try {
    const response = await api.post<ConversationStatus>(endpoint, data)
    return response.data
  } catch (error: any) {
    if (error.response?.status === 409) {
      throw new Error('Ya existe un estado de conversación con ese nombre')
    }
    if (error.response?.status === 400) {
      throw new Error('Datos inválidos. Verifica los campos')
    }
    throw new Error('Error al crear el estado de conversación')
  }
}

export const updateConversationStatus = async (
  id: string,
  data: UpdateConversationStatusValues
): Promise<ConversationStatus> => {
  try {
    const cleanId = String(id).trim()
    const url = `${endpoint}/${cleanId}`

    const bodyWithId = {
      id: cleanId,
      ...data,
    }

    const response = await api.put<ConversationStatus>(url, bodyWithId)
    return response.data
  } catch (error: any) {
    if (error.response?.status === 404) {
      throw new Error('El estado de conversación no existe')
    }
    if (error.response?.status === 409) {
      throw new Error('Ya existe un estado de conversación con ese nombre')
    }
    if (error.response?.status === 400) {
      throw new Error('Datos inválidos. Verifica los campos')
    }
    throw new Error('Error al actualizar el estado de conversación')
  }
}

export const deleteConversationStatus = async (id: string): Promise<void> => {
  try {
    const cleanId = String(id).trim()
    const url = `${endpoint}/${cleanId}`

    await api.delete(url)
  } catch (error: any) {
    if (error.response?.status === 404) {
      throw new Error('El estado de conversación no existe')
    }
    if (error.response?.status === 409) {
      throw new Error(
        'No se puede eliminar el estado porque está siendo utilizado por conversaciones'
      )
    }
    throw new Error('Error al eliminar el estado de conversación')
  }
}
