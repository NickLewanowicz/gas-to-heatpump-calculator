import React from 'react'
import { Form, InputNumber, Select, Typography } from 'antd'
import { InfoCircleOutlined } from '@ant-design/icons'
import { FuelType, fuelUnits } from '../../types'

const { Text } = Typography

interface ElectrificationBreakevenFormProps {
    fuelType: FuelType
    setFuelType: (value: FuelType) => void
    annualFixedCost: number
    setAnnualFixedCost: (value: number) => void
    consumptionCost: number
    setConsumptionCost: (value: number) => void
    annualConsumption: number
    setAnnualConsumption: (value: number) => void
}

export const ElectrificationBreakevenForm: React.FC<ElectrificationBreakevenFormProps> = ({
    fuelType,
    setFuelType,
    annualFixedCost,
    setAnnualFixedCost,
    consumptionCost,
    setConsumptionCost,
    annualConsumption,
    setAnnualConsumption
}) => {
    const fuelTypeOptions = [
        { label: 'Natural Gas (m³)', value: FuelType.NATURAL_GAS },
        { label: 'Oil (L)', value: FuelType.OIL },
        { label: 'Propane (L)', value: FuelType.PROPANE },
        { label: 'Electric (kWh)', value: FuelType.ELECTRIC }
    ]

    return (
        <Form layout="vertical" size="small">
            <Form.Item label="Current Fuel Type">
                <Select
                    value={fuelType}
                    onChange={setFuelType}
                    options={fuelTypeOptions}
                />
            </Form.Item>

            <Form.Item
                label="Annual Fixed Cost"
                tooltip={{
                    title: "Fixed costs like monthly connection fees or tank rentals",
                    icon: <InfoCircleOutlined />
                }}
            >
                <InputNumber
                    value={annualFixedCost}
                    onChange={value => setAnnualFixedCost(value || 0)}
                    prefix="$"
                    style={{ width: '100%' }}
                />
            </Form.Item>

            <Form.Item
                label={`Cost per ${fuelUnits[fuelType]}`}
                tooltip={{
                    title: "Cost per unit of fuel consumed",
                    icon: <InfoCircleOutlined />
                }}
            >
                <InputNumber
                    value={consumptionCost}
                    onChange={value => setConsumptionCost(value || 0)}
                    prefix="$"
                    style={{ width: '100%' }}
                />
            </Form.Item>

            <Form.Item
                label={`Annual Consumption (${fuelUnits[fuelType]})`}
                tooltip={{
                    title: "Total amount of fuel consumed per year",
                    icon: <InfoCircleOutlined />
                }}
            >
                <InputNumber
                    value={annualConsumption}
                    onChange={value => setAnnualConsumption(value || 0)}
                    style={{ width: '100%' }}
                />
            </Form.Item>
        </Form>
    )
} 