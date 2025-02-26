import { isSameDay, parseISO, startOfDay } from "date-fns";
import { useMemo } from "react";
import { Booking, DurationPrimitives, EventWithBookings } from "../types";
import { generateOccurrences } from "../utils/occurrence";

export function useGetEventAvailableDates(event?: EventWithBookings) {
    // Compute available occurrence dates.
    const availableDates = useMemo(() => {
        if (!event) return [] as Date[];

        // Generate occurrences from event duration and recurrence.
        // (Assumes event.duration and event.recurrence exist.)
        let generated: DurationPrimitives[] = [];
        if (event.recurrence.frequency !== 'never') {
            generated = generateOccurrences(event.duration, event.recurrence.frequency, event.recurrence.endCondition);
        } else {
            generated = [event.duration];
        }
        const dates: Date[] = generated.map((d) => startOfDay(parseISO(d.startAt)));

        // Ensure any booked date not in the generated list is added.
        event.bookings.forEach((booking: Booking) => {
            const bookingDate = startOfDay(parseISO(booking.date));
            if (!dates.some((d) => isSameDay(d, bookingDate))) {
                dates.push(bookingDate);
            }
        });

        // Sort dates ascending.
        return dates.sort((a, b) => a.getTime() - b.getTime());
    }, [event]);

    return availableDates
}