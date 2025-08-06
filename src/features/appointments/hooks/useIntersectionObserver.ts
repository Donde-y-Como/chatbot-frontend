import { useEffect, useRef, useState } from 'react'

interface UseIntersectionObserverOptions {
  onIntersect: () => void
  enabled: boolean
  threshold?: number
  rootMargin?: string
}

export function useIntersectionObserver({
  onIntersect,
  enabled,
  threshold = 0.1,
  rootMargin = '20px'
}: UseIntersectionObserverOptions) {
  const [isIntersecting, setIsIntersecting] = useState(false)
  const targetRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!enabled || !targetRef.current) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        const intersecting = entry.isIntersecting
        setIsIntersecting(intersecting)
        
        if (intersecting) {
          onIntersect()
        }
      },
      {
        threshold,
        rootMargin
      }
    )

    observer.observe(targetRef.current)

    return () => {
      observer.disconnect()
    }
  }, [enabled, onIntersect, threshold, rootMargin])

  return { targetRef, isIntersecting }
}