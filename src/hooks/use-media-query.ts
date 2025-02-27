
import { useEffect, useState } from "react"

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState<boolean>(() => {
    // Check if we're in the browser environment
    if (typeof window !== "undefined") {
      return window.matchMedia(query).matches
    }
    return false
  })

  useEffect(() => {
    if (typeof window === "undefined") return undefined

    const media = window.matchMedia(query)
    
    // Initial check
    setMatches(media.matches)

    // Create listener for changes
    const listener = (event: MediaQueryListEvent) => {
      setMatches(event.matches)
    }

    // Add listener
    if (media.addEventListener) {
      media.addEventListener("change", listener)
    } else {
      // Fallback for older browsers
      media.addListener(listener)
    }

    // Cleanup
    return () => {
      if (media.removeEventListener) {
        media.removeEventListener("change", listener)
      } else {
        // Fallback for older browsers
        media.removeListener(listener)
      }
    }
  }, [query])

  return matches
}
