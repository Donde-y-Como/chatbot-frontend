import { Badge } from "../../../components/ui/badge";
import { EventWithBookings } from "../types";


type EventDetailBoookingsProps = {
    event: EventWithBookings
}

export function EventDetailBoookings({ event }: EventDetailBoookingsProps) {
    return (
        <Badge variant='outline' className='text-sm'>
            {event.capacity.isLimited
                ? `${event.bookings.length} / ${event.capacity.maxCapacity} reservas`
                : `${event.bookings.length} reservas`}
        </Badge>
    )
}