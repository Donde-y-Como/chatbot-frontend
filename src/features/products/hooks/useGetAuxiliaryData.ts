import { useQuery } from '@tanstack/react-query';
import { ProductApiService } from '../ProductApiService';

export const useGetUnits = () => {
  return useQuery({
    queryKey: ['products', 'units'],
    queryFn: () => ProductApiService.getUnits(),
    staleTime: 1000 * 60 * 30, // 30 minutos - las unidades cambian pocas veces
  });
};

export const useGetCategories = () => {
  return useQuery({
    queryKey: ['products', 'categories'],
    queryFn: () => ProductApiService.getCategories(),
    staleTime: 1000 * 60 * 30, // 30 minutos
  });
};

export const useGetProductTags = () => {
  return useQuery({
    queryKey: ['products', 'tags'],
    queryFn: () => ProductApiService.getProductTags(),
    initialData: []
  });
};
