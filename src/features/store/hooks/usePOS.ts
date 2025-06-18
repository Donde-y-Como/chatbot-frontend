import { useGetPOSProducts } from './useGetPOSProducts'
import { useGetPOSServices } from './useGetPOSServices'
import { useGetPOSEvents } from './useGetPOSEvents'
import { useGetPOSAuxiliaryData } from './useGetPOSAuxiliaryData'
import { usePOSCart } from './usePOSCart'
import { usePOSFilters } from './usePOSFilters'

/**
 * Hook principal del POS que combina todas las funcionalidades
 * Proporciona una API unificada para manejar productos, servicios, eventos, carrito y filtros
 */
export function usePOS() {
  // Obtener datos
  const productsQuery = useGetPOSProducts()
  const servicesQuery = useGetPOSServices()
  const eventsQuery = useGetPOSEvents()
  const auxiliaryDataQuery = useGetPOSAuxiliaryData()

  // Datos procesados
  const products = productsQuery.data || []
  const services = servicesQuery.data || []
  const events = eventsQuery.data || []
  const auxiliaryData = auxiliaryDataQuery.data

  // Estado de carga
  const isLoading = productsQuery.isLoading || 
                   servicesQuery.isLoading || 
                   eventsQuery.isLoading || 
                   auxiliaryDataQuery.isLoading

  // Errores
  const error = productsQuery.error || 
               servicesQuery.error || 
               eventsQuery.error || 
               auxiliaryDataQuery.error

  // Hooks de funcionalidad
  const cart = usePOSCart()
  const filtersHook = usePOSFilters({ products, services, events })

  // Función para refrescar todos los datos
  const refetchAll = () => {
    productsQuery.refetch()
    servicesQuery.refetch()
    eventsQuery.refetch()
    auxiliaryDataQuery.refetch()
  }

  return {
    // Datos
    products,
    services,
    events,
    auxiliaryData,
    
    // Estados de carga y error
    isLoading,
    error,
    
    // Funcionalidad del carrito
    cart,
    
    // Funcionalidad de filtros
    filters: filtersHook.filters,
    filteredItems: filtersHook.filteredItems,
    filterStats: filtersHook.filterStats,
    
    // Acciones de filtros
    updateFilters: filtersHook.updateFilters,
    resetFilters: filtersHook.resetFilters,
    setCategory: filtersHook.setCategory,
    setSearch: filtersHook.setSearch,
    toggleFiltersActive: filtersHook.toggleFiltersActive,
    
    // Acciones generales
    refetchAll
  }
}