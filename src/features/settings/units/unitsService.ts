import { api } from '@/api/axiosInstance'
import { Unit, UnitFormValues, UpdateUnitValues } from './types'

const endpoint = '/products/units' as const

export const getUnits = async (): Promise<Unit[]> => {
  try {
    const response = await api.get<Unit[]>(endpoint)
    return response.data
  } catch (error) {
    throw new Error('Error al obtener las unidades')
  }
}

export const createUnit = async (data: UnitFormValues): Promise<Unit> => {
  try {
    const response = await api.post<Unit>(endpoint, data)
    return response.data
  } catch (error: any) {
    if (error.response?.status === 409) {
      throw new Error('Ya existe una unidad con esa abreviación')
    }
    if (error.response?.status === 400) {
      throw new Error('Datos inválidos. Verifica los campos')
    }
    throw new Error('Error al crear la unidad')
  }
}

export const updateUnit = async (
  id: string,
  data: UpdateUnitValues
): Promise<Unit> => {
  try {
    const cleanId = String(id).trim()
    const url = `${endpoint}/${cleanId}`
    
    // Incluir el ID en el body
    const bodyWithId = {
      id: cleanId,
      ...data
    }
    
    const response = await api.put<Unit>(url, bodyWithId)
    return response.data
  } catch (error: any) {
    if (error.response?.status === 404) {
      throw new Error('La unidad no existe')
    }
    if (error.response?.status === 409) {
      throw new Error('Ya existe una unidad con esa abreviación')
    }
    if (error.response?.status === 400) {
      throw new Error('Datos inválidos. Verifica los campos')
    }
    throw new Error('Error al actualizar la unidad')
  }
}

export const deleteUnit = async (id: string): Promise<void> => {
  try {
    const cleanId = String(id).trim()
    const url = `${endpoint}/${cleanId}`
    
    await api.delete(url)
  } catch (error: any) {
    if (error.response?.status === 404) {
      throw new Error('La unidad no existe')
    }
    if (error.response?.status === 409) {
      throw new Error('No se puede eliminar la unidad porque está siendo utilizada')
    }
    throw new Error('Error al eliminar la unidad')
  }
}
