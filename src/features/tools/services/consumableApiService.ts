import { api } from "../../../api/axiosInstance";
import { Consumable, CreateConsumableData, UpdateConsumableData } from '../types';

export const ConsumableService = {
  getAll: async (): Promise<Consumable[]> => {
    const response = await api.get<Consumable[]>('/consumables');
    return response.data;
  },

  getById: async (id: string): Promise<Consumable> => {
    const response = await api.get<Consumable>(`/consumables/${id}`);
    return response.data;
  },

  create: async (data: CreateConsumableData): Promise<Consumable> => {
    const response = await api.post<Consumable>('/consumables', data);
    if (response.status !== 201) {
      throw new Error('Error creating consumable');
    }
    return response.data;
  },

  update: async (id: string, data: UpdateConsumableData): Promise<Consumable> => {
    // Filtrar campos undefined/null antes de enviar
    const cleanData = Object.fromEntries(
      Object.entries(data).filter(([_, value]) => value !== undefined && value !== null && value !== '')
    );
    
    const response = await api.put<Consumable>(`/consumables/${id}`, cleanData);
    if (response.status !== 200 && response.status !== 201) {
      throw new Error('Error updating consumable');
    }
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    try {
      const response = await api.delete(`/consumables/${id}`);
      if (response.status !== 200 && response.status !== 201 && response.status !== 204) {
        throw new Error('Error deleting consumable');
      }
    } catch (error) {
      console.error('Consumable delete error:', error);
      throw error;
    }
  },
};
