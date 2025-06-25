import { useGetPOSProducts } from './useGetPOSProducts'
import { useGetPOSServices } from './useGetPOSServices'
import { useGetPOSEvents } from './useGetPOSEvents'
import { useGetPOSBundles } from './useGetPOSBundles'
import { useGetPOSAuxiliaryData } from './useGetPOSAuxiliaryData'
import { usePOSCart } from './usePOSCart'
import { usePOSFilters } from './usePOSFilters'

export function usePOS() {
  const cart = usePOSCart()
  
  // Hook de filtros (inicializamos primero para obtener el estado actual)
  const filtersHook = usePOSFilters({ products: [], services: [], events: [], bundles: [] })
  
  // Determinar si aplicar filtros al backend
  const shouldApplyFilters = filtersHook.filters.isActive
  const backendFilters = shouldApplyFilters ? filtersHook.filters : undefined

  // Obtener datos con filtros si están activos
  const productsQuery = useGetPOSProducts(backendFilters)
  const servicesQuery = useGetPOSServices(backendFilters)
  const eventsQuery = useGetPOSEvents(backendFilters)
  const bundlesQuery = useGetPOSBundles(backendFilters)
  const auxiliaryDataQuery = useGetPOSAuxiliaryData()

  // Datos procesados
  const products = productsQuery.data || []
  const services = servicesQuery.data || []
  const events = eventsQuery.data || []
  const bundles = bundlesQuery.data || []
  const auxiliaryData = auxiliaryDataQuery.data

  // Estado de carga (incluir loading del carrito)
  const isLoading = productsQuery.isLoading || 
                   servicesQuery.isLoading || 
                   eventsQuery.isLoading || 
                   bundlesQuery.isLoading ||
                   auxiliaryDataQuery.isLoading ||
                   cart.isLoading

  // Errores
  const error = productsQuery.error || 
               servicesQuery.error || 
               eventsQuery.error || 
               bundlesQuery.error ||
               auxiliaryDataQuery.error

  // Hooks de funcionalidad - usar el carrito ya inicializado
  
  // Actualizar los datos del hook de filtros con los datos reales
  const filtersWithData = usePOSFilters({ products, services, events, bundles })

  // Función para refrescar todos los datos
  const refetchAll = () => {
    productsQuery.refetch()
    servicesQuery.refetch()
    eventsQuery.refetch()
    bundlesQuery.refetch()
    auxiliaryDataQuery.refetch()
    cart.refreshCart() 
  }

  return {
    // Datos
    products,
    services,
    events,
    bundles,
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