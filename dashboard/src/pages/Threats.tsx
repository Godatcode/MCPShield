import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useApi } from '../hooks/useApi'
import { getThreats } from '../api/client'
import { ThreatCard } from '../components/ThreatCard'
import { cn } from '../lib/utils'
import { stagger, fadeUp } from '../lib/animations'
import { Search } from 'lucide-react'
import type { Severity } from '../api/mock'

const filters: { label: string; value: Severity | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Critical', value: 'critical' },
  { label: 'High', value: 'high' },
  { label: 'Medium', value: 'medium' },
  { label: 'Warning', value: 'warning' },
  { label: 'Low', value: 'low' },
]

export function Threats() {
  const { data: threats } = useApi(getThreats)
  const [search, setSearch] = useState('')
  const [severity, setSeverity] = useState<Severity | 'all'>('all')

  const filtered = (threats ?? []).filter((t) => {
    if (severity !== 'all' && t.severity !== severity) return false
    if (search) {
      const q = search.toLowerCase()
      return (
        t.title.toLowerCase().includes(q) ||
        t.id.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q)
      )
    }
    return true
  })

  return (
    <motion.div
      className="space-y-6"
      initial="hidden"
      animate="visible"
      variants={stagger}
    >
      <motion.div variants={fadeUp}>
        <h1 className="text-2xl font-semibold text-[#f4f4f5]">Threat Signatures</h1>
        <p className="text-sm text-[#3f3f46] mt-0.5">
          {threats?.length ?? 0} detection rules active
        </p>
      </motion.div>

      {/* Search + Filters */}
      <motion.div variants={fadeUp} className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#3f3f46]" />
          <input
            type="text"
            placeholder="Search threats..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={cn(
              'w-full glass-card rounded-lg pl-10 pr-4 py-2.5',
              'text-sm text-[#f4f4f5] placeholder:text-[#3f3f46]',
              'focus:outline-none focus:border-white/[0.1] transition-colors',
            )}
          />
        </div>

        <div className="flex items-center gap-2">
          {filters.map((f) => (
            <motion.button
              key={f.value}
              onClick={() => setSeverity(f.value)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200',
                severity === f.value
                  ? 'bg-white/[0.06] text-[#f4f4f5] border border-white/[0.1]'
                  : 'text-[#a1a1aa] hover:text-[#f4f4f5] hover:bg-white/[0.03] border border-transparent',
              )}
            >
              {f.label}
            </motion.button>
          ))}
          {filtered.length !== (threats?.length ?? 0) && (
            <span className="text-xs text-[#3f3f46] ml-2 font-mono tabular-nums">
              {filtered.length} results
            </span>
          )}
        </div>
      </motion.div>

      {/* Threat list */}
      <motion.div variants={fadeUp} className="space-y-3">
        <AnimatePresence mode="popLayout">
          {filtered.map((threat, i) => (
            <motion.div
              key={threat.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: i * 0.04, type: 'spring', stiffness: 200, damping: 20 }}
            >
              <ThreatCard threat={threat} />
            </motion.div>
          ))}
        </AnimatePresence>
        {filtered.length === 0 && threats && (
          <div className="text-center py-12 text-[#3f3f46] text-sm">
            No threats match your filters
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}
