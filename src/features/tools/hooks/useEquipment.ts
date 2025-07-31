import { useState, useEffect } from 'react';
import { Equipment, CreateEquipmentData, UpdateEquipmentData } from '../types';
import { EquipmentService } from '../services/equipmentApiService';

export const useEquipment = () => {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEquipment = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await EquipmentService.getAll();
      setEquipment(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error fetching equipment';
      console.error('Fetch equipment error:', err);
      setError(errorMessage);
      
      setTimeout(() => setError(null), 5000);
    } finally {
      setLoading(false);
    }
  };

  const createEquipment = async (data: CreateEquipmentData): Promise<Equipment | null> => {
    try {
      setError(null);
      const newEquipment = await EquipmentService.create(data);
      
      setEquipment(prev => [...prev, newEquipment]);
      
      return newEquipment;
    } catch (err) {
      console.error('Create equipment error:', err);
      setError(err instanceof Error ? err.message : 'Error creating equipment');
      return null;
    }
  };

  const updateEquipment = async (id: string, data: UpdateEquipmentData): Promise<Equipment | null> => {
    try {
      setError(null);
      const updatedEquipment = await EquipmentService.update(id, data);
      
      setEquipment(prev => prev.map(eq => eq.id === id ? updatedEquipment : eq));
      
      return updatedEquipment;
    } catch (err) {
      console.error('Update equipment error:', err);
      setError(err instanceof Error ? err.message : 'Error updating equipment');
      return null;
    }
  };

  const deleteEquipment = async (id: string): Promise<boolean> => {
    try {
      setError(null);
      await EquipmentService.delete(id);
      
      setEquipment(prev => prev.filter(eq => eq.id !== id));
      
      return true;
    } catch (err) {
      console.error('Delete equipment error:', err);
      setError(err instanceof Error ? err.message : 'Error deleting equipment');
      return false;
    }
  };

  useEffect(() => {
    fetchEquipment();
  }, []);

  return {
    equipment,
    loading,
    error,
    createEquipment,
    updateEquipment,
    deleteEquipment,
    refetch: fetchEquipment
  };
};
