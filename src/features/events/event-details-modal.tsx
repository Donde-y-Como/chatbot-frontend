import * as React from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { EventPrimitives } from '@/features/events/types.ts'

export function EventDetailsModal({
                                    event,
                                    open,
                                    onClose,
                                  }: {
  event: EventPrimitives
  open: boolean
  onClose: () => void
}) {
  const [currentIndex, setCurrentIndex] = React.useState(0)

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[720px]">
        <div className="flex flex-col gap-4">
          <Carousel className="w-full" currentIndex={currentIndex} onSelect={setCurrentIndex}>
            <CarouselContent>
              {event.photos.map((photo, index) => (
                <CarouselItem key={index}>
                  <div className="relative aspect-square w-full overflow-hidden rounded-lg">
                    <img
                      src={photo || "/placeholder.svg"}
                      alt={`${event.name} photo ${index + 1}`}
                      className="object-cover"
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>

          <div className="grid grid-cols-6 gap-2">
            {event.photos.map((photo, index) => (
              <button
                key={index}
                className={`relative aspect-square w-full overflow-hidden rounded-lg ${
                  currentIndex === index ? "ring-2 ring-primary" : ""
                }`}
                onClick={() => setCurrentIndex(index)}
              >
                <img
                  src={photo || "/placeholder.svg"}
                  alt={`${event.name} thumbnail ${index + 1}`}
                  className="object-cover"
                />
              </button>
            ))}
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold">{event.name}</h2>
            <p className="text-muted-foreground">{event.description}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

