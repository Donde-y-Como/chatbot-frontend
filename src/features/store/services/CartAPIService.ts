import { api } from '@/api/axiosInstance.ts'
import {
  AddCartItemResponse,
  CartItemRequest,
  GetCartSuccessResponse,
  ProblemDetails,
  UpdateCartItemPriceRequest,
} from '../types'

/**
 * Generate or retrieve unique terminal ID for this POS browser instance
 * Format: "terminal-{location}-{random}" where location should be set in env
 * Falls back to timestamp-based ID if location is not configured
 */
const getTerminalId = (): string => {
  const STORAGE_KEY = 'pos_terminal_id';

  // Check if we already have a terminal ID
  let terminalId = localStorage.getItem(STORAGE_KEY);

  if (!terminalId) {
    // Get location from environment or use default
    const location = import.meta.env.VITE_TERMINAL_LOCATION || 'default';
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 9);

    terminalId = `terminal-${location}-${timestamp}-${random}`;
    localStorage.setItem(STORAGE_KEY, terminalId);
  }

  return terminalId;
};

const TERMINAL_ID = getTerminalId();

export const CartAPIService = {
  getCart: async (
    includeDetails: boolean = false
  ): Promise<GetCartSuccessResponse> => {
    const queryParams = new URLSearchParams({
      terminalId: TERMINAL_ID,
      ...(includeDetails && { includeDetails: 'true' })
    });

    const response = await api.get<GetCartSuccessResponse>(
      `/cart?${queryParams.toString()}`
    )

    if (response.status !== 200) {
      throw new Error('Error obteniendo carrito')
    }

    return response.data
  },

  addCartItem: async (item: CartItemRequest): Promise<AddCartItemResponse> => {
    try {
      const response = await api.post<AddCartItemResponse | ProblemDetails>(
        '/cart/items',
        {
          ...item,
          terminalId: TERMINAL_ID
        }
      )

      if (response.status !== 200) {
        if ((response.status === 400 || response.status === 409) && 'title' in response.data) {
          throw new Error(response.data.title)
        }
        throw new Error('Error agregando item al carrito')
      }

      return response.data as AddCartItemResponse
    } catch (error: any) {
      if (error.response && error.response.data) {
        const errorData = error.response.data
        
        if (errorData.title) {
          throw new Error(errorData.title)
        }
      }
      
      throw new Error('Error agregando item al carrito')
    }
  },

  updateCartItemQuantity: async (request: CartItemRequest) => {
    const response = await api.put(`/cart/items/${request.itemId}/quantity`, {
      itemType: request.itemType,
      quantity: request.quantity,
      notes: request.notes,
      eventDate: request.eventDate,
      terminalId: TERMINAL_ID
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
      terminalId: TERMINAL_ID
    })

    if (response.status !== 200) {
      throw new Error('Error actualizando precio')
    }
    return response.data
  },

  removeCartItemFromCart: async (itemId: string, itemType: string) => {
    const response = await api.delete(`/cart/items/${itemId}`, {
      data: {
        itemType,
        terminalId: TERMINAL_ID
      },
    })

    if (response.status !== 200) {
      throw new Error('Error removiendo item del carrito')
    }

    return response.data
  },

  clearCart: async () => {
    const response = await api.delete(`/cart?terminalId=${TERMINAL_ID}`)

    if (response.status !== 200) {
      throw new Error('No se pudo limpiar el carrito')
    }

    return response.data
  },
}
