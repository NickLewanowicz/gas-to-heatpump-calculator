import React from 'react'
import { Row, Heatpump } from '../../types'

interface ConsumptionBreakdownProps {
    rows: Row[]
    heatpumps: Heatpump[]
    selected: number
}

export const ConsumptionBreakdown: React.FC<ConsumptionBreakdownProps> = ({
    rows,
    heatpumps,
    selected,
}) => {
    return (
        <figure>
            <table role="grid">
                <thead>
                    <tr>
                        <td>Threshold °C</td>
                        <td>% of hours / heating degree</td>
                        <td>Energy Consumption</td>
                        <td>Heat Pump Performance</td>
                    </tr>
                </thead>
                <tbody>
                    {rows.map((val, i) => {
                        const percent = val.percentHours.toLocaleString(undefined, {
                            style: 'percent',
                            minimumFractionDigits: 2,
                        })
                        const heatingDeltaPercent = val.heatingPercent.toLocaleString(
                            undefined,
                            {
                                style: 'percent',
                                minimumFractionDigits: 2,
                            }
                        )

                        return (
                            <tr key={i}>
                                <td>{`${val.label} °C`}</td>
                                <td>
                                    {percent} / {heatingDeltaPercent}
                                </td>
                                <td>
                                    HP: {Math.round(val.heatPumpKwhConsumed)}kWh <br /> AUX:
                                    {val.resistiveKwhConsumed.toFixed(2)}kWh
                                </td>
                                <td>
                                    {heatpumps[selected].cop[i]}
                                    <em data-tooltip={`COP @ ${val.max}c`}>COP</em>
                                    <br />
                                    {heatpumps[selected].cap[i]} BTUs
                                    <br />
                                    {val.copAverage.toFixed(2)}{' '}
                                    <em data-tooltip="COP average for range">COP</em>
                                </td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        </figure>
    )
}