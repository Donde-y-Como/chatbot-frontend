import { z } from 'zod'

export type MessageTemplateType =
  | 'appointment_created'
  | 'appointment_updated'
  | 'appointment_cancelled'
  | 'appointment_reminder'

export type MessageTemplate = {
  id: string
  businessId: string
  type: MessageTemplateType
  template: string
  isActive: boolean
  language: string
}

export const messageTemplateSchema = z.object({
  type: z.enum(['appointment_created', 'appointment_updated', 'appointment_cancelled', 'appointment_reminder'], {
    errorMap: () => ({ message: 'Selecciona un tipo de plantilla válido' }),
  }),
  template: z
    .string()
    .min(1, 'La plantilla es requerida')
    .min(10, 'La plantilla debe tener al menos 10 caracteres')
    .max(1000, 'La plantilla no puede exceder 1000 caracteres'),
  isActive: z.boolean().default(true),
  language: z.string().default('es'),
})

export const updateMessageTemplateSchema = z.object({
  template: z
    .string()
    .min(10, 'La plantilla debe tener al menos 10 caracteres')
    .max(1000, 'La plantilla no puede exceder 1000 caracteres')
    .optional(),
  isActive: z.boolean().optional(),
}).refine(data => data.template || data.isActive !== undefined, {
  message: 'Debe proporcionar al menos un campo para actualizar',
})

export type MessageTemplateFormValues = z.infer<typeof messageTemplateSchema>
export type UpdateMessageTemplateValues = z.infer<typeof updateMessageTemplateSchema>

export type MessageTemplateDialogMode = 'create' | 'edit'

export const templateTypeLabels: Record<MessageTemplateType, string> = {
  appointment_created: 'Cita creada',
  appointment_updated: 'Cita actualizada',
  appointment_cancelled: 'Cita cancelada',
  appointment_reminder: 'Recordatorio de cita',
}

export const templateTypeDescriptions: Record<MessageTemplateType, string> = {
  appointment_created: 'Mensaje enviado cuando se crea una nueva cita',
  appointment_updated: 'Mensaje enviado cuando se modifica una cita',
  appointment_cancelled: 'Mensaje enviado cuando se cancela una cita',
  appointment_reminder: 'Mensaje enviado como recordatorio de cita (próximamente)',
}

export const availableVariables = [
  { name: '{{date}}', description: 'Fecha de la cita', example: '2025-10-25' },
  { name: '{{time}}', description: 'Hora de la cita', example: '14:30' },
  { name: '{{services}}', description: 'Nombre(s) del servicio', example: 'Corte de cabello' },
  { name: '{{employees}}', description: 'Nombre(s) del empleado', example: 'Juan García' },
  { name: '{{folio}}', description: 'Folio de referencia', example: 'F-000123' },
  { name: '{{businessName}}', description: 'Nombre del negocio', example: 'Salón de Belleza' },
]
