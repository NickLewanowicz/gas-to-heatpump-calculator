import React from 'react'
import { Space, Typography, Divider } from 'antd'
import { FireOutlined, ThunderboltOutlined } from '@ant-design/icons'

const { Text } = Typography

interface ApplianceBreakdown {
    name: string
    kwh: number
    electricKwh: number
}

interface UsageSummaryProps {
    breakdown: ApplianceBreakdown[]
    gasSystem: {
        fuelConsumption: number
        fuelUnit: string
        energyOutput: number
        annualCost: number
        fixedCost: number
    }
    electricSystem: {
        consumption: number
        energyOutput: number
        annualCost: number
    }
}

const systemPanelStyle = {
    padding: '12px',
    background: 'white',
    borderRadius: '6px',
    border: '1px solid #f0f0f0',
    marginTop: '8px'
}

export const UsageSummary: React.FC<UsageSummaryProps> = ({
    breakdown,
    gasSystem,
    electricSystem
}) => {
    return (
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            {/* Individual Appliance Breakdown */}
            {breakdown.map(item => (
                <div key={item.name} style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text strong>{item.name}</Text>
                    <Space direction="vertical" align="end">
                        <Text>{item.kwh.toFixed(0)} kWh output</Text>
                        <Text type="secondary">Electric: {item.electricKwh.toFixed(0)} kWh</Text>
                    </Space>
                </div>
            ))}

            <Divider style={{ margin: '8px 0' }} />

            {/* Fossil Fuel Summary */}
            <div style={systemPanelStyle}>
                <Space direction="vertical" size="small" style={{ width: '100%' }}>
                    <Space size="small">
                        <FireOutlined style={{ color: '#cf1322' }} />
                        <Text strong>Current Fossil Fuel System</Text>
                    </Space>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Text type="secondary">Fuel Consumption:</Text>
                        <Text>{gasSystem.fuelConsumption.toFixed(0)} {gasSystem.fuelUnit}/year</Text>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Text type="secondary">Energy Output:</Text>
                        <Text>{gasSystem.energyOutput.toFixed(0)} kWh/year</Text>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Text type="secondary">Annual Fuel Cost:</Text>
                        <Text>${gasSystem.annualCost.toFixed(2)}</Text>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Text type="secondary">Annual Fixed Cost:</Text>
                        <Text>${gasSystem.fixedCost.toFixed(2)}</Text>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Text type="secondary">Total Annual Cost:</Text>
                        <Text>${(gasSystem.annualCost + gasSystem.fixedCost).toFixed(2)}</Text>
                    </div>
                </Space>
            </div>

            {/* Electric Summary */}
            <div style={systemPanelStyle}>
                <Space direction="vertical" size="small" style={{ width: '100%' }}>
                    <Space size="small">
                        <ThunderboltOutlined style={{ color: '#1890ff' }} />
                        <Text strong>Electric Alternative</Text>
                    </Space>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Text type="secondary">Electricity Consumption:</Text>
                        <Text>{electricSystem.consumption.toFixed(0)} kWh/year</Text>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Text type="secondary">Energy Output:</Text>
                        <Text>{electricSystem.energyOutput.toFixed(0)} kWh/year</Text>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Text type="secondary">Annual Electricity Cost:</Text>
                        <Text>${electricSystem.annualCost.toFixed(2)}</Text>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Text type="secondary">Annual Fixed Cost:</Text>
                        <Text>$0.00</Text>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Text type="secondary">Total Annual Cost:</Text>
                        <Text>${electricSystem.annualCost.toFixed(2)}</Text>
                    </div>
                </Space>
            </div>
        </Space>
    )
} 