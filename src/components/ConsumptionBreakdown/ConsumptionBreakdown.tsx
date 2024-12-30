import React from 'react'
import { Table, Space, Tooltip, Typography, Card } from 'antd'
import { InfoCircleOutlined, PercentageOutlined, RocketFilled, ExperimentFilled, QuestionCircleOutlined, FireOutlined } from '@ant-design/icons'
import { Row, Heatpump } from '../../types'
import { HeatPumpIcon, ResistiveHeatIcon } from '../Icons/HvacIcons'

const { Text } = Typography

// Define the ConsumptionBreakdownProps type
type ConsumptionBreakdownProps = {
    rows: Row[], // Assuming Row is already defined
    heatpumps: Heatpump[], // Assuming Heatpump is already defined
    selected: number, // Assuming selected is an index or similar'
    magicNumber: number,
    gasRate: number,  // $ per m³
    gasEfficiency: number  // Furnace efficiency (e.g., 0.95)
}

export const ConsumptionBreakdown: React.FC<ConsumptionBreakdownProps> = ({
    rows,
    heatpumps,
    selected,
    magicNumber,
    gasRate,
    gasEfficiency
}) => {
    // Constants for gas calculations
    const KWH_PER_M3 = 10.55  // kWh of energy per m³ of natural gas

    const columns = [
        {
            title: (
                <Space>
                    Threshold & Heating Degree
                    <Tooltip title="Temperature range and percentage of hours/heating degree days">
                        <InfoCircleOutlined />
                    </Tooltip>
                </Space>
            ),
            key: 'thresholdAndDegree',
            render: (_, record: Row) => {
                const percent = (record.percentHours * 100).toFixed(1)
                const heatingDeltaPercent = (record.heatingPercent * 100).toFixed(1)
                return (
                    <Space direction="vertical">
                        <Text>{`${record.min}°C - ${record.max}°C`}</Text>
                        <Text type="secondary">
                            {`${percent}% / ${heatingDeltaPercent}%`}
                            <Tooltip title={`For ${percent}% of the year it is above ${record.min}°C, that represents ${heatingDeltaPercent}% of total heating load for the year`}>
                                <QuestionCircleOutlined style={{ marginLeft: 4, color: '#1890ff' }} />
                            </Tooltip>
                        </Text>
                    </Space>
                )
            },
        },
        {
            title: (
                <Tooltip title="Heat Pump Energy Consumption Details">
                    Heat Pump Energy
                </Tooltip>
            ),
            key: 'energy',
            render: (_, record) => (
                <Space direction="horizontal" style={{ whiteSpace: 'nowrap' }}>
                    <Tooltip title="Heat Pump Energy Consumption">
                        <Text>
                            <HeatPumpIcon color="#1890ff" /> {Math.round(record.heatPumpKwhConsumed * magicNumber)}kWh
                        </Text>
                    </Tooltip>
                    <Tooltip title="Auxiliary Energy Consumption">
                        <Text>
                            <ResistiveHeatIcon color="#ff4d4f" /> {Math.round(record.resistiveKwhConsumed * magicNumber)}kWh
                        </Text>
                    </Tooltip>
                </Space>
            ),
        },
        {
            title: (
                <Tooltip title="Natural Gas Consumption">
                    Gas Energy
                </Tooltip>
            ),
            key: 'gas',
            render: (_, record) => {
                // Calculate total heat needed in kWh
                const totalHeatKwh = (record.heatPumpKwhConsumed + record.resistiveKwhConsumed) *
                    record.copAverage * magicNumber

                // Convert to m³ of gas needed
                const gasM3 = totalHeatKwh / (KWH_PER_M3 * gasEfficiency)

                // Calculate cost
                const gasCost = gasM3 * gasRate

                return (
                    <Space direction="horizontal" style={{ whiteSpace: 'nowrap' }}>
                        <Tooltip title="Natural Gas Consumption">
                            <Text>
                                <FireOutlined style={{ color: '#fa8c16' }} /> {Math.round(gasM3)}m³
                            </Text>
                        </Tooltip>
                        <Tooltip title="Gas Cost">
                            <Text type="secondary">
                                (${Math.round(gasCost)})
                            </Text>
                        </Tooltip>
                    </Space>
                )
            }
        },
        {
            title: 'Heat Pump Performance',
            key: 'performance',
            render: (_, record, index) => (
                <Space direction="horizontal" style={{ whiteSpace: 'nowrap' }}>
                    <Tooltip title="Coefficient of Performance">
                        <Space size="small">
                            <PercentageOutlined style={{ color: '#1890ff' }} />
                            <Text type="secondary">{heatpumps[selected].cop[index].toFixed(2)}</Text>
                        </Space>
                    </Tooltip>
                    <Tooltip title="Heating Capacity">
                        <Space size="small">
                            <RocketFilled style={{ color: '#ff4d4f' }} />
                            <Text type="secondary">{Math.round(heatpumps[selected].cap[index])} BTUs</Text>
                        </Space>
                    </Tooltip>
                    <Tooltip title="Average COP for Range">
                        <Space size="small">
                            <ExperimentFilled style={{ color: '#52c41a' }} />
                            <Text type="secondary">{record.copAverage.toFixed(2)}</Text>
                        </Space>
                    </Tooltip>
                </Space>
            ),
        },
    ]

    return (
        <Card size="small">
            <Table
                columns={columns}
                dataSource={rows}
                rowKey={(record, index) => index.toString()}
                pagination={false}
                scroll={{ x: 'max-content' }}
            />
        </Card>
    )
}