import { FuelType, HourlyWeather, Heatpump, Row } from '../types'
import { FUEL_CONVERSION, FUEL_UNITS, getFuelUnit, getConversionFactor, getConversionExplanation } from '../constants/fuel'

export {
    getFuelUnit,
    getConversionFactor,
    getConversionExplanation
}

export const KWH_BTU = 3412

// Constants for appliance energy usage
export const APPLIANCE_ENERGY = {
    HOT_WATER: {
        KWH_PER_PERSON_YEAR: 2500,
        LITERS_PER_PERSON_YEAR: 27375  // 109,500L/year for family of 4 = 27,375L per person
    },
    COOKING: {
        KWH_PER_DAY: 2.5
    }
}

// Hot water calculations
export function getHotWaterKwh(people: number): number {
    return people * APPLIANCE_ENERGY.HOT_WATER.KWH_PER_PERSON_YEAR
}

// Cooking calculations
export function getStoveKwh(daysPerWeek: number): number {
    return daysPerWeek * APPLIANCE_ENERGY.COOKING.KWH_PER_DAY * 52
}

// Conversion helper
export function convertToKwh(fuelType: FuelType, quantity: number): number {
    return quantity * FUEL_CONVERSION[fuelType]
}

export function getDesignLoadAtTemp(temp: number, indoor: number, designTemp: number, designBtu: number) {
    const designBtuPerDegree = designBtu / (indoor - designTemp)
    const heatingDegrees = indoor - temp
    return heatingDegrees * designBtuPerDegree
}

export function getEfficiencyAtTemp(
    temp: number,
    thresholds: number[],
    heatpump: Heatpump
) {
    const cap = heatpump.cap
    const cop = heatpump.cop
    const temps = [...thresholds, -100]
    const arr = temps.map((val, i) => ({
        temp: val,
        cap: cap[i],
        cop: cop[i],
    }))

    const minIndex = Math.max(arr.findIndex((val) => val.temp < temp), 1)

    const capSlope =
        (cap[minIndex] - cap[minIndex - 1]) /
        (temps[minIndex] - temps[minIndex - 1])
    const copSlope =
        (cop[minIndex] - cop[minIndex - 1]) /
        (temps[minIndex] - temps[minIndex - 1])
    const capIntercept = cap[minIndex] - capSlope * temps[minIndex]
    const copIntercept = cop[minIndex] - copSlope * temps[minIndex]

    return {
        cap: capSlope * temp + capIntercept,
        cop: copSlope * temp + copIntercept,
    }
}

export function getEnergySource(
    hour: HourlyWeather,
    btusAtTemp: number,
    copAtTemp: number,
    indoor: number,
    designTemp: number,
    designBtu: number
): {
    resistiveHeat: number
    heatPump: number
    heatPumpDuelFuel: number
    fossilFuelKwh: number
    amountOfEnergyNeeded: number
    effectiveCop: number
} {
    const requiredBtus = getDesignLoadAtTemp(hour.temp, indoor, designTemp, designBtu)
    const amountOfEnergyNeeded = requiredBtus / KWH_BTU
    const proportionHeatPump = Math.min(btusAtTemp / requiredBtus, 1)

    const resistiveHeat = (1 - proportionHeatPump) * amountOfEnergyNeeded
    const heatPump = (proportionHeatPump * amountOfEnergyNeeded) / copAtTemp
    const heatPumpDuelFuel = proportionHeatPump === 1 ? heatPump : 0
    const fossilFuelKwh = proportionHeatPump === 1 ? 0 : amountOfEnergyNeeded
    const effectiveCop =
        proportionHeatPump * copAtTemp + 1 * (1 - proportionHeatPump)

    return {
        resistiveHeat,
        heatPump,
        heatPumpDuelFuel,
        fossilFuelKwh,
        amountOfEnergyNeeded,
        effectiveCop,
    }
}

export function getHoursInTempRange(
    hours: HourlyWeather[],
    min: number,
    max: number
): HourlyWeather[] {
    return hours.filter((hour) => hour.temp <= max && hour.temp > min)
}

export function getRows(
    thresholds: number[],
    weather: HourlyWeather[],
    heatpump: Heatpump,
    indoor: number,
    designTemp: number,
    designBtu: number
): Row[] {
    return thresholds.map((val, i) => {
        const max = val
        const min = thresholds[i + 1] || -100
        const hoursInRange = getHoursInTempRange(weather, min, max)

        const {
            resistiveKwhConsumed,
            heatPumpKwhConsumed,
            heatPumpDuelFuel,
            fossilFuelKwh,
            copAverage,
            heatingDelta,
            amountOfEnergyNeeded,
            hoursHeating,
        } = hoursInRange.reduce(
            (acc, hour) => {
                const { cop: hourCop, cap: hourCap } = getEfficiencyAtTemp(
                    hour.temp,
                    thresholds,
                    heatpump
                )

                const {
                    resistiveHeat: hourResitiveKwh,
                    heatPump: hourHeatPumpKwh,
                    heatPumpDuelFuel: hourHeatPumpDuelFuel,
                    fossilFuelKwh: hourFossilFuelKwh,
                    amountOfEnergyNeeded,
                    effectiveCop,
                } = getEnergySource(hour, hourCap, hourCop, indoor, designTemp, designBtu)

                return {
                    heatingDelta: acc.heatingDelta + (indoor - hour.temp),
                    resistiveKwhConsumed: acc.resistiveKwhConsumed + hourResitiveKwh,
                    heatPumpKwhConsumed: acc.heatPumpKwhConsumed + hourHeatPumpKwh,
                    heatPumpDuelFuel: acc.heatPumpDuelFuel + hourHeatPumpDuelFuel,
                    fossilFuelKwh: acc.fossilFuelKwh + hourFossilFuelKwh,
                    amountOfEnergyNeeded:
                        acc.amountOfEnergyNeeded + amountOfEnergyNeeded,
                    copAverage: amountOfEnergyNeeded > 0 ? acc.copAverage + effectiveCop : acc.copAverage,
                    hoursHeating: amountOfEnergyNeeded > 0 ? acc.hoursHeating + 1 : acc.hoursHeating,
                }
            },
            {
                heatingDelta: 0,
                resistiveKwhConsumed: 0,
                heatPumpKwhConsumed: 0,
                heatPumpDuelFuel: 0,
                fossilFuelKwh: 0,
                copAverage: 0,
                amountOfEnergyNeeded: 0,
                hoursHeating: 0,
            }
        )

        const hoursBelowNum = hoursInRange.length
        const percent = Number(hoursBelowNum / weather.length)
        const heatingDeltaPercent = Number(heatingDelta / weather.reduce((acc, hour) => acc + (indoor - hour.temp), 0))

        let label = ''
        if (i === thresholds.length - 1) {
            label = `< ${val}`
        } else {
            label = `${val} to ${thresholds[i + 1]}`
        }

        return {
            label,
            threshold: val,
            max,
            min,
            hours: hoursInRange,
            num: hoursInRange.length,
            percentHours: percent,
            heatingDegrees: heatingDelta,
            heatingPercent: heatingDeltaPercent,
            gains: 0, // This needs to be calculated elsewhere
            resistiveKwhConsumed,
            heatPumpKwhConsumed,
            heatPumpDuelFuel,
            fossilFuelKwh,
            copAverage: copAverage / hoursHeating,
            amountOfEnergyNeeded,
        }
    })
}