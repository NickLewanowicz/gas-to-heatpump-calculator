import React, { useState } from 'react'
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    Line,
    ComposedChart
} from 'recharts'
import { HourlyWeather, Heatpump, SeasonView } from '../../types'
import { Button, Space, Table } from 'antd'
import { ArrowLeftOutlined } from '@ant-design/icons'

interface EnergyConsumptionChartProps {
    weather: HourlyWeather[]
    heatpump: Heatpump
    indoor: number
    seasonView: SeasonView
    year: number
    costKwh: number
    designBtu: number
    magicNumber: number
}

interface MonthlyData {
    month: string
    baseLoad: number
    potentialSavings: number
    averageTemp: number
    year: number
}

interface DailyData {
    day: string
    baseLoad: number
    potentialSavings: number
    averageTemp: number
    year: number
}

interface HourlyData {
    hour: string
    baseLoad: number
    potentialSavings: number
    temp: number
    year: number
}

const MONTHS = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
]

export const EnergyConsumptionChart: React.FC<EnergyConsumptionChartProps> = ({
    weather,
    heatpump,
    indoor,
    seasonView,
    year,
    costKwh,
    designBtu,
    magicNumber
}) => {
    const [selectedMonth, setSelectedMonth] = useState<string | null>(null)
    const [selectedDay, setSelectedDay] = useState<string | null>(null)

    const calculateHourlyData = (month: string, day: string): HourlyData[] => {
        const monthIndex = MONTHS.indexOf(month)
        const dayNumber = parseInt(day.split(' ')[1])

        const filteredWeather = weather.filter(hour => {
            const date = new Date(hour.datetime)
            return date.getMonth() === monthIndex && date.getDate() === dayNumber
        })

        return filteredWeather.map(hour => {
            const date = new Date(hour.datetime)
            const hourOfDay = date.getHours()

            // Calculate energy consumption based on temperature and heat pump performance
            const temp = hour.temp
            const tempDiff = Math.max(0, indoor - temp)

            // Calculate BTUs per degree, then multiply by temperature difference
            const btusPerDegree = designBtu / (indoor - -30) // -30 is design temp
            const requiredBtus = tempDiff * btusPerDegree

            // Convert to kWh and normalize
            const heatingDegrees = (requiredBtus / 3412) / magicNumber

            const thresholdIndex = Math.min(
                Math.max(0, Math.floor((temp + 30) / 5)),
                heatpump.cap.length - 1
            )
            const cop = heatpump.cop[thresholdIndex] || 1
            const capacity = (heatpump.cap[thresholdIndex] || 0) / 3412 / magicNumber // Convert BTU to kWh and normalize

            let heatpumpEnergy = 0
            let backupEnergy = 0

            if (heatingDegrees > 0) {
                if (capacity >= heatingDegrees) {
                    // Heat pump can handle the full load
                    heatpumpEnergy = heatingDegrees / cop
                } else {
                    // Heat pump at max capacity, rest goes to backup
                    heatpumpEnergy = capacity / cop
                    backupEnergy = heatingDegrees - capacity
                }
            }

            return {
                hour: `${hourOfDay.toString().padStart(2, '0')}:00`,
                baseLoad: heatpumpEnergy,
                potentialSavings: backupEnergy,
                temp: hour.temp,
                year: date.getFullYear()
            }
        }).sort((a, b) => parseInt(a.hour) - parseInt(b.hour))
    }

    const calculateDailyData = (month: string): DailyData[] => {
        const dailyData: {
            [key: string]: {
                day: string
                baseLoad: number
                potentialSavings: number
                totalTemp: number
                hourCount: number
                year: number
            }
        } = {}

        const monthIndex = MONTHS.indexOf(month)
        const filteredWeather = weather.filter(hour => {
            const date = new Date(hour.datetime)
            return date.getMonth() === monthIndex
        })

        filteredWeather.forEach(hour => {
            const date = new Date(hour.datetime)
            const day = date.getDate().toString().padStart(2, '0')

            if (!dailyData[day]) {
                dailyData[day] = {
                    day: `${month} ${parseInt(day)}`,
                    baseLoad: 0,
                    potentialSavings: 0,
                    totalTemp: 0,
                    hourCount: 0,
                    year: date.getFullYear()
                }
            }

            dailyData[day].totalTemp += hour.temp
            dailyData[day].hourCount++

            // Calculate energy consumption
            const temp = hour.temp
            const heatingDegrees = Math.max(0, indoor - temp)
            const thresholdIndex = heatpump.cap.findIndex((_, i) => temp > -30 + i * 5)
            const cop = heatpump.cop[thresholdIndex]
            const capacity = heatpump.cap[thresholdIndex]

            const energyNeeded = heatingDegrees
            const heatpumpEnergy = energyNeeded / cop
            const backupEnergy = Math.max(0, energyNeeded - capacity / cop)

            dailyData[day].baseLoad += heatpumpEnergy
            dailyData[day].potentialSavings += backupEnergy
        })

        return Object.values(dailyData)
            .map(data => ({
                ...data,
                averageTemp: data.hourCount > 0 ? data.totalTemp / data.hourCount : 0,
                year: data.year
            }))
            .sort((a, b) => parseInt(a.day.split(' ')[1]) - parseInt(b.day.split(' ')[1]))
    }

    const getYearForMonth = (month: string): number => {
        if (seasonView === 'calendar') {
            return year
        }
        // For heating season, months Sep-Dec are in the first year, Jan-May in the second year
        const monthIndex = MONTHS.indexOf(month)
        return monthIndex >= 8 ? year : year + 1
    }

    const calculateMonthlyData = (): MonthlyData[] => {
        const monthlyData: {
            [key: string]: MonthlyData & {
                totalTemp: number
                hourCount: number
            }
        } = {}

        // Initialize months based on season view
        const relevantMonths = seasonView === 'calendar'
            ? MONTHS
            : [...MONTHS.slice(8), ...MONTHS.slice(0, 5)] // Sep to May

        relevantMonths.forEach(month => {
            monthlyData[month] = {
                month,
                baseLoad: 0,
                potentialSavings: 0,
                totalTemp: 0,
                hourCount: 0,
                averageTemp: 0,
                year: getYearForMonth(month)
            }
        })

        weather.forEach(hour => {
            const date = new Date(hour.datetime)
            const month = MONTHS[date.getMonth()]

            // Skip if this month shouldn't be shown in current view
            if (!monthlyData[month]) return

            monthlyData[month].totalTemp += hour.temp
            monthlyData[month].hourCount++
            monthlyData[month].year = getYearForMonth(month)

            // Calculate energy consumption
            const temp = hour.temp
            const heatingDegrees = Math.max(0, indoor - temp)
            const thresholdIndex = heatpump.cap.findIndex((_, i) => temp > -30 + i * 5)
            const cop = heatpump.cop[thresholdIndex]
            const capacity = heatpump.cap[thresholdIndex]

            const energyNeeded = heatingDegrees
            const heatpumpEnergy = energyNeeded / cop
            const backupEnergy = Math.max(0, energyNeeded - capacity / cop)

            monthlyData[month].baseLoad += heatpumpEnergy
            monthlyData[month].potentialSavings += backupEnergy
        })

        return Object.entries(monthlyData)
            .sort((a, b) => {
                if (seasonView === 'calendar') {
                    return MONTHS.indexOf(a[0]) - MONTHS.indexOf(b[0])
                }
                // For heating season, sort Sep-Dec then Jan-May
                const aIndex = MONTHS.indexOf(a[0])
                const bIndex = MONTHS.indexOf(b[0])
                const aAdjusted = aIndex >= 8 ? aIndex - 8 : aIndex + 4
                const bAdjusted = bIndex >= 8 ? bIndex - 8 : bIndex + 4
                return aAdjusted - bAdjusted
            })
            .map(([month, data]) => ({
                month,
                baseLoad: data.baseLoad,
                potentialSavings: data.potentialSavings,
                averageTemp: data.hourCount > 0 ? data.totalTemp / data.hourCount : 0,
                year: data.year
            }))
    }

    const data = selectedDay
        ? calculateHourlyData(selectedMonth!, selectedDay)
        : selectedMonth
            ? calculateDailyData(selectedMonth)
            : calculateMonthlyData()

    const handleBarClick = (data: any) => {
        if (data.activePayload) {
            if (!selectedMonth) {
                setSelectedMonth(data.activePayload[0].payload.month)
            } else if (!selectedDay) {
                setSelectedDay(data.activePayload[0].payload.day)
            }
        }
    }

    const getTitle = () => {
        const yearRange = seasonView === 'heating'
            ? `${year}-${year + 1}`
            : year.toString()
        if (selectedDay) return `Hourly View - ${selectedDay}`
        if (selectedMonth) return `Daily View - ${selectedMonth}`
        return `Monthly View (${seasonView === 'heating' ? 'Heating Season' : 'Calendar Year'} ${yearRange})`
    }

    const calculateTotalStats = () => {
        const monthlyData = calculateMonthlyData()
        const totalBase = monthlyData.reduce((sum, month) => sum + month.baseLoad, 0)
        const totalBackup = monthlyData.reduce((sum, month) => sum + month.potentialSavings, 0)
        const totalCost = (totalBase + totalBackup) * costKwh

        return [
            {
                key: '1',
                metric: 'Heat Pump Energy (kWh)',
                value: Math.round(totalBase).toLocaleString(),
                cost: `$${Math.round(totalBase * costKwh).toLocaleString()}`
            },
            {
                key: '2',
                metric: 'Backup Energy (kWh)',
                value: Math.round(totalBackup).toLocaleString(),
                cost: `$${Math.round(totalBackup * costKwh).toLocaleString()}`
            },
            {
                key: '3',
                metric: 'Total Energy (kWh)',
                value: Math.round(totalBase + totalBackup).toLocaleString(),
                cost: `$${Math.round(totalCost).toLocaleString()}`
            }
        ]
    }

    const columns = [
        {
            title: 'Metric',
            dataIndex: 'metric',
            key: 'metric',
        },
        {
            title: 'Energy',
            dataIndex: 'value',
            key: 'value',
            align: 'right' as const,
        },
        {
            title: 'Cost',
            dataIndex: 'cost',
            key: 'cost',
            align: 'right' as const,
        }
    ]

    return (
        <div>
            <Space direction="vertical" style={{ width: '100%' }}>
                <Space>
                    {(selectedMonth || selectedDay) && (
                        <Button
                            icon={<ArrowLeftOutlined />}
                            onClick={() => {
                                if (selectedDay) {
                                    setSelectedDay(null)
                                } else {
                                    setSelectedMonth(null)
                                }
                            }}
                        >
                            Back to {selectedDay ? 'Daily' : 'Monthly'} View
                        </Button>
                    )}
                    <h3>{getTitle()}</h3>
                </Space>
                <ResponsiveContainer width="100%" height={400}>
                    <ComposedChart data={data} onClick={handleBarClick}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                            dataKey={selectedDay ? "hour" : selectedMonth ? "day" : "month"}
                            angle={selectedMonth ? -45 : 0}
                            textAnchor={selectedMonth ? "end" : "middle"}
                            height={selectedMonth ? 60 : 30}
                        />
                        <YAxis
                            yAxisId="left"
                            label={{
                                value: 'Energy Consumption (kWh)',
                                angle: -90,
                                position: 'insideLeft'
                            }}
                        />
                        <YAxis
                            yAxisId="right"
                            orientation="right"
                            label={{
                                value: 'Temperature (°C)',
                                angle: 90,
                                position: 'insideRight'
                            }}
                            domain={['auto', 'auto']}
                        />
                        <Tooltip
                            formatter={(value: number, name: string) => {
                                if (name === 'Temperature' || name === 'Average Temperature') {
                                    return [`${value.toFixed(1)}°C`, name]
                                }
                                return [`${Math.round(value).toLocaleString()} kWh`, name]
                            }}
                            labelFormatter={(label: string) => {
                                if (!selectedMonth && !selectedDay) {
                                    const monthIndex = MONTHS.indexOf(label)
                                    if (seasonView === 'heating') {
                                        // For heating season, months Sep-Dec are in first year, Jan-May in second year
                                        const yearValue = monthIndex >= 8 ? year : year + 1
                                        return `${label} ${yearValue}`
                                    } else {
                                        return `${label} ${year}`
                                    }
                                }
                                return label
                            }}
                        />
                        <Legend />
                        <Bar
                            yAxisId="left"
                            dataKey="baseLoad"
                            stackId="a"
                            fill="#8884d8"
                            name="Heat Pump"
                            cursor={selectedDay ? undefined : "pointer"}
                        />
                        <Bar
                            yAxisId="left"
                            dataKey="potentialSavings"
                            stackId="a"
                            fill="#82ca9d"
                            name="Backup Heating"
                            cursor={selectedDay ? undefined : "pointer"}
                        />
                        <Line
                            yAxisId="right"
                            type="monotone"
                            dataKey={selectedDay ? "temp" : "averageTemp"}
                            stroke="#ff7300"
                            name={selectedDay ? "Temperature" : "Average Temperature"}
                            dot={selectedMonth ? true : false}
                        />
                    </ComposedChart>
                </ResponsiveContainer>
                <Table
                    dataSource={calculateTotalStats()}
                    columns={columns}
                    pagination={false}
                    size="small"
                    style={{ marginTop: 16 }}
                />
                <div style={{ fontSize: '0.9em', color: 'rgba(0, 0, 0, 0.45)' }}>
                    <p><strong>Heat Pump (kWh):</strong> Energy consumed by the heat pump when operating within its capacity.</p>
                    <p><strong>Backup Heating (kWh):</strong> Additional energy required from backup heating when heat pump capacity is insufficient.</p>
                    <p><em>Note: Energy consumption is calculated based on the heat pump's performance characteristics at different outdoor temperatures and the actual weather data for your location.</em></p>
                </div>
            </Space>
        </div>
    )
} 