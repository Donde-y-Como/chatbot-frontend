import { addMinutes, setHours, setMinutes } from 'date-fns'
import type { Employee, Event, Service } from './types'

export const mockEmployees: Employee[] = [
  { id: '1', name: 'John Doe', color: 'rgba(231,71,200,0.69)' },
  { id: '2', name: 'Jane Smith', color: 'rgba(86,240,113,0.6)' },
  { id: '3', name: 'Bob Johnson', color: 'rgba(51,87,255,0.6)' },
  { id: '4', name: 'Alice Williams', color: 'rgba(255,51,245,0.6)' },
  { id: '5', name: 'Charlie Brown', color: 'rgba(51,255,245,0.6)' },
]

export const mockServices: Service[] = [
  { id: '1', name: 'Service A' },
  { id: '2', name: 'Service B' },
  { id: '3', name: 'Service C' },
  { id: '4', name: 'Service D' },
  { id: '5', name: 'Service E' },
]

export const generateMockEvents = (): Event[] => {
  const events: Event[] = []

  const startDate = new Date()
  const startHour = 9 + Math.floor(Math.random() * 8) // Random hour between 9 AM and 5 PM
  const duration = 1 // Random duration between 1 and 3 hours

  const start = setMinutes(setHours(startDate, startHour), 0)
  const end = setMinutes(setHours(startDate, startHour + duration), 0)

  events.push({
    id: `event-${mockEmployees[0].id}-${100}`,
    employeeId: mockEmployees[0].id,
    client: `Client ${100}`,
    service: `Service ${String.fromCharCode(65)}`, // Service A, B, C, etc.
    serviceId: mockServices[0].id,
    notes: `Notes for appointment ${1}`,
    start,
    end,
    status: ['scheduled', 'completed', 'cancelled'][
      Math.floor(Math.random() * 3)
    ] as Event['status'],
  })

  events.push({
    id: `event-${mockEmployees[1].id}-${101}`,
    employeeId: mockEmployees[1].id,
    client: `Client ${100}`,
    service: `Service ${String.fromCharCode(66)}`, // Service A, B, C, etc.
    serviceId: mockServices[1].id,
    notes: `Notes for appointment ${1}`,
    start,
    end,
    status: ['scheduled', 'completed', 'cancelled'][
      Math.floor(Math.random() * 3)
    ] as Event['status'],
  })

  events.push({
    id: `event-${mockEmployees[1].id}-${1001}`,
    employeeId: mockEmployees[1].id,
    client: `Client ${100}`,
    service: `Service ${String.fromCharCode(66)}`, // Service A, B, C, etc.
    serviceId: mockServices[1].id,
    notes: `Notes for appointment ${1}`,
    start: addMinutes(start, 60),
    end: addMinutes(end, 60),
    status: ['scheduled', 'completed', 'cancelled'][
      Math.floor(Math.random() * 3)
    ] as Event['status'],
  })

  events.push({
    id: `event-${mockEmployees[2].id}-${101}`,
    employeeId: mockEmployees[2].id,
    client: `Client ${100}`,
    service: `Service ${String.fromCharCode(66)}`, // Service A, B, C, etc.
    serviceId: mockServices[2].id,
    notes: `Notes for appointment ${1}`,
    start,
    end,
    status: ['scheduled', 'completed', 'cancelled'][
      Math.floor(Math.random() * 3)
    ] as Event['status'],
  })

  console.log(events)

  return events
}
