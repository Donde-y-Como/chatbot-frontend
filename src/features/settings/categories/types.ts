import { z } from 'zod'

export type Category = {
  id: string
  businessId: string
  name: string
  description: string
  parentCategoryId: string | null
  createdAt: string
  subcategories?: Category[]
}

export const categorySchema = z.object({
  name: z
    .string()
    .min(1, 'El nombre es requerido')
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(50, 'El nombre no puede exceder 50 caracteres'),
  description: z
    .string()
    .min(1, 'La descripción es requerida')
    .max(200, 'La descripción no puede exceder 200 caracteres'),
  parentCategoryId: z.string().optional(),
})

export const updateCategorySchema = z.object({
  name: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(50, 'El nombre no puede exceder 50 caracteres')
    .optional(),
  description: z
    .string()
    .max(200, 'La descripción no puede exceder 200 caracteres')
    .optional(),
}).refine(data => data.name || data.description, {
  message: "Debe proporcionar al menos el nombre o la descripción",
})

export type CategoryFormValues = z.infer<typeof categorySchema>
export type UpdateCategoryValues = z.infer<typeof updateCategorySchema>

// Tipos para diferenciar entre categorías padre e hijas
export type ParentCategory = Category & {
  parentCategoryId: null
  subcategories: Category[]
}

export type SubCategory = Category & {
  parentCategoryId: string
  subcategories?: never
}
