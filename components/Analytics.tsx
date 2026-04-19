'use client'

import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

declare global {
  interface Window {
    gtag: (...args: any[]) => void
  }
}

export default function Analytics() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    const url =
      pathname + (searchParams.toString() ? `?${searchParams}` : '')

    window.gtag?.('config', 'G-00SZCS1HEH', {
      page_path: url,
    })
  }, [pathname, searchParams])

  return null
}
