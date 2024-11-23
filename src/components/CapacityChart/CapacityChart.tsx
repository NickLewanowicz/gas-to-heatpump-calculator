import React, { useState } from 'react'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  Dot,
  Area
} from 'recharts'
import { Typography, Space, Select } from 'antd'
import { CapacityChartProps, ChartDataPoint } from '../../types'

const { Title } = Typography

interface CustomDotProps {
  cx?: number
  cy?: number
  payload?: ChartDataPoint
  value?: number
  index?: number
}

const CustomDot: React.FC<CustomDotProps> = (props) => {
  const { cx, cy, payload } = props
  if (payload?.isIntersection && cx && cy) {
    return <Dot cx={cx} cy={cy} r={6} fill="green" />
  }
  return null
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        backgroundColor: 'white',
        padding: '8px',
        border: '1px solid #ccc',
        borderRadius: '4px'
      }}>
        <p style={{ margin: 0 }}>{`Temperature: ${label}°C`}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} style={{ margin: 0, color: entry.color }}>
            {entry.name.includes('COP') &&
              `${entry.name}: ${entry.value.toFixed(2)} (efficiency ratio)`}
            {entry.name.includes('BTU/h') &&
              `${entry.name}: ${entry.value.toLocaleString()} BTU/h`}
            {entry.name === 'Design Load' &&
              `Required: ${entry.value.toLocaleString()} BTU/h`}
          </p>
        ))}
      </div>
    )
  }
  return null
}

const LineToggles = ({
  heatpumps,
  selectedHeatpumps,
  onSelectionChange,
}: {
  heatpumps: any[],
  selectedHeatpumps: number[],
  onSelectionChange: (selected: number[]) => void,
}) => {
  return (
    <Space wrap style={{ marginBottom: 16 }}>
      <Select
        mode="multiple"
        style={{ minWidth: 200 }}
        placeholder="Select heat pumps to display"
        value={selectedHeatpumps}
        onChange={onSelectionChange}
        options={heatpumps.map((heatpump, index) => ({
          label: heatpump.name,
          value: index,
        }))}
      />
    </Space>
  )
}

export const CapacityChart: React.FC<CapacityChartProps> = ({
  data,
  duelFuelBreakeven,
  heatpumps = [],
  selected = 0,
  weather
}) => {
  const [selectedHeatpumps, setSelectedHeatpumps] = useState<number[]>([selected])
  const colors = ['#1890ff', '#ff4d4f', '#ffd700', '#52c41a', '#722ed1', '#fa8c16']

  // Get the temperature range from the data points
  const minTemp = Math.min(...data.map(d => d.temperature))
  const maxTemp = Math.max(...data.map(d => d.temperature))

  // Create an array of all temperatures in the range
  const temperatureRange = Array.from(
    { length: maxTemp - minTemp + 1 },
    (_, i) => minTemp + i
  )

  // Group weather data by each integer temperature in the range
  const temperatureFrequency = temperatureRange.map(temp => ({
    temperature: temp,
    hours: weather.filter(hour =>
      Math.round(hour.temp) === temp
    ).length,
    // Include any matching data point information
    ...data.find(d => Math.round(d.temperature) === temp) || {}
  }))

  console.log('Weather:', weather.length)

  console.log('Temperature frequency:', temperatureFrequency) // For debugging

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <Title level={5} style={{ margin: '0 0 16px 0' }}>Heat Pump Performance Analysis</Title>

      <LineToggles
        heatpumps={heatpumps}
        selectedHeatpumps={selectedHeatpumps}
        onSelectionChange={setSelectedHeatpumps}
      />

      <ResponsiveContainer width="100%" height={400}>
        <LineChart
          data={data}
          margin={{
            top: 10,
            right: 10,
            left: -20,
            bottom: 25
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="temperature"
            label={{
              value: 'Outdoor Temperature (°C)',
              position: 'bottom',
              offset: 10
            }}
            tick={{ dy: 10 }}
          />
          <YAxis
            yAxisId="left"
            label={{
              value: 'Coefficient of Performance (COP)',
              angle: -90,
              position: 'insideLeft',
              offset: -50,
              style: { textAnchor: 'middle' }
            }}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            label={{
              value: 'Heating Capacity (BTU/h)',
              angle: 90,
              position: 'insideRight',
              offset: -40,
              style: { textAnchor: 'middle' }
            }}
          />
          <Tooltip content={<CustomTooltip />} />

          {selectedHeatpumps.map((heatpumpIndex) => (
            <React.Fragment key={`heatpump-${heatpumpIndex}`}>
              <Area
                yAxisId="right"
                dataKey={`heatpump-${heatpumpIndex}-aux`}
                fill={`${colors[heatpumpIndex % colors.length]}20`}
                stroke="none"
                name={`${heatpumps[heatpumpIndex].name} Aux Heat`}
              />
              <Line
                type="monotone"
                dataKey={`heatpump-${heatpumpIndex}-cap`}
                stroke={colors[heatpumpIndex % colors.length]}
                yAxisId="right"
                name={`${heatpumps[heatpumpIndex].name} BTU/h`}
                dot={<CustomDot />}
              />
              <Line
                type="monotone"
                dataKey={`heatpump-${heatpumpIndex}-cop`}
                stroke={colors[heatpumpIndex % colors.length]}
                yAxisId="left"
                name={`${heatpumps[heatpumpIndex].name} COP`}
                strokeDasharray="5 5"
              />
            </React.Fragment>
          ))}
          <Line
            type="monotone"
            dataKey="design"
            stroke="#ffd700"
            yAxisId="right"
            name="Design Load"
          />
          {duelFuelBreakeven && (
            <ReferenceLine
              yAxisId="right"
              x={duelFuelBreakeven}
              stroke="rgba(255, 99, 132, 0.5)"
              strokeDasharray="3 3"
              label={{
                value: "Dual Fuel Breakeven",
                position: "top",
                fill: "rgba(255, 99, 132, 0.8)"
              }}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
