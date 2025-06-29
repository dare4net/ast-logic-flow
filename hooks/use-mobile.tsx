import { useEffect, useState } from "react"

const MOBILE_BREAKPOINT = 768

/**
 * useMobile - React hook to detect if the user is on a mobile device and provide screen size info.
 * Returns { isMobile, width, height }
 */
export function useMobile() {
  const [isMobile, setIsMobile] = useState(false)
  const [width, setWidth] = useState(typeof window !== "undefined" ? window.innerWidth : 1024)
  const [height, setHeight] = useState(typeof window !== "undefined" ? window.innerHeight : 768)

  useEffect(() => {
    function handleResize() {
      setWidth(window.innerWidth)
      setHeight(window.innerHeight)
      setIsMobile(window.innerWidth <= MOBILE_BREAKPOINT || /Mobi|Android/i.test(navigator.userAgent))
    }
    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return { isMobile, width, height }
}
