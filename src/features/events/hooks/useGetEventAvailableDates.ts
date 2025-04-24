import { isSameDay, parseISO, startOfDay } from "date-fns";
import { useMemo } from "react";
import { Booking, DurationPrimitives, EventWithBookings } from "../types";
import { generateOccurrences } from "../utils/occurrence";

export function useGetEventAvailableDates(event?: EventWithBookings | null) {
    // Compute available occurrence dates.
    const availableDates = useMemo(() => {
        // Verificar que el evento existe
        if (!event) return [] as Date[];

        // Generate occurrences from event duration and recurrence.
        let generated: DurationPrimitives[] = [];
        
        try {
            // Verificar que todas las propiedades necesarias existen
            if (event.recurrence && event.duration) {
                if (event.recurrence.frequency && event.recurrence.frequency !== 'never') {
                    generated = generateOccurrences(
                        event.duration, 
                        event.recurrence.frequency, 
                        event.recurrence.endCondition
                    );
                } else {
                    generated = [event.duration];
                }
            }
            
            // Convertir las fechas generadas a objetos Date
            const dates: Date[] = [];
            generated.forEach(d => {
                if (d && d.startAt) {
                    try {
                        // Usar startOfDay para eliminar las horas, minutos, etc.
                        const date = startOfDay(parseISO(d.startAt));
                        // Verificar que la fecha sea válida antes de agregarla
                        if (!isNaN(date.getTime())) {
                            dates.push(date);
                        }
                    } catch (e) {
                        console.error('Error parsing date:', e);
                    }
                }
            });

            // Ensure any booked date not in the generated list is added.
            if (event.bookings && Array.isArray(event.bookings)) {
                event.bookings.forEach((booking: Booking) => {
                    if (booking && booking.date) {
                        try {
                            const bookingDate = startOfDay(parseISO(booking.date));
                            // Verificar que la fecha sea válida antes de usarla
                            if (!isNaN(bookingDate.getTime()) && !dates.some((d) => isSameDay(d, bookingDate))) {
                                dates.push(bookingDate);
                            }
                        } catch (e) {
                            console.error('Error processing booking date:', e);
                        }
                    }
                });
            }

            // Sort dates ascending.
            return dates.sort((a, b) => a.getTime() - b.getTime());
        } catch (error) {
            console.error('Error in useGetEventAvailableDates:', error);
            return [] as Date[];
        }
    }, [event]);

    return availableDates;
}