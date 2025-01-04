import React from 'react'
import { Table, Space, Tooltip, Typography, Card, Statistic, Row, Col, Divider } from 'antd'
import { InfoCircleOutlined, PercentageOutlined, RocketFilled, ExperimentFilled, QuestionCircleOutlined, FireOutlined, ThunderboltOutlined } from '@ant-design/icons'
import { Row as DataRow, Heatpump, FuelType } from '../../types'
import { HeatPumpIcon, ResistiveHeatIcon } from '../Icons/HvacIcons'

const { Text, Title } = Typography

// Define the ConsumptionBreakdownProps type
type ConsumptionBreakdownProps = {
    rows: DataRow[],
    heatpumps: Heatpump[],
    selected: number,
    magicNumber: number,
    gasRate: number,
    gasEfficiency: number,
    kwhRate: number,
    fuelType: FuelType,
    gasOnlyM3: number,
    gasOnlyCost: number,
    heatPumpKwh: number,
    resistiveKwh: number,
    totalKwh: number,
    averageCop: number,
    hybridHeatPumpKwh: number,
    hybridFuelUsage: number,
    hybridCost: number,
    hybridCop: number
}

export const ConsumptionBreakdown: React.FC<ConsumptionBreakdownProps> = ({
    rows,
    heatpumps,
    selected,
    magicNumber,
    gasRate,
    gasEfficiency,
    kwhRate,
    fuelType,
    gasOnlyM3,
    gasOnlyCost,
    heatPumpKwh,
    resistiveKwh,
    totalKwh,
    averageCop,
    hybridHeatPumpKwh,
    hybridFuelUsage,
    hybridCost,
    hybridCop
}) => {
    const getUnits = (fuelType: FuelType) => {
        switch (fuelType) {
            case FuelType.NATURAL_GAS: return "m³"
            case FuelType.OIL:
            case FuelType.PROPANE: return "L"
            case FuelType.ELECTRIC: return "kWh"
        }
    }

    const summaryCards = [
        {
            title: `Current ${fuelType} System`,
            icon: <FireOutlined style={{ color: '#fa8c16', fontSize: 24 }} />,
            consumption: `${Math.round(gasOnlyM3)} ${getUnits(fuelType)}`,
            cost: gasOnlyCost,
            details: [
                {
                    label: 'System Efficiency',
                    value: `${(gasEfficiency * 100).toFixed(0)}%`,
                    icon: <PercentageOutlined style={{ color: '#52c41a' }} />
                }
            ]
        },
        {
            title: `Hybrid (${fuelType} + ${heatpumps[selected].name})`,
            icon: <Space><HeatPumpIcon color="#1890ff" size={24} /><FireOutlined style={{ color: '#fa8c16', fontSize: 24 }} /></Space>,
            consumption: `${Math.round(hybridHeatPumpKwh)} kWh + ${Math.round(hybridFuelUsage)} ${getUnits(fuelType)}`,
            cost: hybridCost,
            details: [
                {
                    label: 'Heat Pump',
                    value: `${Math.round(hybridHeatPumpKwh)} kWh`,
                    icon: <HeatPumpIcon color="#1890ff" />
                },
                {
                    label: `${fuelType}`,
                    value: `${Math.round(hybridFuelUsage)} ${getUnits(fuelType)}`,
                    icon: <FireOutlined style={{ color: '#fa8c16' }} />
                },
                {
                    label: 'Average COP',
                    value: hybridCop.toFixed(2),
                    icon: <ExperimentFilled style={{ color: '#52c41a' }} />
                }
            ]
        },
        {
            title: `Full Electric (${heatpumps[selected].name})`,
            icon: <ThunderboltOutlined style={{ color: '#1890ff', fontSize: 24 }} />,
            consumption: `${Math.round(totalKwh)} kWh`,
            cost: totalKwh * kwhRate,
            details: [
                {
                    label: 'Heat Pump',
                    value: `${Math.round(heatPumpKwh)} kWh`,
                    icon: <HeatPumpIcon color="#1890ff" />
                },
                {
                    label: 'Electric Backup',
                    value: `${Math.round(resistiveKwh)} kWh`,
                    icon: <ResistiveHeatIcon color="#ff4d4f" />
                },
                {
                    label: 'Average COP',
                    value: averageCop.toFixed(2),
                    icon: <ExperimentFilled style={{ color: '#52c41a' }} />
                }
            ]
        }
    ]

    return (
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <Row gutter={[16, 16]}>
                {summaryCards.map((card, index) => (
                    <Col xs={24} md={8} key={index}>
                        <Card
                            style={{ height: '100%' }}
                            bodyStyle={{
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '16px'
                            }}
                        >
                            <Space align="center" size="middle">
                                {card.icon}
                                <Title level={5} style={{ margin: 0 }}>{card.title}</Title>
                            </Space>

                            <Statistic
                                title="Annual Cost"
                                value={Math.round(card.cost)}
                                prefix="$"
                                valueStyle={{ color: '#1890ff' }}
                            />

                            <div style={{ flex: 1 }}>
                                <Text type="secondary" style={{ display: 'block', marginBottom: 8 }}>
                                    Energy Used: {card.consumption}
                                </Text>

                                <Space direction="vertical" size="small">
                                    {card.details.map((detail, i) => (
                                        <Space key={i} size="small" align="center">
                                            {detail.icon}
                                            <Text>
                                                {detail.label}: <Text strong>{detail.value}</Text>
                                            </Text>
                                        </Space>
                                    ))}
                                </Space>
                            </div>
                        </Card>
                    </Col>
                ))}
            </Row>

            <Divider orientation="left">
                <Space>
                    <Title level={5} style={{ margin: 0 }}>Temperature-Based Energy Consumption: {heatpumps[selected].name}</Title>
                    <Tooltip title="Detailed breakdown of heat pump energy consumption and efficiency at different outdoor temperature ranges">
                        <InfoCircleOutlined />
                    </Tooltip>
                </Space>
            </Divider>

            <Table
                columns={[
                    {
                        title: (
                            <Space>
                                Outdoor Temperature
                                <Tooltip title="Temperature ranges and their impact on annual heating">
                                    <InfoCircleOutlined />
                                </Tooltip>
                            </Space>
                        ),
                        key: 'thresholdAndDegree',
                        render: (_, record: DataRow) => {
                            const percent = (record.percentHours * 100).toFixed(1)
                            const heatingDeltaPercent = (record.heatingPercent * 100).toFixed(1)
                            return (
                                <Space direction="vertical" size="small">
                                    <Space>
                                        <Text strong>{`${record.min}°C to ${record.max}°C`}</Text>
                                        <Tooltip title="Percentage of annual hours in this temperature range">
                                            <Text type="secondary">({percent}% of year)</Text>
                                        </Tooltip>
                                    </Space>
                                    <Text type="secondary">
                                        Represents <Text strong>{heatingDeltaPercent}%</Text> of annual heating needs
                                    </Text>
                                </Space>
                            )
                        },
                    },
                    {
                        title: 'Heat Pump Specs',
                        key: 'performance',
                        render: (_, record, index) => (
                            <Space direction="vertical" size="small">
                                <Space direction="horizontal" style={{ whiteSpace: 'nowrap' }}>
                                    <Tooltip title="Maximum Heating Capacity">
                                        <Space size="small">
                                            <RocketFilled style={{ color: '#ff4d4f' }} />
                                            <Text>{Math.round(heatpumps[selected].cap[index]).toLocaleString()} BTU/h</Text>
                                        </Space>
                                    </Tooltip>
                                </Space>
                                <Space direction="horizontal" style={{ whiteSpace: 'nowrap' }}>
                                    <Tooltip title="Rated Coefficient of Performance">
                                        <Space size="small">
                                            <PercentageOutlined style={{ color: '#1890ff' }} />
                                            <Text>Rated COP: <Text strong>{heatpumps[selected].cop[index].toFixed(2)}</Text></Text>
                                        </Space>
                                    </Tooltip>
                                </Space>
                            </Space>
                        ),
                    },
                    {
                        title: 'Energy Usage',
                        key: 'energy',
                        render: (_, record) => (
                            <Space direction="vertical" size="small">
                                <Space direction="horizontal" style={{ whiteSpace: 'nowrap' }}>
                                    <Tooltip title="Heat Pump Energy Consumption">
                                        <Text>
                                            <HeatPumpIcon color="#1890ff" /> {Math.round(record.heatPumpKwhConsumed * magicNumber).toLocaleString()} kWh
                                        </Text>
                                    </Tooltip>
                                    {record.resistiveKwhConsumed > 0 && (
                                        <Tooltip title="Auxiliary Energy Consumption">
                                            <Text>
                                                <ResistiveHeatIcon color="#ff4d4f" /> {Math.round(record.resistiveKwhConsumed * magicNumber).toLocaleString()} kWh
                                            </Text>
                                        </Tooltip>
                                    )}
                                </Space>
                                <Space direction="horizontal" style={{ whiteSpace: 'nowrap' }}>
                                    <Tooltip title="Average efficiency including backup heating, weighted by local temperature distribution">
                                        <Space size="small">
                                            <ExperimentFilled style={{ color: '#52c41a' }} />
                                            <Text>Actual COP: <Text strong>{record.copAverage.toFixed(2)}</Text></Text>
                                        </Space>
                                    </Tooltip>
                                </Space>
                            </Space>
                        ),
                    }
                ]}
                dataSource={rows}
                rowKey={(record, index) => index.toString()}
                pagination={false}
                scroll={{ x: 'max-content' }}
                size="small"
            />
        </Space>
    )
}