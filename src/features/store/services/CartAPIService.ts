import { api } from '@/api/axiosInstance.ts'
import {
  CartItemRequest,
  GetCartSuccessResponse,
  UpdateCartItemPriceRequest,
  UpdateCartItemQuantityRequest,
} from '../types'

export const CartAPIService = {
  getCart: async (
    includeDetails: boolean = false
  ): Promise<GetCartSuccessResponse> => {
    const response = await api.get<GetCartSuccessResponse>(
      includeDetails ? '/cart?includeDetails=true' : '/cart'
    )

    if (response.status !== 200) {
      throw new Error('Error obteniendo carrito')
    }

    return response.data
  },

  addCartItem: async (item: CartItemRequest) => {
    const response = await api.post('/cart/items', item)

    if (response.status !== 200) {
      throw new Error('Error agregando item al carrito')
    }

    return response.data
  },

  updateCartItemQuantity: async (request: UpdateCartItemQuantityRequest) => {
    const response = await api.put(`/cart/items/${request.itemId}/quantity`, {
      itemType: request.itemType,
      quantity: request.quantity,
    })

    if (response.status !== 200) {
      throw new Error('Error actualizando cantidad')
    }

    return response.data
  },

  updateCartItemPrice: async (request: UpdateCartItemPriceRequest) => {
    const response = await api.put(`/cart/items/${request.itemId}/price`, {
      itemType: request.itemType,
      newPrice: request.newPrice,
    })

    if (response.status !== 200) {
      throw new Error('Error actualizando precio')
    }
    return response.data
  },

  removeCartItemFromCart: async (itemId: string, itemType: string) => {
    const response = await api.delete(`/cart/items/${itemId}`, {
      data: { itemType },
    })

    if (response.status !== 200) {
      throw new Error('Error removiendo item del carrito')
    }

    return response.data
  },

  clearCart: async () => {
    const response = await api.delete('/cart')

    if (response.status !== 200) {
      throw new Error('No se pudo limpiar el carrito')
    }

    return response.data
  },
}
