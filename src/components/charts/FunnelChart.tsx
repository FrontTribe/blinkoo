'use client'

type FunnelStep = {
  name: string
  value: number
  color?: string
}

type FunnelChartProps = {
  data: FunnelStep[]
  height?: number
}

export function FunnelChart({ data, height = 300 }: FunnelChartProps) {
  const colors = data.map((step, index) => step.color || `hsl(${220 - index * 15}, 70%, 50%)`)

  return (
    <div className="w-full" style={{ height: `${height}px`, padding: '20px 0' }}>
      <div className="flex flex-col items-center space-y-2">
        {data.map((step, index) => {
          const prevValue = index > 0 ? data[index - 1].value : step.value
          const percentage = prevValue > 0 ? (step.value / prevValue) * 100 : 100
          const widthPercentage = percentage

          return (
            <div key={step.name} className="relative w-full" style={{ minHeight: '40px' }}>
              <div
                className="text-center py-2 text-white font-semibold relative"
                style={{
                  width: `${widthPercentage}%`,
                  marginLeft: `${(100 - widthPercentage) / 2}%`,
                  backgroundColor: colors[index],
                  borderRadius: '4px',
                }}
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm font-semibold">{step.name}</span>
                </div>
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white">
                  {step.value}
                </div>
              </div>
              {index > 0 && (
                <div className="text-xs text-gray-600 mt-1 text-center">
                  {percentage.toFixed(1)}% conversion
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
