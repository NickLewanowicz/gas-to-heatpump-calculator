import React, { createContext, useState } from 'react'
import { Heatpump } from '../types'

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
    city: 'Toronto',
    setCity: () => { },
    electricityRate: 0.13,
    setElectricityRate: () => { },
    gasRate: 0.42,
    setGasRate: () => { },
    furnaceEfficiency: 0.96,
    setFurnaceEfficiency: () => { },
    heatpumps: [],
    setHeatpumps: () => { },
    selectedHeatpump: 0,
    setSelectedHeatpump: () => { }
})

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [city, setCity] = useState<string>('Toronto')
    const [electricityRate, setElectricityRate] = useState(0.13)
    const [gasRate, setGasRate] = useState(0.42)
    const [furnaceEfficiency, setFurnaceEfficiency] = useState(0.96)
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