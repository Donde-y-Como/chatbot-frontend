import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { appointmentService } from '../appointmentService';
import { EmployeeAvailable, MinutesTimeRange, Service } from '../types';
import { handleAvailabilityError } from '../utils/errorHandler';

// Helper function to check if a sorted list of time slots can cover a target time range
function checkSlotsCoverTimeRange(
  employeeSlots: ReadonlyArray<{ startAt: number; endAt: number }>,
  targetRange: { startAt: number; endAt: number }
): boolean {
  if (targetRange.startAt >= targetRange.endAt) {
    return true;
  }

  if (employeeSlots.length === 0) {
    return false;
  }

  for (let i = 0; i < employeeSlots.length; i++) {
    const firstSlot = employeeSlots[i];

    if (firstSlot.startAt <= targetRange.startAt && firstSlot.endAt > targetRange.startAt) {
      let currentCoverageEnd = firstSlot.endAt;

      if (currentCoverageEnd >= targetRange.endAt) {
        return true;
      }

      for (let j = i + 1; j < employeeSlots.length; j++) {
        const nextSlot = employeeSlots[j];

        if (nextSlot.startAt <= currentCoverageEnd) {
          currentCoverageEnd = Math.max(currentCoverageEnd, nextSlot.endAt);
          if (currentCoverageEnd >= targetRange.endAt) {
            return true;
          }
        } else {
          break;
        }
      }
    }
  }
  return false;
}

export function useCheckAvailability(
  selectedServices: Service[],
  date: Date,
  activeStep: number,
  timeRange: MinutesTimeRange,
  isEditMode?: boolean,
  appointmentId?: string
) {
  const [availableEmployees, setAvailableEmployees] = useState<
    EmployeeAvailable[]
  >([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (selectedServices.length === 0 || (!isEditMode && activeStep != 3)) {
      setAvailableEmployees([])
      setLoading(false)
      return
    }

    const checkAvailability = async () => {
      setLoading(true);
      let employeesAvailableForAllServices = new Map<string, EmployeeAvailable>();
      let isFirstService = true;
      const servicesToProcess = [...selectedServices];

      if (servicesToProcess.length === 0) {
        setAvailableEmployees([]);
        setLoading(false);
        return;
      }

      for (const service of servicesToProcess) {
        const currentServiceAvailableEmployees = new Map<string, EmployeeAvailable>();
        try {
          const result = await appointmentService.checkAvailability(service.id, date, appointmentId);

          const employeeSlotsMap = new Map<string, { slotData: { startAt: number; endAt: number }; employee: EmployeeAvailable }[]>();
          result.availableSlots.forEach(apiSlot => {
            apiSlot.employees.forEach(employee => {
              if (!employeeSlotsMap.has(employee.id)) {
                employeeSlotsMap.set(employee.id, []);
              }
              employeeSlotsMap.get(employee.id)!.push({ slotData: apiSlot.slot, employee });
            });
          });

          employeeSlotsMap.forEach((employeeApiSlots, employeeId) => {
            const slotsForEmployee = employeeApiSlots.map(s => s.slotData).sort((a, b) => a.startAt - b.startAt);
            const originalEmployeeObject = employeeApiSlots.length > 0 ? employeeApiSlots[0].employee : undefined;

            const covers = checkSlotsCoverTimeRange(slotsForEmployee, timeRange)
            
            if (originalEmployeeObject && covers) {
              currentServiceAvailableEmployees.set(employeeId, originalEmployeeObject);
            }
          });

        } catch (error: any) {
          const errorResult = handleAvailabilityError(error);

          if (errorResult.type === 'warning') {
            toast.warning(errorResult.message);
          } else {
            toast.error(errorResult.message);
          }

          console.error('Error checking availability:', error);
          setAvailableEmployees([]);
          setLoading(false);
          return;
        }

        if (isFirstService) {
          employeesAvailableForAllServices = currentServiceAvailableEmployees;
          isFirstService = false;
        } else {
          const nextAvailableForAll = new Map<string, EmployeeAvailable>();
          employeesAvailableForAllServices.forEach((employee, employeeId) => {
            if (currentServiceAvailableEmployees.has(employeeId)) {
              nextAvailableForAll.set(employeeId, employee);
            }
          });
          employeesAvailableForAllServices = nextAvailableForAll;
        }

        if (employeesAvailableForAllServices.size === 0) {
          break;
        }
      }
      const finalEmployees = Array.from(employeesAvailableForAllServices.values())
      setAvailableEmployees(finalEmployees);
      setLoading(false);
    };

    void checkAvailability()
  }, [selectedServices, date, activeStep, timeRange, isEditMode, appointmentId])

  return { availableEmployees, loading }
}
