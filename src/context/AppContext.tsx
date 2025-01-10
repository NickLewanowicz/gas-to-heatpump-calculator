import React, { createContext, useContext, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Row, Heatpump, FuelType, SeasonView } from '../types'
import { CityName, cities } from '../data/weather'
import { useFormState } from '../hooks'
import { useHeatpumps } from '../hooks/useHeatpumps/hook'
import { useWeatherData } from '../hooks/useWeatherData/hook'
import { getRows, convertToKwh } from '../utils/calculations'
import type { Dayjs } from 'dayjs'
import dayjs from 'dayjs'

const initialHeatpump: Heatpump = {
    name: 'Heatpump #1',
    cap: [35000, 35000, 24000, 28000, 16000, 0],
    cop: [3.5, 3, 2, 1.8, 1.2, 1],
}

type AppContextType = {
    indoor: number
    setIndoor: (value: number) => void
    designTemp: number
    setDesignTemp: (value: number) => void
    designBtu: number
    setDesignBtu: (value: number) => void
    city: CityName
    setCity: (city: CityName) => void
    furnaceEfficiency: number
    setFurnaceEfficiency: (value: number) => void
    costGas: number
    setCostGas: (value: number) => void
    costKwh: number
    setCostKwh: (value: number) => void
    fuelType: FuelType
    setFuelType: (type: FuelType) => void
    fuelUsage: number
    setFuelUsage: (value: number) => void
    seasonView: SeasonView
    setSeasonView: (view: SeasonView) => void
    year: number
    setYear: (value: number) => void
    weather: any[]
    filteredWeather: any[]
    loading: boolean
    error: any
    heatpumps: Heatpump[]
    selected: number
    setSelected: (index: number) => void
    addHeatpump: (heatpump: Heatpump) => void
    removeHeatpump: (index: number) => void
    updateHeatpump: (index: number, heatpump: Partial<Heatpump>) => void
    thresholds: number[]
    kwhEquivalent: number
    heatingDegrees: number
    getRows: (thresholds: number[], weather: any[], heatpump: Heatpump, indoor: number, designTemp: number, designBtu: number) => Row[]
    convertToKwh: (fuelType: FuelType, amount: number) => number
    // Temperature settings
    setbackTemp: number
    setSetbackTemp: (value: number) => void
    setbackType: '24/7' | 'overnight'
    setSetbackType: (type: '24/7' | 'overnight') => void
    startTime: Dayjs | null
    setStartTime: (time: Dayjs | null) => void
    endTime: Dayjs | null
    setEndTime: (time: Dayjs | null) => void
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [searchParams, setSearchParams] = useSearchParams()
    const [init, setInit] = useState(false)
    const formState = useFormState()
    const {
        heatpumps,
        addHeatpump,
        removeHeatpump,
        updateHeatpump,
        selected,
        setSelected,
    } = useHeatpumps([initialHeatpump])

    // Temperature settings
    const [setbackTemp, setSetbackTemp] = useState(2)
    const [setbackType, setSetbackType] = useState<'24/7' | 'overnight'>('24/7')
    const [startTime, setStartTime] = useState<Dayjs | null>(dayjs().hour(22).minute(0))
    const [endTime, setEndTime] = useState<Dayjs | null>(dayjs().hour(6).minute(0))

    const {
        indoor,
        setIndoor,
        designTemp,
        setDesignTemp,
        designBtu,
        setDesignBtu,
        city,
        setCity,
        furnaceEfficiency,
        setFurnaceEfficiency,
        costGas,
        setCostGas,
        costKwh,
        setCostKwh,
        fuelType,
        setFuelType,
        fuelUsage,
        setFuelUsage,
        seasonView,
        setSeasonView,
        year,
        setYear
    } = formState

    const { weather, filteredWeather, loading, error } = useWeatherData(city as CityName, seasonView, year)
    const thresholds = [indoor, 8.33, -8.33, -15, -30]
    const kwhEquivalent = convertToKwh(fuelType, fuelUsage) * furnaceEfficiency
    const heatingDegrees = filteredWeather.reduce((acc, hour) => acc + (indoor - hour.temp), 0)

    useEffect(() => {
        const storedHeatpumps = JSON.parse(
            decodeURI(searchParams.get('heatpumps') || '[]')
        ) as Heatpump[]
        if (storedHeatpumps.length) {
            storedHeatpumps.forEach((heatpump, i) =>
                i === 0 ? updateHeatpump(i, heatpump) : addHeatpump(heatpump)
            )
        }
        setInit(true)
    }, [])

    useEffect(() => {
        if (init) {
            searchParams.set('heatpumps', encodeURI(JSON.stringify(heatpumps)))
            setSearchParams(searchParams)
        }
    }, [heatpumps, init])

    const value: AppContextType = {
        indoor,
        setIndoor,
        designTemp,
        setDesignTemp,
        designBtu,
        setDesignBtu,
        city: city as CityName,
        setCity,
        furnaceEfficiency,
        setFurnaceEfficiency,
        costGas,
        setCostGas,
        costKwh,
        setCostKwh,
        fuelType,
        setFuelType,
        fuelUsage,
        setFuelUsage,
        seasonView,
        setSeasonView,
        year,
        setYear,
        weather,
        filteredWeather,
        loading,
        error,
        heatpumps,
        selected,
        setSelected,
        addHeatpump,
        removeHeatpump,
        updateHeatpump,
        thresholds,
        kwhEquivalent,
        heatingDegrees,
        getRows,
        convertToKwh,
        // Temperature settings
        setbackTemp,
        setSetbackTemp,
        setbackType,
        setSetbackType,
        startTime,
        setStartTime,
        endTime,
        setEndTime,
    }

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export const useApp = () => {
    const context = useContext(AppContext)
    if (context === undefined) {
        throw new Error('useApp must be used within an AppProvider')
    }
    return context
} 