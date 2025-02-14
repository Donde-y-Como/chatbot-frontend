import React from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { EventPrimitives } from '@/features/events/types.ts'

export default function EventCarousel({ event }: { event: EventPrimitives }) {
  const [currentIndex, setCurrentIndex] = React.useState(0)
  const images = event.photos

  const previousImage = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    )
  }

  const nextImage = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    )
  }
  return (
    <div className='relative w-full h-[400px] overflow-hidden rounded-md'>
      {images.length > 0 ? (
        <>
          <img
            src={images[currentIndex]}
            alt={`Event image ${currentIndex + 1}`}
            className='w-full h-full object-cover'
          />
          {images.length > 1 && (
            <>
              <button
                onClick={previousImage}
                className='absolute top-1/2 left-4 transform -translate-y-1/2 bg-primary text-background rounded-full p-1 items-center flex justify-center opacity-75 hover:opacity-100'
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={nextImage}
                className='absolute top-1/2 right-4 transform -translate-y-1/2 bg-primary text-background rounded-full p-1 items-center flex justify-center opacity-75 hover:opacity-100'
              >
                <ChevronRight size={20} />
              </button>
            </>
          )}
        </>
      ) : (
        <div className='w-full h-full flex items-center justify-center'>
          Sin imagenes
        </div>
      )}
    </div>
  )
}
