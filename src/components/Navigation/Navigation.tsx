import React from 'react'
import { Space, theme } from 'antd'
import { GithubOutlined } from '@ant-design/icons'
import { HvacSystemIcon } from '../Icons/HvacIcons'

export const Navigation = () => {
    const { token } = theme.useToken()

    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
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

            <a
                href="https://github.com/NickLewanowicz/gas-to-heatpump-calculator"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                    color: token.colorText,
                    fontSize: 20,
                    display: 'flex',
                    alignItems: 'center'
                }}
            >
                <GithubOutlined />
            </a>
        </div>
    )
}