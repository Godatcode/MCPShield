import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useApi } from '../hooks/useApi'
import { getOverview, getTrend, triggerScan } from '../api/client'
import { StatCard } from '../components/StatCard'
import { LiveFeed } from '../components/LiveFeed'
import { TrendChart } from '../components/TrendChart'
import { ProgressRing } from '../components/ProgressRing'
import { SeverityBadge } from '../components/SeverityBadge'
import { cn, trustScoreColor, trustScoreBarColor } from '../lib/utils'
import { stagger, fadeUp } from '../lib/animations'
import { Scan } from 'lucide-react'

export function Overview() {
  const { data: overview } = useApi(getOverview)
  const { data: trend } = useApi(getTrend)
  const [scanning, setScanning] = useState(false)

  const handleScan = useCallback(async () => {
    setScanning(true)
    try {
      await triggerScan()
    } finally {
      setTimeout(() => setScanning(false), 1500)
    }
  }, [])

  if (!overview) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-5 h-5 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const recentServers = [
    { name: 'GitHub MCP', tools: 5, status: 'active' as const, trust: 96, lastScan: '15m ago' },
    { name: 'Filesystem', tools: 4, status: 'active' as const, trust: 94, lastScan: '15m ago' },
    { name: 'PostgreSQL', tools: 3, status: 'active' as const, trust: 91, lastScan: '30m ago' },
    { name: 'Slack', tools: 4, status: 'active' as const, trust: 92, lastScan: '30m ago' },
    { name: 'Custom API Gateway', tools: 4, status: 'active' as const, trust: 73, lastScan: '18m ago' },
    { name: 'Sketchy Math Service', tools: 2, status: 'blocked' as const, trust: 4, lastScan: '48m ago' },
    { name: 'Internal DevTools', tools: 5, status: 'active' as const, trust: 88, lastScan: '2h ago' },
  ]

  return (
    <motion.div
      className="space-y-8"
      initial="hidden"
      animate="visible"
      variants={stagger}
    >
      {/* Top bar */}
      <motion.div variants={fadeUp} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#f4f4f5]">Overview</h1>
          <p className="text-sm text-[#3f3f46] mt-0.5">
            Real-time security monitoring for MCP servers
          </p>
        </div>
        <motion.button
          onClick={handleScan}
          disabled={scanning}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={cn(
            'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
            'border border-purple-400/40 text-purple-400',
            'hover:bg-purple-400/10 hover:border-purple-400/60',
            'disabled:opacity-50 disabled:cursor-not-allowed',
          )}
        >
          {scanning ? (
            <span className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
              Scanning...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Scan className="w-4 h-4" />
              Scan Now
            </span>
          )}
        </motion.button>
      </motion.div>

      {/* Metric cards */}
      <motion.div variants={fadeUp} className="grid grid-cols-4 gap-5">
        <StatCard
          label="Servers"
          value={overview.servers}
          trend={{ value: 16, positive: true }}
          sparklineData={overview.sparklines?.servers}
          sparklineColor="#8b5cf6"
        />
        <StatCard
          label="Tools Pinned"
          value={overview.tools_pinned}
          trend={{ value: 8, positive: true }}
          sparklineData={overview.sparklines?.tools}
          sparklineColor="#3b82f6"
        />
        <StatCard
          label="Threats Blocked"
          value={overview.threats_blocked}
          trend={{ value: 50, positive: false }}
          sparklineData={overview.sparklines?.threats}
          sparklineColor="#ef4444"
        />
        <motion.div variants={fadeUp} className="glass-card rounded-xl p-5">
          <span className="text-[11px] font-medium uppercase tracking-widest text-[#52525b]">
            OWASP Coverage
          </span>
          <div className="flex items-center justify-center gap-4 mt-3">
            <ProgressRing
              value={overview.owasp_mcp_score}
              max={overview.owasp_mcp_total}
              size={64}
              strokeWidth={4}
              color="#8b5cf6"
              label="MCP"
            />
            <ProgressRing
              value={overview.owasp_agentic_score}
              max={overview.owasp_agentic_total}
              size={64}
              strokeWidth={4}
              color="#3b82f6"
              label="Agentic"
            />
          </div>
        </motion.div>
      </motion.div>

      {/* Two-column middle */}
      <motion.div variants={fadeUp} className="grid grid-cols-5 gap-6">
        {/* Live Feed - 60% */}
        <div className="col-span-3 glass-card rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-[#f4f4f5]">Live Event Feed</h2>
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
              </span>
              <span className="text-xs text-[#3f3f46]">Live</span>
            </div>
          </div>
          <LiveFeed maxItems={12} />
        </div>

        {/* Threat Trend - 40% */}
        <div className="col-span-2 glass-card rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-[#f4f4f5]">Threat Trend</h2>
            <span className="text-xs text-[#3f3f46] font-mono">Last 24h</span>
          </div>
          {trend && <TrendChart data={trend} height={220} />}

          <div className="flex items-center gap-4 mt-3 pt-3 border-t border-white/[0.04]">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="text-[11px] text-[#3f3f46]">Clean</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span className="text-[11px] text-[#3f3f46]">Warning</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-400" />
              <span className="text-[11px] text-[#3f3f46]">Critical</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Recent Servers Table */}
      <motion.div variants={fadeUp} className="glass-card rounded-xl p-5">
        <h2 className="text-base font-semibold text-[#f4f4f5] mb-4">Servers</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-[11px] font-medium text-[#3f3f46] uppercase tracking-wider">
                <th className="pb-3 pr-4">Status</th>
                <th className="pb-3 pr-4">Name</th>
                <th className="pb-3 pr-4 text-right">Tools</th>
                <th className="pb-3 pr-4">Trust Score</th>
                <th className="pb-3 text-right">Last Scan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {recentServers.map((server, i) => (
                <motion.tr
                  key={server.name}
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.05, type: 'spring', stiffness: 300, damping: 25 }}
                  className="hover:bg-white/[0.02] transition-colors"
                >
                  <td className="py-2.5 pr-4">
                    <span
                      className={cn(
                        'inline-block w-2 h-2 rounded-full',
                        server.status === 'active' ? 'bg-emerald-400' : 'bg-red-400',
                      )}
                    />
                  </td>
                  <td className="py-2.5 pr-4">
                    <span className="text-sm text-[#f4f4f5]">{server.name}</span>
                    {server.status === 'blocked' && (
                      <SeverityBadge severity="critical" className="ml-2" />
                    )}
                  </td>
                  <td className="py-2.5 pr-4 text-right">
                    <span className="font-mono text-sm tabular-nums text-[#a1a1aa]">
                      {server.tools}
                    </span>
                  </td>
                  <td className="py-2.5 pr-4">
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-1.5 rounded-full overflow-hidden bg-white/[0.06]">
                        <motion.div
                          className={cn('h-full rounded-full', trustScoreBarColor(server.trust))}
                          initial={{ width: 0 }}
                          animate={{ width: `${server.trust}%` }}
                          transition={{ duration: 0.8, delay: 0.5 + i * 0.05, ease: 'easeOut' }}
                        />
                      </div>
                      <span className={cn('font-mono text-xs tabular-nums', trustScoreColor(server.trust))}>
                        {server.trust}
                      </span>
                    </div>
                  </td>
                  <td className="py-2.5 text-right">
                    <span className="font-mono text-xs text-[#3f3f46] tabular-nums">
                      {server.lastScan}
                    </span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Configs found */}
      <motion.div variants={fadeUp} className="glass-card rounded-xl p-5">
        <h2 className="text-base font-semibold text-[#f4f4f5] mb-3">
          Discovered Configurations
        </h2>
        <div className="grid grid-cols-3 gap-3">
          {(overview.configs_found ?? []).map((config, i) => (
            <motion.div
              key={config.name}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 + i * 0.08, type: 'spring', stiffness: 200, damping: 20 }}
              className="rounded-lg px-4 py-3 bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04] transition-colors"
            >
              <div className="text-sm font-medium text-[#f4f4f5]">{config.name}</div>
              <div className="font-mono text-xs text-[#52525b] mt-0.5 truncate">{config.path}</div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
}
