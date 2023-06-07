import { useState } from 'react';

export interface Heatpump {
  performance: Performance[];
  neame: string;
  id: number;
}

export interface Performance {
  temp: number;
  cop: number;
  cap: number;
  index: number;
}

export interface HeatpumpInterface {
  heatpumps: Heatpump[];
  updateHeatpump(heatpump: Partial<Heatpump>): void;
  addHeatpump(): void;
  deleteHeatpump(id: number): void;
}

export function useHeatpumps(): HeatpumpInterface {
  const [heatpumps, setHeatpumps] = useState([]);

  return {
    heatpumps,
    updateHeatpump,
    addHeatpump,
    deleteHeatpump,
  };
  function updateHeatpump(heatpump: Partial<Heatpump>) {
    let newHeatpumps = heatpumps.
    setHeatpumps
  }
  function addHeatpump() {}
  function deleteHeatpump(id: number) {}
}
