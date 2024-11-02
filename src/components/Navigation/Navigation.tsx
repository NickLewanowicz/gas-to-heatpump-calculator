import React from 'react'
import { Menu, Space, theme } from 'antd'
import { QuestionCircleOutlined, SettingOutlined } from '@ant-design/icons'
import { HvacSystemIcon } from '../Icons/HvacIcons'

export const Navigation = () => {
    const { token } = theme.useToken()

    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            height: 48,
            padding: `0 ${token.paddingLG}px`,
        }}>
            <Space align="center" size="middle">
                <HvacSystemIcon style={{
                    fontSize: 20,
                    color: token.colorPrimary,
                    width: '20px',
                    height: '20px'
                }} />
                <span style={{
                    fontSize: 16,
                    fontWeight: 'bold',
                    color: token.colorText
                }}>
                    Heat Pump Calculator
                </span>
            </Space>

            {/* <Menu
                mode="horizontal"
                style={{
                    flex: 1,
                    justifyContent: 'flex-end',
                    background: 'transparent',
                    border: 'none'
                }}
                items={[
                    {
                        key: 'help',
                        icon: <QuestionCircleOutlined />,
                        label: 'Help'
                    },
                    {
                        key: 'settings',
                        icon: <SettingOutlined />,
                        label: 'Settings'
                    }
                ]}
            /> */}
        </div>
    )
}