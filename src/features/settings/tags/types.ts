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
  color: z
    .string()
    .min(1, 'El color es requerido')
    .regex(/^#[0-9A-F]{6}$/i, 'El color debe ser un código hexadecimal válido'),
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
  color: z
    .string()
    .regex(/^#[0-9A-F]{6}$/i, 'El color debe ser un código hexadecimal válido')
    .optional(),
  description: z
    .string()
    .max(200, 'La descripción no puede exceder 200 caracteres')
    .optional(),
}).refine(data => data.name || data.color || data.description, {
  message: "Debe proporcionar al menos un campo para actualizar",
})

export type TagFormValues = z.infer<typeof tagSchema>
export type SimpleTagFormValues = z.infer<typeof simpleTagSchema>
export type UpdateTagValues = z.infer<typeof updateTagSchema>

// Colores predefinidos para el selector
export const PREDEFINED_COLORS = [
  { name: 'Rojo', value: '#EF4444' },
  { name: 'Naranja', value: '#F97316' },
  { name: 'Amarillo', value: '#EAB308' },
  { name: 'Verde', value: '#22C55E' },
  { name: 'Azul', value: '#3B82F6' },
  { name: 'Índigo', value: '#6366F1' },
  { name: 'Púrpura', value: '#A855F7' },
  { name: 'Rosa', value: '#EC4899' },
  { name: 'Gris', value: '#6B7280' },
  { name: 'Negro', value: '#1F2937' },
  { name: 'Esmeralda', value: '#10B981' },
  { name: 'Cian', value: '#06B6D4' },
  { name: 'Lima', value: '#84CC16' },
  { name: 'Ámbar', value: '#F59E0B' },
  { name: 'Fucsia', value: '#D946EF' },
  { name: 'Teal', value: '#14B8A6' },
] as const

// Tipos para el modo del formulario
export type TagDialogMode = 'create-simple' | 'create-complete' | 'edit'
