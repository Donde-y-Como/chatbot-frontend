import { useEffect, useState } from 'react'

export const useMobileMediaQuery = (query: string) => {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    const media = window.matchMedia(query)
    const updateMatch = (e: MediaQueryListEvent | MediaQueryList) =>
      setMatches(e.matches)

    setMatches(media.matches)
    media.addEventListener('change', updateMatch)
    return () => media.removeEventListener('change', updateMatch)
  }, [query])

  return matches
}
