import { useQuery, useQueryClient } from '@tanstack/react-query'
import { appointmentService } from '@/features/appointments/appointmentService.ts'
import { useEffect } from 'react'
import { socket } from '@/hooks/use-web-socket.ts'

export const UseGetAppointmentsQueryKey = 'appointments' as const

export function useGetAppointments(startDate: string, endDate?: string) {
  const queryClient = useQueryClient()
  
  if (!endDate) {
    endDate = startDate
  }

  const query = useQuery({
    queryKey: [UseGetAppointmentsQueryKey, startDate, endDate],
    queryFn: () => appointmentService.getAppointments(startDate, endDate),
    staleTime: 30 * 1000, // 30 segundos en lugar de Infinity
  })

  useEffect(() => {
    const handleAppointmentCreated = () => {
      console.log('Nueva cita creada - Refrescando calendario...')
      queryClient.invalidateQueries({
        queryKey: [UseGetAppointmentsQueryKey]
      })
    }

    const handleAppointmentCanceled = () => {
      console.log('Cita cancelada - Refrescando calendario...')
      queryClient.invalidateQueries({
        queryKey: [UseGetAppointmentsQueryKey]
      })
    }

    // Agregar listeners para los eventos de citas
    socket.on('newAppointmentCreated', handleAppointmentCreated)
    socket.on('newAppointmentCanceled', handleAppointmentCanceled)

    return () => {
      socket.off('newAppointmentCreated', handleAppointmentCreated)
      socket.off('newAppointmentCanceled', handleAppointmentCanceled)
    }
  }, [queryClient])

  return query
}
