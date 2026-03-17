import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn, severityColor, trustScoreColor, trustScoreBarColor } from '../lib/utils'
import { useRelativeTime } from '../hooks/useRelativeTime'
import { SeverityBadge } from './SeverityBadge'
import { ChevronDown } from 'lucide-react'
import type { ServerInfo } from '../api/mock'

interface ServerRowProps {
  server: ServerInfo
  onScan?: (name: string) => void
}

export function ServerRow({ server, onScan }: ServerRowProps) {
  const [expanded, setExpanded] = useState(false)
  const lastScan = useRelativeTime(server.last_scan)

  const statusColor = server.status === 'active'
    ? 'bg-emerald-400'
    : server.status === 'blocked'
      ? 'bg-red-400'
      : server.status === 'scanning'
        ? 'bg-amber-400 animate-pulse'
        : 'bg-zinc-600'

  return (
    <motion.div
      layout
      className={cn(
        'glass-card rounded-xl overflow-hidden',
        server.status === 'blocked' && 'border-red-400/20',
      )}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left p-4"
      >
        <div className="flex items-center gap-4">
          <div className={cn('w-2 h-2 rounded-full shrink-0 status-pulse', statusColor)} />

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-[#f4f4f5]">
                {server.display_name}
              </span>
              {server.status === 'blocked' && (
                <SeverityBadge severity="critical" />
              )}
            </div>
            <span className="text-xs text-[#3f3f46] font-mono">{server.config_source}</span>
          </div>

          <div className="hidden sm:flex items-center gap-6 shrink-0">
            <div className="text-right">
              <div className="font-mono text-sm tabular-nums text-[#f4f4f5]">
                {server.tools.length}
              </div>
              <div className="text-[11px] text-[#3f3f46]">tools</div>
            </div>

            <div className="w-24">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] text-[#3f3f46]">Trust</span>
                <span className={cn('font-mono text-xs tabular-nums', trustScoreColor(server.trust_score))}>
                  {server.trust_score}
                </span>
              </div>
              <div className="h-1 rounded-full overflow-hidden bg-white/[0.06]">
                <motion.div
                  className={cn('h-full rounded-full', trustScoreBarColor(server.trust_score))}
                  initial={{ width: 0 }}
                  animate={{ width: `${server.trust_score}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut', delay: 0.3 }}
                />
              </div>
            </div>

            <span className="font-mono text-xs text-[#3f3f46] tabular-nums w-16 text-right">
              {lastScan}
            </span>
          </div>

          <motion.div
            animate={{ rotate: expanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="w-4 h-4 text-[#3f3f46]" />
          </motion.div>
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            <div className="border-t border-white/[0.04] p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-medium text-[#3f3f46] uppercase tracking-wider">
                  Tools ({server.tools.length})
                </span>
                {onScan && (
                  <button
                    onClick={(e) => { e.stopPropagation(); onScan(server.name) }}
                    className="text-xs font-medium text-purple-400 hover:text-purple-300 transition-colors"
                  >
                    Scan Now
                  </button>
                )}
              </div>

              <div className="space-y-1">
                {server.tools.map((tool, i) => {
                  const analysisColors = severityColor(
                    tool.llm_analysis === 'malicious' ? 'critical' :
                    tool.llm_analysis === 'suspicious' ? 'warning' :
                    tool.llm_analysis === 'pending' ? 'info' : 'clean'
                  )

                  return (
                    <motion.div
                      key={tool.name}
                      initial={{ opacity: 0, x: 12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05, type: 'spring', stiffness: 300, damping: 25 }}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg bg-white/[0.02] hover:bg-white/[0.04] transition-colors"
                    >
                      <span className="font-mono text-[13px] text-[#f4f4f5] min-w-0 flex-1 truncate">
                        {tool.name}
                      </span>

                      <span className={cn(
                        'text-[10px] font-mono px-1.5 py-0.5 rounded',
                        tool.pinned ? 'text-emerald-400 bg-emerald-400/10' : 'text-red-400 bg-red-400/10',
                      )}>
                        {tool.pinned ? 'PINNED' : 'UNPINNED'}
                      </span>

                      <span className={cn(
                        'text-[10px] font-mono px-1.5 py-0.5 rounded',
                        tool.behavior_baseline ? 'text-blue-400 bg-blue-400/10' : 'text-zinc-500 bg-white/[0.04]',
                      )}>
                        {tool.behavior_baseline ? 'BASELINED' : 'NO BASELINE'}
                      </span>

                      <span className={cn(
                        'text-[10px] font-mono px-1.5 py-0.5 rounded uppercase',
                        analysisColors.text,
                        analysisColors.bg,
                      )}>
                        {tool.llm_analysis}
                      </span>

                      <span className="font-mono text-xs text-[#3f3f46] tabular-nums w-8 text-right">
                        {tool.calls_last_24h}
                      </span>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
