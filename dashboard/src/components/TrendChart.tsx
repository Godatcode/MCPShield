import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

interface TrendChartProps {
  data: { hour: string; clean: number; warning: number; critical: number }[]
  height?: number
}

export function TrendChart({ data, height = 240 }: TrendChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
        <defs>
          <linearGradient id="gradClean" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#22c55e" stopOpacity={0.2} />
            <stop offset="100%" stopColor="#22c55e" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="gradWarning" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.2} />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="gradCritical" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ef4444" stopOpacity={0.2} />
            <stop offset="100%" stopColor="#ef4444" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
        <XAxis
          dataKey="hour"
          tick={{ fill: '#52525b', fontSize: 11, fontFamily: 'JetBrains Mono' }}
          tickLine={false}
          axisLine={false}
          interval={5}
        />
        <YAxis
          tick={{ fill: '#52525b', fontSize: 11, fontFamily: 'JetBrains Mono' }}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'rgba(30, 30, 45, 0.95)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '8px',
            fontSize: '12px',
            fontFamily: 'JetBrains Mono',
            color: '#f4f4f5',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          }}
          itemStyle={{ color: '#a1a1aa' }}
          labelStyle={{ color: '#f4f4f5', marginBottom: '4px' }}
        />
        <Area
          type="monotone"
          dataKey="clean"
          stackId="1"
          stroke="#22c55e"
          strokeWidth={1.5}
          fill="url(#gradClean)"
          name="Clean"
          isAnimationActive={true}
          animationDuration={1200}
        />
        <Area
          type="monotone"
          dataKey="warning"
          stackId="1"
          stroke="#f59e0b"
          strokeWidth={1.5}
          fill="url(#gradWarning)"
          name="Warning"
          isAnimationActive={true}
          animationDuration={1200}
          animationBegin={200}
        />
        <Area
          type="monotone"
          dataKey="critical"
          stackId="1"
          stroke="#ef4444"
          strokeWidth={1.5}
          fill="url(#gradCritical)"
          name="Critical"
          isAnimationActive={true}
          animationDuration={1200}
          animationBegin={400}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
