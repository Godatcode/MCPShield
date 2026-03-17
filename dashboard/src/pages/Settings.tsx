import { motion } from 'framer-motion'
import { useApi } from '../hooks/useApi'
import { getConfig } from '../api/client'
import { cn } from '../lib/utils'
import { stagger, fadeUp } from '../lib/animations'

export function Settings() {
  const { data: config } = useApi(getConfig)

  if (!config) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-5 h-5 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const sections = [
    { title: 'Global', data: config.global },
    { title: 'Scan', data: config.scan },
    { title: 'Proxy', data: config.proxy },
    { title: 'LLM', data: config.llm },
    { title: 'Servers', data: config.servers },
  ]

  return (
    <motion.div
      className="space-y-6"
      initial="hidden"
      animate="visible"
      variants={stagger}
    >
      <motion.div variants={fadeUp}>
        <h1 className="text-2xl font-semibold text-[#f4f4f5]">Settings</h1>
        <p className="text-sm text-[#3f3f46] mt-0.5">
          Current MCPShield configuration (read-only)
        </p>
      </motion.div>

      <div className="space-y-4">
        {sections.map((section) => (
          <motion.div
            key={section.title}
            variants={fadeUp}
            className="glass-card rounded-xl p-5"
          >
            <h2 className="text-sm font-semibold text-[#f4f4f5] mb-4">
              {section.title}
            </h2>
            <div className="space-y-1">
              {Object.entries(section.data as Record<string, unknown>).map(([key, value]) => (
                <ConfigRow key={key} keyName={key} value={value} />
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

function ConfigRow({ keyName, value }: { keyName: string; value: unknown }) {
  if (typeof value === 'object' && value !== null) {
    return (
      <div className="pl-3 border-l border-white/[0.04] ml-1 mt-2 mb-2">
        <span className="text-xs font-medium text-[#3f3f46] uppercase tracking-wider">{keyName}</span>
        <div className="mt-1 space-y-1">
          {Object.entries(value as Record<string, unknown>).map(([k, v]) => (
            <ConfigRow key={k} keyName={k} value={v} />
          ))}
        </div>
      </div>
    )
  }

  const isStatus = keyName === 'status'
  const isConnected = isStatus && value === 'connected'

  return (
    <div className="flex items-center justify-between py-1.5 px-3 rounded-lg hover:bg-white/[0.02] transition-colors">
      <span className="text-[13px] text-[#a1a1aa]">{keyName}</span>
      <div className="flex items-center gap-2">
        {isStatus && (
          <span
            className={cn(
              'w-2 h-2 rounded-full',
              isConnected ? 'bg-emerald-400' : 'bg-red-400',
            )}
          />
        )}
        <span
          className={cn(
            'font-mono text-[13px] tabular-nums',
            typeof value === 'boolean'
              ? value
                ? 'text-emerald-400'
                : 'text-red-400'
              : 'text-[#f4f4f5]',
          )}
        >
          {String(value)}
        </span>
      </div>
    </div>
  )
}
