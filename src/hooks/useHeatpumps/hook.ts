import { Dispatch, SetStateAction, useState } from 'react';

interface Heatpump {
  name: string;
  cap: number[];
  cop: number[];
}

interface HeatpumpsHook {
  heatpumps: Heatpump[];
  addHeatpump: (newHeatpump: Heatpump) => void;
  removeHeatpump: (index: number) => void;
  updateHeatpump: (index: number, updatedHeatpump: Partial<Heatpump>) => void;
  selected: number;
  setSelected: Dispatch<SetStateAction<number>>;
}

export function useHeatpumps(initialHeatpumps: Heatpump[]): HeatpumpsHook {
  const [heatpumps, setHeatpumps] = useState<Heatpump[]>(initialHeatpumps);
  const [selected, setSelected] = useState(0);

  // Add a new heat pump
  const addHeatpump = (newHeatpump: Heatpump) => {
    setHeatpumps([...heatpumps, newHeatpump]);
  };

  // Remove a heat pump by index
  const removeHeatpump = (index: number) => {
    const updatedHeatpumps = [...heatpumps];
    updatedHeatpumps.splice(index, 1);
    setHeatpumps(updatedHeatpumps);
  };

  // Update a heat pump by index
  const updateHeatpump = (
    index: number,
    updatedHeatpump: Partial<Heatpump>
  ) => {
    setHeatpumps(
      heatpumps.map((heatpump, i) =>
        index === i ? { ...heatpump, ...updatedHeatpump } : heatpump
      )
    );
  };

  return {
    heatpumps,
    addHeatpump,
    removeHeatpump,
    updateHeatpump,
    selected,
    setSelected,
  };
}
