import { useEffect, useState } from 'react'
import { appointmentService } from '../appointmentService'
import { EmployeeAvailable, MinutesTimeRange, Service } from '../types'

export function useCheckAvailability(
  selectedServices: Service[],
  date: Date
) {
  const [availableEmployees, setAvailableEmployees] = useState<
    EmployeeAvailable[]
  >([])

  useEffect(() => {
    if (selectedServices.length === 0) {
      return
    }

    const checkAvailability = async () => {
      const uniqueEmployeesMap = new Map<string, EmployeeAvailable>()

      for (const service of selectedServices) {
        try {
          const result = await appointmentService.checkAvailability(
            service.id,
            date
          )

          result.availableSlots.forEach((slot) => {
            slot.employees.forEach((employee) => {
              if (!uniqueEmployeesMap.has(employee.id)) {
                uniqueEmployeesMap.set(employee.id, employee)
              }
            })
          })
        } catch (error) {
          console.error(
            `Error fetching availability for service ${service.id}:`,
            error
          )
        }
      }

      setAvailableEmployees(Array.from(uniqueEmployeesMap.values()))
    }

    checkAvailability()
  }, [selectedServices, date])

  return { availableEmployees }
}
