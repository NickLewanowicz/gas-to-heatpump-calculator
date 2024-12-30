import React, { useState } from 'react'
import { Typography, Card, Space } from 'antd'
import { FuelType, SeasonView } from '../../types'
import { ElectrificationBreakevenForm } from './ElectrificationBreakevenForm'
import { LocationYearForm } from './LocationYearForm'
import { useWeatherData } from '../../hooks/useWeatherData/hook'
import { CityName } from '../../data/weather'

const { Title } = Typography

export const Breakeven = () => {
    // Fuel cost states
    const [fuelType, setFuelType] = useState<FuelType>(FuelType.NATURAL_GAS)
    const [annualFixedCost, setAnnualFixedCost] = useState<number>(0)
    const [consumptionCost, setConsumptionCost] = useState<number>(0)
    const [annualConsumption, setAnnualConsumption] = useState<number>(0)

    // Location and time period states
    const [city, setCity] = useState<CityName>('Ottawa')
    const [year, setYear] = useState(2022)
    const [seasonView, setSeasonView] = useState<SeasonView>('heating')

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

                <Card title="Current Heating System Costs">
                    <ElectrificationBreakevenForm
                        fuelType={fuelType}
                        setFuelType={setFuelType}
                        annualFixedCost={annualFixedCost}
                        setAnnualFixedCost={setAnnualFixedCost}
                        consumptionCost={consumptionCost}
                        setConsumptionCost={setConsumptionCost}
                        annualConsumption={annualConsumption}
                        setAnnualConsumption={setAnnualConsumption}
                    />
                </Card>
            </Space>
        </div>
    )
} 