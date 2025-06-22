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
  // Hook de filtros (inicializamos primero para obtener el estado actual)
  const filtersHook = usePOSFilters({ products: [], services: [], events: [] })
  
  // Determinar si aplicar filtros al backend
  const shouldApplyFilters = filtersHook.filters.isActive
  const backendFilters = shouldApplyFilters ? filtersHook.filters : undefined

  // Obtener datos con filtros si están activos
  const productsQuery = useGetPOSProducts(backendFilters)
  const servicesQuery = useGetPOSServices(backendFilters)
  const eventsQuery = useGetPOSEvents(backendFilters)
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
  
  // Actualizar los datos del hook de filtros con los datos reales
  const filtersWithData = usePOSFilters({ products, services, events })

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
    filters: filtersWithData.filters,
    filteredItems: filtersWithData.filteredItems,
    filterStats: filtersWithData.filterStats,
    
    // Acciones de filtros
    updateFilters: filtersWithData.updateFilters,
    resetFilters: filtersWithData.resetFilters,
    setCategory: filtersWithData.setCategory,
    setSearch: filtersWithData.setSearch,
    toggleFiltersActive: filtersWithData.toggleFiltersActive,
    
    // Acciones generales
    refetchAll
  }
}