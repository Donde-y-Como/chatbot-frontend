import { api } from '@/api/axiosInstance'
import { Category, CategoryFormValues, UpdateCategoryValues } from './types'

const endpoint = '/products/categories' as const

export const getCategories = async (): Promise<Category[]> => {
  try {
    const response = await api.get<Category[]>(endpoint)
    return response.data
  } catch (error) {
    throw new Error('Error al obtener las categorías')
  }
}

export const getCategoryById = async (id: string): Promise<Category> => {
  try {
    const response = await api.get<Category>(`${endpoint}/${id}`)
    return response.data
  } catch (error: any) {
    if (error.response?.status === 404) {
      throw new Error('La categoría no existe')
    }
    throw new Error('Error al obtener la categoría')
  }
}

export const createCategory = async (data: CategoryFormValues): Promise<Category> => {
  try {
    const response = await api.post<Category>(endpoint, data)
    return response.data
  } catch (error: any) {
    if (error.response?.status === 409) {
      throw new Error('Ya existe una categoría con ese nombre')
    }
    if (error.response?.status === 400) {
      const message = error.response?.data?.message
      if (message?.includes('parentCategoryId')) {
        throw new Error('La categoría padre no existe o no es válida')
      }
      throw new Error('Datos inválidos. Verifica los campos')
    }
    throw new Error('Error al crear la categoría')
  }
}

export const updateCategory = async (
  id: string,
  data: UpdateCategoryValues
): Promise<Category> => {
  try {
    const cleanId = String(id).trim()
    const url = `${endpoint}/${cleanId}`
    
    // Incluir el ID en el body como en units
    const bodyWithId = {
      id: cleanId,
      ...data
    }
    
    const response = await api.put<Category>(url, bodyWithId)
    return response.data
  } catch (error: any) {
    if (error.response?.status === 404) {
      throw new Error('La categoría no existe')
    }
    if (error.response?.status === 409) {
      throw new Error('Ya existe una categoría con ese nombre')
    }
    if (error.response?.status === 400) {
      throw new Error('Datos inválidos. Verifica los campos')
    }
    throw new Error('Error al actualizar la categoría')
  }
}

export const deleteCategory = async (id: string): Promise<void> => {
  try {
    const cleanId = String(id).trim()
    const url = `${endpoint}/${cleanId}`
    
    await api.delete(url)
  } catch (error: any) {
    if (error.response?.status === 404) {
      throw new Error('La categoría no existe')
    }
    if (error.response?.status === 409) {
      throw new Error('No se puede eliminar la categoría porque tiene subcategorías o productos asociados')
    }
    throw new Error('Error al eliminar la categoría')
  }
}
