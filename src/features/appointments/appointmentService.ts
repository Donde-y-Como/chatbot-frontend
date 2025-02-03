import { api } from '@/api/axiosInstance'
import { Appointment, Employee, Service, Schedule } from '@/features/appointments/types.ts'

const generateDistantPastels = (seed:number, count = 5) => {
  const rand = ((seed * 9301 + 49297) % 233280) / 233280;
  const startHue = rand * 360;
  const hueStep = 360 / count;

  return Array.from({ length: count }, (_, i) => {
    const hue = (startHue + i * hueStep) % 360;
    return `hsl(${hue}, 75%, 65%)`;
  });
};


export const appointmentService = {
  getAppointments: async (startDate: string, endDate: string) => {
    let endpoint = '/appointments'
    if (startDate && endDate) {
      endpoint += `?startDate=${startDate}&endDate=${endDate}`
    }
    const response = await api.get<Appointment[]>(endpoint)
    return response.data
  },

  getEmployees: async(): Promise<Employee[]> => {
    const response = await api.get<Omit<Employee,"color">[]>('/employees')
    const colors = generateDistantPastels(42, response.data.length);
    return response.data.map((emp, i) => ({
      ...emp,
      color: colors[i]
    }))
  },

  getServices: async(): Promise<Service[]> => {
    const response = await api.get<Service[]>('/services')
    return response.data;
  },

  getSchedule: async() => {
    const response = await api.get<Schedule>('/schedule')
    return response.data;
  }
}
