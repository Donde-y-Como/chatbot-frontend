import { z } from 'zod'

export type Unit = {
  id: string
  name: string
  abbreviation: string
  createdAt: string
  updatedAt: string
}

export const unitSchema = z.object({
  name: z
    .string()
    .min(1, 'El nombre es requerido')
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(50, 'El nombre no puede exceder 50 caracteres'),
  abbreviation: z
    .string()
    .min(1, 'La abreviación es requerida')
    .max(10, 'La abreviación no puede exceder 10 caracteres')
    .regex(/^[a-zA-Z0-9°%/²³]+$/, 'La abreviación solo puede contener letras, números y símbolos básicos'),
})

export const updateUnitSchema = z.object({
  name: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(50, 'El nombre no puede exceder 50 caracteres')
    .optional(),
  abbreviation: z
    .string()
    .max(10, 'La abreviación no puede exceder 10 caracteres')
    .regex(/^[a-zA-Z0-9°%/²³]+$/, 'La abreviación solo puede contener letras, números y símbolos básicos')
    .optional(),
}).refine(data => data.name || data.abbreviation, {
  message: "Debe proporcionar al menos el nombre o la abreviación",
})

export type UnitFormValues = z.infer<typeof unitSchema>
export type UpdateUnitValues = z.infer<typeof updateUnitSchema>
