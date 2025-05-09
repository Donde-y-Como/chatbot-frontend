import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { appointmentService } from '../appointmentService'
import { EmployeeAvailable, Service } from '../types'

export function useCheckAvailability(
  selectedServices: Service[],
  date: Date,
  activeStep: number
) {
  const [availableEmployees, setAvailableEmployees] = useState<
    EmployeeAvailable[]
  >([])

  useEffect(() => {
    if (selectedServices.length === 0 || activeStep != 3) {
      setAvailableEmployees([])
      return
    }

    const checkAvailability = async () => {
      const uniqueEmployeesMap = new Map<string, EmployeeAvailable>()
      const services = [...selectedServices]
      for (const service of services) {

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
          toast.warning(
            'No se encontraron empleados. Intenta mas tarde o continua sin empleado por el momento'
          )
          return
        }
      }

      setAvailableEmployees(Array.from(uniqueEmployeesMap.values()))
    }

    void checkAvailability()
  }, [selectedServices, date, activeStep])

  return { availableEmployees }
}
