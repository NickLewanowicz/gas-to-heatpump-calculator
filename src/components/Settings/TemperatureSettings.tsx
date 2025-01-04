import React from 'react'
import { Form, InputNumber, Radio, TimePicker } from 'antd'
import { useApp } from '../../context/AppContext'
import type { Dayjs } from 'dayjs'
import dayjs from 'dayjs'

export const TemperatureSettings = () => {
    const {
        baseTemp,
        setBaseTemp,
        reducedTemp,
        setReducedTemp,
        setbackType,
        setSetbackType,
        startTime,
        setStartTime,
        endTime,
        setEndTime,
    } = useApp()

    return (
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
    )
} 