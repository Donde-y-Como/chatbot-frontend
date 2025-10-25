import { api } from '@/api/axiosInstance'
import { MessageTemplate, MessageTemplateFormValues, UpdateMessageTemplateValues } from './types'

const endpoint = '/message-templates' as const

export const getMessageTemplates = async (): Promise<MessageTemplate[]> => {
  try {
    const response = await api.get<MessageTemplate[]>(endpoint)
    return response.data
  } catch (error) {
    throw new Error('Error al obtener las plantillas de mensajes')
  }
}

export const getMessageTemplateById = async (id: string): Promise<MessageTemplate> => {
  try {
    const response = await api.get<MessageTemplate>(`${endpoint}/${id}`)
    return response.data
  } catch (error: any) {
    if (error.response?.status === 404) {
      throw new Error('La plantilla no existe')
    }
    throw new Error('Error al obtener la plantilla')
  }
}

export const createMessageTemplate = async (data: MessageTemplateFormValues): Promise<MessageTemplate> => {
  try {
    const response = await api.post<MessageTemplate>(endpoint, data)
    return response.data
  } catch (error: any) {
    if (error.response?.status === 409) {
      throw new Error('Ya existe una plantilla activa para este tipo de evento. Desactiva o actualiza la existente.')
    }
    if (error.response?.status === 400) {
      throw new Error('Datos inválidos. Verifica los campos')
    }
    throw new Error('Error al crear la plantilla')
  }
}

export const updateMessageTemplate = async (
  id: string,
  data: UpdateMessageTemplateValues
): Promise<MessageTemplate> => {
  try {
    const cleanId = String(id).trim()
    const url = `${endpoint}/${cleanId}`

    const response = await api.put<MessageTemplate>(url, data)
    return response.data
  } catch (error: any) {
    if (error.response?.status === 404) {
      throw new Error('La plantilla no existe')
    }
    if (error.response?.status === 403) {
      throw new Error('No tienes autorización para actualizar esta plantilla')
    }
    if (error.response?.status === 400) {
      throw new Error('Datos inválidos. Verifica los campos')
    }
    throw new Error('Error al actualizar la plantilla')
  }
}

export const deleteMessageTemplate = async (id: string): Promise<void> => {
  try {
    const cleanId = String(id).trim()
    const url = `${endpoint}/${cleanId}`

    await api.delete(url)
  } catch (error: any) {
    if (error.response?.status === 404) {
      throw new Error('La plantilla no existe')
    }
    if (error.response?.status === 403) {
      throw new Error('No tienes autorización para eliminar esta plantilla')
    }
    throw new Error('Error al eliminar la plantilla')
  }
}
