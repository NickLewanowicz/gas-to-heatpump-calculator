import React from 'react'
import { Form, Input, Select, Collapse, InputNumber, Typography, theme } from 'antd'
import { InfoCircleOutlined } from '@ant-design/icons'
import { FuelType } from '../../hooks'
import { InputFormProps } from '../../types'
import styles from './InputForm.module.css'

const { Panel } = Collapse
const { Title } = Typography

export const InputForm: React.FC<InputFormProps> = ({ formState, cities }) => {
    const { token } = theme.useToken()

    const {
        indoor, setIndoor,
        designTemp, setDesignTemp,
        designBtu, setDesignBtu,
        city, setCity,
        furnaceEfficiency, setFurnaceEfficiency,
        costGas, setCostGas,
        costKwh, setCostKwh,
        fuelType, setFuelType,
        fuelUsage, setFuelUsage
    } = formState

    const getUnits = (fuelType: FuelType) => {
        switch (fuelType) {
            case FuelType.NATURAL_GAS: return "m³"
            case FuelType.OIL:
            case FuelType.PROPANE: return "L"
        }
    }

    return (
        <Collapse defaultActiveKey={['1', '2']} ghost className={styles.collapse}>
            <Panel
                header={
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <Title level={5} style={{
                            margin: 0,
                            color: token.colorTextHeading,
                            fontWeight: 500
                        }}>
                            Heating consumption/cost
                        </Title>
                    </div>
                }
                key="1"
            >
                <Form layout="vertical" size="small">
                    <Form.Item
                        label={`Cost of ${fuelType} (per ${getUnits(fuelType)})`}
                        tooltip={{ title: "Enter the cost per unit of your fuel type", icon: <InfoCircleOutlined /> }}
                    >
                        <InputNumber
                            value={costGas}
                            onChange={(value) => setCostGas(value || 0)}
                            style={{ width: '100%' }}
                        />
                    </Form.Item>

                    <Form.Item label="Fuel type">
                        <Select
                            value={fuelType}
                            onChange={value => setFuelType(value)}
                            options={[
                                { value: FuelType.NATURAL_GAS, label: 'Natural Gas' },
                                { value: FuelType.OIL, label: 'Oil' },
                                { value: FuelType.PROPANE, label: 'Propane' }
                            ]}
                        />
                    </Form.Item>

                    <Form.Item label="Seasonal fuel usage">
                        <InputNumber
                            value={fuelUsage}
                            onChange={(value) => setFuelUsage(value || 0)}
                            style={{ width: '100%' }}
                        />
                    </Form.Item>

                    <Form.Item label="Furnace efficiency">
                        <InputNumber
                            value={furnaceEfficiency}
                            onChange={(value) => setFurnaceEfficiency(value || 0)}
                            style={{ width: '100%' }}
                        />
                    </Form.Item>

                    <Form.Item label="Cost per kWh">
                        <InputNumber
                            value={costKwh}
                            onChange={(value) => setCostKwh(value || 0)}
                            style={{ width: '100%' }}
                        />
                    </Form.Item>
                </Form>
            </Panel>

            <Panel
                header={
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <Title level={5} style={{
                            margin: 0,
                            color: token.colorTextHeading,
                            fontWeight: 500
                        }}>
                            Heating Design Load
                        </Title>
                    </div>
                }
                key="2"
            >
                <Form layout="vertical" size="small">
                    <Form.Item label="Choose a city">
                        <Select
                            value={city}
                            onChange={value => setCity(value)}
                            options={cities.map(city => ({ value: city, label: city }))}
                        />
                    </Form.Item>

                    <Form.Item label="Design BTU">
                        <InputNumber
                            value={designBtu}
                            onChange={(value) => setDesignBtu(value || 0)}
                            style={{ width: '100%' }}
                        />
                    </Form.Item>

                    <Form.Item label="Design temp">
                        <InputNumber
                            value={designTemp}
                            onChange={(value) => setDesignTemp(value || 0)}
                            style={{ width: '100%' }}
                        />
                    </Form.Item>

                    <Form.Item label="Indoor temp">
                        <InputNumber
                            value={indoor}
                            onChange={(value) => setIndoor(value || 0)}
                            style={{ width: '100%' }}
                        />
                    </Form.Item>
                </Form>
            </Panel>
        </Collapse>
    )
}
