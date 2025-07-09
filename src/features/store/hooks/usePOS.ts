import { useGetServices } from '@/features/appointments/hooks/useGetServices.ts'
import { useGetBundles } from '@/features/bundles/hooks/useGetBundles.ts'
import { useGetEvents } from '@/features/events/hooks/useGetEvents.ts'
import { useGetProducts } from '@/features/products/hooks/useGetProducts.ts'
import { useGetPOSAuxiliaryData } from '@/features/store/hooks/useGetPOSAuxiliaryData.tsx'
import { useCart } from './useCart.ts'
import { usePOSFilters } from './usePOSFilters'

export function usePOS() {
  const cart = useCart()

  // Hook de filtros (inicializamos primero para obtener el estado actual)
  const filtersHook = usePOSFilters({
    products: [],
    services: [],
    events: [],
    bundles: [],
  })

  // Determinar si aplicar filtros al backend
  const shouldApplyFilters = filtersHook.filters.isActive
  const backendFilters = shouldApplyFilters ? filtersHook.filters : undefined

  // Obtener datos con filtros si están activos
  const productsQuery = useGetProducts(backendFilters)
  const servicesQuery = useGetServices()
  const eventsQuery = useGetEvents()
  const bundlesQuery = useGetBundles(backendFilters)
  const auxiliaryDataQuery = useGetPOSAuxiliaryData()

  // Datos procesados
  const products = productsQuery.data?.products || []
  const services = servicesQuery.data || []
  const events = eventsQuery.data || []
  const bundles = bundlesQuery.data || []
  const auxiliaryData = auxiliaryDataQuery.data

  // Estado de carga (incluir loading del carrito)
  const isLoading =
    productsQuery.isLoading ||
    servicesQuery.isLoading ||
    eventsQuery.isLoading ||
    bundlesQuery.isLoading ||
    auxiliaryDataQuery.isLoading ||
    cart.isLoading

  // Errores
  const error =
    productsQuery.error ||
    servicesQuery.error ||
    eventsQuery.error ||
    bundlesQuery.error ||
    auxiliaryDataQuery.error

  // Hooks de funcionalidad - usar el carrito ya inicializado

  // Actualizar los datos del hook de filtros con los datos reales
  const filtersWithData = usePOSFilters({ products, services, events, bundles })

  // Función para refrescar todos los datos
  const refetchAll = () => {
    void productsQuery.refetch()
    void servicesQuery.refetch()
    void eventsQuery.refetch()
    void bundlesQuery.refetch()
    void auxiliaryDataQuery.refetch()
    void cart.getCart()
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
    refetchAll,
  }
}
