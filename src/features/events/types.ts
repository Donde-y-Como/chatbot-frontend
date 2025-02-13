export type Frequency = 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';

export type EndCondition = {
  type: 'occurrences';
  occurrences: number;
} | {
  type: 'date';
  until: Date;
} | null;

export type RecurrencePrimitives = {
  frequency: Frequency;
  endCondition: EndCondition;
}
export type DurationPrimitives = {
  startAt: Date
  endAt: Date
}

export type CapacityPrimitives = {
  isLimited: boolean
  maxCapacity?: number
}

export interface PricePrimitives {
  amount: number;
  currency: string;
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
  photos: string[]
}

export type Booking = {
  id: string
  eventId: string
  clientId: string
  bookedAt: Date
}

export const mockEvents: EventPrimitives[] = [
  {
    id: "1",
    businessId: "b1",
    name: "User Journey Mapping Session",
    description: "Collaborative session to map out user journeys and identify pain points",
    duration: {
      startAt: new Date("2024-12-28T10:00:00"),
      endAt: new Date("2024-12-28T11:30:00"),
    },
    capacity: {
      isLimited: true,
      maxCapacity: 10,
    },
    price: {
      amount: 0,
      currency: "MXN",
    },
    recurrence: {
      frequency: "weekly" as Frequency,
      endCondition: {
        type: "occurrences",
        occurrences: 4,
      },
    },
    photos: ["/placeholder.svg?height=100&width=100"],
  },
  {
    id: "2",
    businessId: "b1",
    name: "Usability Testing Debrief",
    description: "Review and analyze findings from recent usability testing sessions",
    duration: {
      startAt: new Date("2024-12-28T16:00:00"),
      endAt: new Date("2024-12-28T17:00:00"),
    },
    capacity: {
      isLimited: false,
    },
    price: {
      amount: 100,
      currency: "MXN",
    },
    recurrence: {
      frequency: "never" as Frequency,
      endCondition: null,
    },
    photos: ["/placeholder.svg?height=100&width=100"],
  },
  {
    id: "3",
    businessId: "b1",
    name: "Design Sprint Workshop",
    description: "Intensive design sprint to solve key business challenges",
    duration: {
      startAt: new Date("2024-12-30T11:00:00"),
      endAt: new Date("2024-12-30T16:00:00"),
    },
    capacity: {
      isLimited: true,
      maxCapacity: 15,
    },
    price: {
      amount: 299.99,
      currency: "MXN",
    },
    recurrence: {
      frequency: "monthly" as Frequency,
      endCondition: {
        type: "date",
        until: new Date("2024-03-30"),
      },
    },
    photos: ["/placeholder.svg?height=100&width=100"],
  },
]