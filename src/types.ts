export enum FuelType {
    NATURAL_GAS = "Natural Gas",
    OIL = "Oil",
    PROPANE = "Propane",
    ELECTRIC = "Electric"
}

export interface HourlyWeather {
    datetime: Date
    temp: number
}

export interface WeatherData {
    [city: string]: {
        latitude: number
        longitude: number
        hourly_units: {
            time: string
            temperature_2m: string
        }
        hourly: {
            time: string[]
            temperature_2m: number[]
        }
        city: string
        province: string
        startTime: string
        endTime: string
    }
}

export interface Heatpump {
    name: string
    cop: number[]
    cap: number[]
}

export interface Row {
    label: string
    threshold: number
    max: number
    min: number
    hours: HourlyWeather[]
    num: number
    percentHours: number
    heatingDegrees: number
    heatingPercent: number
    gains: number
    resistiveKwhConsumed: number
    heatPumpKwhConsumed: number
    heatPumpDuelFuel: number
    fossilFuelKwh: number
    copAverage: number
    amountOfEnergyNeeded: number
}

export interface FormState {
    indoor: number
    setIndoor: (value: number) => void
    designTemp: number
    setDesignTemp: (value: number) => void
    designBtu: number
    setDesignBtu: (value: number) => void
    city: string
    setCity: (city: string) => void
    furnaceEfficiency: number
    setFurnaceEfficiency: (value: number) => void
    costGas: number
    setCostGas: (value: number) => void
    costKwh: number
    setCostKwh: (value: number) => void
    fuelType: FuelType
    setFuelType: (value: FuelType) => void
    fuelUsage: number
    setFuelUsage: (value: number) => void
    year: number
    setYear: (year: number) => void
    seasonView: SeasonView
    setSeasonView: (view: SeasonView) => void
}

export interface HeatpumpsHook {
    heatpumps: Heatpump[]
    addHeatpump: (newHeatpump: Heatpump) => void
    removeHeatpump: (index: number) => void
    updateHeatpump: (index: number, updatedHeatpump: Partial<Heatpump>) => void
    selected: number
    setSelected: React.Dispatch<React.SetStateAction<number>>
}

export interface ChartDataPoint {
    temperature: number
    cap: number
    cop: number
    design: number
    isIntersection?: boolean
    [key: string]: number | boolean | undefined
}

export interface CapacityChartProps {
    data: ChartDataPoint[]
    duelFuelBreakeven: number
    heatpumps?: Heatpump[]
    selected?: number
    weather: HourlyWeather[]
    onHeatPumpChange?: (index: number) => void
}

export type Cities = string

export interface ResultsTotals {
    totalConsumed: number
    totalOutput: number
    heatpumpConsumed: number
    auxConsumed: number
    heatpumpOutput: number
    auxOutput: number
    heatPumpDuelFuelConsumed: number
    fossilFuelKwhTotal: number
}

export interface InputFormProps {
    formState: FormState
    cities: string[]
    weather: HourlyWeather[]
}

export interface ResultsProps {
    rows: Row[]
    kwhEquivalent: number
    fuelUsage: number
    fuelType: FuelType
    costGas: number
    costKwh: number
    heatpumps: Heatpump[]
    heatingDegrees: number
    getRows: (thresholds: number[], weather: HourlyWeather[], heatpump: Heatpump) => Row[]
    thresholds: number[]
    weather: HourlyWeather[]
    convertToKwh: (fuelType: FuelType, amount: number) => number
}

export type FuelUnit = 'm³' | 'L' | 'kWh'

export const fuelUnits: Record<FuelType, FuelUnit> = {
    [FuelType.NATURAL_GAS]: 'm³',
    [FuelType.OIL]: 'L',
    [FuelType.PROPANE]: 'L',
    [FuelType.ELECTRIC]: 'kWh'
}

export interface YearRange {
    startYear: number
    endYear: number
}

export type SeasonView = 'heating' | 'year'

export interface MarginalHeatingCostProps {
    // Empty for now as it uses context
}