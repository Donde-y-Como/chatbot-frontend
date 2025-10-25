import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { appointmentService } from '../appointmentService';
import { EmployeeAvailabilityInfo } from '../types';
import { handleAvailabilityError } from '../utils/errorHandler';

export function useEmployeeAvailability(
  fromDate: Date,
  toDate: Date,
  activeStep: number,
  employeeIds?: string[],
  appointmentId?: string
) {
  const [employeesWithAvailability, setEmployeesWithAvailability] = useState<EmployeeAvailabilityInfo[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Only fetch when on step 3 (employee selection step)
    if (activeStep !== 3) {
      setEmployeesWithAvailability([]);
      setLoading(false);
      return;
    }

    const fetchEmployeeAvailability = async () => {
      setLoading(true);
      try {
        const result = await appointmentService.checkEmployeeAvailability(
          fromDate,
          toDate,
          employeeIds,
          appointmentId
        );
        setEmployeesWithAvailability(result.employees);
      } catch (error: any) {
        const errorResult = handleAvailabilityError(error);

        if (errorResult.type === 'warning') {
          toast.warning(errorResult.message);
        } else {
          toast.error(errorResult.message);
        }

        console.error('Error fetching employee availability:', error);
        setEmployeesWithAvailability([]);
      } finally {
        setLoading(false);
      }
    };

    void fetchEmployeeAvailability();
  }, [fromDate, toDate, activeStep, employeeIds, appointmentId]);

  return { employeesWithAvailability, loading };
}
