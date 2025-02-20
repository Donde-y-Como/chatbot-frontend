import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { IconBrandFacebook, IconBrandInstagram } from "@tabler/icons-react"
import { PhoneIcon as WhatsApp } from 'lucide-react'
import { useMemo } from "react"
import { useGetClients } from "../../appointments/hooks/useGetClients"
import { PlatformName } from "../../chats/ChatTypes"
import { EventWithBookings } from "../types"

type EventDetailBookingsProps = {
  event: EventWithBookings
}

export function EventDetailBookings({ event }: EventDetailBookingsProps) {
  const { data: clients } = useGetClients()

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

  return (
    <div className="flex items-center gap-2">
      <div className="flex -space-x-2">
        {bookingDetails.map(
          (booking, index) =>
            booking.client && (
              <Dialog key={booking.id}>
                <HoverCard>
                  <HoverCardTrigger asChild>
                    <DialogTrigger asChild>
                      <Avatar
                        className="ring-2 ring-background cursor-pointer transition-transform hover:scale-105 hover:z-10"
                        style={{
                          zIndex: bookingDetails.length - index,
                        }}
                      >
                        <AvatarImage src={booking.client.photo} alt={booking.client.name} />
                        <AvatarFallback>{getInitials(booking.client.name)}</AvatarFallback>
                      </Avatar>
                    </DialogTrigger>
                  </HoverCardTrigger>
                  <HoverCardContent className="w-80">
                    <div className="flex justify-between space-x-4">
                      <Avatar>
                        <AvatarImage src={booking.client.photo} />
                        <AvatarFallback>{getInitials(booking.client.name)}</AvatarFallback>
                      </Avatar>
                      <div className="space-y-1">
                        <h4 className="text-sm font-semibold">{booking.client.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          Participantes: {booking.participants}
                        </p>
                      </div>
                    </div>
                  </HoverCardContent>
                </HoverCard>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{booking.client.name}</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-20 w-20">
                        <AvatarImage src={booking.client.photo} alt={booking.client.name} />
                        <AvatarFallback className="text-xl">
                          {getInitials(booking.client.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="grid gap-1">
                        <p className="text-sm font-medium">{booking.client.email}</p>
                        <div className="flex gap-2">
                          {booking.client.platformIdentities.map((platform) => (
                            <div
                              key={platform.platformId}
                              className="flex items-center gap-1 text-sm text-muted-foreground"
                            >
                              {getPlatformIcon(platform.platformName)}
                              {platform.profileName}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    {booking.client.notes && (
                      <p className="text-sm text-muted-foreground">{booking.client.notes}</p>
                    )}
                    <div className="grid gap-1">
                      <p className="text-sm font-medium">Detalles de la reserva</p>
                      <p className="text-sm text-muted-foreground">
                        Numero de participantes: {booking.participants}
                      </p>
                      {booking.notes && (
                        <p className="text-sm text-muted-foreground">Notas: {booking.notes}</p>
                      )}
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )
        )}
      </div>
      <Badge variant="outline" className="text-sm">
        {event.capacity.isLimited
          ? `${event.bookings.length} / ${event.capacity.maxCapacity} reservas`
          : `${event.bookings.length} reservas`}
      </Badge>
    </div>
  )
}