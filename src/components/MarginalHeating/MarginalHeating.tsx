import React, { useState } from 'react'
import { Typography, Card, Space } from 'antd'
import { SeasonView } from '../../types'
import { LocationYearForm } from '../Breakeven/LocationYearForm'
import { useWeatherData } from '../../hooks/useWeatherData/hook'
import { CityName } from '../../data/weather'
import type { Dayjs } from 'dayjs'
import dayjs from 'dayjs'
import { TemperatureSettingsForm } from './TemperatureSettingsForm'
import { HeatingDegreeChart } from './HeatingDegreeChart'

const { Title } = Typography

export const MarginalHeating = () => {
    // Location and time period states
    const [city, setCity] = useState<CityName>('Ottawa')
    const [year, setYear] = useState(2022)
    const [seasonView, setSeasonView] = useState<SeasonView>('heating')

    // Temperature settings
    const [baseTemp, setBaseTemp] = useState(21)
    const [reducedTemp, setReducedTemp] = useState(19)
    const [setbackType, setSetbackType] = useState<'24/7' | 'overnight'>('24/7')
    const [startTime, setStartTime] = useState<Dayjs | null>(dayjs().hour(22).minute(0))
    const [endTime, setEndTime] = useState<Dayjs | null>(dayjs().hour(6).minute(0))

    // Get weather data and available years
    const { weather, filteredWeather } = useWeatherData(city, seasonView, year)

    const getAvailableYears = (weather: any[], view: SeasonView) => {
        if (!weather.length) return []

        const years = new Set(
            weather.map(entry => new Date(entry.datetime).getFullYear())
        )

        const currentDate = new Date()
        const currentYear = currentDate.getFullYear()

        return Array.from(years)
            .map(year => {
                const endDate = view === 'calendar'
                    ? new Date(`${year}-12-31`)
                    : new Date(`${year + 1}-08-31`)

                // Skip if the season/year isn't complete yet
                if (endDate > currentDate) return null

                return {
                    value: year,
                    label: view === 'calendar'
                        ? year.toString()
                        : `${year}-${year + 1} Heating Season`,
                    startDate: view === 'calendar'
                        ? new Date(`${year}-01-01`)
                        : new Date(`${year}-09-01`),
                    endDate
                }
            })
            .filter((year): year is NonNullable<typeof year> => year !== null)
            .sort((a, b) => b.value - a.value)
    }

    const availableYears = getAvailableYears(weather, seasonView)

    return (
        <div>
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
                <Card title="Location and Time Period">
                    <LocationYearForm
                        city={city}
                        setCity={setCity}
                        year={year}
                        setYear={setYear}
                        seasonView={seasonView}
                        setSeasonView={setSeasonView}
                        availableYears={availableYears}
                    />
                </Card>

                <Card title="Temperature Settings">
                    <TemperatureSettingsForm
                        baseTemp={baseTemp}
                        setBaseTemp={setBaseTemp}
                        reducedTemp={reducedTemp}
                        setReducedTemp={setReducedTemp}
                        setbackType={setbackType}
                        setSetbackType={setSetbackType}
                        startTime={startTime}
                        setStartTime={setStartTime}
                        endTime={endTime}
                        setEndTime={setEndTime}
                    />
                </Card>

                <Card title="Monthly Heating Degree Hours">
                    <HeatingDegreeChart
                        weather={filteredWeather}
                        baseTemp={baseTemp}
                        reducedTemp={reducedTemp}
                        setbackType={setbackType}
                        startTime={startTime}
                        endTime={endTime}
                        seasonView={seasonView}
                        selectedYear={year}
                    />
                </Card>
            </Space>
        </div>
    )
} 