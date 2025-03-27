"use client"

import { usePathname, useSearchParams } from "next/navigation"
import { useEffect } from "react"

export function Analytics() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Google Analytics:
    // gtag('config', 'GA_MEASUREMENT_ID', {
    //   page_path: pathname + searchParams.toString(),
    // })
    if (process.env.NODE_ENV === "development") {
      console.log(`Page view: ${pathname}${searchParams.toString()}`)
    }
  }, [pathname, searchParams])

  return null
}

