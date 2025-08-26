import { api } from '@/api/axiosInstance'
import { Employee, EmployeeFormValues } from './types'

const generateDistantPastels = (seed: number, count = 5) => {
  const rand = ((seed * 9301 + 49297) % 233280) / 233280
  const startHue = rand * 360
  const hueStep = 360 / count

  return Array.from({ length: count }, (_, i) => {
    const hue = (startHue + i * hueStep) % 360
    return `hsl(${hue}, 75%, 65%)`
  })
}

export const EmployeeService = {
  getEmployees: async (): Promise<Employee[]> => {
    const response = await api.get<Omit<Employee, 'color'>[]>('/employees')
    const colors = generateDistantPastels(42, response.data.length)
    return response.data.map((emp, i) => ({
      ...emp,
      color: colors[i],
    }))
  },
  createEmployee: async (employee: EmployeeFormValues) => {
    const response = await api.post('/employees', employee)
    if (response.status !== 201) {
      if (response.data.title) {
        throw new Error(response.data.title)
      }
      throw new Error('Error creando el empleado')
    }
  },
  updateEmployee: async (id: string, employee: Partial<Employee>) => {
    const response = await api.put(`/employees/${id}`, employee)
    if (response.status !== 200) {
      if (response.data.title) {
        throw new Error(response.data.title)
      }
      throw new Error('Error actualizando el empleado')
    }
  },
}
