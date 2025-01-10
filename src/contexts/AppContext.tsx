import React, { createContext, useState } from 'react'
import { Heatpump } from '../types'
import { DEFAULTS } from '../constants/defaults'

export interface AppContextType {
    city: string
    setCity: (city: string) => void
    electricityRate: number
    setElectricityRate: (rate: number) => void
    gasRate: number
    setGasRate: (rate: number) => void
    furnaceEfficiency: number
    setFurnaceEfficiency: (efficiency: number) => void
    heatpumps: Heatpump[]
    setHeatpumps: (heatpumps: Heatpump[]) => void
    selectedHeatpump: number
    setSelectedHeatpump: (index: number) => void
}

export const AppContext = createContext<AppContextType>({
    city: DEFAULTS.CITY,
    setCity: () => { },
    electricityRate: DEFAULTS.COST_ELECTRICITY,
    setElectricityRate: () => { },
    gasRate: DEFAULTS.COST_GAS,
    setGasRate: () => { },
    furnaceEfficiency: DEFAULTS.FURNACE_EFFICIENCY,
    setFurnaceEfficiency: () => { },
    heatpumps: [],
    setHeatpumps: () => { },
    selectedHeatpump: 0,
    setSelectedHeatpump: () => { }
})

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [city, setCity] = useState<string>(DEFAULTS.CITY)
    const [electricityRate, setElectricityRate] = useState(DEFAULTS.COST_ELECTRICITY)
    const [gasRate, setGasRate] = useState(DEFAULTS.COST_GAS)
    const [furnaceEfficiency, setFurnaceEfficiency] = useState(DEFAULTS.FURNACE_EFFICIENCY)
    const [heatpumps, setHeatpumps] = useState<Heatpump[]>([])
    const [selectedHeatpump, setSelectedHeatpump] = useState(0)

    return (
        <AppContext.Provider value={{
            city,
            setCity,
            electricityRate,
            setElectricityRate,
            gasRate,
            setGasRate,
            furnaceEfficiency,
            setFurnaceEfficiency,
            heatpumps,
            setHeatpumps,
            selectedHeatpump,
            setSelectedHeatpump
        }}>
            {children}
        </AppContext.Provider>
    )
} 