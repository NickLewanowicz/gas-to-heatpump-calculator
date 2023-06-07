import { useState } from 'react';

export interface Heatpump {
  performance: Performance[];
  name: string;
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
  const [heatpumps, setHeatpumps] = useState([
    { performance: [], name: '', id: 1 },
  ]);

  return {
    heatpumps,
    updateHeatpump,
    addHeatpump,
    deleteHeatpump,
  };
  function updateHeatpump(heatpump: Partial<Heatpump>) {
    setHeatpumps((previousState) => {
      const newState = previousState.map((pump) =>
        heatpump.id === pump.id ? { ...pump, ...heatpump } : pump
      );
      return newState;
    });
  }
  function addHeatpump() {
    setHeatpumps([...heatpumps, initHeatpump()]);
  }
  function deleteHeatpump(id: number) {
    setHeatpumps((previousState) => {
      const newState = previousState.filter(({ id: curr }) => curr != id);
      return newState;
    });
  }

  function initHeatpump() {
    return { performance: [], name: '', id: heatpumps.length + 1 };
  }
}
