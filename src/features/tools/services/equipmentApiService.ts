import { api } from "../../../api/axiosInstance";
import { Equipment, CreateEquipmentData, UpdateEquipmentData } from '../types';

export const EquipmentService = {
  getAll: async (): Promise<Equipment[]> => {
    const response = await api.get<Equipment[]>('/equipment');
    return response.data;
  },

  getById: async (id: string): Promise<Equipment> => {
    const response = await api.get<Equipment>(`/equipment/${id}`);
    return response.data;
  },

  create: async (data: CreateEquipmentData): Promise<Equipment> => {
    const response = await api.post<Equipment>('/equipment', data);
    if (response.status !== 201) {
      throw new Error('Error creating equipment');
    }
    return response.data;
  },

  update: async (id: string, data: UpdateEquipmentData): Promise<Equipment> => {
    try {
      // Filtrar campos undefined/null antes de enviar
      const cleanData = Object.fromEntries(
        Object.entries(data).filter(([_, value]) => value !== undefined && value !== null && value !== '')
      );
      
      const response = await api.put<Equipment>(`/equipment/${id}`, cleanData);
      if (response.status !== 200 && response.status !== 201) {
        throw new Error('Error updating equipment');
      }
      return response.data;
    } catch (error) {
      console.error('Equipment update error:', error);
      throw error;
    }
  },

  delete: async (id: string): Promise<void> => {
    try {
      const response = await api.delete(`/equipment/${id}`);
      if (response.status !== 200 && response.status !== 201 && response.status !== 204) {
        throw new Error('Error deleting equipment');
      }
    } catch (error) {
      console.error('Equipment delete error:', error);
      throw error;
    }
  },
};
