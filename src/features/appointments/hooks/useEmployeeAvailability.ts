import { useEffect, useState } from 'react';
import { appointmentService } from '../appointmentService';
import { EmployeeAvailabilityInfo } from '../types';

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
      } catch (error) {
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
