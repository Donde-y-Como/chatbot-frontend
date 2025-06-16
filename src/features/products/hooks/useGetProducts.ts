import { useQuery } from '@tanstack/react-query';
import { ProductApiService } from '../ProductApiService';
import { ProductFilters } from '../types';

export const useGetProducts = (filters?: ProductFilters) => {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: () => ProductApiService.getAllProducts(filters),
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
};

export const useGetProduct = (productId: string) => {
  return useQuery({
    queryKey: ['product', productId],
    queryFn: () => ProductApiService.getProductById(productId),
    enabled: !!productId,
  });
};

export const useGetLowStockProducts = () => {
  return useQuery({
    queryKey: ['products', 'low-stock'],
    queryFn: () => ProductApiService.getLowStockProducts(),
    staleTime: 1000 * 60 * 2, // 2 minutos para productos con bajo stock
  });
};

export const useSearchProducts = (query: string) => {
  return useQuery({
    queryKey: ['products', 'search', query],
    queryFn: () => ProductApiService.searchProducts(query),
    enabled: !!query && query.length > 2, // Solo buscar si hay al menos 3 caracteres
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
};
