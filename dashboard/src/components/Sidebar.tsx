import { NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import { cn } from '../lib/utils'
import { sidebarStagger, sidebarItem } from '../lib/animations'
import {
  LayoutDashboard,
  Server,
  AlertTriangle,
  ShieldCheck,
  Crosshair,
  FileText,
  Settings,
} from 'lucide-react'

const navItems = [
  { to: '/', label: 'Overview', icon: LayoutDashboard },
  { to: '/servers', label: 'Servers', icon: Server },
  { to: '/threats', label: 'Threats', icon: AlertTriangle },
  { to: '/compliance', label: 'Compliance', icon: ShieldCheck },
  { to: '/honeypot', label: 'Honeypot', icon: Crosshair },
  { to: '/audit', label: 'Audit Log', icon: FileText },
]

const bottomItems = [
  { to: '/settings', label: 'Settings', icon: Settings },
]

export function Sidebar() {
  return (
    <aside className="w-56 glass-surface flex flex-col shrink-0 border-r border-white/[0.04]">
      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="p-5 pb-4"
      >
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-purple-500/10 flex items-center justify-center">
            <ShieldCheck className="w-4 h-4 text-purple-400" />
          </div>
          <div>
            <span className="text-[15px] font-semibold text-[#f4f4f5]">MCPShield</span>
          </div>
        </div>
        <span className="font-mono text-[11px] text-[#3f3f46] ml-9">v0.2.0</span>
      </motion.div>

      {/* Nav */}
      <motion.nav
        className="flex-1 px-3 space-y-0.5"
        variants={sidebarStagger}
        initial="hidden"
        animate="visible"
      >
        {navItems.map(({ to, label, icon: Icon }) => (
          <motion.div key={to} variants={sidebarItem}>
            <NavLink
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium',
                  'transition-all duration-200',
                  isActive
                    ? 'bg-white/[0.06] text-[#f4f4f5] shadow-[inset_0_0_0_1px_rgba(139,92,246,0.3)]'
                    : 'text-[#a1a1aa] hover:text-[#f4f4f5] hover:bg-white/[0.03]',
                )
              }
            >
              <Icon className="w-4 h-4" />
              {label}
            </NavLink>
          </motion.div>
        ))}
      </motion.nav>

      {/* Divider + bottom */}
      <div className="px-3 pb-2">
        <div className="border-t border-white/[0.04] mb-2" />
        {bottomItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium',
                'transition-all duration-200',
                isActive
                  ? 'bg-white/[0.06] text-[#f4f4f5] shadow-[inset_0_0_0_1px_rgba(139,92,246,0.3)]'
                  : 'text-[#a1a1aa] hover:text-[#f4f4f5] hover:bg-white/[0.03]',
              )
            }
          >
            <Icon className="w-4 h-4" />
            {label}
          </NavLink>
        ))}
      </div>

      {/* Status bar */}
      <div className="p-4 border-t border-white/[0.04]">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
          </span>
          <span className="text-xs text-[#a1a1aa]">Proxy: Active</span>
        </div>
      </div>
    </aside>
  )
}
