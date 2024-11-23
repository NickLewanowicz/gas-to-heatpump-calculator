import React from 'react'
import { FuelType } from '../../hooks'
import { Row, Heatpump, HourlyWeather } from '../../types'
import { Table, Card, Typography, Statistic, Space, Divider, theme } from 'antd'
import { FireFilled, ThunderboltFilled, HeatMapOutlined, RocketFilled, ExperimentFilled, PercentageOutlined, ApiOutlined } from '@ant-design/icons'
import { Tooltip } from 'antd'
const { Text, Title } = Typography

interface ResultOption {
    title: string
    consumption?: string
    cost?: number
    electricOption?: {
        consumption: string
        cost: number
        details: {
            heatpumpKwh: number
            auxKwh: number
            avgCop: number
        }
    }
    fossilOption?: {
        consumption: string
        cost: number
    }
}

interface ResultsProps {
    rows: Row[]
    kwhEquivalent: number
    fuelUsage: number
    fuelType: FuelType
    costGas: number
    costKwh: number
    heatpumps: Heatpump[]
    heatingDegrees: number
    getRows: (thresholds: number[], weather: HourlyWeather[], heatpump: Heatpump) => Row[]
    thresholds: number[]
    weather: HourlyWeather[]
    convertToKwh: (fuelType: FuelType, quantity: number) => number
}

export const Results: React.FC<ResultsProps> = ({
    rows,
    kwhEquivalent,
    fuelUsage,
    fuelType,
    costGas,
    costKwh,
    heatpumps,
    heatingDegrees,
    getRows,
    thresholds,
    weather,
    convertToKwh,
}) => {
    const { token } = theme.useToken()

    const getUnits = (fuelType: FuelType) => {
        switch (fuelType) {
            case FuelType.NATURAL_GAS:
                return "m3"
            case FuelType.OIL:
            case FuelType.PROPANE:
                return "L"
        }
    }

    const getTotals = (rows: Row[]) => {
        const totalEnery = rows.reduce(
            (acc, row) => acc + row.amountOfEnergyNeeded,
            0
        )
        const magicNumber = kwhEquivalent / totalEnery
        return rows.reduce(
            (acc, row) => {
                return {
                    totalConsumed:
                        acc.totalConsumed +
                        row.heatPumpKwhConsumed * magicNumber +
                        row.resistiveKwhConsumed * magicNumber,
                    totalOutput: acc.totalOutput + row.amountOfEnergyNeeded,
                    heatpumpConsumed:
                        acc.heatpumpConsumed + row.heatPumpKwhConsumed * magicNumber,
                    auxConsumed: acc.auxConsumed + row.resistiveKwhConsumed * magicNumber,
                    heatpumpOutput:
                        acc.heatpumpOutput + row.heatPumpKwhConsumed * row.copAverage,
                    auxOutput: acc.auxConsumed + row.resistiveKwhConsumed,
                    heatPumpDuelFuelConsumed:
                        acc.heatPumpDuelFuelConsumed + row.heatPumpDuelFuel * magicNumber,
                    fossilFuelKwhTotal:
                        acc.fossilFuelKwhTotal + row.fossilFuelKwh * magicNumber,
                }
            },
            {
                totalConsumed: 0,
                totalOutput: 0,
                heatpumpConsumed: 0,
                auxConsumed: 0,
                heatpumpOutput: 0,
                auxOutput: 0,
                heatPumpDuelFuelConsumed: 0,
                fossilFuelKwhTotal: 0,
            }
        )
    }

    const totals = getTotals(rows)

    const baseOptions: ResultOption[] = [
        {
            title: 'Fossil Fuel',
            consumption: `${fuelUsage} ${getUnits(fuelType)}`,
            cost: costGas * fuelUsage
        },
        {
            title: 'Baseboard Heat',
            consumption: `${kwhEquivalent.toFixed(2)} kWh`,
            cost: Math.round(kwhEquivalent * costKwh)
        }
    ]

    const heatpumpOptions: ResultOption[] = heatpumps.map(heatpump => {
        const heatpumpRows = getRows(thresholds, weather, heatpump)
        const heatpumpTotals = getTotals(heatpumpRows)

        return {
            title: heatpump.name,
            electricOption: {
                consumption: `${Math.round(heatpumpTotals.totalConsumed)} kWh`,
                cost: Math.round(heatpumpTotals.totalConsumed * costKwh),
                details: {
                    heatpumpKwh: Math.round(heatpumpTotals.heatpumpConsumed),
                    auxKwh: Math.round(heatpumpTotals.auxConsumed),
                    avgCop: Number(rows.reduce((acc, row) =>
                        acc + row.copAverage * (row.heatingDegrees / heatingDegrees), 0
                    ).toFixed(2))
                }
            },
            fossilOption: {
                consumption: `${Math.round(heatpumpTotals.heatPumpDuelFuelConsumed)} kWh + ${Math.round(heatpumpTotals.fossilFuelKwhTotal / convertToKwh(fuelType, 1))} ${getUnits(fuelType)}`,
                cost: Math.round(
                    heatpumpTotals.heatPumpDuelFuelConsumed * costKwh +
                    (heatpumpTotals.fossilFuelKwhTotal / convertToKwh(fuelType, 1)) * costGas
                )
            }
        }
    })

    return (
        <Space
            direction="vertical"
            size="middle"
            style={{
                width: '100%',
                maxWidth: '100%',
                padding: '0 8px',
                overflow: 'hidden'
            }}
        >
            <Title level={4} style={{ fontSize: '1.2rem' }}>Cost Comparison</Title>

            {heatpumpOptions.map((option, index) => (
                <Card size="small" key={index}>
                    <Space direction="vertical" style={{ width: '100%' }} size="middle">
                        {/* Header */}
                        <Space>
                            <HeatMapOutlined style={{ color: token.colorTextSecondary }} />
                            <Text strong>{option.title}</Text>
                        </Space>

                        {/* Electric backup option */}
                        <Space direction="vertical" style={{ width: '100%' }}>
                            <Tooltip title="System uses electric resistance heating when supplemental heat is needed">
                                <Space>
                                    <ThunderboltFilled style={{ color: token.colorTextSecondary }} />
                                    <Text>Electric backup</Text>
                                    <Statistic value={option.electricOption.cost} prefix="$" valueStyle={{ fontSize: '14px' }} />
                                </Space>
                            </Tooltip>

                            <Space size="large" style={{ paddingLeft: token.paddingLG }}>
                                <Tooltip title="Energy consumed by heat pump">
                                    <Space size="small">
                                        <ApiOutlined style={{ color: token.colorTextSecondary }} />
                                        <Text type="secondary">{option.electricOption.details.heatpumpKwh} kWh</Text>
                                    </Space>
                                </Tooltip>
                                <Tooltip title="Auxiliary energy consumption">
                                    <Space size="small">
                                        <ExperimentFilled style={{ color: token.colorTextSecondary }} />
                                        <Text type="secondary">{option.electricOption.details.auxKwh} kWh</Text>
                                    </Space>
                                </Tooltip>
                                <Tooltip title="Coefficient of Performance - The ratio of heat output to energy input">
                                    <Space size="small">
                                        <PercentageOutlined style={{ color: token.colorTextSecondary }} />
                                        <Text type="secondary">{option.electricOption.details.avgCop}</Text>
                                    </Space>
                                </Tooltip>
                            </Space>
                        </Space>

                        {/* Fossil fuel backup option - only show if not electric */}
                        {fuelType !== 'Electric' && (
                            <Space direction="vertical" style={{ width: '100%' }}>
                                <Tooltip title={`System uses ${fuelType.toLowerCase()} when supplemental heat is needed`}>
                                    <Space>
                                        <FireFilled style={{ color: token.colorTextSecondary }} />
                                        <Text>{fuelType} backup</Text>
                                        <Statistic value={option.fossilOption.cost} prefix="$" valueStyle={{ fontSize: '14px' }} />
                                    </Space>
                                </Tooltip>

                                <Space size="large" style={{ paddingLeft: token.paddingLG }}>
                                    <Tooltip title="Energy consumed by heat pump">
                                        <Space size="small">
                                            <ApiOutlined style={{ color: token.colorTextSecondary }} />
                                            <Text type="secondary">
                                                {option.fossilOption.consumption.split('+')[0].trim()}
                                            </Text>
                                        </Space>
                                    </Tooltip>
                                    <Tooltip title="Auxiliary energy consumption">
                                        <Space size="small">
                                            <FireFilled style={{ color: token.colorTextSecondary }} />
                                            <Text type="secondary">
                                                {option.fossilOption.consumption.split('+')[1].trim()}
                                            </Text>
                                        </Space>
                                    </Tooltip>
                                </Space>
                            </Space>
                        )}
                    </Space>
                </Card>
            ))}
        </Space>
    )
}