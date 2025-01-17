import React from 'react'
import { Form, InputNumber, Radio, TimePicker } from 'antd'
import { useApp } from '../../context/AppContext'
import type { Dayjs } from 'dayjs'
import dayjs from 'dayjs'

export const TemperatureSettings = () => {
    const {
        indoor,
        setbackTemp,
        setSetbackTemp,
        setbackType,
        setSetbackType,
        startTime,
        setStartTime,
        endTime,
        setEndTime,
    } = useApp()

    return (
        <Form layout="vertical">
            <Form.Item label="Setback Amount (°C)">
                <InputNumber
                    value={setbackTemp}
                    onChange={value => setSetbackTemp(value || 2)}
                    min={0}
                    max={10}
                    addonAfter="°C"
                />
                <div style={{ marginTop: 8, color: 'rgba(0, 0, 0, 0.45)' }}>
                    Temperature will be reduced to {(indoor - setbackTemp).toFixed(1)}°C during setback periods
                </div>
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