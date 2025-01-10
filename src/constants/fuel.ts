import { FuelType } from '../types'

export const FUEL_CONVERSION: Record<FuelType, number> = {
    [FuelType.NATURAL_GAS]: 10.55, // 1 m³ of natural gas ≈ 10.55 kWh
    [FuelType.PROPANE]: 7.57,      // 1 L of propane ≈ 7.57 kWh
    [FuelType.OIL]: 10.68,         // 1 L of heating oil ≈ 10.68 kWh
    [FuelType.ELECTRIC]: 1,        // Already in kWh
}

export const FUEL_UNITS: Record<FuelType, string> = {
    [FuelType.NATURAL_GAS]: 'm³',
    [FuelType.PROPANE]: 'L',
    [FuelType.OIL]: 'L',
    [FuelType.ELECTRIC]: 'kWh',
}

export function getFuelUnit(fuelType: FuelType): string {
    return FUEL_UNITS[fuelType]
}

export function getConversionFactor(fuelType: FuelType): number {
    return FUEL_CONVERSION[fuelType]
}

export function getConversionExplanation(fuelType: FuelType): string {
    const unit = FUEL_UNITS[fuelType]
    const factor = FUEL_CONVERSION[fuelType]

    if (fuelType === FuelType.ELECTRIC) {
        return 'Already in kilowatt-hours (kWh)'
    }

    return `1 ${unit} of ${fuelType.toLowerCase()} contains approximately ${factor} kilowatt-hours (kWh) of energy`
} 