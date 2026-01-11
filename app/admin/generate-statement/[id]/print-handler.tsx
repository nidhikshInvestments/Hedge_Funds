"use client"

import { useEffect } from "react"
import { useSearchParams } from "next/navigation"

export function PrintHandler() {
  const searchParams = useSearchParams()
  const shouldPrint = searchParams.get("print") === "true"

  useEffect(() => {
    if (shouldPrint) {
      // Small delay to ensure page is fully rendered
      setTimeout(() => {
        window.print()
      }, 500)
    }
  }, [shouldPrint])

  return null
}
