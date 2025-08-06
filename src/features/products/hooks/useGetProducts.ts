import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ProductApiService } from '../ProductApiService';
import { ProductFilters } from '../types';
import { useEffect } from 'react';
import { socket } from '@/hooks/use-web-socket';

export const useGetProducts = (filters?: ProductFilters) => {
  const queryClient = useQueryClient();
  
  const query = useQuery({
    queryKey: ['products', filters],
    queryFn: () => ProductApiService.getAllProducts(filters),
    staleTime: 1000 * 60 * 5, // 5 minutos
  });

  useEffect(() => {
    const handleProductStockUpdated = (data: { updatedProducts: Array<{productId: string, newStock: number}> }) => {
      console.log('Stock de productos actualizado - Refrescando lista...', data.updatedProducts);
      
      data.updatedProducts.forEach(({ productId, newStock }) => {
        queryClient.setQueryData(['product', productId], (oldProduct: any) => {
          if (oldProduct) {
            return {
              ...oldProduct,
              stock: newStock
            }
          }
          return oldProduct
        })
      })
      
      queryClient.invalidateQueries({
        queryKey: ['products']
      })
    }

    socket.on('productStockUpdated', handleProductStockUpdated)

    return () => {
      socket.off('productStockUpdated', handleProductStockUpdated)
    }
  }, [queryClient])

  return query;
};

export const useGetProduct = (productId: string) => {
  const queryClient = useQueryClient();
  
  const query = useQuery({
    queryKey: ['product', productId],
    queryFn: () => ProductApiService.getProductById(productId),
    enabled: !!productId,
  });

  useEffect(() => {
    const handleProductStockUpdated = (data: { updatedProducts: Array<{productId: string, newStock: number}> }) => {
      const updatedProduct = data.updatedProducts.find(p => p.productId === productId);
      if (updatedProduct) {
        console.log(`Stock actualizado para producto ${productId}: ${updatedProduct.newStock}`);
        queryClient.invalidateQueries({
          queryKey: ['product', productId]
        });
      }
    }

    socket.on('productStockUpdated', handleProductStockUpdated)

    return () => {
      socket.off('productStockUpdated', handleProductStockUpdated)
    }
  }, [queryClient, productId])

  return query;
};

export const useGetLowStockProducts = () => {
  const queryClient = useQueryClient();
  
  const query = useQuery({
    queryKey: ['products', 'low-stock'],
    queryFn: () => ProductApiService.getLowStockProducts(),
    staleTime: 1000 * 60 * 2, // 2 minutos para productos con bajo stock
  });

  useEffect(() => {
    const handleProductStockUpdated = () => {
      console.log('Stock actualizado - Refrescando productos con bajo stock...');
      queryClient.invalidateQueries({
        queryKey: ['products', 'low-stock']
      });
    }

    socket.on('productStockUpdated', handleProductStockUpdated)

    return () => {
      socket.off('productStockUpdated', handleProductStockUpdated)
    }
  }, [queryClient])

  return query;
};

export const useSearchProducts = (query: string) => {
  return useQuery({
    queryKey: ['products', 'search', query],
    queryFn: () => ProductApiService.searchProducts(query),
    enabled: !!query && query.length > 2, // Solo buscar si hay al menos 3 caracteres
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
};
