import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { IconBrandFacebook, IconBrandInstagram } from "@tabler/icons-react"
import { format, formatDuration, intervalToDuration, parseISO } from "date-fns"
import { es } from "date-fns/locale"
import { Calendar, Clipboard, Clock, Users, PhoneIcon as WhatsApp } from 'lucide-react'
import { ScrollArea } from "../../../components/ui/scroll-area"
import { useGetClients } from "../../appointments/hooks/useGetClients"
import { Client, PlatformName } from "../../chats/ChatTypes"
import { Booking, DurationPrimitives, EventWithBookings } from "../types"

interface EventDetailBookingsByDateProps {
    event: EventWithBookings;
    occurrences: DurationPrimitives[];
}

export function EventDetailBookingsByDate({ event, occurrences }: EventDetailBookingsByDateProps) {
    const { data: clients } = useGetClients()
    const MAX_VISIBLE_AVATARS = 3; // Reduced for date-grouped display

    const getInitials = (name: string) => {
        if (!name) return '';
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
    }

    const getPlatformIcon = (platform: PlatformName) => {
        switch (platform) {
            case PlatformName.Facebook:
                return <IconBrandFacebook className="h-4 w-4" />
            case PlatformName.Instagram:
                return <IconBrandInstagram className="h-4 w-4" />
            case PlatformName.Whatsapp:
                return <WhatsApp className="h-4 w-4" />
            default:
                return null; // Handle default case or unknown platforms
        }
    }

    const formatDate = (isoDate: string) => {
        if (!isoDate) return 'N/A';
        const date = new Date(isoDate);
        return new Intl.DateTimeFormat('es', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    }

    const formatDateRange = (startAt: string, endAt: string) => {
        if (!startAt || !endAt) return 'N/A';

        const start = new Date(startAt);
        const end = new Date(endAt);

        // If same day, show only one date with time range
        if (start.toDateString() === end.toDateString()) {
            return `${new Intl.DateTimeFormat('es', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
            }).format(start)} · ${new Intl.DateTimeFormat('es', {
                hour: '2-digit',
                minute: '2-digit'
            }).format(start)} - ${new Intl.DateTimeFormat('es', {
                hour: '2-digit',
                minute: '2-digit'
            }).format(end)}`;
        }

        // Different days, show full range
        return `${formatDate(startAt)} - ${formatDate(endAt)}`;
    }

    const calculateDuration = (startAt: string, endAt: string) => {
        if (!startAt || !endAt) return 'N/A';

        const start = parseISO(startAt);
        const end = parseISO(endAt);

        const duration = intervalToDuration({ start, end });

        return formatDuration(duration, {
            format: ['days', 'hours', 'minutes'],
            locale: es,
            delimiter: ', ',
            zero: false,
        });
    }

    return (
        <ScrollArea className="h-full  p-2">
            <div>
                <h3 className="text-lg font-semibold mb-4">Reservas por fecha</h3>

                {occurrences.map((occurrence, index) => {
                    const occurrenceDate = new Date(occurrence.startAt);
                    const formattedDate = format(occurrenceDate, 'MMM d, yyyy');
                    const bookingsForDate = event.bookings.filter(booking => format(new Date(booking.date), 'MMM d, yyyy') === formattedDate);

                    if (bookingsForDate.length === 0) return null; // Skip rendering if no bookings for this date

                    return (
                        <div key={index} className="mb-6 p-4 border rounded-md">
                            <h4 className="font-semibold text-md mb-3">{formattedDate}</h4>
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex -space-x-2 flex-wrap">
                                    {bookingsForDate.slice(0, MAX_VISIBLE_AVATARS).map((booking, bookingIndex) => {
                                        const client = clients?.find((client) => client.id === booking.clientId);
                                        return client ? (
                                            <Dialog key={booking.id}>
                                                <HoverCard>
                                                    <HoverCardTrigger asChild>
                                                        <DialogTrigger asChild>
                                                            <Avatar
                                                                className="ring-2 ring-background cursor-pointer transition-transform hover:scale-105 hover:z-10"
                                                                style={{ zIndex: bookingsForDate.length - bookingIndex }}
                                                            >
                                                                <AvatarImage src={client.photo} alt={client.name} />
                                                                <AvatarFallback>{getInitials(client.name)}</AvatarFallback>
                                                            </Avatar>
                                                        </DialogTrigger>
                                                    </HoverCardTrigger>
                                                    <HoverCardContent className="w-80">
                                                        <div className="flex space-x-4">
                                                            <Avatar>
                                                                <AvatarImage src={client.photo} />
                                                                <AvatarFallback>{getInitials(client.name)}</AvatarFallback>
                                                            </Avatar>
                                                            <div className="space-y-1 flex-1 overflow-hidden">
                                                                <h4 className="text-sm font-semibold truncate">{client.name}</h4>
                                                                <div className="flex items-center text-sm text-muted-foreground gap-2">
                                                                    <Users className="h-3 w-3" />
                                                                    <span>{booking.participants}</span>
                                                                </div>
                                                                <div className="flex items-center text-sm text-muted-foreground gap-2">
                                                                    <Calendar className="h-3 w-3" />
                                                                    <span>{formatDate(booking.date)}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </HoverCardContent>
                                                </HoverCard>
                                                <DialogContent className="sm:max-w-md md:max-w-lg max-h-[90vh] overflow-y-auto">
                                                    <DialogHeader>
                                                        <DialogTitle className="text-xl">{client.name}</DialogTitle>
                                                    </DialogHeader>
                                                    {client && <BookingDetailsDialogContent
                                                        booking={booking}
                                                        client={client}
                                                        event={event}
                                                        formatDate={formatDate}
                                                        formatDateRange={formatDateRange}
                                                        calculateDuration={calculateDuration}
                                                        getPlatformIcon={getPlatformIcon}
                                                        getInitials={getInitials}
                                                    />}
                                                </DialogContent>
                                            </Dialog>
                                        ) : null;
                                    })}
                                    {bookingsForDate.length > MAX_VISIBLE_AVATARS && (
                                        <HoverCard>
                                            <HoverCardTrigger asChild>
                                                <Avatar className="ring-2 ring-background bg-muted cursor-pointer transition-transform hover:scale-105 hover:z-10">
                                                    <AvatarFallback>+{bookingsForDate.length - MAX_VISIBLE_AVATARS}</AvatarFallback>
                                                </Avatar>
                                            </HoverCardTrigger>
                                            <HoverCardContent className="w-60">
                                                <p className="text-sm">
                                                    {bookingsForDate.length - MAX_VISIBLE_AVATARS} reserva{bookingsForDate.length - MAX_VISIBLE_AVATARS !== 1 ? 's' : ''} adicional{bookingsForDate.length - MAX_VISIBLE_AVATARS !== 1 ? 'es' : ''}
                                                </p>
                                            </HoverCardContent>
                                        </HoverCard>
                                    )}
                                </div>
                                <Badge variant="outline" className="text-sm whitespace-nowrap">
                                    {event.capacity.isLimited && event.capacity.maxCapacity
                                        ? `${bookingsForDate.length} / ${event.capacity.maxCapacity} reservas`
                                        : `${bookingsForDate.length} reservas`}
                                </Badge>
                            </div>
                        </div>
                    )
                })}
            </div>
        </ScrollArea>
    )
}


interface BookingDetailsDialogContentProps {
    booking: Booking;
    client: Client;
    event: EventWithBookings;
    formatDate: (isoDate: string) => string;
    formatDateRange: (startAt: string, endAt: string) => string;
    calculateDuration: (startAt: string, endAt: string) => string;
    getPlatformIcon: (platform: PlatformName) => React.ReactNode;
    getInitials: (name: string) => string;

}

function BookingDetailsDialogContent({
    booking,
    client,
    event,
    formatDate,
    formatDateRange,
    calculateDuration,
    getPlatformIcon,
    getInitials
}: BookingDetailsDialogContentProps) {
    return (
        <div className="grid gap-6 py-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                <Avatar className="h-20 w-20 sm:h-24 sm:w-24">
                    <AvatarImage src={client.photo} alt={client.name} />
                    <AvatarFallback className="text-xl sm:text-2xl">
                        {getInitials(client.name)}
                    </AvatarFallback>
                </Avatar>
                <div className="grid gap-2 flex-1 overflow-hidden w-full">
                    <h3 className="font-medium text-lg truncate">{client.name}</h3>
                    <p className="text-sm font-medium truncate">{client.email}</p>
                    <div className="flex flex-wrap gap-2">
                        {client.platformIdentities.map((platform) => (
                            <div
                                key={platform.platformId}
                                className="flex items-center gap-1.5 text-sm text-muted-foreground bg-muted px-2 py-1 rounded-md"
                            >
                                {getPlatformIcon(platform.platformName)}
                                <span className="truncate max-w-[120px]">{platform.profileName}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-muted p-4 rounded-lg">
                    <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Detalles de la reserva
                    </h3>
                    <div className="space-y-3">
                        <div className="grid grid-cols-2 text-sm">
                            <span className="text-muted-foreground">Fecha reservada:</span>
                            <span className="font-medium">{formatDate(booking.date)}</span>
                        </div>
                        <div className="grid grid-cols-2 text-sm">
                            <span className="text-muted-foreground">Participantes:</span>
                            <span className="font-medium">{booking.participants}</span>
                        </div>
                        <div className="grid grid-cols-2 text-sm">
                            <span className="text-muted-foreground">Creada:</span>
                            <span className="font-medium">{formatDate(booking.createdAt)}</span>
                        </div>
                        <div className="grid grid-cols-2 text-sm">
                            <span className="text-muted-foreground">Actualizada:</span>
                            <span className="font-medium">{formatDate(booking.updatedAt)}</span>
                        </div>
                        <div className="grid grid-cols-2 text-sm">
                            <span className="text-muted-foreground">Duración del evento:</span>
                            <span className="font-medium flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {calculateDuration(event.duration.startAt, event.duration.endAt)}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="bg-muted p-4 rounded-lg">
                    <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                        <Clipboard className="h-4 w-4" />
                        Información adicional
                    </h3>
                    <div className="space-y-3">
                        <div className="text-sm">
                            <span className="text-muted-foreground block mb-1">Evento:</span>
                            <p className="text-sm overflow-y-auto max-h-16 bg-background p-2 rounded truncate">
                                {event.name}
                            </p>
                        </div>
                        <div className="text-sm">
                            <span className="text-muted-foreground block mb-1">Horario:</span>
                            <p className="text-sm overflow-y-auto max-h-16 bg-background p-2 rounded">
                                {formatDateRange(event.duration.startAt, event.duration.endAt)}
                            </p>
                        </div>
                        {event.location && (
                            <div className="text-sm">
                                <span className="text-muted-foreground block mb-1">Ubicación:</span>
                                <p className="text-sm overflow-y-auto max-h-16 bg-background p-2 rounded">
                                    {event.location}
                                </p>
                            </div>
                        )}
                        {booking.notes && (
                            <div className="text-sm">
                                <span className="text-muted-foreground block mb-1">Notas:</span>
                                <p className="text-sm overflow-y-auto max-h-24 bg-background p-2 rounded">
                                    {booking.notes}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}