import { useState, Dispatch, SetStateAction } from 'react';

interface FormState {
  indoor: number;
  setIndoor: Dispatch<SetStateAction<number>>;
  designTemp: number;
  setDesignTemp: Dispatch<SetStateAction<number>>;
  designBtu: number;
  setDesignBtu: Dispatch<SetStateAction<number>>;
  gasUsage: number;
  setGasUsage: Dispatch<SetStateAction<number>>;
  city: string;
  setCity: Dispatch<SetStateAction<string>>;
  furnaceEfficiency: number;
  setFurnaceEfficiency: Dispatch<SetStateAction<number>>;
  costGas: number;
  setCostGas: Dispatch<SetStateAction<number>>;
  costKwh: number;
  setCostKwh: Dispatch<SetStateAction<number>>;
  selected: number;
  setSelected: Dispatch<SetStateAction<number>>;
}

export function useFormState(): FormState {
  const [indoor, setIndoor] = useState(22);
  const [designTemp, setDesignTemp] = useState(-30);
  const [designBtu, setDesignBtu] = useState(48000);
  const [gasUsage, setGasUsage] = useState(1300);
  const [city, setCity] = useState('Ottawa');
  const [furnaceEfficiency, setFurnaceEfficiency] = useState(0.96);
  const [costGas, setCostGas] = useState(0.45);
  const [costKwh, setCostKwh] = useState(0.1);
  const [selected, setSelected] = useState(0);

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
  };
}


