import { useState, useCallback } from 'react';
import { ProductFilters } from '../types';

export const useProductFilters = () => {
  const [filters, setFilters] = useState<ProductFilters>({});

  // Aplicar filtros
  const applyFilters = useCallback((newFilters: ProductFilters) => {
    setFilters(newFilters);
  }, []);

  // Limpiar todos los filtros
  const clearAllFilters = useCallback(() => {
    const clearedFilters: ProductFilters = {};
    setFilters(clearedFilters);
  }, []);

  // Actualizar un filtro específico
  const updateFilter = useCallback((key: keyof ProductFilters, value: any) => {
    const newFilters = { ...filters };
    if (value === undefined || value === null || (Array.isArray(value) && value.length === 0)) {
      delete newFilters[key];
    } else {
      (newFilters as any)[key] = value;
    }
    setFilters(newFilters);
  }, [filters]);

  // Alternar un valor en un filtro de array
  const toggleArrayFilter = useCallback((
    key: 'categoryIds' | 'subcategoryIds' | 'tagIds' | 'unitIds',
    value: string
  ) => {
    const currentArray = filters[key] || [];
    const newArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value];
    
    updateFilter(key, newArray.length > 0 ? newArray : undefined);
  }, [filters, updateFilter]);

  // Contar filtros activos
  const activeFiltersCount = Object.values(filters).filter(value => {
    if (Array.isArray(value)) return value.length > 0;
    return Boolean(value);
  }).length;

  // Verificar si hay filtros aplicados
  const hasActiveFilters = activeFiltersCount > 0;

  return {
    filters,
    activeFiltersCount,
    hasActiveFilters,
    applyFilters,
    clearAllFilters,
    updateFilter,
    toggleArrayFilter,
  };
};
