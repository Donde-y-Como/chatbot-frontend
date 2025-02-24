import { useQuery } from '@tanstack/react-query'
import { EmployeeService } from '../../employees/EmployeeService'

export function useGetEmployees() {
  return useQuery({
    queryKey: ['employees'],
    queryFn: EmployeeService.getEmployees,
    staleTime: Infinity
  })
}
