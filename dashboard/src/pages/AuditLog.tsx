import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useApi } from '../hooks/useApi'
import { getAuditLog } from '../api/client'
import { SeverityBadge } from '../components/SeverityBadge'
import { CodeBlock } from '../components/CodeBlock'
import { useRelativeTime } from '../hooks/useRelativeTime'
import { cn } from '../lib/utils'
import { stagger, fadeUp } from '../lib/animations'
import { ChevronDown } from 'lucide-react'
import type { Severity } from '../api/mock'

const severityOptions: (Severity | 'all')[] = ['all', 'critical', 'high', 'warning', 'medium', 'low', 'info', 'clean']

export function AuditLog() {
  const { data: logs } = useApi(getAuditLog)
  const [severityFilter, setSeverityFilter] = useState<Severity | 'all'>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [serverFilter, setServerFilter] = useState<string>('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const categories = Array.from(new Set(logs?.map((l) => l.category) ?? []))
  const servers = Array.from(new Set(logs?.map((l) => l.server) ?? []))

  const filtered = (logs ?? []).filter((l) => {
    if (severityFilter !== 'all' && l.severity !== severityFilter) return false
    if (categoryFilter !== 'all' && l.category !== categoryFilter) return false
    if (serverFilter !== 'all' && l.server !== serverFilter) return false
    return true
  })

  return (
    <motion.div
      className="space-y-6"
      initial="hidden"
      animate="visible"
      variants={stagger}
    >
      <motion.div variants={fadeUp} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#f4f4f5]">Audit Log</h1>
          <p className="text-sm text-[#3f3f46] mt-0.5">
            {logs?.length ?? 0} events recorded
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="px-4 py-2 rounded-lg text-sm font-medium border border-white/[0.06] text-[#a1a1aa] hover:text-[#f4f4f5] hover:border-white/[0.1] transition-colors"
        >
          Export JSONL
        </motion.button>
      </motion.div>

      {/* Filters */}
      <motion.div variants={fadeUp} className="flex items-center gap-3">
        <Select
          label="Severity"
          value={severityFilter}
          onChange={setSeverityFilter}
          options={severityOptions.map((s) => ({ label: s === 'all' ? 'All Severities' : s, value: s }))}
        />
        <Select
          label="Category"
          value={categoryFilter}
          onChange={setCategoryFilter}
          options={[{ label: 'All Categories', value: 'all' }, ...categories.map((c) => ({ label: c, value: c }))]}
        />
        <Select
          label="Server"
          value={serverFilter}
          onChange={setServerFilter}
          options={[{ label: 'All Servers', value: 'all' }, ...servers.map((s) => ({ label: s, value: s }))]}
        />

        {(severityFilter !== 'all' || categoryFilter !== 'all' || serverFilter !== 'all') && (
          <button
            onClick={() => { setSeverityFilter('all'); setCategoryFilter('all'); setServerFilter('all') }}
            className="text-xs text-[#3f3f46] hover:text-[#a1a1aa] transition-colors"
          >
            Clear filters
          </button>
        )}

        <span className="text-xs text-[#3f3f46] ml-auto font-mono tabular-nums">
          {filtered.length} entries
        </span>
      </motion.div>

      {/* Table */}
      <motion.div variants={fadeUp} className="glass-card rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="text-left text-[11px] font-medium text-[#3f3f46] uppercase tracking-wider bg-white/[0.02]">
              <th className="px-4 py-3">Time</th>
              <th className="px-4 py-3">Severity</th>
              <th className="px-4 py-3">Server</th>
              <th className="px-4 py-3">Tool</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Description</th>
              <th className="px-4 py-3 w-8" />
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {filtered.map((log, i) => (
              <AuditRow
                key={log.id}
                log={log}
                index={i}
                expanded={expandedId === log.id}
                onToggle={() => setExpandedId(expandedId === log.id ? null : log.id)}
              />
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="text-center py-12 text-[#3f3f46] text-sm">
            No audit events match your filters
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}

function AuditRow({
  log,
  index,
  expanded,
  onToggle,
}: {
  log: { id: string; timestamp: string; severity: string; server: string; tool?: string; category: string; description: string; raw?: Record<string, unknown> }
  index: number
  expanded: boolean
  onToggle: () => void
}) {
  const timeAgo = useRelativeTime(log.timestamp)

  return (
    <>
      <motion.tr
        initial={{ opacity: 0, x: 12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.02, type: 'spring', stiffness: 300, damping: 25 }}
        onClick={onToggle}
        className="hover:bg-white/[0.02] transition-colors cursor-pointer"
      >
        <td className="px-4 py-2.5">
          <span className="font-mono text-xs text-[#3f3f46] tabular-nums">{timeAgo}</span>
        </td>
        <td className="px-4 py-2.5">
          <SeverityBadge severity={log.severity} />
        </td>
        <td className="px-4 py-2.5">
          <span className="text-sm text-[#a1a1aa]">{log.server}</span>
        </td>
        <td className="px-4 py-2.5">
          <span className="font-mono text-[13px] text-[#f4f4f5]">{log.tool ?? '\u2014'}</span>
        </td>
        <td className="px-4 py-2.5">
          <span className="text-xs text-[#3f3f46]">{log.category}</span>
        </td>
        <td className="px-4 py-2.5">
          <span className="text-[13px] text-[#52525b] line-clamp-1">{log.description}</span>
        </td>
        <td className="px-4 py-2.5">
          <motion.div
            animate={{ rotate: expanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="w-4 h-4 text-[#3f3f46]" />
          </motion.div>
        </td>
      </motion.tr>
      <AnimatePresence>
        {expanded && log.raw && (
          <motion.tr
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <td colSpan={7} className="px-4 py-3 bg-[rgba(9,9,11,0.5)]">
              <CodeBlock data={log.raw} />
            </td>
          </motion.tr>
        )}
      </AnimatePresence>
    </>
  )
}

function Select<T extends string>({
  label,
  value,
  onChange,
  options,
}: {
  label: string
  value: T
  onChange: (v: T) => void
  options: { label: string; value: T }[]
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as T)}
      aria-label={label}
      className={cn(
        'glass-card rounded-lg px-3 py-2',
        'text-xs text-[#a1a1aa]',
        'focus:outline-none focus:border-white/[0.1] transition-colors',
        'appearance-none cursor-pointer',
        'font-mono',
      )}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  )
}
