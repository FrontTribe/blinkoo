'use client'

import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'

type DataPoint = {
  [key: string]: string | number
}

type BarChartProps = {
  data: DataPoint[]
  bars: Array<{
    key: string
    name: string
    color?: string
  }>
  xAxisKey: string
  height?: number
  stacked?: boolean
}

export function BarChart({ data, bars, xAxisKey, height = 300, stacked = false }: BarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsBarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#EBEBEB" />
        <XAxis dataKey={xAxisKey} stroke="#666666" />
        <YAxis stroke="#666666" />
        <Tooltip
          contentStyle={{
            backgroundColor: 'white',
            border: '1px solid #EBEBEB',
            borderRadius: '4px',
          }}
        />
        <Legend />
        {bars.map((bar) => (
          <Bar
            key={bar.key}
            dataKey={bar.key}
            name={bar.name}
            fill={bar.color || '#3B82F6'}
            stackId={stacked ? 'stack' : undefined}
          />
        ))}
      </RechartsBarChart>
    </ResponsiveContainer>
  )
}
