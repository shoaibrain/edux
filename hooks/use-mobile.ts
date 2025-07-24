"use client"

import { useEffect, useState } from "react"

export function useIsMobile(query: string = "(max-width: 768px)") {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia(query)
    const handleChange = () => setIsMobile(mediaQuery.matches)

    handleChange() // Set initial value
    mediaQuery.addEventListener("change", handleChange)

    return () => {
      mediaQuery.removeEventListener("change", handleChange)
    }
  }, [query])

  return isMobile
}