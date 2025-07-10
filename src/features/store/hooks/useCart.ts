import { useCallback, useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useIsMobile } from '@/hooks/use-mobile.tsx'
import { CartAPIService } from '../services/CartAPIService.ts'
import {
  CartItemRequest,
  CartState,
  CartWithDetails,
  Price,
  UpdateCartItemPriceRequest,
  UpdateCartItemQuantityRequest,
} from '../types'

const getDefaultCartState = (isMobile: boolean): CartState => ({
  isOpen: !isMobile, // Abierto por defecto en desktop
  items: [],
  selectedClientId: '',
  total: { amount: 0, currency: 'MXN' },
})

const CART_QUERY_KEY = ['cart']

export function useCart() {
  const isMobile = useIsMobile()
  const queryClient = useQueryClient()

  // Cart-specific mobile detection (matches lg: breakpoint at 1024px)
  const [isCartMobile, setIsCartMobile] = useState<boolean>(false)

  useEffect(() => {
    const checkCartMobile = () => {
      setIsCartMobile(window.innerWidth < 1024)
    }
    
    checkCartMobile()
    window.addEventListener('resize', checkCartMobile)
    
    return () => window.removeEventListener('resize', checkCartMobile)
  }, [])

  // Local state for client selection
  const [selectedClientId, setSelectedClientId] = useState<string>('')
  // Local state for cart visibility (mobile drawer)
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false)

  const {
    data: cartData,
    isLoading,
    error,
    refetch: getCart,
  } = useQuery({
    queryKey: CART_QUERY_KEY,
    queryFn: async () => {
      const response = await CartAPIService.getCart(true)
      return response.data as CartWithDetails
    },
    staleTime: 30 * 1000,
  })

  // Create cart state from query data
  const cart: CartState = useMemo(() => {
    if (!cartData) {
      return {
        ...getDefaultCartState(isMobile),
        selectedClientId,
        isOpen: isCartMobile ? isCartOpen : true, // Desktop always open, mobile uses state
      }
    }

    return {
      isOpen: isCartMobile ? isCartOpen : true, // Desktop always open, mobile uses state
      items: cartData.itemsWithDetails || [],
      selectedClientId,
      total: cartData.totalAmount || { amount: 0, currency: 'MXN' },
    }
  }, [cartData, isMobile, selectedClientId, isCartOpen, isCartMobile])

  // Add to cart mutation with optimistic update
  const addToCartMutation = useMutation({
    mutationFn: async (item: CartItemRequest) => {
      return await CartAPIService.addCartItem(item)
    },
    onMutate: async (_item: CartItemRequest) => {
      await queryClient.cancelQueries({ queryKey: CART_QUERY_KEY })

      const previousCart =
        queryClient.getQueryData<CartWithDetails>(CART_QUERY_KEY)

      return { previousCart }
    },
    onError: (error, variables, context) => {
      if (context?.previousCart) {
        queryClient.setQueryData(CART_QUERY_KEY, context.previousCart)
      }
      toast.error(
        error instanceof Error
          ? error.message
          : 'Error al agregar item a la orden'
      )
    },
    onSuccess: async (data, variables) => {
      await queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY })
      toast.success(`Articulo agregado a la orden (${variables.quantity})`)
    },
  })

  const addToCart = async (item: CartItemRequest) => {
    addToCartMutation.mutate(item)
  }

  // Remove from cart mutation with optimistic update
  const removeFromCartMutation = useMutation({
    mutationFn: async ({
      itemId,
      itemType,
    }: {
      itemId: string
      itemType: string
    }) => {
      return await CartAPIService.removeCartItemFromCart(itemId, itemType)
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: CART_QUERY_KEY })

      const previousCart =
        queryClient.getQueryData<CartWithDetails>(CART_QUERY_KEY)

      return { previousCart }
    },
    onError: (error, variables, context) => {
      if (context?.previousCart) {
        queryClient.setQueryData(CART_QUERY_KEY, context.previousCart)
      }
      toast.error('Error al remover articulo de la orden')
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY })
      toast.success('Articulo removido de la orden')
    },
  })

  const removeFromCart = async (itemId: string) => {
    const item = cart.items.find((i) => i.itemId === itemId)
    if (!item) return

    removeFromCartMutation.mutate({
      itemId: item.itemId,
      itemType: item.itemType,
    })
  }

  // Update quantity mutation with optimistic update
  const updateQuantityMutation = useMutation({
    mutationFn: async (request: UpdateCartItemQuantityRequest) => {
      return await CartAPIService.updateCartItemQuantity(request)
    },
    onMutate: async ({ itemId, quantity }) => {
      await queryClient.cancelQueries({ queryKey: CART_QUERY_KEY })

      const previousCart =
        queryClient.getQueryData<CartWithDetails>(CART_QUERY_KEY)

      return { previousCart }
    },
    onError: (error, variables, context) => {
      if (context?.previousCart) {
        queryClient.setQueryData(CART_QUERY_KEY, context.previousCart)
      }
      toast.error('Error al actualizar cantidad')
    },
    onSuccess: async() => {
      await queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY })
    },
  })

  const updateCartQuantity = async (request: CartItemRequest) => {
    if (request.quantity <= 0) {
      await removeFromCart(request.itemId)
      return
    }

    const item = cart.items.find((i) => i.itemId === request.itemId)
    if (!item) return

    updateQuantityMutation.mutate(request)
  }

  const updatePriceMutation = useMutation({
    mutationFn: async (request: UpdateCartItemPriceRequest) => {
      return await CartAPIService.updateCartItemPrice(request)
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: CART_QUERY_KEY })

      const previousCart =
        queryClient.getQueryData<CartWithDetails>(CART_QUERY_KEY)

      return { previousCart }
    },
    onError: (error, variables, context) => {
      if (context?.previousCart) {
        queryClient.setQueryData(CART_QUERY_KEY, context.previousCart)
      }
      toast.error('Error al actualizar precio')
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY })
      toast.success('Precio actualizado')
    },
  })

  const updateCartPrice = async (request: UpdateCartItemPriceRequest) => {
    const item = cart.items.find((i) => i.itemId === request.itemId)
    if (!item) return

    updatePriceMutation.mutate(request)
  }

  const decreaseQuantity = async (itemId: string) => {
    const item = cart.items.find((i) => i.itemId === itemId)
    if (!item) return

    const newQuantity = item.quantity - 1
    
    if (newQuantity <= 0) {
      await removeFromCart(itemId)
      return
    }

    updateQuantityMutation.mutate({
      itemId: item.itemId,
      itemType: item.itemType,
      quantity: newQuantity,
    })
  }

  const clearCartMutation = useMutation({
    mutationFn: async () => {
      return await CartAPIService.clearCart()
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: CART_QUERY_KEY })

      const previousCart =
        queryClient.getQueryData<CartWithDetails>(CART_QUERY_KEY)

      return { previousCart }
    },
    onError: (error, variables, context) => {
      if (context?.previousCart) {
        queryClient.setQueryData(CART_QUERY_KEY, context.previousCart)
      }
      toast.error('Error al limpiar orden')
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY })
      toast.success('Orden limpia')
    },
  })

  const clearCart = async () => {
    clearCartMutation.mutate()
    setSelectedClientId('') // Reset client selection when clearing cart
  }

  const toggleCart = useCallback(() => {
    if (isCartMobile) {
      setIsCartOpen(prev => !prev)
    }
    // Desktop cart is always open, no need to toggle
  }, [isCartMobile])

  // Abrir carrito
  const openCart = useCallback(() => {
    if (isCartMobile) {
      setIsCartOpen(true)
    }
  }, [isCartMobile])

  // Cerrar carrito (solo en móvil)
  const closeCart = useCallback(() => {
    if (isCartMobile) {
      setIsCartOpen(false)
    }
  }, [isCartMobile])

  // Seleccionar cliente - frontend state only
  const setSelectedClient = useCallback((clientId: string) => {
    setSelectedClientId(clientId)
  }, [])

  // Obtener cantidad total de items
  const totalItems = useMemo(() => {
    return cart.items.reduce((sum, item) => sum + item.quantity, 0)
  }, [cart.items])

  // Verificar si el carrito está listo para procesar
  const isReadyToProcess = useMemo(() => {
    return cart.items.length > 0 && selectedClientId !== ''
  }, [cart.items.length, selectedClientId])

  // Formatear precio
  const formatPrice = useCallback((price: Price) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: price.currency,
    }).format(price.amount)
  }, [])

  // No need for useEffect since useQuery handles the fetching

  return {
    cart,
    totalItems,
    isReadyToProcess,
    isLoading,
    error,

    addToCart,
    removeFromCart,
    updateCartQuantity,
    updateCartPrice,
    decreaseQuantity,
    clearCart,
    getCart,

    toggleCart,
    openCart,
    closeCart,

    setSelectedClient,
    formatPrice,

    // Expose mutation states for loading indicators
    isAddingToCart: addToCartMutation.isPending,
    isRemovingFromCart: removeFromCartMutation.isPending,
    isUpdatingQuantity: updateQuantityMutation.isPending,
    isUpdatingPrice: updatePriceMutation.isPending,
    isClearingCart: clearCartMutation.isPending,
  }
}
