import { useQuery } from '@tanstack/react-query';
import { BundleApiService } from '../BundleApiService';
import { BundleFilters } from '../types';

export const useGetBundles = (filters?: BundleFilters) => {
  return useQuery({
    queryKey: ['bundles', filters],
    queryFn: () => BundleApiService.getAllBundles(filters),
    staleTime: 5 * 60 * 1000, // 5 minutos
    initialData: []
  });
};