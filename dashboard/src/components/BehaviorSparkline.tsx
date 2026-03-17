import { AreaChart, Area, ResponsiveContainer } from 'recharts'

interface BehaviorSparklineProps {
  data: number[]
  color?: string
  height?: number
}

export function BehaviorSparkline({
  data,
  color = '#8b5cf6',
  height = 40,
}: BehaviorSparklineProps) {
  const chartData = data.map((value, i) => ({ i, value }))

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={chartData} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id={`gradient-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.3} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={1.5}
          fill={`url(#gradient-${color.replace('#', '')})`}
          isAnimationActive={true}
          animationDuration={800}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
