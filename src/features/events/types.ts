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
