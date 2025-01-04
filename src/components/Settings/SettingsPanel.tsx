import React from 'react'
import { Drawer, Tabs } from 'antd'
import { HouseSettings } from './HouseSettings'
import { HeatPumpSettings } from './HeatPumpSettings'

interface SettingsPanelProps {
    open: boolean
    onClose: () => void
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ open, onClose }) => {
    const items = [
        {
            key: 'house',
            label: 'House Settings',
            children: <HouseSettings />,
        },
        {
            key: 'heatpump',
            label: 'Heat Pump Settings',
            children: <HeatPumpSettings />,
        },
    ]

    return (
        <Drawer
            title="Settings"
            placement="right"
            width={500}
            onClose={onClose}
            open={open}
        >
            <Tabs
                defaultActiveKey="house"
                items={items}
                style={{ height: '100%' }}
            />
        </Drawer>
    )
} 