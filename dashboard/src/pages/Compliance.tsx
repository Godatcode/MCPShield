import { motion } from 'framer-motion'
import { useApi } from '../hooks/useApi'
import { getComplianceMCP, getComplianceAgentic } from '../api/client'
import { ProgressRing } from '../components/ProgressRing'
import { OWASPScorecard } from '../components/OWASPScorecard'
import { stagger, fadeUp } from '../lib/animations'

export function Compliance() {
  const { data: mcp } = useApi(getComplianceMCP)
  const { data: agentic } = useApi(getComplianceAgentic)

  const mcpCovered = mcp?.filter((i) => i.status === 'covered').length ?? 0
  const mcpTotal = mcp?.length ?? 10
  const agenticCovered = agentic?.filter((i) => i.status === 'covered').length ?? 0
  const agenticTotal = agentic?.length ?? 10

  return (
    <motion.div
      className="space-y-8"
      initial="hidden"
      animate="visible"
      variants={stagger}
    >
      <motion.div variants={fadeUp} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#f4f4f5]">Compliance</h1>
          <p className="text-sm text-[#3f3f46] mt-0.5">
            OWASP coverage across MCP and Agentic security frameworks
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="px-4 py-2 rounded-lg text-sm font-medium border border-white/[0.06] text-[#a1a1aa] hover:text-[#f4f4f5] hover:border-white/[0.1] transition-colors"
        >
          Export Report
        </motion.button>
      </motion.div>

      {/* Score summary */}
      <motion.div
        variants={fadeUp}
        className="flex items-center justify-center gap-16 glass-card rounded-xl py-8"
      >
        <div className="text-center">
          <ProgressRing value={mcpCovered} max={mcpTotal} size={100} strokeWidth={6} color="#8b5cf6" />
          <p className="text-sm font-medium text-[#a1a1aa] mt-3">OWASP MCP Top 10</p>
        </div>
        <div className="w-px h-20 bg-white/[0.04]" />
        <div className="text-center">
          <ProgressRing value={agenticCovered} max={agenticTotal} size={100} strokeWidth={6} color="#3b82f6" />
          <p className="text-sm font-medium text-[#a1a1aa] mt-3">OWASP Agentic Top 10</p>
        </div>
      </motion.div>

      {/* Detailed scorecards */}
      <motion.div variants={fadeUp} className="grid grid-cols-2 gap-6">
        <div className="glass-card rounded-xl p-5">
          {mcp && <OWASPScorecard title="OWASP MCP Top 10" items={mcp} />}
        </div>
        <div className="glass-card rounded-xl p-5">
          {agentic && <OWASPScorecard title="OWASP Agentic Top 10" items={agentic} />}
        </div>
      </motion.div>

      {/* Legend */}
      <motion.div variants={fadeUp} className="flex items-center gap-6 text-xs text-[#3f3f46]">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          Covered
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-amber-400" />
          Partial
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-red-400" />
          Missing
        </div>
      </motion.div>
    </motion.div>
  )
}
