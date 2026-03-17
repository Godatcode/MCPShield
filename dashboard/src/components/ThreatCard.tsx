import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn, severityColor } from '../lib/utils'
import { SeverityBadge } from './SeverityBadge'
import { ChevronDown } from 'lucide-react'
import type { ThreatSignature } from '../api/mock'

interface ThreatCardProps {
  threat: ThreatSignature
}

export function ThreatCard({ threat }: ThreatCardProps) {
  const [expanded, setExpanded] = useState(false)
  const colors = severityColor(threat.severity)

  return (
    <motion.div
      layout
      className={cn(
        'glass-card rounded-xl overflow-hidden',
        'severity-left-border',
        `severity-left-border-${threat.severity}`,
      )}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left p-4"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="font-mono text-xs text-[#3f3f46] tabular-nums">{threat.id}</span>
              <SeverityBadge severity={threat.severity} />
              <span className="text-xs text-[#3f3f46] px-2 py-0.5 bg-white/[0.04] rounded">
                {threat.category}
              </span>
            </div>
            <h3 className="text-sm font-medium text-[#f4f4f5]">{threat.title}</h3>
            <p className="text-[13px] text-[#52525b] mt-1 line-clamp-2">{threat.description}</p>
          </div>

          <motion.div
            animate={{ rotate: expanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="shrink-0 mt-1"
          >
            <ChevronDown className="w-4 h-4 text-[#3f3f46]" />
          </motion.div>
        </div>

        {threat.owasp_ids.length > 0 && (
          <div className="flex items-center gap-1.5 mt-2">
            {threat.owasp_ids.map((id) => (
              <span
                key={id}
                className={cn(
                  'font-mono text-[10px] px-1.5 py-0.5 rounded',
                  colors.text,
                  colors.bg,
                )}
              >
                {id}
              </span>
            ))}
          </div>
        )}
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
            <div className="px-4 pb-4 border-t border-white/[0.04] pt-3 space-y-3">
              {threat.pattern && (
                <div>
                  <span className="text-[11px] font-medium text-[#3f3f46] uppercase tracking-wider">
                    Detection Pattern
                  </span>
                  <code className="block mt-1 font-mono text-xs text-purple-400 bg-purple-400/10 px-2 py-1.5 rounded">
                    {threat.pattern}
                  </code>
                </div>
              )}

              {threat.mitigations.length > 0 && (
                <div>
                  <span className="text-[11px] font-medium text-[#3f3f46] uppercase tracking-wider">
                    Mitigations
                  </span>
                  <ul className="mt-1 space-y-0.5">
                    {threat.mitigations.map((m, i) => (
                      <li key={i} className="text-xs text-[#a1a1aa] flex items-center gap-1.5">
                        <span className="w-1 h-1 rounded-full bg-emerald-400 shrink-0" />
                        {m}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {threat.references.length > 0 && (
                <div>
                  <span className="text-[11px] font-medium text-[#3f3f46] uppercase tracking-wider">
                    References
                  </span>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {threat.references.map((ref, i) => (
                      <span key={i} className="font-mono text-[11px] text-[#52525b] bg-white/[0.04] px-2 py-0.5 rounded">
                        {ref}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
