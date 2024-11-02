import { FormState, Row, Heatpump, HourlyWeather, FuelType } from '../../types'

export interface AppLayoutProps {
    formState: FormState
    cities: string[]
    heatpumps: Heatpump[]
    selected: number
    setSelected: React.Dispatch<React.SetStateAction<number>>
    addHeatpump: (newHeatpump: Heatpump) => void
    removeHeatpump: (index: number) => void
    updateHeatpump: (index: number, updatedHeatpump: Partial<Heatpump>) => void
    rows: Row[]
    indoor: number
    designTemp: number
    designBtu: number
    weather: HourlyWeather[]
    thresholds: number[]
    kwhEquivalent: number
    fuelUsage: number
    fuelType: FuelType
    costGas: number
    costKwh: number
    heatingDegrees: number
    duelFuelBreakeven?: number
    getRows: (thresholds: number[], weather: HourlyWeather[], heatpump: Heatpump) => Row[]
    convertToKwh: (fuelType: FuelType, amount: number) => number
}
