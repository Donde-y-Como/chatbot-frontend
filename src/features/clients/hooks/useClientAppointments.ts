import { appointmentService } from "@/features/appointments/appointmentService";
import { Appointment, Service } from "@/features/appointments/types";
import { useEffect, useState } from "react";

/**
 * Custom hook for getting client appointments with service details
 * @param clientId - The client ID
 * @param enabled - Whether to fetch data
 * @returns Client appointments with service details, loading state, and any error
 */
export function useClientAppointments(clientId: string | undefined, enabled: boolean = true) {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [services, setServices] = useState<Record<string, Service>>({});
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);
  
    // Fetch both appointments and services
    useEffect(() => {
      if (!clientId || !enabled) {
        setAppointments([]);
        return;
      }
  
      setIsLoading(true);
      setError(null);
  
      // First fetch services to create a lookup map
      const fetchServices = appointmentService.getServices()
        .then(servicesData => {
          // Create a map of service ID to service object for quick lookup
          const servicesMap = servicesData.reduce<Record<string, Service>>((acc, service) => {
            acc[service.id] = service;
            return acc;
          }, {});
          setServices(servicesMap);
          return servicesMap;
        });
  
      // Then fetch appointments using the services data
      fetchServices
        .then(servicesMap => {
          return appointmentService.getAppointments('', '')
            .then(data => {
              // Filter appointments for this client
              const clientAppointments = data.filter(app => app.clientId === clientId);
              
              // Enhance appointments with detailed service info if needed
              const enhancedAppointments = clientAppointments.map(appointment => {
                // If the appointment already has detailed service info, return as is
                if (appointment.serviceName) {
                  return appointment;
                }
                
                // Otherwise, try to add service details from our map
                const service = servicesMap[appointment.serviceId];
                if (service) {
                  return {
                    ...appointment,
                    serviceName: service.name,
                    serviceDuration: service.duration,
                    servicePrice: service.price
                  };
                }
                
                return appointment;
              });
              
              setAppointments(enhancedAppointments);
              return enhancedAppointments;
            });
        })
        .catch(err => {
          console.error('Error fetching appointments or services:', err);
          setError(err instanceof Error ? err : new Error('Unknown error'));
        })
        .finally(() => {
          setIsLoading(false);
        });
    }, [clientId, enabled]);
  
    return { 
      appointments, 
      services,
      isLoading, 
      error 
    };
  }
  