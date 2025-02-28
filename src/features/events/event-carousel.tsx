import { EventPrimitives } from '@/features/events/types.ts'
import { cn } from '@/lib/utils'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useEffect, useState } from 'react'

export default function EventCarousel({ event }: { event: EventPrimitives }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const images = event.photos
  
  const goToImage = (index: number) => {
    if (isTransitioning) return
    setIsTransitioning(true)
    setCurrentIndex(index)
  }

  const previousImage = () => {
    if (images.length <= 1) return
    const newIndex = currentIndex === 0 ? images.length - 1 : currentIndex - 1
    goToImage(newIndex)
  }

  const nextImage = () => {
    if (images.length <= 1) return
    const newIndex = currentIndex === images.length - 1 ? 0 : currentIndex + 1
    goToImage(newIndex)
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsTransitioning(false)
    }, 400)
    
    return () => clearTimeout(timer)
  }, [currentIndex])

  return (
    <div className="relative w-full h-full bg-black overflow-hidden">
      {images.length > 0 ? (
        <>
          <div className="w-full h-full flex items-center justify-center">
            {images.map((image, index) => (
              <div
                key={index}
                className={cn(
                  "absolute inset-0 w-full h-full transition-all duration-400 ease-in-out transform",
                  index === currentIndex 
                    ? "opacity-100 translate-x-0" 
                    : index < currentIndex 
                      ? "opacity-0 -translate-x-full" 
                      : "opacity-0 translate-x-full"
                )}
              >
                <div className="w-full h-full flex items-center justify-center bg-background">
                  <img
                    src={image}
                    alt={`Event image ${index + 1}`}
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
            ))}
          </div>

          {images.length > 1 && (
            <>
              {/* Navigation buttons */}
              <button
                onClick={previousImage}
                className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-primary text-background rounded-full p-1 items-center flex justify-center opacity-75 hover:opacity-100 transition-opacity duration-200 z-10"
                disabled={isTransitioning}
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={nextImage}
                className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-primary text-background rounded-full p-1 items-center flex justify-center opacity-75 hover:opacity-100 transition-opacity duration-200 z-10"
                disabled={isTransitioning}
              >
                <ChevronRight size={20} />
              </button>

              {/* Pagination indicators */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
                {images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToImage(index)}
                    className={cn(
                      "w-2 h-2 rounded-full transition-all duration-300",
                      index === currentIndex 
                        ? "bg-primary w-4" 
                        : "bg-primary/50"
                    )}
                    aria-label={`Go to image ${index + 1}`}
                  />
                ))}
              </div>
            </>
          )}
        </>
      ) : (
        <div className="w-full h-full bg-secondary flex items-center justify-center">
          Evento sin imagenes
        </div>
      )}
    </div>
  )
}