import { z } from 'zod'
import { ProductInfo, productInfoSchema, getDefaultProductInfo } from '@/types'
import { MinutesTimeRange } from '../appointments/types'

// Interfaz para uso de consumibles en servicios
export interface ConsumableUsage {
  consumableId: string
  quantity: number
}

// Enum para tipos de duración
export enum DurationUnit {
  MINUTES = 'minutes',
  HOURS = 'hours'
}

// Enum para monedas
export enum Currency {
  USD = 'USD',
  EUR = 'EUR',
  MXN = 'MXN',
}

// Interfaz para duración
export interface Duration {
  value: number
  unit: DurationUnit
}

// Interfaz para precio
export interface Price {
  amount: number
  currency: Currency
}

// Interfaz principal del servicio con los nuevos atributos
export interface Service {
  id: string
  businessId: string
  name: string
  description: string
  duration: Duration
  price: Price
  maxConcurrentBooks: number
  minBookingLeadHours: number
  schedule: Record<string, MinutesTimeRange>
  // Nuevos atributos
  productInfo: ProductInfo
  codigoBarras: number
  photos: string[]
  // Campos de equipos y consumibles
  equipmentIds?: string[]
  consumableUsages?: ConsumableUsage[]
}

// Tipo para crear un servicio (sin id y businessId)
export type CreatableService = Omit<Service, 'id' | 'businessId'>

// Schema de validación para duración
export const durationSchema = z.object({
  value: z.number().min(1, 'La duración debe ser al menos 1'),
  unit: z.nativeEnum(DurationUnit),
})

// Schema de validación para precio
export const priceSchema = z.object({
  amount: z.number().min(0, 'El precio no puede ser negativo'),
  currency: z.nativeEnum(Currency),
})

// Schema de validación para unidad de medida
export const unitSchema = z.object({
  id: z.string(),
  name: z.string(),
  abbreviation: z.string(),
  createdAt: z.string(),
  updatedAt: z.string().optional(),
})

// Schema de validación para servicios con los nuevos campos
export const creatableServiceSchema = z.object({
  name: z.string().min(1, { message: 'El nombre del servicio es obligatorio' }),
  description: z.string().min(1, { message: 'La descripción es obligatoria' }),
  duration: durationSchema,
  price: priceSchema,
  maxConcurrentBooks: z.number().min(1, { message: 'Debe permitir al menos 1 reserva' }),
  minBookingLeadHours: z.number().min(0, { message: 'El tiempo mínimo de anticipación debe ser de al menos 0 horas' }),
  schedule: z.record(z.object({
    startAt: z.number(),
    endAt: z.number(),
  })),
  // Nuevos campos
  productInfo: productInfoSchema,
  codigoBarras: z.coerce
    .number()
    .int('El código de barras debe ser un número entero')
    .positive('El código de barras debe ser positivo'),
  photos: z.array(z.string()),
  // Campos de equipos y consumibles (opcionales)
  equipmentIds: z.array(z.string()).default([]),
  consumableUsages: z.array(z.object({
    consumableId: z.string(),
    quantity: z.number().min(1, 'La cantidad debe ser al menos 1'),
  })).default([]),
})

// Tipos inferidos
export type ServiceFormValues = z.infer<typeof creatableServiceSchema>

// Valores por defecto para un nuevo servicio
export const getDefaultService = (): Partial<CreatableService> => ({
  name: '',
  description: '',
  duration: {
    value: 30,
    unit: DurationUnit.MINUTES,
  },
  price: {
    amount: 0,
    currency: Currency.MXN,
  },
  maxConcurrentBooks: 1,
  minBookingLeadHours: 0,
  schedule: {
    MONDAY: { startAt: 480, endAt: 1020 },
    TUESDAY: { startAt: 480, endAt: 1020 },
    WEDNESDAY: { startAt: 480, endAt: 1020 },
    THURSDAY: { startAt: 480, endAt: 1020 },
    FRIDAY: { startAt: 480, endAt: 1020 },
  },
  productInfo: getDefaultProductInfo(),
  codigoBarras: 0,
  photos: [],
  // Nuevos campos
  equipmentIds: [],
  consumableUsages: [],
})
