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
    const response = await api.put<Consumable>(`/consumables/${id}`, data);
    if (response.status !== 200) {
      throw new Error('Error updating consumable');
    }
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    const response = await api.delete(`/consumables/${id}`);
    if (response.status !== 200) {
      throw new Error('Error deleting consumable');
    }
  },
};
