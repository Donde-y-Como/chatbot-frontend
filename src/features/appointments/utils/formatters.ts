export function formatSlotHour(minutes: number) {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60

  // Determine period (AM/PM)
  const period = hours < 12 ? 'AM' : 'PM'

  // Convert to 12-hour format
  const displayHours =
    hours === 0
      ? 12 // Midnight
      : hours > 12
        ? hours - 12 // PM
        : hours // AM

  // Format minutes with leading zero if needed
  const displayMinutes = mins.toString().padStart(2, '0')

  // Return formatted time
  return `${displayHours}:${displayMinutes} ${period}`
}

export function formatTime(minutes: number) {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`
}

export function isAppointmentPast(appointmentDate: string | Date, timeRange: { startAt: number }): boolean {
  const date = typeof appointmentDate === 'string' ? new Date(appointmentDate) : appointmentDate
  const appointmentDateTime = new Date(date)
  
  // Convertir minutos a horas y minutos para setear la hora exacta
  const hours = Math.floor(timeRange.startAt / 60)
  const minutes = timeRange.startAt % 60
  
  appointmentDateTime.setHours(hours, minutes, 0, 0)
  
  // Comparar con la fecha/hora actual
  return appointmentDateTime < new Date()
}
export function isValidAppointmentDate(date: Date): boolean {
  const today = new Date()
  today.setHours(0, 0, 0, 0) 
  
  const appointmentDate = new Date(date)
  appointmentDate.setHours(0, 0, 0, 0) 
  
  return appointmentDate >= today
}

export function getPastDateErrorMessage(): string {
  return 'No se pueden agendar citas en fechas pasadas. Por favor selecciona una fecha desde hoy en adelante.'
}

export function canChangeDateTo(currentDate: Date, newDate: Date): boolean {
  if (!isValidAppointmentDate(newDate)) {
    return false
  }
  
  // Si la cita actual ya pasó, no se puede editar
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const current = new Date(currentDate)
  current.setHours(0, 0, 0, 0)
  
  return current >= today
}
