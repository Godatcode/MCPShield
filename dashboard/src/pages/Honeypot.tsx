import { motion } from 'framer-motion'
import { useApi } from '../hooks/useApi'
import { getHoneypotAttacks, getHoneypotStatus } from '../api/client'
import { SeverityBadge } from '../components/SeverityBadge'
import { useRelativeTime } from '../hooks/useRelativeTime'
import { cn } from '../lib/utils'
import { stagger, fadeUp } from '../lib/animations'
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'

export function Honeypot() {
  const { data: attacks } = useApi(getHoneypotAttacks)
  const { data: status } = useApi(getHoneypotStatus)

  const typeCounts: Record<string, number> = {}
  const attackList = Array.isArray(attacks) ? attacks : []
  attackList.forEach((a) => {
    typeCounts[a.attack_type] = (typeCounts[a.attack_type] ?? 0) + 1
  })
  const pieData = Object.entries(typeCounts).map(([name, value]) => ({ name, value }))

  const PIE_COLORS = ['#ef4444', '#f59e0b', '#3b82f6', '#8b5cf6', '#22c55e', '#f97316']

  const timeData = Array.from({ length: 12 }, (_, i) => ({
    hour: `${String((24 - 12 + i) % 24).padStart(2, '0')}:00`,
    attacks: Math.floor(Math.random() * 5) + (i > 8 ? 2 : 0),
  }))

  const tooltipStyle = {
    backgroundColor: 'rgba(30, 30, 45, 0.95)',
    backdropFilter: 'blur(12px)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '8px',
    fontSize: '12px',
    fontFamily: 'JetBrains Mono',
    color: '#f4f4f5',
    boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
  }

  return (
    <motion.div
      className="space-y-6"
      initial="hidden"
      animate="visible"
      variants={stagger}
    >
      <motion.div variants={fadeUp}>
        <h1 className="text-2xl font-semibold text-[#f4f4f5]">Honeypot</h1>
        <p className="text-sm text-[#3f3f46] mt-0.5">
          Decoy tools that detect and log malicious interactions
        </p>
      </motion.div>

      {/* Status */}
      <motion.div
        variants={fadeUp}
        className="glass-card rounded-xl p-5 flex items-center justify-between"
      >
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              {status?.running && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              )}
              <span
                className={cn(
                  'relative inline-flex rounded-full h-3 w-3',
                  status?.running ? 'bg-emerald-400' : 'bg-zinc-600',
                )}
              />
            </span>
            <span className="text-base font-semibold text-[#f4f4f5]">
              Honeypot: {status?.running ? 'Running' : 'Stopped'}
            </span>
          </div>
          {status && (
            <div className="flex items-center gap-4 ml-4 text-xs text-[#3f3f46]">
              <span>
                Uptime: <span className="font-mono tabular-nums text-[#a1a1aa]">{status.uptime_hours}h</span>
              </span>
              <span>
                Total attacks: <span className="font-mono tabular-nums text-[#a1a1aa]">{status.total_attacks}</span>
              </span>
            </div>
          )}
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={cn(
            'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
            status?.running
              ? 'bg-red-400/10 text-red-400 border border-red-400/20 hover:bg-red-400/20'
              : 'bg-emerald-400/10 text-emerald-400 border border-emerald-400/20 hover:bg-emerald-400/20',
          )}
        >
          {status?.running ? 'Stop' : 'Start'}
        </motion.button>
      </motion.div>

      {/* Charts */}
      <motion.div variants={fadeUp} className="grid grid-cols-5 gap-6">
        <div className="col-span-2 glass-card rounded-xl p-5">
          <h2 className="text-sm font-semibold text-[#f4f4f5] mb-4">Attack Types</h2>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={3}
                dataKey="value"
                stroke="none"
                isAnimationActive={true}
                animationDuration={1000}
              >
                {pieData.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-3 mt-2 justify-center">
            {pieData.map((entry, i) => (
              <div key={entry.name} className="flex items-center gap-1.5">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }}
                />
                <span className="text-[11px] text-[#3f3f46]">{entry.name.replace(/_/g, ' ')}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="col-span-3 glass-card rounded-xl p-5">
          <h2 className="text-sm font-semibold text-[#f4f4f5] mb-4">Attacks Over Time</h2>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={timeData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis
                dataKey="hour"
                tick={{ fill: '#52525b', fontSize: 11, fontFamily: 'JetBrains Mono' }}
                tickLine={false}
                axisLine={false}
                interval={2}
              />
              <YAxis
                tick={{ fill: '#52525b', fontSize: 11, fontFamily: 'JetBrains Mono' }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip contentStyle={tooltipStyle} />
              <Line
                type="monotone"
                dataKey="attacks"
                stroke="#ef4444"
                strokeWidth={2}
                dot={{ fill: '#ef4444', r: 3, strokeWidth: 0 }}
                activeDot={{ fill: '#ef4444', r: 5, strokeWidth: 0 }}
                isAnimationActive={true}
                animationDuration={1200}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Attack feed */}
      <motion.div variants={fadeUp} className="glass-card rounded-xl p-5">
        <h2 className="text-sm font-semibold text-[#f4f4f5] mb-4">Attack Feed</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-[11px] font-medium text-[#3f3f46] uppercase tracking-wider">
                <th className="pb-3 pr-4">Time</th>
                <th className="pb-3 pr-4">Source</th>
                <th className="pb-3 pr-4">Tool Called</th>
                <th className="pb-3 pr-4">Attack Type</th>
                <th className="pb-3 pr-4">Severity</th>
                <th className="pb-3">Input Preview</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {attackList.map((attack, i) => (
                <AttackRow key={attack.id} attack={attack} index={i} />
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  )
}

function AttackRow({ attack, index }: {
  attack: { id: string; timestamp: string; source: string; tool_called: string; attack_type: string; input_preview: string; severity: string }
  index: number
}) {
  const timeAgo = useRelativeTime(attack.timestamp)

  return (
    <motion.tr
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.04, type: 'spring', stiffness: 300, damping: 25 }}
      className="hover:bg-white/[0.02] transition-colors"
    >
      <td className="py-2.5 pr-4">
        <span className="font-mono text-xs text-[#3f3f46] tabular-nums">{timeAgo}</span>
      </td>
      <td className="py-2.5 pr-4">
        <span className="text-sm text-[#a1a1aa]">{attack.source}</span>
      </td>
      <td className="py-2.5 pr-4">
        <span className="font-mono text-[13px] text-[#f4f4f5]">{attack.tool_called}</span>
      </td>
      <td className="py-2.5 pr-4">
        <span className="text-xs text-[#a1a1aa] bg-white/[0.04] px-2 py-0.5 rounded">
          {attack.attack_type.replace(/_/g, ' ')}
        </span>
      </td>
      <td className="py-2.5 pr-4">
        <SeverityBadge severity={attack.severity} />
      </td>
      <td className="py-2.5">
        <code className="font-mono text-[11px] text-[#52525b] truncate block max-w-[300px]">
          {attack.input_preview}
        </code>
      </td>
    </motion.tr>
  )
}
