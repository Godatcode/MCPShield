import { cn, severityColor } from '../lib/utils'

interface SeverityBadgeProps {
  severity: string
  className?: string
}

export function SeverityBadge({ severity, className }: SeverityBadgeProps) {
  const colors = severityColor(severity)

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2 py-0.5',
        'font-mono text-[11px] uppercase tracking-wider',
        colors.bg,
        colors.text,
        className
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', colors.dot)} />
      {severity}
    </span>
  )
}
