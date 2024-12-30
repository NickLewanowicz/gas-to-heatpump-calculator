import React from 'react'
import { Layout, Menu, theme } from 'antd'
import { GithubOutlined, CalculatorOutlined, LineChartOutlined, PercentageOutlined } from '@ant-design/icons'
import { Link, useLocation } from 'react-router-dom'

const { Header } = Layout

export const Navigation = () => {
    const { token } = theme.useToken()
    const location = useLocation()

    const allMenuItems = [
        {
            key: '/',
            icon: <CalculatorOutlined />,
            label: <Link to="/">Calculator</Link>,
            visible: true
        },
        {
            key: '/breakeven',
            icon: <LineChartOutlined />,
            label: <Link to="/breakeven">Breakeven</Link>,
            visible: false // Temporarily hidden
        },
        {
            key: '/marginal',
            icon: <PercentageOutlined />,
            label: <Link to="/marginal">Marginal Heating Cost</Link>,
            visible: true
        }
    ]

    const visibleMenuItems = allMenuItems.filter(item => item.visible)

    return (
        <Header style={{
            padding: 0,
            background: token.colorBgContainer,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
        }}>
            <Menu
                mode="horizontal"
                selectedKeys={[location.pathname]}
                items={visibleMenuItems}
                style={{
                    flex: 1,
                    minWidth: 0
                }}
            />
            <a
                href="https://github.com/NickLewanowicz/gas-to-heatpump-calculator"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                    padding: '0 24px',
                    color: token.colorText,
                    fontSize: 20
                }}
            >
                <GithubOutlined />
            </a>
        </Header>
    )
}