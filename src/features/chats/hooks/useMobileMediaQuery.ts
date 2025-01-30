import { useEffect, useState } from 'react';

export function useMobileMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    const listener = () => setMatches(media.matches);
    media.addEventListener('change', listener);
    listener();
    return () => media.removeEventListener('change', listener);
  }, [query]);

  return matches;
}