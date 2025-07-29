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
    const response = await api.put<Equipment>(`/equipment/${id}`, data);
    if (response.status !== 200) {
      throw new Error('Error updating equipment');
    }
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    const response = await api.delete(`/equipment/${id}`);
    if (response.status !== 200) {
      throw new Error('Error deleting equipment');
    }
  },
};
