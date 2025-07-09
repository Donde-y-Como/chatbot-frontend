import { z } from 'zod'
import { ProductInfo } from '@/types'

export type Frequency = 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never'

export type EndCondition =
  | {
      type: 'occurrences'
      occurrences: number
    }
  | {
      type: 'date'
      until: Date
    }
  | null

export type RecurrencePrimitives = {
  frequency: Frequency
  endCondition: EndCondition
}

export type DurationPrimitives = {
  startAt: string
  endAt: string
}

export type CapacityPrimitives = {
  isLimited: boolean
  maxCapacity?: number | null
}

export interface PricePrimitives {
  amount: number
  currency: string
}

export type EventPrimitives = {
  id: string
  businessId: string
  name: string
  description: string
  duration: DurationPrimitives
  capacity: CapacityPrimitives
  price: PricePrimitives
  recurrence: RecurrencePrimitives
  location: string
  photos: string[]
  productInfo: ProductInfo // Opcional para compatibilidad con eventos existentes
}

export type EventWithBookings = EventPrimitives & {
  bookings: Booking[]
}

export type BookingStatus =
  | 'pendiente'
  | 'confirmada'
  | 'reprogramada'
  | 'completada'
  | 'cancelada'
  | 'no asistió'
export type PaymentStatus = 'pendiente' | 'pagado' | 'parcial' | 'reembolsado'

export type Booking = {
  id: string
  clientId: string
  eventId: string
  date: string
  participants: number
  notes: string
  status: BookingStatus
  amount: number
  paymentStatus: PaymentStatus
  createdAt: string
  updatedAt: string
}

export type EventAvailability = {
  hasAvailability: boolean
  totalParticipants: number
  remainingSpots: number | null
}

/* Define types */
export type CreatableEvent = Omit<EventPrimitives, 'id' | 'businessId'>

// Define currency as a proper enum
export enum Currency {
  USD = 'USD',
  EUR = 'EUR',
  MXN = 'MXN',
}

// Define frequency as a proper enum
export enum RecurrenceFrequency {
  NEVER = 'never',
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  YEARLY = 'yearly',
}

// Define end condition type as a proper enum
export enum EndConditionType {
  OCCURRENCES = 'occurrences',
  DATE = 'date',
  NULL = 'null',
}

/* Zod Schemas */
export const capacitySchema = z
  .object({
    isLimited: z.boolean(),
    maxCapacity: z.number().min(1, 'Debe ser al menos 1').nullable(),
  })
  .refine(
    (data) => !data.isLimited || (data.isLimited && data.maxCapacity !== null),
    {
      message:
        'La capacidad máxima es requerida cuando la capacidad es limitada',
      path: ['maxCapacity'],
    }
  )

export const priceSchema = z.object({
  amount: z.number().min(0, { message: 'El precio no puede ser negativo' }),
  currency: z.nativeEnum(Currency),
})

export const durationSchema = z
  .object({
    startAt: z.string().datetime({ message: 'Fecha de inicio inválida' }),
    endAt: z.string().datetime({ message: 'Fecha de fin inválida' }),
  })
  .refine((data) => new Date(data.endAt) > new Date(data.startAt), {
    message: 'La fecha de fin debe ser posterior a la fecha de inicio',
    path: ['endAt'],
  })

export const recurrenceEndConditionSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('occurrences'),
    occurrences: z.number().int().min(1, 'Debe ser al menos 1'),
  }),
  z.object({
    type: z.literal('date'),
    until: z.date().min(new Date(), 'La fecha debe ser en el futuro'),
  }),
])

export const recurrenceSchema = z
  .object({
    frequency: z.nativeEnum(RecurrenceFrequency),
    endCondition: recurrenceEndConditionSchema.nullable(),
  })
  .refine(
    (data) => (data.frequency === 'never' ? data.endCondition === null : true),
    {
      message:
        "La condición de finalización debe ser nula cuando la recurrencia es 'never'",
      path: ['endCondition'],
    }
  )

// Schema específico para eventos donde SKU y categorías son opcionales
export const eventProductInfoSchema = z.object({
  sku: z
    .string()
    .max(50, 'El SKU no puede exceder 50 caracteres')
    .regex(
      /^[A-Za-z0-9_-]*$/,
      'El SKU solo puede contener letras, números, guiones y guiones bajos'
    )
    .default(''),
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
  categoryIds: z.array(z.string()).default([]),
  subcategoryIds: z.array(z.string()).default([]),
  status: z.enum(['active', 'inactive']),
  tagIds: z.array(z.string()).default([]),
  taxPercentage: z.preprocess(
    (val) => {
      if (val === '' || val === null || val === undefined) return 0
      const num = Number(val)
      return isNaN(num) ? 0 : Math.floor(num) // Asegurar que sea entero
    },
    z.number().min(0, 'El impuesto no puede ser negativo')
  ),
  notes: z
    .string()
    .max(500, 'Las notas no pueden exceder 500 caracteres')
    .default(''),
  cost: z.object({
    amount: z.number().min(0, 'El costo no puede ser negativo'),
    currency: z.string().min(1, 'La moneda es requerida'),
  }),
  precioModificado: z.object({
    amount: z.number().min(0, 'El precio modificado no puede ser negativo'),
    currency: z.string().min(1, 'La moneda es requerida'),
  }),
})

export const creatableEventSchema = z.object({
  name: z.string().min(1, { message: 'El nombre es requerido' }),
  description: z.string().min(1, { message: 'La descripción es requerida' }),
  price: priceSchema,
  capacity: capacitySchema,
  duration: durationSchema,
  recurrence: recurrenceSchema,
  location: z.string().min(1, { message: 'La ubicación es requerida' }),
  photos: z.array(z.string()),
  productInfo: eventProductInfoSchema,
})

// Booking schemas
export const bookingStatusSchema = z.enum([
  'pendiente',
  'confirmada',
  'reprogramada',
  'completada',
  'cancelada',
  'no asistió',
])
export const paymentStatusSchema = z.enum([
  'pendiente',
  'pagado',
  'parcial',
  'reembolsado',
])

export const createBookingSchema = z.object({
  clientId: z.string().min(1, { message: 'El cliente es requerido' }),
  date: z.string().datetime({ message: 'Fecha inválida' }),
  participants: z.number().int().min(1, { message: 'Mínimo 1 participante' }),
  notes: z.string().optional().default(''),
  status: bookingStatusSchema.optional().default('pendiente'),
  amount: z
    .number()
    .min(0, { message: 'El monto no puede ser negativo' })
    .multipleOf(0.01, { message: 'Máximo 2 decimales' })
    .optional()
    .default(0),
  paymentStatus: paymentStatusSchema.optional().default('pendiente'),
})

export const updateBookingSchema = z.object({
  date: z.string().datetime({ message: 'Fecha inválida' }).optional(),
  participants: z
    .number()
    .int()
    .min(1, { message: 'Mínimo 1 participante' })
    .optional(),
  notes: z.string().optional(),
  status: bookingStatusSchema.optional(),
  amount: z
    .number()
    .min(0, { message: 'El monto no puede ser negativo' })
    .multipleOf(0.01, { message: 'Máximo 2 decimales' })
    .optional(),
  paymentStatus: paymentStatusSchema.optional(),
})

export type CreateBookingData = z.infer<typeof createBookingSchema>
export type UpdateBookingData = z.infer<typeof updateBookingSchema>
