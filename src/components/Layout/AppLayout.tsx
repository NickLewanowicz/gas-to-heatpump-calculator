import React from 'react'
import { Layout, Typography, Card, Space, Button, Descriptions, Select } from 'antd'
import { SettingOutlined } from '@ant-design/icons'
import { Results } from '../Results/Results'
import { useApp } from '../../context/AppContext'

const { Content } = Layout
const { Title, Text } = Typography

export const AppLayout = () => {
    const {
        indoor,
        designTemp,
        designBtu,
        city,
        furnaceEfficiency,
        costGas,
        costKwh,
        fuelType,
        fuelUsage,
        seasonView,
        year,
        heatpumps,
        selected,
        setSelected,
    } = useApp()

    const getUnits = (fuelType: string) => {
        switch (fuelType) {
            case 'Natural Gas': return "m³"
            case 'Oil':
            case 'Propane': return "L"
            case 'Electric': return "kWh"
            default: return ""
        }
    }

    return (
        <Content style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
                <Title level={2}>System Comparison</Title>

                <Card size="small">
                    <Space direction="vertical" style={{ width: '100%' }}>
                        <Space align="center" style={{ width: '100%', justifyContent: 'space-between' }}>
                            <Text strong>Current Settings</Text>
                            <Button
                                type="link"
                                icon={<SettingOutlined />}
                                onClick={() => document.querySelector('.ant-float-btn')?.dispatchEvent(
                                    new MouseEvent('click', { bubbles: true })
                                )}
                            >
                                Adjust Settings
                            </Button>
                        </Space>

                        <Descriptions column={{ xs: 1, sm: 2, md: 3 }} size="small">
                            <Descriptions.Item label="Location">{city}</Descriptions.Item>
                            <Descriptions.Item label="Time Period">
                                {seasonView === 'heating' ? 'Heating Season' : 'Calendar Year'} {year}
                            </Descriptions.Item>
                            <Descriptions.Item label="Indoor Temperature">{indoor}°C</Descriptions.Item>
                            <Descriptions.Item label="Design Temperature">{designTemp}°C</Descriptions.Item>
                            <Descriptions.Item label="Design BTU">{designBtu.toLocaleString()} BTU</Descriptions.Item>
                            <Descriptions.Item label="Current System">
                                {fuelType} ({furnaceEfficiency * 100}% efficient)
                            </Descriptions.Item>
                            <Descriptions.Item label={`${fuelType} Usage`}>
                                {fuelUsage} {getUnits(fuelType)}
                            </Descriptions.Item>
                            <Descriptions.Item label={`${fuelType} Cost`}>
                                ${costGas}/{getUnits(fuelType)}
                            </Descriptions.Item>
                            <Descriptions.Item label="Electricity Cost">
                                ${costKwh}/kWh
                            </Descriptions.Item>
                            <Descriptions.Item
                                label="Heat Pump"
                                labelStyle={{
                                    padding: '8px 0',
                                    display: 'flex',
                                    alignItems: 'center',
                                    height: '100%'
                                }}
                                contentStyle={{
                                    padding: '4px 0',
                                    display: 'flex',
                                    alignItems: 'center'
                                }}
                            >
                                <Select
                                    value={selected}
                                    onChange={setSelected}
                                    style={{ width: 200 }}
                                >
                                    {heatpumps.map((hp, index) => (
                                        <Select.Option key={index} value={index}>
                                            {hp.name}
                                        </Select.Option>
                                    ))}
                                </Select>
                            </Descriptions.Item>
                        </Descriptions>
                    </Space>
                </Card>

                <Results />
            </Space>
        </Content>
    )
}
