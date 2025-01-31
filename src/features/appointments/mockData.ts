import type { Employee, Event } from "./types"
import { addDays, setHours, setMinutes } from "date-fns"

export const mockEmployees: Employee[] = [
  { id: "1", name: "John Doe", color: "#FF5733" },
  { id: "2", name: "Jane Smith", color: "#33FF57" },
  { id: "3", name: "Bob Johnson", color: "#3357FF" },
  { id: "4", name: "Alice Williams", color: "#FF33F5" },
  { id: "5", name: "Charlie Brown", color: "#33FFF5" },
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
