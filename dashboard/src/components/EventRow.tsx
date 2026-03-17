import { motion } from 'framer-motion'
import { cn, severityColor } from '../lib/utils'
import { useRelativeTime } from '../hooks/useRelativeTime'
import { SeverityBadge } from './SeverityBadge'
import type { AuditEvent } from '../api/mock'

interface EventRowProps {
  event: AuditEvent
  index?: number
}

export function EventRow({ event, index = 0 }: EventRowProps) {
  const timeAgo = useRelativeTime(event.timestamp)
  const colors = severityColor(event.severity)

  const ageMs = Date.now() - new Date(event.timestamp).getTime()
  const timestampOpacity = ageMs < 60_000 ? 1 : ageMs < 300_000 ? 0.7 : 0.5

  return (
    <motion.div
      initial={{ opacity: 0, x: 20, scale: 0.98 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 25,
        delay: index * 0.03,
      }}
      className={cn(
        'flex items-start gap-3 px-3 py-2.5 rounded-lg',
        'severity-left-border',
        `severity-left-border-${event.severity}`,
        'hover:bg-white/[0.02] transition-colors duration-150',
      )}
    >
      <span
        className="font-mono text-xs tabular-nums shrink-0 mt-0.5 min-w-[52px] text-right text-[#a1a1aa]"
        style={{ opacity: timestampOpacity }}
      >
        {timeAgo}
      </span>

      <SeverityBadge severity={event.severity} className="shrink-0 mt-0.5" />

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[13px] text-[#a1a1aa] truncate">
            {event.tool ? `${event.server}.${event.tool}` : event.server}
          </span>
        </div>
        <p className="text-[13px] text-[#52525b] mt-0.5 line-clamp-1">{event.description}</p>
      </div>

      <div
        className={cn('w-1.5 h-1.5 rounded-full shrink-0 mt-2', colors.dot)}
        title={event.severity}
      />
    </motion.div>
  )
}
