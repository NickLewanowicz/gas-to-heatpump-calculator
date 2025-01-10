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
import { HourlyWeather, SeasonView } from '../../types'
import type { Dayjs } from 'dayjs'
import { Button, Space, Table, Input, InputNumber } from 'antd'
import { ArrowLeftOutlined } from '@ant-design/icons'

interface HeatingDegreeChartProps {
    weather: HourlyWeather[]
    baseTemp: number
    reducedTemp: number
    setbackType: '24/7' | 'overnight'
    startTime: Dayjs | null
    endTime: Dayjs | null
    seasonView: SeasonView
    selectedYear: number
}

interface MonthlyData {
    month: string
    totalDegreeHours: number
    potentialSavings: number
    averageTemp: number
    year: number
}

interface DailyData {
    day: string
    totalDegreeHours: number
    potentialSavings: number
    averageTemp: number
    year: number
}

interface HourlyData {
    hour: string
    totalDegreeHours: number
    potentialSavings: number
    temp: number
    isSetback: boolean
    year: number
}

const MONTHS = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
]

export const HeatingDegreeChart: React.FC<HeatingDegreeChartProps> = ({
    weather,
    baseTemp,
    reducedTemp,
    setbackType,
    startTime,
    endTime,
    seasonView,
    selectedYear
}) => {
    const [selectedMonth, setSelectedMonth] = useState<string | null>(null)
    const [selectedDay, setSelectedDay] = useState<string | null>(null)
    const [heatingCost, setHeatingCost] = useState(500)

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
            const degreeHours = hour.temp < baseTemp ? baseTemp - hour.temp : 0
            let savings = 0
            let isSetback = false

            if (setbackType === '24/7') {
                savings = Math.min(degreeHours, baseTemp - reducedTemp)
                isSetback = true
            } else if (setbackType === 'overnight' && startTime && endTime) {
                const startHour = startTime.hour()
                const endHour = endTime.hour()

                if (startHour <= endHour) {
                    isSetback = hourOfDay >= startHour && hourOfDay < endHour
                } else {
                    isSetback = hourOfDay >= startHour || hourOfDay < endHour
                }

                if (isSetback) {
                    savings = Math.min(degreeHours, baseTemp - reducedTemp)
                }
            }

            return {
                hour: `${hourOfDay.toString().padStart(2, '0')}:00`,
                totalDegreeHours: degreeHours,
                potentialSavings: savings,
                temp: hour.temp,
                isSetback,
                year: date.getFullYear()
            }
        }).sort((a, b) => parseInt(a.hour) - parseInt(b.hour))
    }

    const calculateDailyData = (month: string): DailyData[] => {
        const dailyData: {
            [key: string]: {
                day: string
                totalDegreeHours: number
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
            const hourOfDay = date.getHours()

            if (!dailyData[day]) {
                dailyData[day] = {
                    day: `${month} ${parseInt(day)}`,
                    totalDegreeHours: 0,
                    potentialSavings: 0,
                    totalTemp: 0,
                    hourCount: 0,
                    year: new Date(hour.datetime).getFullYear()
                }
            }

            dailyData[day].totalTemp += hour.temp
            dailyData[day].hourCount++

            const degreeHours = hour.temp < baseTemp ? baseTemp - hour.temp : 0
            dailyData[day].totalDegreeHours += degreeHours

            const tempDifference = baseTemp - reducedTemp
            let savings = 0

            if (setbackType === '24/7') {
                savings = Math.min(degreeHours, tempDifference)
            } else if (setbackType === 'overnight' && startTime && endTime) {
                const startHour = startTime.hour()
                const endHour = endTime.hour()

                if (startHour <= endHour) {
                    if (hourOfDay >= startHour && hourOfDay < endHour) {
                        savings = Math.min(degreeHours, tempDifference)
                    }
                } else {
                    if (hourOfDay >= startHour || hourOfDay < endHour) {
                        savings = Math.min(degreeHours, tempDifference)
                    }
                }
            }

            dailyData[day].potentialSavings += savings
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
        if (seasonView === 'year') {
            return selectedYear
        }
        // For heating season, months Sep-Dec are in the first year, Jan-May in the second year
        const monthIndex = MONTHS.indexOf(month)
        return monthIndex >= 8 ? selectedYear : selectedYear + 1
    }

    const calculateMonthlyData = (): MonthlyData[] => {
        const monthlyData: {
            [key: string]: MonthlyData & {
                totalTemp: number
                hourCount: number
            }
        } = {}

        // Initialize months based on season view
        const relevantMonths = seasonView === 'year'
            ? MONTHS
            : [...MONTHS.slice(8), ...MONTHS.slice(0, 5)] // Sep to May

        relevantMonths.forEach(month => {
            monthlyData[month] = {
                month,
                totalDegreeHours: 0,
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

            const hourOfDay = date.getHours()

            monthlyData[month].totalTemp += hour.temp
            monthlyData[month].hourCount++
            monthlyData[month].year = getYearForMonth(month)

            const degreeHours = hour.temp < baseTemp ? baseTemp - hour.temp : 0
            monthlyData[month].totalDegreeHours += degreeHours

            const tempDifference = baseTemp - reducedTemp
            let savings = 0

            if (setbackType === '24/7') {
                savings = Math.min(degreeHours, tempDifference)
            } else if (setbackType === 'overnight' && startTime && endTime) {
                const startHour = startTime.hour()
                const endHour = endTime.hour()

                if (startHour <= endHour) {
                    if (hourOfDay >= startHour && hourOfDay < endHour) {
                        savings = Math.min(degreeHours, tempDifference)
                    }
                } else {
                    if (hourOfDay >= startHour || hourOfDay < endHour) {
                        savings = Math.min(degreeHours, tempDifference)
                    }
                }
            }

            monthlyData[month].potentialSavings += savings
        })

        return Object.entries(monthlyData)
            .sort((a, b) => {
                if (seasonView === 'year') {
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
                totalDegreeHours: data.totalDegreeHours,
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
            ? `${selectedYear}-${selectedYear + 1}`
            : selectedYear.toString()
        if (selectedDay) return `Hourly View - ${selectedDay}`
        if (selectedMonth) return `Daily View - ${selectedMonth}`
        return `Monthly View (${seasonView === 'heating' ? 'Heating Season' : 'Calendar Year'} ${yearRange})`
    }

    const calculateTotalStats = () => {
        const monthlyData = calculateMonthlyData()
        const totalHDH = monthlyData.reduce((sum, month) => sum + month.totalDegreeHours, 0)
        const totalSavings = monthlyData.reduce((sum, month) => sum + month.potentialSavings, 0)
        const savingsPercentage = (totalSavings / totalHDH) * 100
        const costSavings = (heatingCost * savingsPercentage) / 100

        return [
            {
                key: '1',
                metric: 'Total Heating Degree Hours',
                value: Math.round(totalHDH).toLocaleString(),
                percentage: '100%'
            },
            {
                key: '2',
                metric: 'Potential HDH Savings',
                value: Math.round(totalSavings).toLocaleString(),
                percentage: `${savingsPercentage.toFixed(1)}%`
            },
            {
                key: '3',
                metric: 'Heating Cost',
                value: (
                    <InputNumber
                        prefix="$"
                        value={heatingCost}
                        onChange={(value) => setHeatingCost(value || 0)}
                        style={{ width: 100 }}
                        min={0}
                    />
                ),
                percentage: `$${Math.round(costSavings).toLocaleString()}`
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
            title: 'Value',
            dataIndex: 'value',
            key: 'value',
            align: 'right' as const,
        },
        {
            title: 'Savings',
            dataIndex: 'percentage',
            key: 'percentage',
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
                                value: selectedDay ? 'Degree Hours (°C)' : 'Degree Hours (°C·h)',
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
                                const unit = selectedDay ? 'HDH' : 'HDH'
                                return [`${Math.round(value).toLocaleString()} ${unit}`, name]
                            }}
                            labelFormatter={(label: string) => {
                                if (!selectedMonth && !selectedDay) {
                                    const monthIndex = MONTHS.indexOf(label)
                                    if (seasonView === 'heating') {
                                        // For heating season, months Sep-Dec are in first year, Jan-May in second year
                                        const year = monthIndex >= 8 ? selectedYear : selectedYear + 1
                                        return `${label} ${year}`
                                    } else {
                                        return `${label} ${selectedYear}`
                                    }
                                }
                                return label
                            }}
                        />
                        <Legend />
                        <Bar
                            yAxisId="left"
                            dataKey="totalDegreeHours"
                            stackId="a"
                            fill="#8884d8"
                            name="Base Load"
                            cursor={selectedDay ? undefined : "pointer"}
                        />
                        <Bar
                            yAxisId="left"
                            dataKey="potentialSavings"
                            stackId="a"
                            fill="#82ca9d"
                            name="Potential Savings"
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
                    <p><strong>Base Load (HDH):</strong> The net amount of heating that would theoretically be needed to maintain your desired indoor temperature. This is calculated by subtracting periods when outdoor temperature exceeds your target temperature from periods when heating is needed.</p>
                    <p><strong>Potential Savings (HDH):</strong> How much less heating you would need if you lower your thermostat during the specified times.</p>
                    <p><em>Note: The heating load is calculated as a net value - when outdoor temperatures exceed your target temperature, these warmer periods offset the heating requirements, particularly during shoulder seasons and summer months.</em></p>
                </div>
            </Space>
        </div>
    )
} 