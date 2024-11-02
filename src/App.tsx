import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { WeatherData, Row, Heatpump } from './types'
import weatherData from './data'
import { useFormState } from './hooks'
import { useHeatpumps } from './hooks/useHeatpumps/hook'
import { useWeatherData } from './hooks/useWeatherData/hook'
import { getRows, convertToKwh } from './utils/calculations'
import { AppLayout } from './components/Layout/AppLayout'
import 'antd/dist/reset.css'

const initialHeatpump: Heatpump = {
  name: 'Heatpump #1',
  cap: [35000, 35000, 24000, 28000, 16000, 0],
  cop: [3.5, 3, 2, 1.8, 1.2, 1],
}

export default function App() {
  const allWeather = weatherData as WeatherData
  const cities = Object.keys(allWeather).sort()
  const [searchParams, setSearchParams] = useSearchParams()
  const [init, setInit] = useState(false)
  const [rows, setRows] = useState<Row[]>([])
  const formState = useFormState()
  const {
    heatpumps,
    addHeatpump,
    removeHeatpump,
    updateHeatpump,
    selected,
    setSelected,
  } = useHeatpumps([initialHeatpump])

  const {
    indoor,
    designTemp,
    designBtu,
    city,
    furnaceEfficiency,
    costGas,
    costKwh,
    fuelType,
    fuelUsage,
  } = formState

  const weather = useWeatherData(city)
  const thresholds = [indoor, 8.33, -8.33, -15, -30]
  const kwhEquivalent = convertToKwh(fuelType, fuelUsage) * furnaceEfficiency
  const heatingDegrees = weather.reduce((acc, hour) => acc + (indoor - hour.temp), 0)

  useEffect(() => {
    const storedHeatpumps = JSON.parse(
      decodeURI(searchParams.get('heatpumps') || '[]')
    ) as Heatpump[]
    if (storedHeatpumps.length) {
      storedHeatpumps.forEach((heatpump, i) =>
        i === 0 ? updateHeatpump(i, heatpump) : addHeatpump(heatpump)
      )
    }
    setInit(true)
  }, [])

  useEffect(() => {
    if (init) {
      searchParams.set('heatpumps', encodeURI(JSON.stringify(heatpumps)))
      setSearchParams(searchParams)
    }
  }, [heatpumps, init])

  useEffect(() => {
    setRows(getRows(thresholds, weather, heatpumps[selected], indoor, designTemp, designBtu))
  }, [heatpumps, indoor, designBtu, weather, selected, designTemp])

  return (
    <AppLayout
      formState={formState}
      cities={cities}
      heatpumps={heatpumps}
      selected={selected}
      setSelected={setSelected}
      addHeatpump={addHeatpump}
      removeHeatpump={removeHeatpump}
      updateHeatpump={updateHeatpump}
      rows={rows}
      indoor={indoor}
      designTemp={designTemp}
      designBtu={designBtu}
      weather={weather}
      thresholds={thresholds}
      kwhEquivalent={kwhEquivalent}
      fuelUsage={fuelUsage}
      fuelType={fuelType}
      costGas={costGas}
      costKwh={costKwh}
      heatingDegrees={heatingDegrees}
      getRows={(thresholds, weather, heatpump) =>
        getRows(thresholds, weather, heatpump, indoor, designTemp, designBtu)}
      convertToKwh={convertToKwh}
    />
  )
}
