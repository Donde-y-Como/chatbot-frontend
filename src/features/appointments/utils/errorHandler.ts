/**
 * Error handler utilities for appointment-related operations
 * Maps backend errors to user-friendly Spanish messages
 */

export interface AppointmentError {
  title?: string
  detail?: string
  code?: number
  status?: number
  message?: string
}

export interface ErrorHandlerResult {
  message: string
  type: 'error' | 'warning' | 'info'
}

/**
 * Maps backend error codes/titles to user-friendly messages
 */
export function handleAppointmentError(error: AppointmentError): ErrorHandlerResult {
  const errorTitle = error.title || ''
  const errorDetail = error.detail || error.message || ''
  const status = error.status || error.code || 0

  // Service availability errors
  if (errorTitle === 'SERVICE_NOT_FOUND' || errorDetail.includes('Service with id')) {
    return {
      message: 'El servicio seleccionado no existe o fue eliminado',
      type: 'error'
    }
  }

  // Non-work date errors (Service or Business)
  if (errorTitle === 'NON_WORK_DATE' || errorDetail.includes('no funciona el dia') || errorDetail.includes('no trabaja el dia')) {
    return {
      message: errorDetail,  // Use backend message as it contains the specific date and reason
      type: 'warning'
    }
  }

  // Business schedule not found
  if (errorTitle === 'BUSINESS_SCHEDULE_NOT_FOUND' || errorDetail.includes('BusinessSchedule not found')) {
    return {
      message: 'No se ha configurado el horario de trabajo. Por favor contacta al administrador',
      type: 'error'
    }
  }

  // Past date errors
  if (
    errorDetail.includes('fechas pasadas') ||
    errorDetail.includes('cita que ya pasó') ||
    errorTitle === 'Invalid appointment date' ||
    errorTitle === 'Cannot edit past appointment'
  ) {
    return {
      message: 'No se pueden agendar citas en fechas pasadas',
      type: 'error'
    }
  }

  // Service inactive
  if (errorDetail.includes('currently inactive') || errorTitle === 'Service is not available for booking') {
    return {
      message: 'El servicio no está disponible para reservas en este momento',
      type: 'warning'
    }
  }

  // No available slots
  if (errorTitle === 'No available slots for the requested date' || errorDetail.includes('The date is not available')) {
    return {
      message: 'No hay espacios disponibles en la fecha seleccionada',
      type: 'warning'
    }
  }

  // Service not available in time slot
  if (
    errorTitle === 'Requested service is not available' ||
    errorDetail.includes('not available in neither of the requested time slots')
  ) {
    return {
      message: 'El servicio no está disponible en el horario seleccionado. Por favor elige otro horario',
      type: 'warning'
    }
  }

  // Employee availability errors
  if (
    errorTitle === 'Employees requested are not all available for the requested time slot' ||
    errorDetail.includes('Not all requested employees are available')
  ) {
    return {
      message: 'Uno o más empleados seleccionados no están disponibles en este horario',
      type: 'warning'
    }
  }

  // Equipment errors
  if (errorTitle === 'Invalid equipment for appointment' || errorDetail.includes('equipment is not available')) {
    return {
      message: 'El equipo requerido no está disponible para esta cita',
      type: 'error'
    }
  }

  // Consumable/Stock errors
  if (
    errorTitle === 'Insufficient stock for consumables' ||
    errorDetail.includes('Not enough stock') ||
    errorDetail.includes('Failed to reserve consumables')
  ) {
    return {
      message: 'No hay suficiente stock de los consumibles requeridos',
      type: 'error'
    }
  }

  // Equipment assignment error
  if (errorTitle === 'Failed to assign equipment' || errorDetail.includes('Could not assign equipment')) {
    return {
      message: 'No se pudo asignar el equipo necesario para la cita',
      type: 'error'
    }
  }

  // Generic 400 errors
  if (status === 400 && errorDetail) {
    return {
      message: errorDetail,
      type: 'error'
    }
  }

  // Network/Server errors
  if (status >= 500) {
    return {
      message: 'Error del servidor. Por favor intenta de nuevo más tarde',
      type: 'error'
    }
  }

  // Default error
  return {
    message: errorDetail || 'Ocurrió un error inesperado. Por favor intenta de nuevo',
    type: 'error'
  }
}

/**
 * Handles availability check errors specifically
 */
export function handleAvailabilityError(error: AppointmentError): ErrorHandlerResult {
  const result = handleAppointmentError(error)

  // For availability checks, we might want to show warnings instead of errors
  if (result.type === 'error' && (
    error.title === 'NON_WORK_DATE' ||
    error.title === 'No available slots for the requested date'
  )) {
    return { ...result, type: 'warning' }
  }

  return result
}
