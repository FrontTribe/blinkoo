'use client'

import {
  LineChart as RechartsLineChart,
  Line,
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

type LineChartProps = {
  data: DataPoint[]
  lines: Array<{
    key: string
    name: string
    color?: string
  }>
  xAxisKey: string
  height?: number
}

export function LineChart({ data, lines, xAxisKey, height = 300 }: LineChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsLineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
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
        {lines.map((line) => (
          <Line
            key={line.key}
            type="monotone"
            dataKey={line.key}
            name={line.name}
            stroke={line.color || '#3B82F6'}
            strokeWidth={2}
            dot={{ fill: line.color || '#3B82F6', r: 4 }}
            activeDot={{ r: 6 }}
          />
        ))}
      </RechartsLineChart>
    </ResponsiveContainer>
  )
}
