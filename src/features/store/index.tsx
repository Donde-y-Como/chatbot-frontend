import React, { useEffect, useState } from 'react'
import { Menu, X } from 'lucide-react'
import { POSError } from '@/features/store/components/POSError.tsx'
import { POSLoading } from '@/features/store/components/POSLoading.tsx'
import { Button } from '../../components/ui/button'
import { useEventMutations } from '../events/hooks/useEventMutations'
import { AdvancedFilters } from './components/AdvancedFilters'
import { Cart } from './components/Cart'
import { CategoryTabs } from './components/CategoryTabs'
import { FilterButton } from './components/FilterButton'
import { ItemGrid } from './components/ItemGrid'
import { SearchBar } from './components/SearchBar'
import { usePOS } from './hooks/usePOS'

export default function Store() {
  const [isAdvancedFiltersOpen, setIsAdvancedFiltersOpen] = useState(false)
  const [, setIsQuickAppointmentOpen] = useState(false)
  const [, setIsEventBookingOpen] = useState(false)
  const [, setPendingItemForDialog] = useState<any>(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Hook principal del POS
  const {
    // Datos
    auxiliaryData,

    // Estados
    isLoading,
    error,

    // Carrito
    cart,

    // Filtros
    filters,
    filteredItems,
    filterStats,
    updateFilters,
    resetFilters,
    setCategory,
    setSearch,
    toggleFiltersActive,

    // Acciones
    refetchAll,
  } = usePOS()

  const { bookEvent } = useEventMutations()

  // Inicializar POS al montar el componente
  useEffect(() => {
    cart.initializePOS()
  }, [cart.initializePOS])

  // Detectar scroll para cerrar menú móvil automáticamente
  useEffect(() => {
    const handleScroll = () => {
      if (isMobileMenuOpen) {
        setIsMobileMenuOpen(false)
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [isMobileMenuOpen])

  // Manejar carga
  if (isLoading) {
    return <POSLoading />
  }

  // Manejar error
  if (error) {
    return <POSError error={error} onRetry={refetchAll} />
  }

  // Manejar filtros avanzados
  const handleFilterButtonClick = () => {
    setIsAdvancedFiltersOpen(true)
    setIsMobileMenuOpen(false)
  }

  const handleAdvancedFiltersClose = () => {
    setIsAdvancedFiltersOpen(false)
  }

  const handleFiltersApply = (newFilters: Partial<typeof filters>) => {
    updateFilters(newFilters)
  }

  const handleFiltersReset = () => {
    resetFilters()
    setIsAdvancedFiltersOpen(false)
  }

  const handleAddToCart = async (item: any) => {
    if (item.type === 'SERVICIOS') {
      setPendingItemForDialog(item)
      setIsQuickAppointmentOpen(true)
      return
    }

    if (item.type === 'EVENTOS') {
      setPendingItemForDialog(item)
      setIsEventBookingOpen(true)
      return
    }

    await cart.addToCart(item)
  }
  return (
    <div
      className='min-h-screen bg-background flex flex-col lg:flex-row'
      style={{ touchAction: 'pan-y' }}
    >
      {/* Área principal */}
      <div className='flex-1 flex flex-col lg:mr-[35%] lg:max-w-[calc(100%-35%)]'>
        {/* Header compacto para móvil */}
        <div className='border-b border-border bg-card sticky top-0 z-10 lg:static'>
          {/* Header móvil */}
          <div className='lg:hidden'>
            <div className='flex items-center justify-between p-3'>
              <h1 className='text-lg font-semibold'>Tienda</h1>
              <div className='flex items-center gap-2'>
                <FilterButton
                  isActive={filters.isActive}
                  onClick={handleFilterButtonClick}
                />
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className='h-8 w-8 p-0'
                >
                  {isMobileMenuOpen ? (
                    <X className='h-4 w-4' />
                  ) : (
                    <Menu className='h-4 w-4' />
                  )}
                </Button>
              </div>
            </div>

            {/* Barra de búsqueda siempre visible en móvil */}
            <div className='px-3 pb-3'>
              <SearchBar
                value={filters.search}
                onChange={setSearch}
                placeholder='Buscar por nombre, SKU o código de barras...'
              />
            </div>

            {/* Menú desplegable móvil */}
            {isMobileMenuOpen && (
              <div className='border-t border-border bg-card/95 backdrop-blur-sm'>
                <div className='p-3'>
                  <CategoryTabs
                    activeCategory={filters.category}
                    onCategoryChange={(category) => {
                      setCategory(category)
                      setIsMobileMenuOpen(false)
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Header desktop */}
          <div className='hidden lg:block p-4'>
            <div className='flex items-center gap-4 mb-4'>
              <div className='flex-1'>
                <SearchBar
                  value={filters.search}
                  onChange={setSearch}
                  placeholder='Buscar por nombre, SKU o código de barras...'
                />
              </div>
              <FilterButton
                isActive={filters.isActive}
                onClick={handleFilterButtonClick}
              />
            </div>

            <div className='flex items-center justify-between'>
              <CategoryTabs
                activeCategory={filters.category}
                onCategoryChange={setCategory}
              />

              {/* Estadísticas de filtros */}
              {filterStats.isFiltered && (
                <div className='text-sm text-muted-foreground'>
                  Mostrando {filterStats.filtered} de {filterStats.total}{' '}
                  elementos
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Grid de elementos */}
        <div className='flex-1 pb-20 lg:pb-4 lg:overflow-auto'>
          <ItemGrid
            items={filteredItems}
            onAddToCart={handleAddToCart}
            onRemoveFromCart={cart.removeFromCart}
          />
        </div>
      </div>

      {/* Carrito lateral */}
      <Cart
        cart={cart.cart}
        onToggle={cart.toggleCart}
        onRemoveItem={cart.removeFromCart}
        onUpdateQuantity={cart.updateCartQuantity}
        onUpdatePrice={cart.updateCartPrice}
        onClientSelect={cart.setSelectedClient}
        onClearCart={cart.clearCart}
      />

      {/* Filtros avanzados */}
      <AdvancedFilters
        isOpen={isAdvancedFiltersOpen}
        onClose={handleAdvancedFiltersClose}
        filters={filters}
        onFiltersChange={handleFiltersApply}
        onResetFilters={handleFiltersReset}
        auxiliaryData={auxiliaryData}
      />

      {/* Overlay para cerrar menú móvil */}
      {isMobileMenuOpen && (
        <div
          className='fixed inset-0 bg-black/20 z-15 lg:hidden'
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </div>
  )
}
