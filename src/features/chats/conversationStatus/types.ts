import { z } from 'zod'

export type ConversationStatus = {
  id: string
  businessId: string
  name: string
  orderNumber: number
  color?: string
}

// Schema for creating a conversation status
export const conversationStatusSchema = z.object({
  name: z
    .string()
    .min(1, 'El nombre es requerido')
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(50, 'El nombre no puede exceder 50 caracteres'),
  orderNumber: z
    .number()
    .positive('El número de orden debe ser positivo')
    .default(1),
  color: z.string().optional(),
})

// Schema for updating a conversation status
export const updateConversationStatusSchema = z.object({
  name: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(50, 'El nombre no puede exceder 50 caracteres')
    .optional(),
  orderNumber: z
    .number()
    .positive('El número de orden debe ser positivo')
    .optional(),
  color: z.string().optional(),
}).refine(data => data.name || data.orderNumber !== undefined || data.color, {
  message: "Debe proporcionar al menos un campo para actualizar",
})

export type ConversationStatusFormValues = z.infer<typeof conversationStatusSchema>
export type UpdateConversationStatusValues = z.infer<typeof updateConversationStatusSchema>
