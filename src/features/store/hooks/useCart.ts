import { useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { useIsMobile } from '@/hooks/use-mobile.tsx'
import { CartAPIService } from '../services/CartAPIService.ts'
import { CartItemRequest, CartState, CartWithDetails, Price } from '../types'

const getDefaultCartState = (isMobile: boolean): CartState => ({
  isOpen: !isMobile, // Abierto por defecto en desktop
  items: [],
  selectedClientId: '',
  total: { amount: 0, currency: 'MXN' },
})

export function useCart() {
  const isMobile = useIsMobile()
  const [cart, setCart] = useState<CartState>(() =>
    getDefaultCartState(isMobile)
  )
  const [isLoading, setIsLoading] = useState(false)

  const getCart = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await CartAPIService.getCart(true)

      const cartData = response.data as CartWithDetails
      setCart((prev) => ({
        ...prev,
        items: cartData?.itemsWithDetails ?? [],
        total: cartData?.totalAmount ?? 0,
      }))
    } catch (error) {
      toast.error('Error al obtener la orden')
      setCart(() => getDefaultCartState(isMobile))
    } finally {
      setIsLoading(false)
    }
  }, [isMobile])

  const addToCart = useCallback(
    async (item: CartItemRequest) => {
      try {
        await CartAPIService.addCartItem(item)
        await getCart()
        toast.success(`Articulo agregado a la orden (${item.quantity})`)
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : 'Error al agregar item a la orden'
        )
      }
    },
    [getCart]
  )

  const removeFromCart = useCallback(
    async (itemId: string) => {
      try {
        const item = cart.items.find((i) => i.itemId === itemId)
        if (!item) return

        await CartAPIService.removeCartItemFromCart(item.itemId, item.itemType)
        await getCart()
        toast.success(`Articulo removido de la orden`)
      } catch (error) {
        console.error('Error removiendo de la orden:', error)
        toast.error('Error al remover item de la orden')
      }
    },
    [cart.items, getCart]
  )

  const updateCartQuantity = useCallback(
    async (itemId: string, quantity: number) => {
      if (quantity <= 0) {
        await removeFromCart(itemId)
        return
      }

      try {
        const item = cart.items.find((i) => i.itemId === itemId)
        if (!item) return

        await CartAPIService.updateCartItemQuantity({
          itemId: item.itemId,
          itemType: item.itemType,
          quantity,
        })

        await getCart()
      } catch (error) {
        toast.error('Error al actualizar cantidad')
      }
    },
    [cart.items, removeFromCart, getCart]
  )

  const updateCartPrice = useCallback(
    async (itemId: string, newPrice: Price) => {
      try {
        const item = cart.items.find((i) => i.itemId === itemId)
        if (!item) return

        await CartAPIService.updateCartItemPrice({
          itemId: item.itemId,
          itemType: item.itemType,
          newPrice,
        })

        await getCart()
        toast.success('Precio actualizado')
      } catch (error) {
        toast.error('Error al actualizar precio')
      }
    },
    [cart.items, getCart]
  )

  const clearCart = useCallback(async () => {
    try {
      await CartAPIService.clearCart()
      setCart(getDefaultCartState(isMobile))
      toast.success('Orden limpia')
    } catch (error) {
      toast.error('Error al limpiar orden')
    }
  }, [isMobile])

  // Toggle carrito abierto/cerrado (solo en móvil)
  const toggleCart = useCallback(() => {
    if (!isMobile) {
      setCart((prev) => ({ ...prev, isOpen: !prev.isOpen }))
    }
  }, [isMobile])

  // Abrir carrito
  const openCart = useCallback(() => {
    setCart((prev) => ({ ...prev, isOpen: true }))
  }, [])

  // Cerrar carrito (solo en móvil)
  const closeCart = useCallback(() => {
    if (!isMobile) {
      setCart((prev) => ({ ...prev, isOpen: false }))
    }
  }, [isMobile])

  // Seleccionar cliente
  const setSelectedClient = useCallback((clientId: string) => {
    setCart((prev) => ({ ...prev, selectedClientId: clientId }))
  }, [])

  // Obtener cantidad total de items
  const totalItems = useMemo(() => {
    return cart.items.reduce((sum, item) => sum + item.quantity, 0)
  }, [cart.items])

  // Verificar si el carrito está listo para procesar
  const isReadyToProcess = useMemo(() => {
    return cart.items.length > 0 && cart.selectedClientId !== ''
  }, [cart.items.length, cart.selectedClientId])

  // Formatear precio
  const formatPrice = useCallback((price: Price) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: price.currency,
    }).format(price.amount)
  }, [])

  useEffect(() => {
    void getCart()
  }, [])

  return {
    cart,
    totalItems,
    isReadyToProcess,
    isLoading,

    addToCart,
    removeFromCart,
    updateCartQuantity,
    updateCartPrice,
    clearCart,
    getCart,

    toggleCart,
    openCart,
    closeCart,

    setSelectedClient,
    formatPrice,
  }
}
