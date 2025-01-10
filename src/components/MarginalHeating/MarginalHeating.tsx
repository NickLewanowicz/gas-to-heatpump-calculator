import React from 'react'
import { Typography, Card, Space, Button, Descriptions, Form, InputNumber, Radio, TimePicker } from 'antd'
import { SettingOutlined } from '@ant-design/icons'
import { HeatingDegreeChart } from './HeatingDegreeChart'
import { useApp } from '../../context/AppContext'
import { SeasonView } from '../../types'

const { Text } = Typography

interface HeatingDegreeChartProps {
    weather: any[]
    baseTemp: number
    reducedTemp: number
    setbackType: 'overnight' | '24/7'
    startTime: any
    endTime: any
    seasonView: SeasonView
    selectedYear: number
}

export const MarginalHeating = () => {
    const {
        city,
        weather,
        filteredWeather,
        indoor,
        seasonView,
        year,
        setbackTemp,
        setSetbackTemp,
        setbackType,
        setSetbackType,
        startTime,
        setStartTime,
        endTime,
        setEndTime
    } = useApp()

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
                                    {seasonView === 'heating' ? 'Heating Season' : 'Year'} {year}
                                </Descriptions.Item>
                                <Descriptions.Item label="Indoor Temperature">{indoor}°C</Descriptions.Item>
                            </Descriptions>
                        </Space>
                    </Card>

                    <Card title="Temperature Setback">
                        <Form layout="vertical">
                            <Form.Item label="Setback Amount (°C)">
                                <InputNumber
                                    value={setbackTemp}
                                    onChange={value => setSetbackTemp(value || 2)}
                                    min={0}
                                    max={10}
                                    addonAfter="°C"
                                />
                                <Text type="secondary" style={{ marginLeft: 8 }}>
                                    Temperature will be reduced to {(indoor - setbackTemp).toFixed(1)}°C during setback periods
                                </Text>
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
                            baseTemp={indoor}
                            reducedTemp={indoor - setbackTemp}
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