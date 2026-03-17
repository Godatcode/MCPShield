import { useState, useEffect } from 'react'
import { relativeTime } from '../lib/utils'

export function useRelativeTime(iso: string): string {
  const [time, setTime] = useState(() => relativeTime(iso))

  useEffect(() => {
    const update = () => setTime(relativeTime(iso))
    // Update more frequently for recent timestamps
    const diff = Date.now() - new Date(iso).getTime()
    const interval = diff < 60_000 ? 1000 : diff < 3_600_000 ? 10_000 : 60_000
    const id = setInterval(update, interval)
    return () => clearInterval(id)
  }, [iso])

  return time
}
