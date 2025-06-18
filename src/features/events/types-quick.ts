import { z } from 'zod'
import { Currency } from './types'

// Schema para evento rápido (solo campos básicos)
export const quickEventSchema = z.object({
  name: z.string().min(1, { message: 'El nombre es requerido' }),
  description: z.string().min(1, { message: 'La descripción es requerida' }),
  location: z.string().min(1, { message: 'La ubicación es requerida' }),
  isLimitedCapacity: z.boolean(),
  maxCapacity: z.number().min(1, 'Debe ser al menos 1').nullable(),
  startAt: z.string().datetime({ message: 'Fecha de inicio inválida' }),
  endAt: z.string().datetime({ message: 'Fecha de fin inválida' }),
  priceAmount: z.number().min(0, { message: 'El precio no puede ser negativo' }),
  priceCurrency: z.nativeEnum(Currency),
}).refine(
  (data) => new Date(data.endAt) > new Date(data.startAt),
  {
    message: 'La fecha de fin debe ser posterior a la fecha de inicio',
    path: ['endAt'],
  }
).refine(
  (data) => !data.isLimitedCapacity || (data.isLimitedCapacity && data.maxCapacity !== null),
  {
    message: 'La capacidad máxima es requerida cuando la capacidad es limitada',
    path: ['maxCapacity'],
  }
)

export type QuickEventFormValues = z.infer<typeof quickEventSchema>

// Valores por defecto para evento rápido
export const getDefaultQuickEvent = (): QuickEventFormValues => ({
  name: '',
  description: '',
  location: '',
  isLimitedCapacity: false,
  maxCapacity: null,
  startAt: '',
  endAt: '',
  priceAmount: 0,
  priceCurrency: Currency.MXN,
})
