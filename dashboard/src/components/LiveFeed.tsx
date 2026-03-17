import { usePollingApi } from '../hooks/useApi'
import { getEvents } from '../api/client'
import { EventRow } from './EventRow'

interface LiveFeedProps {
  maxItems?: number
}

export function LiveFeed({ maxItems = 20 }: LiveFeedProps) {
  const { data: events } = usePollingApi(getEvents, 5000)

  const items = (events ?? []).slice(0, maxItems)

  return (
    <div className="space-y-0.5 overflow-y-auto max-h-[480px] pr-1">
      {items.length === 0 && (
        <div className="text-center py-8 text-[#3f3f46] text-sm">
          No events recorded
        </div>
      )}
      {items.map((event, i) => (
        <EventRow key={event.id} event={event} index={i} />
      ))}
    </div>
  )
}
