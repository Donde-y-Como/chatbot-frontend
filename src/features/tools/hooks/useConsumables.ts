import { useState, useEffect } from 'react';
import { Consumable, CreateConsumableData, UpdateConsumableData } from '../types';
import { ConsumableService } from '../services/consumableApiService';

export const useConsumables = () => {
  const [consumables, setConsumables] = useState<Consumable[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchConsumables = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await ConsumableService.getAll();
      setConsumables(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching consumables');
    } finally {
      setLoading(false);
    }
  };

  const createConsumable = async (data: CreateConsumableData): Promise<Consumable | null> => {
    try {
      setError(null);
      const newConsumable = await ConsumableService.create(data);
      
      await fetchConsumables();
      
      return newConsumable;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error creating consumable');
      return null;
    }
  };

  const updateConsumable = async (id: string, data: UpdateConsumableData): Promise<Consumable | null> => {
    try {
      setError(null);
      const updatedConsumable = await ConsumableService.update(id, data);
      
      await fetchConsumables();
      
      return updatedConsumable;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error updating consumable');
      return null;
    }
  };

  const deleteConsumable = async (id: string): Promise<boolean> => {
    try {
      setError(null);
      await ConsumableService.delete(id);
      
      await fetchConsumables();
      
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error deleting consumable');
      return false;
    }
  };

  useEffect(() => {
    fetchConsumables();
  }, []);

  return {
    consumables,
    loading,
    error,
    createConsumable,
    updateConsumable,
    deleteConsumable,
    refetch: fetchConsumables
  };
};
