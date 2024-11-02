import { useState } from 'react'
import { Heatpump, HeatpumpsHook } from '../../types'

const initialHeatpump: Heatpump = {
  name: 'Heatpump #1',
  cap: [35000, 35000, 24000, 28000, 16000, 0],
  cop: [3.5, 3, 2, 1.8, 1.2, 1],
}

export function useHeatpumps(initialHeatpumps: Heatpump[] = [initialHeatpump]): HeatpumpsHook {
  const [heatpumps, setHeatpumps] = useState<Heatpump[]>(initialHeatpumps)
  const [selected, setSelected] = useState(0)

  const addHeatpump = (newHeatpump: Heatpump) => {
    setHeatpumps((prev) => [...prev, newHeatpump])
  }

  const removeHeatpump = (index: number) => {
    setHeatpumps((prev) => {
      const newHeatpumps = prev.filter((_, i) => i !== index)
      if (selected >= newHeatpumps.length) {
        setSelected(newHeatpumps.length - 1)
      }
      return newHeatpumps
    })
  }

  const updateHeatpump = (index: number, updatedHeatpump: Partial<Heatpump>) => {
    setHeatpumps((prev) =>
      prev.map((heatpump, i) =>
        i === index ? { ...heatpump, ...updatedHeatpump } : heatpump
      )
    )
  }

  return {
    heatpumps,
    addHeatpump,
    removeHeatpump,
    updateHeatpump,
    selected,
    setSelected,
  }
}
