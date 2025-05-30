import { z } from 'zod'

export type Tag = {
  id: string
  businessId: string
  name: string
  description: string
}

// Schema para etiqueta completa
export const tagSchema = z.object({
  name: z
    .string()
    .min(1, 'El nombre es requerido')
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(30, 'El nombre no puede exceder 30 caracteres'),
  description: z
    .string()
    .min(1, 'La descripción es requerida')
    .max(200, 'La descripción no puede exceder 200 caracteres'),
})

// Schema para etiqueta simple
export const simpleTagSchema = z.object({
  name: z
    .string()
    .min(1, 'El nombre es requerido')
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(30, 'El nombre no puede exceder 30 caracteres'),
})

// Schema para actualización
export const updateTagSchema = z.object({
  name: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(30, 'El nombre no puede exceder 30 caracteres')
    .optional(),
  description: z
    .string()
    .max(200, 'La descripción no puede exceder 200 caracteres')
    .optional(),
}).refine(data => data.name || data.description, {
  message: "Debe proporcionar al menos un campo para actualizar",
})

export type TagFormValues = z.infer<typeof tagSchema>
export type SimpleTagFormValues = z.infer<typeof simpleTagSchema>
export type UpdateTagValues = z.infer<typeof updateTagSchema>

// Tipos para el modo del formulario
export type TagDialogMode = 'create-simple' | 'create-complete' | 'edit'
