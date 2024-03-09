import { useState, Dispatch, SetStateAction } from 'react'

interface FormState {
  indoor: number
  setIndoor: Dispatch<SetStateAction<number>>
  designTemp: number
  setDesignTemp: Dispatch<SetStateAction<number>>
  designBtu: number
  setDesignBtu: Dispatch<SetStateAction<number>>
  gasUsage: number
  setGasUsage: Dispatch<SetStateAction<number>>
  city: string
  setCity: Dispatch<SetStateAction<string>>
  furnaceEfficiency: number
  setFurnaceEfficiency: Dispatch<SetStateAction<number>>
  costGas: number
  setCostGas: Dispatch<SetStateAction<number>>
  costKwh: number
  setCostKwh: Dispatch<SetStateAction<number>>
  selected: number
  setSelected: Dispatch<SetStateAction<number>>
  fuelUsage: number
  setFuelUsage: Dispatch<SetStateAction<number>>
  fuelType: FuelType
  setFuelType: Dispatch<SetStateAction<FuelType>>
}

export enum FuelType {
  NATURAL_GAS = "Natural Gas",
  OIL = "Oil",
  PROPANE = "Propane",
}

export function useFormState(): FormState {
  const [indoor, setIndoor] = useState(22)
  const [designTemp, setDesignTemp] = useState(-30)
  const [designBtu, setDesignBtu] = useState(48000)
  const [fuelType, setFuelType] = useState<FuelType>(FuelType.NATURAL_GAS)
  const [gasUsage, setGasUsage] = useState(1300)
  const [city, setCity] = useState('Ottawa')
  const [furnaceEfficiency, setFurnaceEfficiency] = useState(0.96)
  const [costGas, setCostGas] = useState(0.45)
  const [costKwh, setCostKwh] = useState(0.1)
  const [selected, setSelected] = useState(0)
  const [fuelUsage, setFuelUsage] = useState(1300)

  return {
    indoor,
    setIndoor,
    designTemp,
    setDesignTemp,
    designBtu,
    setDesignBtu,
    gasUsage,
    setGasUsage,
    city,
    setCity,
    furnaceEfficiency,
    setFurnaceEfficiency,
    costGas,
    setCostGas,
    costKwh,
    setCostKwh,
    selected,
    setSelected,
    fuelType,
    setFuelType,
    fuelUsage,
    setFuelUsage
  }
}
