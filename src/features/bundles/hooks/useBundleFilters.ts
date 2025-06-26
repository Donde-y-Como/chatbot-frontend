import { useState, useMemo } from 'react';
import { BundleFilters } from '../types';

export const useBundleFilters = () => {
  const [filters, setFilters] = useState<BundleFilters>({});

  const updateFilter = (key: keyof BundleFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const clearFilters = () => {
    setFilters({});
  };

  const hasActiveFilters = useMemo(() => {
    return Object.values(filters).some(value => 
      Array.isArray(value) ? value.length > 0 : Boolean(value)
    );
  }, [filters]);

  return {
    filters,
    setFilters,
    updateFilter,
    clearFilters,
    hasActiveFilters,
  };
};