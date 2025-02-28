import { z } from "zod"

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
}

export type EventWithBookings = EventPrimitives & {
  bookings: Booking[]
}

export type Booking = {
  id: string
  clientId: string
  eventId: string
  date: string
  participants: number
  notes: string
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
      message: 'La capacidad máxima es requerida cuando la capacidad es limitada',
      path: ['maxCapacity'],
    }
  )

export const priceSchema = z.object({
  amount: z.number().min(0, { message: 'El precio no puede ser negativo' }),
  currency: z.nativeEnum(Currency),
})

export const durationSchema = z.object({
  startAt: z.string().datetime({ message: 'Fecha de inicio inválida' }),
  endAt: z.string().datetime({ message: 'Fecha de fin inválida' }),
}).refine(
  (data) => new Date(data.endAt) > new Date(data.startAt),
  {
    message: 'La fecha de fin debe ser posterior a la fecha de inicio',
    path: ['endAt'],
  }
)

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

export const recurrenceSchema = z.object({
  frequency: z.nativeEnum(RecurrenceFrequency),
  endCondition: recurrenceEndConditionSchema.nullable(),
}).refine(
  (data) => data.frequency === 'never' ? data.endCondition === null : true,
  {
    message: "La condición de finalización debe ser nula cuando la recurrencia es 'never'",
    path: ['endCondition'],
  }
)

export const creatableEventSchema = z.object({
  name: z.string().min(1, { message: 'El nombre es requerido' }),
  description: z.string().min(1, { message: 'La descripción es requerida' }),
  price: priceSchema,
  capacity: capacitySchema,
  duration: durationSchema,
  recurrence: recurrenceSchema,
  location: z.string().min(1, { message: 'La ubicación es requerida' }),
  photos: z.array(z.string()),
})
