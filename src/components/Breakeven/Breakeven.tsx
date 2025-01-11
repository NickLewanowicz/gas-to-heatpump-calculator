import React, { useState } from 'react'
import { Card, Space, InputNumber, Button, Typography, Tooltip, Descriptions } from 'antd'
import { SettingOutlined, InfoCircleOutlined, FireOutlined, ThunderboltOutlined } from '@ant-design/icons'
import { useApp } from '../../context/AppContext'
import { getConversionFactor, getFuelUnit, getConversionExplanation } from '../../constants/fuel'
import { getHotWaterKwh, getStoveKwh } from '../../utils/calculations'
import { ApplianceCard } from './ApplianceCard'
import { UsageSummary } from './UsageSummary'
import { CostAnalysis } from './CostAnalysis'
import styles from './Breakeven.module.css'

const { Text } = Typography

interface ApplianceUsage {
    enabled: boolean
    value: number
}

export const Breakeven = () => {
    // Local state for fixed costs and appliance usage
    const [spaceHeatingEnabled, setSpaceHeatingEnabled] = useState<boolean>(true)
    const [hotWaterUsage, setHotWaterUsage] = useState<ApplianceUsage>({ enabled: false, value: 2 })
    const [waterHeaterEfficiency, setWaterHeaterEfficiency] = useState<number>(0.80)
    const [stoveUsage, setStoveUsage] = useState<ApplianceUsage>({ enabled: false, value: 3 })
    const [stoveEfficiency, setStoveEfficiency] = useState<number>(0.40)

    // New state for electrified options
    const [heatPumpCOP, setHeatPumpCOP] = useState<number>(2.5)
    const [electricWaterHeaterEfficiency, setElectricWaterHeaterEfficiency] = useState<number>(0.95)
    const [electricStoveEfficiency, setElectricStoveEfficiency] = useState<number>(0.80)

    // Get values from context
    const {
        city,
        year,
        seasonView,
        fuelType,
        costGas: consumptionCost,
        costKwh: electricityRate,
        fuelUsage: annualConsumption,
        furnaceEfficiency,
        customerCharge,
    } = useApp()

    const fuelToKwh = getConversionFactor(fuelType)
    const fuelUnit = getFuelUnit(fuelType)

    // Calculate normalized costs
    const fuelPerKwh = consumptionCost / fuelToKwh

    // Calculate usage breakdown
    const getUsageBreakdown = () => {
        let totalKwh = 0
        const breakdown = []

        // Space heating from settings
        if (spaceHeatingEnabled) {
            const furnaceInputKwh = annualConsumption * fuelToKwh
            const furnaceOutputKwh = furnaceInputKwh * furnaceEfficiency
            const heatPumpInputKwh = furnaceOutputKwh / heatPumpCOP
            totalKwh += furnaceOutputKwh
            breakdown.push({
                name: 'Space Heating',
                kwh: furnaceOutputKwh,
                units: annualConsumption,
                electricKwh: heatPumpInputKwh,
                details: `${(furnaceEfficiency * 100).toFixed(0)}% efficient`,
                electricDetails: `COP ${heatPumpCOP.toFixed(1)}`
            })
        }

        if (hotWaterUsage.enabled) {
            const waterInputKwh = getHotWaterKwh(hotWaterUsage.value)
            const waterOutputKwh = waterInputKwh * waterHeaterEfficiency
            const electricWaterInputKwh = waterOutputKwh / electricWaterHeaterEfficiency
            totalKwh += waterOutputKwh
            breakdown.push({
                name: 'Hot Water',
                kwh: waterOutputKwh,
                units: hotWaterUsage.value,
                electricKwh: electricWaterInputKwh,
                details: `${(waterHeaterEfficiency * 100).toFixed(0)}% efficient`,
                electricDetails: `${(electricWaterHeaterEfficiency * 100).toFixed(0)}% efficient`
            })
        }

        if (stoveUsage.enabled) {
            const stoveInputKwh = getStoveKwh(stoveUsage.value)
            const stoveOutputKwh = stoveInputKwh * stoveEfficiency
            const electricStoveInputKwh = stoveOutputKwh / electricStoveEfficiency
            totalKwh += stoveOutputKwh
            breakdown.push({
                name: 'Cooking',
                kwh: stoveOutputKwh,
                units: stoveUsage.value,
                electricKwh: electricStoveInputKwh,
                details: `${(stoveEfficiency * 100).toFixed(0)}% efficient`,
                electricDetails: `${(electricStoveEfficiency * 100).toFixed(0)}% efficient`
            })
        }

        return {
            breakdown,
            totalKwh,
            totalElectricKwh: breakdown.reduce((sum, item) => sum + item.electricKwh, 0)
        }
    }

    const usageBreakdown = getUsageBreakdown()

    // Calculate costs
    const gasCost = (usageBreakdown.totalKwh / fuelToKwh / furnaceEfficiency) * consumptionCost
    const electricCost = usageBreakdown.totalElectricKwh * electricityRate
    const fixedCost = customerCharge * 12
    const totalSavings = fixedCost - (electricCost - gasCost)

    return (
        <div className={styles.container}>
            <div className={styles.content}>
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                    {/* Context Bar */}
                    <Card size="small">
                        <Space direction="vertical" style={{ width: '100%' }}>
                            <Space align="center" style={{ width: '100%', justifyContent: 'space-between' }}>
                                <Text strong>Current Settings</Text>
                                <Button
                                    type="text"
                                    icon={<SettingOutlined />}
                                    onClick={() => document.querySelector('.ant-float-btn')?.dispatchEvent(
                                        new MouseEvent('click', { bubbles: true })
                                    )}
                                >
                                    Settings
                                </Button>
                            </Space>

                            <Descriptions column={{ xs: 1, sm: 2, md: 3 }} size="small">
                                <Descriptions.Item label="Location">{city}</Descriptions.Item>
                                <Descriptions.Item label="Time Period">
                                    {seasonView === 'heating' ? 'Heating Season' : 'Calendar Year'} {year}
                                </Descriptions.Item>
                                <Descriptions.Item label="Current System">
                                    {fuelType} ({(furnaceEfficiency * 100).toFixed(0)}% efficient)
                                </Descriptions.Item>
                                <Descriptions.Item label={`${fuelType} Usage`}>
                                    {annualConsumption} {fuelUnit}
                                </Descriptions.Item>
                                <Descriptions.Item label={`${fuelType} Cost`}>
                                    ${consumptionCost}/{fuelUnit}
                                </Descriptions.Item>
                                <Descriptions.Item label="Electricity Cost">
                                    ${electricityRate}/kWh
                                </Descriptions.Item>
                                <Descriptions.Item label="Monthly Fixed Cost">
                                    ${customerCharge}/month
                                </Descriptions.Item>
                            </Descriptions>
                        </Space>
                    </Card>

                    {/* Cards */}
                    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                        {/* Energy Cost Comparison */}
                        <Card size="small" title="Energy Cost Comparison">
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                                <div style={{ flex: '1 1 300px', minWidth: '300px', padding: '12px', background: '#f0f0f0', borderRadius: '6px' }}>
                                    <Space direction="vertical" style={{ width: '100%' }}>
                                        <Space>
                                            <FireOutlined style={{ color: '#cf1322' }} />
                                            <Text>{fuelType} Cost</Text>
                                            <Tooltip title={getConversionExplanation(fuelType)}>
                                                <InfoCircleOutlined style={{ color: '#8c8c8c' }} />
                                            </Tooltip>
                                        </Space>
                                        <Text strong style={{ fontSize: '20px' }}>${fuelPerKwh.toFixed(4)}/kWh</Text>
                                        <Text type="secondary">${consumptionCost}/{fuelUnit}</Text>
                                    </Space>
                                </div>

                                <div style={{ flex: '1 1 300px', minWidth: '300px', padding: '12px', background: '#f0f0f0', borderRadius: '6px' }}>
                                    <Space direction="vertical" style={{ width: '100%' }}>
                                        <Space>
                                            <ThunderboltOutlined style={{ color: '#1890ff' }} />
                                            <Text>Electricity Cost</Text>
                                        </Space>
                                        <Text strong style={{ fontSize: '20px' }}>${electricityRate}/kWh</Text>
                                    </Space>
                                </div>

                                <div style={{ flex: '1 1 300px', minWidth: '300px', padding: '12px', background: '#f0f0f0', borderRadius: '6px' }}>
                                    <Space direction="vertical" style={{ width: '100%' }}>
                                        <Space>
                                            <Text>Cost Difference</Text>
                                            <Tooltip title="Difference in cost per kWh of useful energy, accounting for system efficiencies">
                                                <InfoCircleOutlined style={{ color: '#8c8c8c' }} />
                                            </Tooltip>
                                        </Space>
                                        <Text strong style={{ fontSize: '20px', color: electricityRate > fuelPerKwh ? '#ff4d4f' : '#52c41a' }}>
                                            {electricityRate > fuelPerKwh ? '+' : '-'}${Math.abs(electricityRate - fuelPerKwh).toFixed(4)}/kWh
                                        </Text>
                                        <Text type="secondary">
                                            Electricity is {electricityRate > fuelPerKwh ? 'more' : 'less'} expensive per kWh
                                        </Text>
                                    </Space>
                                </div>
                            </div>
                        </Card>

                        {/* Usage Breakdown */}
                        <Card size="small" title="Usage Breakdown">
                            <Space direction="vertical" size="small" style={{ width: '100%' }}>
                                {/* Space Heating */}
                                <ApplianceCard
                                    title="Space Heating"
                                    enabled={spaceHeatingEnabled}
                                    onToggle={setSpaceHeatingEnabled}
                                    tooltip="Include this if you use gas for space heating"
                                    fuelType={fuelType}
                                    usage={{
                                        value: annualConsumption,
                                        onChange: () => { },
                                        unit: fuelUnit,
                                        inputConfig: { type: 'readonly' }
                                    }}
                                    gasSystem={{
                                        efficiency: furnaceEfficiency,
                                        onEfficiencyChange: () => { },
                                        showSettings: true
                                    }}
                                    electricSystem={{
                                        value: heatPumpCOP,
                                        efficiency: heatPumpCOP,
                                        onValueChange: setHeatPumpCOP,
                                        valueLabel: "Electric Heat Pump Alternative",
                                        tooltip: "Coefficient of Performance (COP) represents how many units of heat the heat pump produces for each unit of electricity consumed"
                                    }}
                                    stats={{
                                        gasInput: `${fuelType} Input: ${annualConsumption.toLocaleString()} ${fuelUnit}/year`,
                                        heatOutput: `Heat Output: ${(annualConsumption * fuelToKwh * furnaceEfficiency).toFixed(0)} kWh`,
                                        electricInput: `Electric Input Required: ${((annualConsumption * fuelToKwh * furnaceEfficiency) / heatPumpCOP).toFixed(0)} kWh`
                                    }}
                                />

                                {/* Hot Water */}
                                <ApplianceCard
                                    title="Hot Water"
                                    enabled={hotWaterUsage.enabled}
                                    onToggle={checked => setHotWaterUsage(prev => ({ ...prev, enabled: checked }))}
                                    tooltip="Include this if you use gas for water heating"
                                    fuelType={fuelType}
                                    usage={{
                                        value: hotWaterUsage.value,
                                        onChange: value => setHotWaterUsage(prev => ({ ...prev, value: value || 1 })),
                                        unit: "people",
                                        inputConfig: {
                                            type: 'select',
                                            options: Array.from({ length: 8 }, (_, i) => ({
                                                value: i + 1,
                                                label: `${i + 1} ${i === 0 ? 'person' : 'people'}`
                                            })),
                                            tooltip: "Hot water usage is based on Canadian average consumption of 109,500L/year for a family of 4, scaled proportionally by household size"
                                        }
                                    }}
                                    gasSystem={{
                                        efficiency: waterHeaterEfficiency,
                                        onEfficiencyChange: setWaterHeaterEfficiency
                                    }}
                                    electricSystem={{
                                        value: electricWaterHeaterEfficiency,
                                        efficiency: electricWaterHeaterEfficiency,
                                        onValueChange: setElectricWaterHeaterEfficiency,
                                        valueLabel: "Electric Water Heater",
                                        tooltip: "Standard electric tanks are ~95% efficient. Heat pump water heaters can achieve 300% efficiency"
                                    }}
                                    stats={{
                                        gasInput: `${fuelType} Input: ${(getHotWaterKwh(hotWaterUsage.value) / fuelToKwh).toFixed(0)} ${fuelUnit}/year`,
                                        heatOutput: `Heat Output: ${(getHotWaterKwh(hotWaterUsage.value) * waterHeaterEfficiency).toFixed(0)} kWh`,
                                        electricInput: `Electric Input Required: ${((getHotWaterKwh(hotWaterUsage.value) * waterHeaterEfficiency) / electricWaterHeaterEfficiency).toFixed(0)} kWh`
                                    }}
                                />

                                {/* Cooking */}
                                <ApplianceCard
                                    title="Cooking"
                                    enabled={stoveUsage.enabled}
                                    onToggle={checked => setStoveUsage(prev => ({ ...prev, enabled: checked }))}
                                    tooltip="Include this if you use gas for cooking"
                                    fuelType={fuelType}
                                    usage={{
                                        value: stoveUsage.value,
                                        onChange: value => setStoveUsage(prev => ({ ...prev, value: value || 1 })),
                                        unit: "days/week",
                                        inputConfig: {
                                            type: 'number',
                                            min: 1,
                                            max: 7,
                                            tooltip: "Enter the number of days per week you typically cook using your gas stove"
                                        }
                                    }}
                                    gasSystem={{
                                        efficiency: stoveEfficiency,
                                        onEfficiencyChange: setStoveEfficiency
                                    }}
                                    electricSystem={{
                                        value: electricStoveEfficiency,
                                        efficiency: electricStoveEfficiency,
                                        onValueChange: setElectricStoveEfficiency,
                                        valueLabel: "Electric Stove Alternative",
                                        tooltip: "Modern electric stoves are typically 80% efficient"
                                    }}
                                    stats={{
                                        gasInput: `${fuelType} Input: ${(getStoveKwh(stoveUsage.value) / fuelToKwh).toFixed(0)} ${fuelUnit}/year`,
                                        heatOutput: `Heat Output: ${(getStoveKwh(stoveUsage.value) * stoveEfficiency).toFixed(0)} kWh`,
                                        electricInput: `Electric Input Required: ${((getStoveKwh(stoveUsage.value) * stoveEfficiency) / electricStoveEfficiency).toFixed(0)} kWh`
                                    }}
                                />

                                {/* Usage Summary */}
                                <UsageSummary
                                    breakdown={usageBreakdown.breakdown}
                                    gasSystem={{
                                        fuelConsumption: usageBreakdown.totalKwh / fuelToKwh / furnaceEfficiency,
                                        fuelUnit,
                                        energyOutput: usageBreakdown.totalKwh,
                                        annualCost: gasCost,
                                        fixedCost
                                    }}
                                    electricSystem={{
                                        consumption: usageBreakdown.totalElectricKwh,
                                        energyOutput: usageBreakdown.totalKwh,
                                        annualCost: electricCost
                                    }}
                                />
                            </Space>
                        </Card>

                        {/* Cost Analysis */}
                        <Card size="small" title="Cost Analysis">
                            <CostAnalysis
                                gasCost={gasCost}
                                electricCost={electricCost}
                                fixedCost={fixedCost}
                                totalSavings={totalSavings}
                            />
                        </Card>
                    </Space>
                </Space>
            </div>
        </div>
    )
} 