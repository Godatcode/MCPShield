import { motion } from 'framer-motion'
import { cn } from '../lib/utils'
import type { ComplianceItem } from '../api/mock'

interface OWASPScorecardProps {
  title: string
  items: ComplianceItem[]
  className?: string
}

export function OWASPScorecard({ title, items, className }: OWASPScorecardProps) {
  return (
    <div className={cn('space-y-2', className)}>
      <h3 className="text-xs font-semibold text-[#3f3f46] uppercase tracking-wider">
        {title}
      </h3>
      <div className="space-y-1">
        {items.map((item, i) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.04, type: 'spring', stiffness: 300, damping: 25 }}
            className="flex items-center gap-3 px-3 py-2 rounded-lg bg-white/[0.02] hover:bg-white/[0.04] transition-colors"
          >
            <StatusDot status={item.status} />
            <span className="font-mono text-[11px] text-[#3f3f46] tabular-nums w-14 shrink-0">
              {item.id}
            </span>
            <span className="text-[13px] text-[#f4f4f5] flex-1 min-w-0 truncate">
              {item.name}
            </span>
            <span className="font-mono text-[11px] text-[#52525b] shrink-0">
              {item.module}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

function StatusDot({ status }: { status: 'covered' | 'partial' | 'missing' }) {
  return (
    <div
      className={cn(
        'w-2 h-2 rounded-full shrink-0',
        status === 'covered' && 'bg-emerald-400 status-pulse',
        status === 'partial' && 'bg-amber-400',
        status === 'missing' && 'bg-red-400',
      )}
      title={status}
    />
  )
}
