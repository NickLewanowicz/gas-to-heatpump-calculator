import React from 'react'
import { Typography, Card, Space, Button, Descriptions, Form, InputNumber, Radio, TimePicker } from 'antd'
import { SettingOutlined } from '@ant-design/icons'
import { useWeatherData } from '../../hooks/useWeatherData/hook'
import { HeatingDegreeChart } from './HeatingDegreeChart'
import { useApp } from '../../context/AppContext'

const { Text } = Typography

export const MarginalHeating = () => {
    const {
        city,
        year,
        seasonView,
        baseTemp,
        setBaseTemp,
        reducedTemp,
        setReducedTemp,
        setbackType,
        setSetbackType,
        startTime,
        setStartTime,
        endTime,
        setEndTime
    } = useApp()

    // Get weather data and available years
    const { weather, filteredWeather } = useWeatherData(city, seasonView, year)

    return (
        <div style={{ padding: '24px' }}>
            <div style={{ maxWidth: 1200, margin: '0 auto' }}>
                <Space direction="vertical" size="large" style={{ width: '100%' }}>
                    <Card size="small">
                        <Space direction="vertical" style={{ width: '100%' }}>
                            <Space align="center" style={{ width: '100%', justifyContent: 'space-between' }}>
                                <Text strong>Location and Time Period</Text>
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

                            <Descriptions column={{ xs: 1, sm: 2 }} size="small">
                                <Descriptions.Item label="Location">{city}</Descriptions.Item>
                                <Descriptions.Item label="Time Period">
                                    {seasonView === 'heating' ? 'Heating Season' : 'Calendar Year'} {year}
                                </Descriptions.Item>
                            </Descriptions>
                        </Space>
                    </Card>

                    <Card title="Temperature Settings">
                        <Form layout="vertical">
                            <Form.Item label="Base Temperature (°C)">
                                <InputNumber
                                    value={baseTemp}
                                    onChange={value => setBaseTemp(value || 21)}
                                    min={0}
                                    max={30}
                                />
                            </Form.Item>

                            <Form.Item label="Reduced Temperature (°C)">
                                <InputNumber
                                    value={reducedTemp}
                                    onChange={value => setReducedTemp(value || 19)}
                                    min={0}
                                    max={30}
                                />
                            </Form.Item>

                            <Form.Item label="Setback Type">
                                <Radio.Group
                                    value={setbackType}
                                    onChange={e => setSetbackType(e.target.value)}
                                >
                                    <Radio.Button value="24/7">24/7</Radio.Button>
                                    <Radio.Button value="overnight">Overnight</Radio.Button>
                                </Radio.Group>
                            </Form.Item>

                            {setbackType === 'overnight' && (
                                <Form.Item label="Setback Hours">
                                    <TimePicker.RangePicker
                                        format="HH:mm"
                                        value={[startTime, endTime]}
                                        onChange={([start, end]) => {
                                            setStartTime(start)
                                            setEndTime(end)
                                        }}
                                    />
                                </Form.Item>
                            )}
                        </Form>
                    </Card>

                    <Card title="Monthly Heating Degree Hours">
                        <HeatingDegreeChart
                            weather={filteredWeather}
                            baseTemp={baseTemp}
                            reducedTemp={reducedTemp}
                            setbackType={setbackType}
                            startTime={startTime}
                            endTime={endTime}
                            seasonView={seasonView}
                            selectedYear={year}
                        />
                    </Card>
                </Space>
            </div>
        </div>
    )
} 