import React from 'react'
import { Form, Input, Select, Collapse, InputNumber, Typography, theme, Radio, Space } from 'antd'
import { InfoCircleOutlined } from '@ant-design/icons'
import { FuelType } from '../../hooks'
import { HourlyWeather, InputFormProps, SeasonView } from '../../types'
import styles from './InputForm.module.css'

const { Panel } = Collapse
const { Title } = Typography

export const InputForm: React.FC<InputFormProps> = ({ formState, cities, weather }) => {
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
        fuelUsage, setFuelUsage,
        year, setYear,
        seasonView, setSeasonView
    } = formState

    const getUnits = (fuelType: FuelType) => {
        switch (fuelType) {
            case FuelType.NATURAL_GAS: return "m³"
            case FuelType.OIL:
            case FuelType.PROPANE: return "L"
            case FuelType.ELECTRIC: return "kWh"
        }
    }

    const fuelTypeOptions = [
        { label: 'Natural Gas (m³)', value: 'Natural Gas' },
        { label: 'Oil (L)', value: 'Oil' },
        { label: 'Propane (L)', value: 'Propane' },
        { label: 'Electric (kWh)', value: 'Electric' }
    ]

    interface YearOption {
        value: number
        label: string
        startDate: Date
        endDate: Date
    }

    const getAvailableYears = (weather: HourlyWeather[], view: SeasonView): YearOption[] => {
        if (!weather.length) return []

        const years = new Set(
            weather.map(entry => new Date(entry.datetime).getFullYear())
        )

        return Array.from(years).map(year => ({
            value: year,
            label: view === 'calendar'
                ? year.toString()
                : `${year}-${year + 1} Heating Season`,
            startDate: view === 'calendar'
                ? new Date(`${year}-01-01`)
                : new Date(`${year}-09-01`),
            endDate: view === 'calendar'
                ? new Date(`${year}-12-31`)
                : new Date(`${year + 1}-08-31`)
        })).sort((a, b) => b.value - a.value)
    }

    const availableYears = getAvailableYears(weather, seasonView)

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
                    <Form.Item label="Fuel type">
                        <Select
                            value={fuelType}
                            onChange={value => {
                                setFuelType(value)
                                if (value === 'Electric') {
                                    setCostKwh(costGas)  // Set kWh cost to match the electric rate
                                    setCostGas(costGas)  // Keep them in sync
                                }
                            }}
                            options={fuelTypeOptions}
                        />
                    </Form.Item>

                    <Form.Item
                        label={fuelType === 'Electric' ? 'Cost per kWh' : `Cost of ${fuelType} (per ${getUnits(fuelType)})`}
                        tooltip={{ title: fuelType === 'Electric' ? "Enter your electricity rate" : "Enter the cost per unit of your fuel type", icon: <InfoCircleOutlined /> }}
                    >
                        <InputNumber
                            value={costGas}
                            onChange={(value) => {
                                setCostGas(value || 0)
                                if (fuelType === 'Electric') {
                                    setCostKwh(value || 0)  // Keep electric rates in sync
                                }
                            }}
                            style={{ width: '100%' }}
                        />
                    </Form.Item>

                    <Form.Item label={`Seasonal ${fuelType.toLowerCase()} usage (${getUnits(fuelType)})`}>
                        <InputNumber
                            value={fuelUsage}
                            onChange={(value) => setFuelUsage(value || 0)}
                            style={{ width: '100%' }}
                        />
                    </Form.Item>

                    <Form.Item
                        label="Furnace Efficiency"
                        tooltip="The efficiency of your current heating system"
                        style={{ display: fuelType === 'Electric' ? 'none' : 'block' }}
                    >
                        <InputNumber
                            min={0.5}
                            max={1}
                            step={0.01}
                            style={{ width: '100%' }}
                            disabled={fuelType === 'Electric'}
                            value={furnaceEfficiency}
                            onChange={(value) => setFurnaceEfficiency(value || 0)}
                        />
                    </Form.Item>

                    {fuelType !== 'Electric' && (
                        <Form.Item label="Cost per kWh">
                            <InputNumber
                                value={costKwh}
                                onChange={(value) => setCostKwh(value || 0)}
                                style={{ width: '100%' }}
                            />
                        </Form.Item>
                    )}
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

                    <Form.Item label="Time Period">
                        <Space direction="vertical" style={{ width: '100%' }}>
                            <Radio.Group
                                value={seasonView}
                                onChange={e => setSeasonView(e.target.value)}
                                optionType="button"
                                buttonStyle="solid"
                            >
                                <Radio.Button value="heating">Heating Season</Radio.Button>
                                <Radio.Button value="calendar">Calendar Year</Radio.Button>
                            </Radio.Group>

                            <Select
                                value={year}
                                onChange={value => setYear(value)}
                                options={availableYears}
                                style={{ width: '100%' }}
                            />
                        </Space>
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
