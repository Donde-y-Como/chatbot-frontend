import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { IconBrandFacebook, IconBrandInstagram } from "@tabler/icons-react"
import { PhoneIcon as WhatsApp, Calendar, Users, Clipboard, Clock } from 'lucide-react'
import { useMemo } from "react"
import { useGetClients } from "../../appointments/hooks/useGetClients"
import { PlatformName } from "../../chats/ChatTypes"
import { EventWithBookings, Booking } from "../types"
import { formatDuration, intervalToDuration, parseISO } from "date-fns"
import { es } from "date-fns/locale"

type EventDetailBookingsProps = {
  event: EventWithBookings
}

export function EventDetailBookings({ event }: EventDetailBookingsProps) {
  const { data: clients } = useGetClients()
  const MAX_VISIBLE_AVATARS = 5;

  const bookingDetails = useMemo(() => {
    return event.bookings.map((booking) => {
      const client = clients?.find((client) => client.id === booking.clientId)
      return {
        ...booking,
        client,
      }
    })
  }, [event.bookings, clients])

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
      // For short version
      // formatters: {
      //   hours: (value) => `${value}h`,
      //   minutes: (value) => `${value}m`,
      // }
    });
  }

  const visibleBookings = bookingDetails.slice(0, MAX_VISIBLE_AVATARS);
  const remainingCount = bookingDetails.length - MAX_VISIBLE_AVATARS;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <div className="flex -space-x-2 flex-wrap">
        {visibleBookings.map(
          (booking, index) =>
            booking.client && (
              <Dialog key={booking.id}>
                <HoverCard>
                  <HoverCardTrigger asChild>
                    <DialogTrigger asChild>
                      <Avatar
                        className="ring-2 ring-background cursor-pointer transition-transform hover:scale-105 hover:z-10"
                        style={{
                          zIndex: visibleBookings.length - index,
                        }}
                      >
                        <AvatarImage src={booking.client.photo} alt={booking.client.name} className="object-cover" />
                        <AvatarFallback>{getInitials(booking.client.name)}</AvatarFallback>
                      </Avatar>
                    </DialogTrigger>
                  </HoverCardTrigger>
                  <HoverCardContent className="w-80">
                    <div className="flex space-x-4">
                      <Avatar>
                        <AvatarImage src={booking.client.photo} alt={booking.client.name} className="object-cover" />
                        <AvatarFallback>{getInitials(booking.client.name)}</AvatarFallback>
                      </Avatar>
                      <div className="space-y-1 flex-1 overflow-hidden">
                        <h4 className="text-sm font-semibold truncate">{booking.client.name}</h4>
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
                    <DialogTitle className="text-xl">{booking.client.name}</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-6 py-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                      <Avatar className="h-20 w-20 sm:h-24 sm:w-24">
                        <AvatarImage src={booking.client.photo} alt={booking.client.name} className="object-cover" />
                        <AvatarFallback className="text-xl sm:text-2xl">
                          {getInitials(booking.client.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="grid gap-2 flex-1 overflow-hidden w-full">
                        <h3 className="font-medium text-lg truncate">{booking.client.name}</h3>
                        <p className="text-sm font-medium truncate">{booking.client.email}</p>
                        <div className="flex flex-wrap gap-2">
                          {booking.client.platformIdentities.map((platform) => (
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
                </DialogContent>
              </Dialog>
            )
        )}
        {remainingCount > 0 && (
          <HoverCard>
            <HoverCardTrigger asChild>
              <Avatar className="ring-2 ring-background bg-muted cursor-pointer transition-transform hover:scale-105 hover:z-10">
                <AvatarFallback>+{remainingCount}</AvatarFallback>
              </Avatar>
            </HoverCardTrigger>
            <HoverCardContent className="w-60">
              <p className="text-sm">
                {remainingCount} {remainingCount === 1 ? 'reserva' : 'reservas'} adicional{remainingCount !== 1 ? 'es' : ''}
              </p>
            </HoverCardContent>
          </HoverCard>
        )}
      </div>
      <Badge variant="outline" className="text-sm whitespace-nowrap">
        {event.capacity.isLimited && event.capacity.maxCapacity
          ? `${event.bookings.length} / ${event.capacity.maxCapacity} reservas`
          : `${event.bookings.length} reservas`}
      </Badge>
    </div>
  )
}