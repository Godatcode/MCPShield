import { useCallback } from 'react'
import { motion } from 'framer-motion'
import { useApi } from '../hooks/useApi'
import { getServers, triggerScan } from '../api/client'
import { ServerRow } from '../components/ServerRow'
import { stagger, fadeUp } from '../lib/animations'

export function Servers() {
  const { data: servers, refetch } = useApi(getServers)

  const handleScan = useCallback(async (_name: string) => {
    await triggerScan()
    refetch()
  }, [refetch])

  return (
    <motion.div
      className="space-y-6"
      initial="hidden"
      animate="visible"
      variants={stagger}
    >
      <motion.div variants={fadeUp}>
        <h1 className="text-2xl font-semibold text-[#f4f4f5]">Servers</h1>
        <p className="text-sm text-[#3f3f46] mt-0.5">
          {servers?.length ?? 0} MCP servers discovered across {new Set(servers?.map(s => s.config_source)).size} configurations
        </p>
      </motion.div>

      <motion.div variants={fadeUp} className="space-y-3">
        {servers?.map((server, i) => (
          <motion.div
            key={server.name}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06, type: 'spring', stiffness: 200, damping: 20 }}
          >
            <ServerRow server={server} onScan={handleScan} />
          </motion.div>
        ))}

        {!servers && (
          <div className="flex items-center justify-center h-32">
            <div className="w-5 h-5 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}
