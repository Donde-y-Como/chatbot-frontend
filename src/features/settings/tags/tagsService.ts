import { api } from '@/api/axiosInstance'
import { Tag, TagFormValues, SimpleTagFormValues, UpdateTagValues } from './types'

const endpoint = '/products/productTags' as const

export const getTags = async (): Promise<Tag[]> => {
  try {
    const response = await api.get<Tag[]>(endpoint)
    return response.data
  } catch (error) {
    throw new Error('Error al obtener las etiquetas')
  }
}

export const getTagById = async (id: string): Promise<Tag> => {
  try {
    const response = await api.get<Tag>(`${endpoint}/${id}`)
    return response.data
  } catch (error: any) {
    if (error.response?.status === 404) {
      throw new Error('La etiqueta no existe')
    }
    throw new Error('Error al obtener la etiqueta')
  }
}

export const createTag = async (data: TagFormValues | SimpleTagFormValues): Promise<Tag> => {
  try {
    const response = await api.post<Tag>(endpoint, data)
    return response.data
  } catch (error: any) {
    if (error.response?.status === 409) {
      throw new Error('Ya existe una etiqueta con ese nombre')
    }
    if (error.response?.status === 400) {
      throw new Error('Datos inválidos. Verifica los campos')
    }
    throw new Error('Error al crear la etiqueta')
  }
}

export const updateTag = async (
  id: string,
  data: UpdateTagValues
): Promise<Tag> => {
  try {
    const cleanId = String(id).trim()
    const url = `${endpoint}/${cleanId}`
    
    // Incluir el ID en el body como en units y categories
    const bodyWithId = {
      id: cleanId,
      ...data
    }
    
    const response = await api.put<Tag>(url, bodyWithId)
    return response.data
  } catch (error: any) {
    if (error.response?.status === 404) {
      throw new Error('La etiqueta no existe')
    }
    if (error.response?.status === 409) {
      throw new Error('Ya existe una etiqueta con ese nombre')
    }
    if (error.response?.status === 400) {
      throw new Error('Datos inválidos. Verifica los campos')
    }
    throw new Error('Error al actualizar la etiqueta')
  }
}

export const deleteTag = async (id: string): Promise<void> => {
  try {
    const cleanId = String(id).trim()
    const url = `${endpoint}/${cleanId}`
    
    await api.delete(url)
  } catch (error: any) {
    if (error.response?.status === 404) {
      throw new Error('La etiqueta no existe')
    }
    if (error.response?.status === 409) {
      throw new Error('No se puede eliminar la etiqueta porque está siendo utilizada por productos')
    }
    throw new Error('Error al eliminar la etiqueta')
  }
}
