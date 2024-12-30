import React from 'react'
import { InputNumber, Form, Radio, TimePicker, Space } from 'antd'
import type { Dayjs } from 'dayjs'

interface TemperatureSettingsFormProps {
    baseTemp: number
    setBaseTemp: (temp: number) => void
    reducedTemp: number
    setReducedTemp: (temp: number) => void
    setbackType: '24/7' | 'overnight'
    setSetbackType: (type: '24/7' | 'overnight') => void
    startTime: Dayjs | null
    setStartTime: (time: Dayjs | null) => void
    endTime: Dayjs | null
    setEndTime: (time: Dayjs | null) => void
}

export const TemperatureSettingsForm: React.FC<TemperatureSettingsFormProps> = ({
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
}) => {
    return (
        <Form layout="vertical" size="small">
            <Form.Item
                label="Base Temperature (°C)"
                tooltip="Your normal thermostat setting"
            >
                <InputNumber
                    value={baseTemp}
                    onChange={value => setBaseTemp(value || 21)}
                    style={{ width: '100%' }}
                />
            </Form.Item>

            <Form.Item
                label="Reduced Temperature (°C)"
                tooltip="The lower temperature you're considering"
            >
                <InputNumber
                    value={reducedTemp}
                    onChange={value => setReducedTemp(value || 19)}
                    style={{ width: '100%' }}
                />
            </Form.Item>

            <Form.Item
                label="Setback Schedule"
                tooltip="When to apply the temperature reduction"
            >
                <Radio.Group
                    value={setbackType}
                    onChange={e => setSetbackType(e.target.value)}
                    style={{ width: '100%' }}
                >
                    <Space direction="vertical" style={{ width: '100%' }}>
                        <Radio value="24/7">All day (24/7)</Radio>
                        <Radio value="overnight">Overnight only</Radio>
                    </Space>
                </Radio.Group>
            </Form.Item>

            {setbackType === 'overnight' && (
                <Form.Item
                    label="Setback Hours"
                    tooltip="Time period to apply the reduced temperature"
                >
                    <Space>
                        <TimePicker
                            format="HH:mm"
                            value={startTime}
                            onChange={setStartTime}
                            placeholder="Start time"
                        />
                        <TimePicker
                            format="HH:mm"
                            value={endTime}
                            onChange={setEndTime}
                            placeholder="End time"
                        />
                    </Space>
                </Form.Item>
            )}
        </Form>
    )
} 