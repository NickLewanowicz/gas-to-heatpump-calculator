import React, { useState } from 'react'
import { Card, Space, InputNumber, Button, Typography, Tooltip } from 'antd'
import { SettingOutlined, InfoCircleOutlined } from '@ant-design/icons'
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
    const [customerCharge, setCustomerCharge] = useState<number>(25)
    const [spaceHeatingEnabled, setSpaceHeatingEnabled] = useState<boolean>(true)
    const [hotWaterUsage, setHotWaterUsage] = useState<ApplianceUsage>({ enabled: false, value: 2 })
    const [waterHeaterEfficiency, setWaterHeaterEfficiency] = useState<number>(0.60)
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

        const totalElectricKwh = breakdown.reduce((sum, item) => sum + item.electricKwh, 0)

        return {
            breakdown,
            totalKwh,
            totalElectricKwh
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
                    <div className={styles.contextBar}>
                        <div className={styles.contextInfo}>
                            <Space>
                                <Text type="secondary">Location:</Text>
                                <Text strong>{city}</Text>
                            </Space>
                            <Space>
                                <Text type="secondary">Time Period:</Text>
                                <Text strong>{seasonView === 'heating' ? 'Heating Season' : 'Calendar Year'} {year}</Text>
                            </Space>
                        </div>
                        <Button
                            type="text"
                            icon={<SettingOutlined />}
                            onClick={() => document.querySelector('.ant-float-btn')?.dispatchEvent(
                                new MouseEvent('click', { bubbles: true })
                            )}
                        >
                            Settings
                        </Button>
                    </div>

                    <div className={styles.gridLayout}>
                        {/* Left Column - Inputs */}
                        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                            {/* Customer Charge */}
                            <Card size="small" title="Monthly Customer Charge">
                                <Space direction="vertical" size="small" style={{ width: '100%' }}>
                                    <InputNumber
                                        value={customerCharge}
                                        onChange={value => setCustomerCharge(value || 25)}
                                        min={0}
                                        step={1}
                                        precision={2}
                                        addonBefore="$"
                                        addonAfter="/month"
                                        style={{ width: '100%' }}
                                    />
                                    <Text type="secondary">Annual Cost: ${(customerCharge * 12).toFixed(2)}</Text>
                                </Space>
                            </Card>

                            {/* Energy Cost Comparison */}
                            <Card size="small" title="Energy Cost Comparison">
                                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                                    <div style={{ padding: '12px', background: '#f0f0f0', borderRadius: '6px' }}>
                                        <Space direction="vertical" style={{ width: '100%' }}>
                                            <Space>
                                                <Text>{fuelType} Cost</Text>
                                                <Tooltip title={getConversionExplanation(fuelType)}>
                                                    <InfoCircleOutlined style={{ color: '#8c8c8c' }} />
                                                </Tooltip>
                                            </Space>
                                            <Text strong style={{ fontSize: '20px' }}>${fuelPerKwh.toFixed(4)}/kWh</Text>
                                            <Text type="secondary">${consumptionCost}/{fuelUnit}</Text>
                                        </Space>
                                    </div>

                                    <div style={{ padding: '12px', background: '#f0f0f0', borderRadius: '6px' }}>
                                        <Space direction="vertical" style={{ width: '100%' }}>
                                            <Text>Electricity Cost</Text>
                                            <Text strong style={{ fontSize: '20px' }}>${electricityRate}/kWh</Text>
                                        </Space>
                                    </div>
                                </Space>
                            </Card>
                        </Space>

                        {/* Right Column - Usage and Results */}
                        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                            {/* Usage Breakdown */}
                            <Card size="small" title="Usage Breakdown">
                                <Space direction="vertical" size="small" style={{ width: '100%' }}>
                                    {/* Space Heating */}
                                    <ApplianceCard
                                        title="Space Heating"
                                        enabled={spaceHeatingEnabled}
                                        onToggle={setSpaceHeatingEnabled}
                                        tooltip="Include this if you use gas for space heating"
                                        gasSystem={{
                                            value: annualConsumption,
                                            efficiency: furnaceEfficiency,
                                            onValueChange: () => { },
                                            onEfficiencyChange: () => { },
                                            unit: fuelUnit,
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
                                            gasInput: `Gas Input: ${annualConsumption.toLocaleString()} ${fuelUnit}/year`,
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
                                        gasSystem={{
                                            value: hotWaterUsage.value,
                                            efficiency: waterHeaterEfficiency,
                                            onValueChange: value => setHotWaterUsage(prev => ({ ...prev, value: value || 1 })),
                                            onEfficiencyChange: setWaterHeaterEfficiency,
                                            unit: "people"
                                        }}
                                        electricSystem={{
                                            value: electricWaterHeaterEfficiency,
                                            efficiency: electricWaterHeaterEfficiency,
                                            onValueChange: setElectricWaterHeaterEfficiency,
                                            valueLabel: "Electric Water Heater",
                                            tooltip: "Standard electric tanks are ~95% efficient. Heat pump water heaters can achieve 300% efficiency"
                                        }}
                                        stats={{
                                            gasInput: `Gas Input: ${(getHotWaterKwh(hotWaterUsage.value) / fuelToKwh).toFixed(0)} ${fuelUnit}/year`,
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
                                        gasSystem={{
                                            value: stoveUsage.value,
                                            efficiency: stoveEfficiency,
                                            onValueChange: value => setStoveUsage(prev => ({ ...prev, value: value || 1 })),
                                            onEfficiencyChange: setStoveEfficiency,
                                            unit: "days/week"
                                        }}
                                        electricSystem={{
                                            value: electricStoveEfficiency,
                                            efficiency: electricStoveEfficiency,
                                            onValueChange: setElectricStoveEfficiency,
                                            valueLabel: "Electric Stove Alternative",
                                            tooltip: "Modern electric stoves are typically 80% efficient"
                                        }}
                                        stats={{
                                            gasInput: `Gas Input: ${(getStoveKwh(stoveUsage.value) / fuelToKwh).toFixed(0)} ${fuelUnit}/year`,
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
                    </div>
                </Space>
            </div>
        </div>
    )
} 