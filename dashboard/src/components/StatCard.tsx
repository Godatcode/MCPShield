import { TiltCard } from './TiltCard'
import { AnimatedNumber } from './AnimatedNumber'
import { Sparkline } from './Sparkline'

interface StatCardProps {
  label: string
  value: number
  trend?: { value: number; positive?: boolean }
  sparklineData?: number[]
  sparklineColor?: string
  icon?: React.ReactNode
  className?: string
}

export function StatCard({
  label,
  value,
  trend,
  sparklineData,
  sparklineColor = '#8b5cf6',
  icon,
  className,
}: StatCardProps) {
  return (
    <TiltCard className={className}>
      <div className="p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-medium uppercase tracking-widest text-[#52525b]">
            {label}
          </span>
          {icon && <span className="text-[#3f3f46]">{icon}</span>}
        </div>

        <div className="flex items-end justify-between">
          <div className="flex items-baseline gap-2">
            <AnimatedNumber
              value={value}
              className="text-[28px] font-medium text-[#f4f4f5] leading-none"
            />
            {trend && (
              <span
                className={`font-mono text-xs tabular-nums ${
                  trend.positive !== false ? 'text-emerald-400' : 'text-red-400'
                }`}
              >
                {trend.positive !== false ? '\u25B2' : '\u25BC'} {Math.abs(trend.value)}%
              </span>
            )}
          </div>
        </div>

        {sparklineData && sparklineData.length > 0 && (
          <div className="mt-3 -mx-1">
            <Sparkline data={sparklineData} color={sparklineColor} height={36} />
          </div>
        )}
      </div>
    </TiltCard>
  )
}
