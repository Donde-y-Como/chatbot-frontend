import React, { useEffect, useState } from 'react'
import { Cart } from '@/features/store/components/Cart.tsx'
import { ItemGrid } from '@/features/store/components/ItemGrid.tsx'
import { POSError } from '@/features/store/components/POSError.tsx'
import { POSLoading } from '@/features/store/components/POSLoading.tsx'
import { SelectEventDateDialog } from '@/features/store/components/SelectEventDateDialog.tsx'
import { CartItemRequest, PaymentMethod } from '@/features/store/types.ts'
import { AdvancedFilters } from './components/AdvancedFilters'
import { StoreHeader } from './components/StoreHeader'
import { StoreLayout } from './components/StoreLayout'
import { useCart } from './hooks/useCart'
import { usePOS } from './hooks/usePOS'

export default function Store() {
  const [isAdvancedFiltersOpen, setIsAdvancedFiltersOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [currentItem, setCurrentItem] = useState<CartItemRequest | null>(null)

  // Hook principal del POS
  const {
    // Datos
    auxiliaryData,

    // Estados
    isLoading,
    error,

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

  // Hook del carrito independiente
  const cart = useCart()
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash')

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
  if (isLoading || !auxiliaryData) {
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
    if (item.itemType === 'event') {
      setCurrentItem(item)
      return
    }

    await cart.addToCart(item)
  }

  const handleDateSelected = async (item: CartItemRequest) => {
    await cart.addToCart(item)
  }

  const handleToggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const handleCloseMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

  const handleConvertCart = async () => {
    console.log({ ...cart.cart, paymentMethod })
  }

  return (
    <StoreLayout
      isMobileMenuOpen={isMobileMenuOpen}
      onCloseMobileMenu={handleCloseMobileMenu}
    >
      {/* Área principal */}
      <div className='flex-1 flex flex-col lg:mr-[35%] lg:max-w-[calc(100%-35%)] xl:mr-[30%] xl:max-w-[calc(100%-30%)] relative'>
        <StoreHeader
          filters={filters}
          filterStats={filterStats}
          isMobileMenuOpen={isMobileMenuOpen}
          onToggleMobileMenu={handleToggleMobileMenu}
          onFilterButtonClick={handleFilterButtonClick}
          onSearchChange={setSearch}
          onCategoryChange={setCategory}
        />

        <div className='flex-1 pb-20 lg:pb-4 overflow-auto'>
          <ItemGrid
            items={filteredItems}
            onAddToCart={handleAddToCart}
            onDecreaseQuantity={cart.decreaseQuantity}
          />
        </div>
      </div>

      {/* Carrito lateral */}
      {cart.isLoading ? (
        <>Cargando</>
      ) : (
        <Cart
          cart={cart.cart}
          onToggle={cart.toggleCart}
          onRemoveItem={cart.removeFromCart}
          onUpdateQuantity={cart.updateCartQuantity}
          onUpdatePrice={cart.updateCartPrice}
          onClientSelect={cart.setSelectedClient}
          onPaymentMethodSelect={setPaymentMethod}
          onClearCart={cart.clearCart}
          onConvertCart={handleConvertCart}
        />
      )}

      {currentItem && (
        <SelectEventDateDialog
          item={currentItem}
          onSubmit={handleDateSelected}
          onClose={() => setCurrentItem(null)}
        />
      )}

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
