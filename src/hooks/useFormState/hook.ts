import { Dispatch, SetStateAction, useState } from 'react'
import { FuelType, SeasonView } from '../../types'
import { DEFAULTS } from '../../constants/defaults'

interface FormState {
  city: string
  setCity: Dispatch<SetStateAction<string>>
  year: number
  setYear: Dispatch<SetStateAction<number>>
  seasonView: SeasonView
  setSeasonView: Dispatch<SetStateAction<SeasonView>>
  costGas: number
  setCostGas: Dispatch<SetStateAction<number>>
  costKwh: number
  setCostKwh: Dispatch<SetStateAction<number>>
  fuelUsage: number
  setFuelUsage: Dispatch<SetStateAction<number>>
  furnaceEfficiency: number
  setFurnaceEfficiency: Dispatch<SetStateAction<number>>
  fuelType: FuelType
  setFuelType: Dispatch<SetStateAction<FuelType>>
  indoor: number
  setIndoor: Dispatch<SetStateAction<number>>
  designTemp: number
  setDesignTemp: Dispatch<SetStateAction<number>>
  designBtu: number
  setDesignBtu: Dispatch<SetStateAction<number>>
}

export function useFormState(): FormState {
  const [city, setCity] = useState<string>(DEFAULTS.CITY)
  const [year, setYear] = useState<number>(DEFAULTS.YEAR)
  const [seasonView, setSeasonView] = useState<SeasonView>(DEFAULTS.SEASON_VIEW)
  const [costGas, setCostGas] = useState<number>(DEFAULTS.COST_GAS)
  const [costKwh, setCostKwh] = useState<number>(DEFAULTS.COST_ELECTRICITY)
  const [fuelUsage, setFuelUsage] = useState<number>(DEFAULTS.FUEL_USAGE)
  const [furnaceEfficiency, setFurnaceEfficiency] = useState<number>(DEFAULTS.FURNACE_EFFICIENCY)
  const [fuelType, setFuelType] = useState<FuelType>(DEFAULTS.FUEL_TYPE)
  const [indoor, setIndoor] = useState<number>(DEFAULTS.INDOOR_TEMP)
  const [designTemp, setDesignTemp] = useState<number>(DEFAULTS.DESIGN_TEMP)
  const [designBtu, setDesignBtu] = useState<number>(DEFAULTS.DESIGN_BTU)

  return {
    city,
    setCity,
    year,
    setYear,
    seasonView,
    setSeasonView,
    costGas,
    setCostGas,
    costKwh,
    setCostKwh,
    fuelUsage,
    setFuelUsage,
    furnaceEfficiency,
    setFurnaceEfficiency,
    fuelType,
    setFuelType,
    indoor,
    setIndoor,
    designTemp,
    setDesignTemp,
    designBtu,
    setDesignBtu,
  }
}
