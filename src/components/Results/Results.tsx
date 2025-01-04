import React from 'react'
import { Card, Space, Typography } from 'antd'
import { useApp } from '../../context/AppContext'
import { ConsumptionBreakdown } from '../ConsumptionBreakdown/ConsumptionBreakdown'
import { CapacityChart } from '../CapacityChart/CapacityChart'
import { getMultipleChartData } from '../../utils/chartData'

const { Title } = Typography

const ENERGY_CONTENT = {
    'Natural Gas': 10.55,  // kWh per m³
    'Oil': 10.0,          // kWh per L (approximate)
    'Propane': 7.1,       // kWh per L (approximate)
    'Electric': 1.0,      // kWh per kWh
}

export const Results = () => {
    const {
        indoor,
        designTemp,
        designBtu,
        weather,
        filteredWeather,
        thresholds,
        kwhEquivalent,
        fuelUsage,
        fuelType,
        costGas,
        costKwh,
        heatingDegrees,
        getRows,
        convertToKwh,
        heatpumps,
        selected,
        seasonView,
        year,
        furnaceEfficiency,
    } = useApp()

    const rows = getRows(thresholds, filteredWeather, heatpumps[selected], indoor, designTemp, designBtu)
    const totalEnergy = rows.reduce((acc, row) => acc + row.amountOfEnergyNeeded, 0)
    const magicNumber = kwhEquivalent / totalEnergy
    const duelFuelBreakeven = costKwh / (costGas / (convertToKwh(fuelType, 1) * furnaceEfficiency))

    // Calculate total heat needed (in kWh)
    const totalHeatKwh = rows.reduce((sum, row) => {
        return sum + (row.heatPumpKwhConsumed + row.resistiveKwhConsumed) * row.copAverage * magicNumber
    }, 0)

    // Calculate current fossil fuel system
    const gasOnlyM3 = totalHeatKwh / (ENERGY_CONTENT[fuelType] * furnaceEfficiency)
    const gasOnlyCost = gasOnlyM3 * costGas

    // Calculate full electric heat pump system
    const heatPumpKwh = rows.reduce((sum, row) => sum + row.heatPumpKwhConsumed * magicNumber, 0)
    const resistiveKwh = rows.reduce((sum, row) => sum + row.resistiveKwhConsumed * magicNumber, 0)
    const totalKwh = heatPumpKwh + resistiveKwh

    // Calculate average COP for full electric mode (weighted by actual heat provided)
    const fullElectricCop = rows.reduce((acc, row) => {
        const heatFromHeatPump = row.heatPumpKwhConsumed * row.copAverage * magicNumber
        const totalHeatThisRow = (row.heatPumpKwhConsumed + row.resistiveKwhConsumed) * row.copAverage * magicNumber
        return acc + (row.copAverage * (heatFromHeatPump / totalHeatKwh))
    }, 0)

    // Calculate hybrid system (heat pump + existing furnace)
    // Use heat pump when it can meet the full heating load, use furnace for the rest
    const hybridCalc = rows.reduce((acc, row) => {
        const totalHeat = (row.heatPumpKwhConsumed + row.resistiveKwhConsumed) * row.copAverage * magicNumber
        const heatPumpCapacity = heatpumps[selected].cap[rows.indexOf(row)]
        const requiredBtu = Math.round((designBtu / (indoor - -30)) * (indoor - row.max))

        if (heatPumpCapacity >= requiredBtu) {
            // Heat pump can handle the full load at this temperature
            return {
                heatPumpKwh: acc.heatPumpKwh + totalHeat / row.copAverage,
                fuelUsage: acc.fuelUsage,
                weightedCop: acc.weightedCop + (row.copAverage * (totalHeat / totalHeatKwh)),
                heatPumpHeatTotal: acc.heatPumpHeatTotal + totalHeat
            }
        } else {
            // Need to use the furnace at this temperature
            return {
                heatPumpKwh: acc.heatPumpKwh,
                fuelUsage: acc.fuelUsage + totalHeat / (ENERGY_CONTENT[fuelType] * furnaceEfficiency),
                weightedCop: acc.weightedCop,
                heatPumpHeatTotal: acc.heatPumpHeatTotal
            }
        }
    }, { heatPumpKwh: 0, fuelUsage: 0, weightedCop: 0, heatPumpHeatTotal: 0 })

    // Calculate average COP for hybrid mode (only when heat pump is used)
    const hybridCop = hybridCalc.heatPumpHeatTotal > 0
        ? hybridCalc.weightedCop * (totalHeatKwh / hybridCalc.heatPumpHeatTotal)
        : 0

    const hybridCost = hybridCalc.heatPumpKwh * costKwh + hybridCalc.fuelUsage * costGas

    return (
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <Card>
                <Title level={4}>System Comparison</Title>
                <ConsumptionBreakdown
                    rows={rows}
                    heatpumps={heatpumps}
                    selected={selected}
                    magicNumber={magicNumber}
                    gasRate={costGas}
                    gasEfficiency={furnaceEfficiency}
                    kwhRate={costKwh}
                    fuelType={fuelType}
                    gasOnlyM3={gasOnlyM3}
                    gasOnlyCost={gasOnlyCost}
                    heatPumpKwh={heatPumpKwh}
                    resistiveKwh={resistiveKwh}
                    totalKwh={totalKwh}
                    averageCop={fullElectricCop}
                    hybridHeatPumpKwh={hybridCalc.heatPumpKwh}
                    hybridFuelUsage={hybridCalc.fuelUsage}
                    hybridCost={hybridCost}
                    hybridCop={hybridCop}
                />
            </Card>

            <Card>
                <Title level={4}>Performance Analysis</Title>
                <CapacityChart
                    data={getMultipleChartData(rows, heatpumps, indoor, designTemp, designBtu)}
                    duelFuelBreakeven={duelFuelBreakeven}
                    heatpumps={heatpumps}
                    selected={selected}
                    weather={filteredWeather}
                />
            </Card>
        </Space>
    )
}