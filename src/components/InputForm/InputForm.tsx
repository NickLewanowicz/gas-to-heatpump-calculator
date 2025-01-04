import React from 'react'
import { Form, InputNumber, Select, Radio, Space, Card } from 'antd'
import { useApp } from '../../context/AppContext'
import { FuelType } from '../../types'
import { cities } from '../../data/weather'

export const InputForm = () => {
    const {
        indoor,
        setIndoor,
        designTemp,
        setDesignTemp,
        designBtu,
        setDesignBtu,
        city,
        setCity,
        furnaceEfficiency,
        setFurnaceEfficiency,
        costGas,
        setCostGas,
        costKwh,
        setCostKwh,
        fuelType,
        setFuelType,
        fuelUsage,
        setFuelUsage,
        seasonView,
        setSeasonView,
        year,
        setYear,
    } = useApp()

    return (
        <Card title="House Settings">
            <Form layout="vertical">
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                    <Form.Item label="Indoor Temperature (°C)">
                        <InputNumber
                            value={indoor}
                            onChange={(value) => setIndoor(value || 0)}
                            style={{ width: '100%' }}
                        />
                    </Form.Item>

                    <Form.Item label="Design Temperature (°C)">
                        <InputNumber
                            value={designTemp}
                            onChange={(value) => setDesignTemp(value || 0)}
                            style={{ width: '100%' }}
                        />
                    </Form.Item>

                    <Form.Item label="Design BTU">
                        <InputNumber
                            value={designBtu}
                            onChange={(value) => setDesignBtu(value || 0)}
                            style={{ width: '100%' }}
                        />
                    </Form.Item>

                    <Form.Item label="City">
                        <Select
                            value={city}
                            onChange={setCity}
                            style={{ width: '100%' }}
                        >
                            {cities.map((city) => (
                                <Select.Option key={city} value={city}>
                                    {city}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item label="Fuel Type">
                        <Radio.Group
                            value={fuelType}
                            onChange={(e) => setFuelType(e.target.value)}
                            style={{ width: '100%' }}
                        >
                            <Space direction="vertical">
                                <Radio value={FuelType.NATURAL_GAS}>Natural Gas</Radio>
                                <Radio value={FuelType.OIL}>Oil</Radio>
                                <Radio value={FuelType.PROPANE}>Propane</Radio>
                                <Radio value={FuelType.ELECTRIC}>Electric</Radio>
                            </Space>
                        </Radio.Group>
                    </Form.Item>

                    <Form.Item label="Furnace Efficiency">
                        <InputNumber
                            value={furnaceEfficiency}
                            onChange={(value) => setFurnaceEfficiency(value || 0)}
                            style={{ width: '100%' }}
                            min={0}
                            max={1}
                            step={0.01}
                        />
                    </Form.Item>

                    <Form.Item label="Cost per m³ of Gas">
                        <InputNumber
                            value={costGas}
                            onChange={(value) => setCostGas(value || 0)}
                            style={{ width: '100%' }}
                            prefix="$"
                        />
                    </Form.Item>

                    <Form.Item label="Cost per kWh">
                        <InputNumber
                            value={costKwh}
                            onChange={(value) => setCostKwh(value || 0)}
                            style={{ width: '100%' }}
                            prefix="$"
                        />
                    </Form.Item>

                    <Form.Item label="Fuel Usage">
                        <InputNumber
                            value={fuelUsage}
                            onChange={(value) => setFuelUsage(value || 0)}
                            style={{ width: '100%' }}
                        />
                    </Form.Item>

                    <Form.Item label="View">
                        <Radio.Group
                            value={seasonView}
                            onChange={(e) => setSeasonView(e.target.value)}
                            style={{ width: '100%' }}
                        >
                            <Radio value="heating">Heating Season</Radio>
                            <Radio value="calendar">Calendar Year</Radio>
                        </Radio.Group>
                    </Form.Item>

                    <Form.Item label="Year">
                        <InputNumber
                            value={year}
                            onChange={(value) => setYear(value || 0)}
                            style={{ width: '100%' }}
                        />
                    </Form.Item>
                </Space>
            </Form>
        </Card>
    )
}
