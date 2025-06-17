import { z } from 'zod'
import { DurationUnit, Currency } from './types'
import { scheduleSchema } from '../employees/types'

// Schema para servicio rápido (solo campos básicos)
export const quickServiceSchema = z.object({
  name: z.string().min(1, { message: 'El nombre del servicio es obligatorio' }),
  description: z.string().min(1, { message: 'La descripción es obligatoria' }),
  durationValue: z.coerce
    .number()
    .min(1, { message: 'La duración debe ser al menos 1.' }),
  durationUnit: z.enum(['minutes', 'hours']),
  priceAmount: z.coerce
    .number()
    .min(0, { message: 'El precio debe ser al menos 0.' }),
  priceCurrency: z.string().min(1, { message: 'La moneda es obligatoria.' }),
  schedule: scheduleSchema,
})

export type QuickServiceFormValues = z.infer<typeof quickServiceSchema>

// Valores por defecto para servicio rápido
export const getDefaultQuickService = (): QuickServiceFormValues => ({
  name: '',
  description: '',
  durationValue: 30,
  durationUnit: 'minutes' as const,
  priceAmount: 0,
  priceCurrency: 'MXN',
  schedule: {
    MONDAY: { startAt: 480, endAt: 1020 },
    TUESDAY: { startAt: 480, endAt: 1020 },
    WEDNESDAY: { startAt: 480, endAt: 1020 },
    THURSDAY: { startAt: 480, endAt: 1020 },
    FRIDAY: { startAt: 480, endAt: 1020 },
    SATURDAY: undefined,
    SUNDAY: undefined,
  },
})
