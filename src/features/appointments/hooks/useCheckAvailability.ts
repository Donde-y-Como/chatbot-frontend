import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { appointmentService } from '../appointmentService'
import { EmployeeAvailable, MinutesTimeRange, Service } from '../types'

export function useCheckAvailability(
  selectedServices: Service[],
  date: Date,
  activeStep: number,
  timeRange: MinutesTimeRange
) {
  const [availableEmployees, setAvailableEmployees] = useState<
    EmployeeAvailable[]
  >([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (selectedServices.length === 0 || activeStep != 3) {
      setAvailableEmployees([])
      setLoading(false)
      return
    }

    const checkAvailability = async () => {
      setLoading(true)
      const uniqueEmployeesMap = new Map<string, EmployeeAvailable>()
      const services = [...selectedServices]
      for (const service of services) {
        try {
          const result = await appointmentService.checkAvailability(
            service.id,
            date
          )

          result.availableSlots.forEach((slot) => {
            if (timeRange.startAt >= slot.slot.startAt && timeRange.endAt <= slot.slot.endAt) {
              slot.employees.forEach((employee) => {
                if (!uniqueEmployeesMap.has(employee.id)) {
                  uniqueEmployeesMap.set(employee.id, employee)
                }
              })
            }
          })
        } catch (error) {
          toast.warning(
            'No se encontraron empleados. Intenta mas tarde o continua sin empleado por el momento'
          )
          return
        }
      }

      setAvailableEmployees(Array.from(uniqueEmployeesMap.values()))
      setLoading(false)
    }

    void checkAvailability()
  }, [selectedServices, date, activeStep, timeRange])

  return { availableEmployees, loading }
}
