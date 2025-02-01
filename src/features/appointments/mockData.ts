import type { Employee, Event, Service } from './types'
import { addDays, setHours, setMinutes } from "date-fns"

export const mockEmployees: Employee[] = [
  { id: "1", name: "John Doe", color: "rgba(255,87,51,0.6)" },
  { id: "2", name: "Jane Smith", color: "rgba(51,255,87,0.6)" },
  { id: "3", name: "Bob Johnson", color: "rgba(51,87,255,0.6)" },
  { id: "4", name: "Alice Williams", color: "rgba(255,51,245,0.6)" },
  { id: "5", name: "Charlie Brown", color: "rgba(51,255,245,0.6)" },
]

export const mockServices: Service[] = [
  { id: "1", name: "Service A" },
  { id: "2", name: "Service B" },
  { id: "3", name: "Service C" },
  { id: "4", name: "Service D" },
  { id: "5", name: "Service E" },
]

export const generateMockEvents = (): Event[] => {
  const events: Event[] = []
  const today = new Date()

  mockEmployees.forEach((employee) => {
    for (let i = 0; i < 5; i++) {
      const startDate = addDays(today, Math.floor(Math.random() * 7))
      const startHour = 9 + Math.floor(Math.random() * 8) // Random hour between 9 AM and 5 PM
      const duration = 1 + Math.floor(Math.random() * 3) // Random duration between 1 and 3 hours

      const start = setMinutes(setHours(startDate, startHour), 0)
      const end = setMinutes(setHours(startDate, startHour + duration), 0)

      events.push({
        id: `event-${employee.id}-${i}`,
        employeeId: employee.id,
        client: `Client ${i + 1}`,
        service: `Service ${String.fromCharCode(65 + i)}`, // Service A, B, C, etc.
        notes: `Notes for appointment ${i + 1}`,
        start,
        end,
        status: ["scheduled", "completed", "cancelled"][Math.floor(Math.random() * 3)] as Event["status"],
      })
    }
  })

  return events
}
