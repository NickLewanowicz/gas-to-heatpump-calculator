import React from 'react'
import { Space, Typography } from 'antd'
import { HouseSettings } from './HouseSettings'
import { HeatPumpSettings } from './HeatPumpSettings'

const { Title } = Typography

export const Settings = () => {
    return (
        <div style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
                <Typography>
                    <Title level={2}>Settings</Title>
                </Typography>

                <HouseSettings />
                <HeatPumpSettings />
            </Space>
        </div>
    )
} 