import React from 'react'
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
  Area,
  ComposedChart
} from 'recharts'
import { Typography, Space, Card, Row, Col } from 'antd'
import { CapacityChartProps, ChartDataPoint } from '../../types'

const { Title, Text } = Typography

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
    // Find all values for this temperature
    const temp = Number(label)
    const values = {
      cop: payload.find((p: any) => p.dataKey === `heatpump-${0}-cop`)?.value || 0,
      capacity: payload.find((p: any) => p.dataKey === `heatpump-${0}-cap`)?.value || 0,
      design: payload.find((p: any) => p.dataKey === "design")?.value || 0,
      hours: payload.find((p: any) => p.dataKey === "hours")?.value || 0
    }

    return (
      <div style={{
        backgroundColor: 'white',
        padding: '8px',
        border: '1px solid #ccc',
        borderRadius: '4px'
      }}>
        <p style={{ margin: 0, fontWeight: 'bold' }}>{`Temperature: ${temp}°C`}</p>
        <p style={{ margin: 0, color: '#1890ff' }}>
          {`COP: ${values.cop.toFixed(2)} (efficiency ratio)`}
        </p>
        <p style={{ margin: 0, color: '#1890ff' }}>
          {`Capacity: ${Math.round(values.capacity).toLocaleString()} BTU/h`}
        </p>
        <p style={{ margin: 0, color: '#ffd700' }}>
          {`Required: ${Math.round(values.design).toLocaleString()} BTU/h`}
        </p>
        <p style={{ margin: 0, color: '#1890ff' }}>
          {`Hours per Year: ${Math.round(values.hours).toLocaleString()}`}
        </p>
      </div>
    )
  }
  return null
}

const interpolateValue = (x: number, x1: number, x2: number, y1: number, y2: number): number => {
  if (x === x1) return y1
  if (x === x2) return y2
  return y1 + (x - x1) * (y2 - y1) / (x2 - x1)
}

const interpolateData = (data: any[], temp: number) => {
  // Find the two closest points
  const sortedPoints = [...data].sort((a, b) => Math.abs(a.temperature - temp) - Math.abs(b.temperature - temp))
  const p1 = sortedPoints[0]
  const p2 = sortedPoints[1]

  if (!p1 || !p2) return null

  const result: any = { temperature: temp }

  // Interpolate all numeric values
  Object.keys(p1).forEach(key => {
    if (typeof p1[key] === 'number' && key !== 'temperature') {
      result[key] = interpolateValue(temp, p1.temperature, p2.temperature, p1[key], p2[key])
    }
  })

  return result
}

export const CapacityChart: React.FC<CapacityChartProps> = ({
  data,
  duelFuelBreakeven,
  heatpumps = [],
  selected = 0,
  weather
}) => {
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
    ).length
  }))

  // Calculate key performance indicators
  const totalHours = weather.length
  const hoursAboveDesign = weather.filter(hour =>
    hour.temp > data.find(d => d.isIntersection)?.temperature || 0
  ).length
  const percentageAboveDesign = ((hoursAboveDesign / totalHours) * 100).toFixed(1)

  // Create interpolated data points for every integer temperature
  const interpolatedData = temperatureRange.map(temp => {
    const interpolated = interpolateData(data, temp)
    return {
      temperature: temp,
      ...interpolated,
      hours: temperatureFrequency.find(t => t.temperature === temp)?.hours || 0
    }
  }).filter(d => d !== null)

  // Find temperature with maximum COP
  const maxCopTemp = interpolatedData.reduce((maxTemp, point) => {
    const currentCop = point[`heatpump-${selected}-cop`] || 0
    const maxCop = maxTemp ? interpolatedData.find(p => p.temperature === maxTemp)?.[`heatpump-${selected}-cop`] || 0 : 0
    return currentCop > maxCop ? point.temperature : maxTemp
  }, null)

  // Find most common temperature range
  const sortedFrequencies = [...temperatureFrequency].sort((a, b) => b.hours - a.hours)
  const commonTempRange = {
    min: Math.min(sortedFrequencies[0].temperature, sortedFrequencies[1].temperature),
    max: Math.max(sortedFrequencies[0].temperature, sortedFrequencies[1].temperature)
  }

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <Title level={5} style={{ margin: '0 0 16px 0' }}>Heat Pump Performance: {heatpumps[selected].name}</Title>

      <Row gutter={[16, 16]}>
        <Col span={24}>
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart
              margin={{
                top: 30,
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
                domain={[minTemp, maxTemp]}
                type="number"
                allowDataOverflow={false}
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
              <YAxis
                yAxisId="hours"
                orientation="right"
                hide={true}
              />
              <Tooltip content={<CustomTooltip />} />

              {/* Temperature distribution */}
              <Area
                yAxisId="hours"
                data={interpolatedData}
                dataKey="hours"
                fill={`${colors[0]}10`}
                stroke="none"
                name="Hours per Year"
                isAnimationActive={false}
              />

              <Line
                type="monotone"
                data={interpolatedData}
                dataKey={`heatpump-${selected}-cap`}
                stroke={colors[0]}
                yAxisId="right"
                name={`${heatpumps[selected].name} BTU/h`}
                dot={<CustomDot />}
                connectNulls={true}
                isAnimationActive={false}
              />
              <Line
                type="monotone"
                data={interpolatedData}
                dataKey={`heatpump-${selected}-cop`}
                stroke={colors[0]}
                yAxisId="left"
                name={`${heatpumps[selected].name} COP`}
                strokeDasharray="5 5"
                connectNulls={true}
                isAnimationActive={false}
                dot={false}
              />
              <Line
                type="monotone"
                data={interpolatedData}
                dataKey="design"
                stroke="#ffd700"
                yAxisId="right"
                name="Design Load"
                connectNulls={true}
                isAnimationActive={false}
                dot={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </Col>
        <Col span={24}>
          <Card size="small">
            <Row gutter={[16, 8]}>
              <Col span={12}>
                <Text strong>Balance Point: </Text>
                <Text>{data.find(d => d.isIntersection)?.temperature.toFixed(1)}°C</Text>
              </Col>
              <Col span={12}>
                <Text strong>Max Efficiency: </Text>
                <Text>{maxCopTemp}°C</Text>
              </Col>
              <Col span={12}>
                <Text strong>Heat Pump Coverage: </Text>
                <Text>{percentageAboveDesign}% of hours</Text>
              </Col>
              <Col span={12}>
                <Text strong>Common Range: </Text>
                <Text>{commonTempRange.min}°C to {commonTempRange.max}°C</Text>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  )
}
