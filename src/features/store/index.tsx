import React, { useEffect, useState } from 'react'
import { Cart } from '@/features/store/components/Cart.tsx'
import { POSError } from '@/features/store/components/POSError.tsx'
import { POSLoading } from '@/features/store/components/POSLoading.tsx'
import { AdvancedFilters } from './components/AdvancedFilters'
import { StoreHeader } from './components/StoreHeader'
import { StoreItems } from './components/StoreItems'
import { StoreLayout } from './components/StoreLayout'
import { usePOS } from './hooks/usePOS'
import { CartItemRequest } from '@/features/store/types.ts'

export default function Store() {
  const [isAdvancedFiltersOpen, setIsAdvancedFiltersOpen] = useState(false)
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

    // Acciones
    refetchAll,
  } = usePOS()

  // Inicializar POS al montar el componente
  useEffect(() => {
    void cart.getCart()
  }, [cart.getCart])

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

  const handleAddToCart = async (item: CartItemRequest) => {
    await cart.addToCart(item)
  }

  const handleToggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const handleCloseMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

  return (
    <StoreLayout
      isMobileMenuOpen={isMobileMenuOpen}
      onCloseMobileMenu={handleCloseMobileMenu}
    >
      {/* Área principal */}
      <div className='flex-1 flex flex-col lg:mr-[35%] lg:max-w-[calc(100%-35%)]'>
        <StoreHeader
          filters={filters}
          filterStats={filterStats}
          isMobileMenuOpen={isMobileMenuOpen}
          onToggleMobileMenu={handleToggleMobileMenu}
          onFilterButtonClick={handleFilterButtonClick}
          onSearchChange={setSearch}
          onCategoryChange={setCategory}
        />

        <StoreItems
          items={filteredItems}
          onAddToCart={handleAddToCart}
          onRemoveFromCart={cart.removeFromCart}
        />
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
    </StoreLayout>
  )
}
