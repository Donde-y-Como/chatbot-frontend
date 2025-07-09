import { z } from 'zod'
import { ProductStatus } from '@/features/products/types.ts'

// Tipo para el costo del producto
export interface ProductCost {
  amount: number
  currency: string
}

// Tipo para ProductInfo
export interface ProductInfo {
  sku: string // Código único del producto
  discountPercentage: number // 0-100
  categoryIds: string[] // Array de IDs de categorías
  subcategoryIds: string[] // Array de IDs de subcategorías
  status: ProductStatus // Estado del producto
  tagIds: string[] // Array de IDs de etiquetas
  taxPercentage: number // ≥0
  notes: string // Notas adicionales
  cost: ProductCost // Costo del negocio (diferente al precio de venta)
  precioModificado: ProductCost
}

// Schema de validación para ProductCost
export const productCostSchema = z.object({
  amount: z.number().min(0, 'El costo no puede ser negativo'),
  currency: z.string().min(1, 'La moneda es requerida'),
})

// Schema de validación para ProductInfo
export const productInfoSchema = z.object({
  sku: z
    .string()
    .min(1, 'El SKU es requerido')
    .max(50, 'El SKU no puede exceder 50 caracteres')
    .regex(
      /^[A-Za-z0-9_-]+$/,
      'El SKU solo puede contener letras, números, guiones y guiones bajos'
    ),
  discountPercentage: z.preprocess(
    (val) => {
      if (val === '' || val === null || val === undefined) return 0
      const num = Number(val)
      return isNaN(num) ? 0 : Math.floor(num) // Asegurar que sea entero
    },
    z
      .number()
      .min(0, 'El descuento no puede ser negativo')
      .max(100, 'El descuento no puede ser mayor al 100%')
  ),
  categoryIds: z
    .array(z.string())
    .min(1, 'Debe seleccionar al menos una categoría'),
  subcategoryIds: z.array(z.string()),
  status: z.nativeEnum(ProductStatus),
  tagIds: z.array(z.string()),
  taxPercentage: z.preprocess(
    (val) => {
      if (val === '' || val === null || val === undefined) return 0
      const num = Number(val)
      return isNaN(num) ? 0 : Math.floor(num) // Asegurar que sea entero
    },
    z.number().min(0, 'El impuesto no puede ser negativo')
  ),
  notes: z.string().max(500, 'Las notas no pueden exceder 500 caracteres'),
  cost: productCostSchema,
  precioModificado: productCostSchema,
})

// Tipo inferido del schema
export type ProductInfoFormValues = z.infer<typeof productInfoSchema>

// Valores por defecto para ProductInfo
export const getDefaultProductInfo = (): ProductInfo => ({
  sku: '',
  discountPercentage: 0,
  categoryIds: [],
  subcategoryIds: [],
  status: ProductStatus.ACTIVO,
  tagIds: [],
  taxPercentage: 0,
  notes: '',
  cost: {
    amount: 0,
    currency: 'MXN',
  },
  precioModificado: {
    amount: 0,
    currency: 'MXN',
  },
})
